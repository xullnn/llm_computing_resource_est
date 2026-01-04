#!/usr/bin/env node
/**
 * Fetch open-source LLM models (70B+) from Hugging Face Hub API
 * 
 * Usage: node scripts/fetch-models.js
 * 
 * Env vars (optional):
 *   HF_TOKEN - Hugging Face API token for higher rate limits
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load configuration
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const MIN_PARAMS_BILLION = CONFIG.params.min;
const MAX_PARAMS_BILLION = CONFIG.params.max;
const CUTOFF_DAYS = CONFIG.cutoffDays;
const CUTOFF_DATE = new Date(Date.now() - CUTOFF_DAYS * 24 * 60 * 60 * 1000);
const VENDORS = CONFIG.vendors;

/**
 * Load manual overrides from data/overrides.json
 */
function loadOverrides() {
  const overridesPath = path.join(__dirname, '../data/overrides.json');
  if (fs.existsSync(overridesPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
      return new Map(data.models.map(m => [m.id, m]));
    } catch (e) {
      console.warn(`⚠️  Failed to load overrides.json: ${e.message}`);
    }
  }
  return new Map();
}

const OVERRIDES = loadOverrides();

/**
 * Load existing models to support incremental updates
 */
function loadExistingModels() {
  const modelsPath = path.join(__dirname, '../data/models.json');
  if (fs.existsSync(modelsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));
      return new Map(data.models.map(m => [m.id, m]));
    } catch (e) {
      console.warn(`⚠️  Failed to load existing models.json: ${e.message}`);
    }
  }
  return new Map();
}

const EXISTING_MODELS = loadExistingModels();

/**
 * Load Artificial Analysis models cache for slug matching
 * Run scripts/fetch-aa-models.js first to populate this cache
 */
function loadAACache() {
  const aaCachePath = path.join(__dirname, '../data/aa-models-cache.json');
  if (fs.existsSync(aaCachePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(aaCachePath, 'utf8'));
      console.log(`📊 Loaded AA cache with ${Object.keys(data.models || {}).length} models`);
      return {
        models: data.models || {},
        slugMap: data.slug_map || {},
      };
    } catch (e) {
      console.warn(`⚠️  Failed to load AA cache: ${e.message}`);
    }
  } else {
    console.log('ℹ️  AA cache not found. Run "node scripts/fetch-aa-models.js" to enable AA links.');
  }
  return { models: {}, slugMap: {} };
}

const AA_CACHE = loadAACache();

/**
 * Fetch individual model metadata (includes safetensors data)
 */
async function fetchModelMetadata(modelId) {
  try {
    const url = `https://huggingface.co/api/models/${modelId}`;
    const metadata = await fetchJson(url);
    return metadata;
  } catch (e) {
    return null;
  }
}

/**
 * Fetch JSON from URL using https module
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'LLM-Resource-Tool/1.0',
    };

    if (process.env.HF_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.HF_TOKEN}`;
    }

    https.get(url, { headers }, (res) => {
      let data = '';

      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchJson(res.headers.location));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Fetch text content from URL (for model cards)
 */
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'LLM-Resource-Tool/1.0',
    };

    if (process.env.HF_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.HF_TOKEN}`;
    }

    https.get(url, { headers }, (res) => {
      let data = '';

      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchText(res.headers.location));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Check if a URL exists via HTTP HEAD request
 * Returns true if status is 200, 301, or 302
 */
function checkUrlExists(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 3000 }, (res) => {
      // 200 = exists, 301/302 = redirect to valid page
      resolve([200, 301, 302].includes(res.statusCode));
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

/**
 * Generate candidate matching keys from HuggingFace model ID
 * Used to lookup models in the AA cache
 */
function generateAAMatchingKeys(modelId) {
  const name = modelId.split('/').pop().toLowerCase();
  const vendor = modelId.split('/')[0].toLowerCase();

  const candidates = [
    // Direct slug match (e.g., deepseek-v3)
    name.replace(/\./g, '-'),

    // Without vendor prefix
    name.replace(/\./g, '-').replace(/^(deepseek-|qwen|llama-|mistral-)/i, ''),

    // Strip quantization suffixes (model-FP8 → model)
    name.replace(/\./g, '-').replace(/-(fp8|int8|int4|fp16|bf16|awq|gptq|gguf)$/i, ''),

    // Strip date suffixes (DeepSeek-R1-0528 → deepseek-r1)
    name.replace(/\./g, '-').replace(/-\d{4}$/i, ''),

    // Remove -instruct, -chat, -base, -hf suffixes
    name.replace(/\./g, '-').replace(/-(instruct|chat|base|hf|it|preview)$/i, ''),

    // Normalize version (V3.2 → v3-2)
    name.replace(/(\d+)\.(\d+)/g, '$1-$2').toLowerCase(),

    // Core model name only (deepseek-v3-1-terminus → deepseek-v3-1)
    name.replace(/\./g, '-').replace(/-(terminus|speciale|exp|base)$/i, ''),

    // With reasoning suffix for reasoning models
    name.replace(/\./g, '-') + '-reasoning',

    // Map HF vendor prefixes to AA creator slugs
    `${vendor === 'deepseek-ai' ? 'deepseek' : vendor}-${name.replace(/\./g, '-')}`,
  ];

  // Deduplicate and filter
  return [...new Set(candidates)].filter(s => s.length > 2);
}

/**
 * Find Artificial Analysis slug for a model using cached data
 * Much faster and more reliable than HTTP HEAD probing
 */
function findAASlugFromCache(modelId) {
  if (!AA_CACHE.slugMap || Object.keys(AA_CACHE.slugMap).length === 0) {
    return null;
  }

  const candidates = generateAAMatchingKeys(modelId);

  for (const candidate of candidates) {
    // Direct lookup in slug map
    if (AA_CACHE.slugMap[candidate]) {
      return AA_CACHE.slugMap[candidate];
    }

    // Check if it's a direct slug
    if (AA_CACHE.models[candidate]) {
      return candidate;
    }
  }

  // Fallback: fuzzy match on model names in cache
  const hfName = modelId.split('/').pop().toLowerCase().replace(/[.-]/g, '');
  for (const [slug, model] of Object.entries(AA_CACHE.models)) {
    const aaName = model.name.toLowerCase().replace(/[\s.-]/g, '');
    if (aaName.includes(hfName) || hfName.includes(aaName.replace(/\(.*\)/, '').trim())) {
      return slug;
    }
  }

  return null;
}

/**
 * STEP 1: Extract parameter count from model card (README.md)
 * This is the most reliable source as model authors state the official count
 */
async function fetchStatedParams(modelId) {
  try {
    const readmeUrl = `https://huggingface.co/${modelId}/raw/main/README.md`;
    const markdown = await fetchText(readmeUrl);

    // Look for TOTAL parameter count patterns (not activated params)
    // Prioritize patterns that explicitly mention "total"
    const patterns = [
      // High priority: explicit "total params"
      /(?:#\s*)?total\s+(?:params?|parameters?)[\s:]+(\d+(?:\.\d+)?)\s*([BT])/i,
      /(\d+(?:\.\d+)?)\s*([BT])\s+total\s+(?:params?|parameters?)/i,

      // Medium priority: table rows with "total"
      /\|\s*(?:#\s*)?total\s+(?:params?|parameters?)\s*\|[^\d]*(\d+(?:\.\d+)?)\s*([BT])?/i,

      // Look for context that indicates total vs active
      /(\d+(?:\.\d+)?)\s*([BT])\s+(?:params?|parameters?).*?total/i,

      // Generic patterns (lower priority, may catch "activated" by mistake)
      /(?<!activated?\s)(?<!active\s)(\d+(?:\.\d+)?)\s*([BT])\s+(?:params?|parameters?)/i,
      /(?:params?|parameters?)[\s:]*(\d+(?:\.\d+)?)\s*([BT])/i,
    ];

    for (const pattern of patterns) {
      const match = markdown.match(pattern);
      if (match) {
        let num = parseFloat(match[1]);
        const unit = match[2] ? match[2].toUpperCase() : 'B';

        // Convert to billions
        if (unit === 'T') {
          num *= 1000;
        }

        // Sanity check: reasonable range for LLMs
        // For models < 100B, be suspicious (might be activated params)
        if (num >= 80 && num <= 10000) {
          // Additional check: skip if it's clearly "activated" params
          const context = markdown.substring(Math.max(0, match.index - 100), match.index + 100);
          if (!context.toLowerCase().includes('activated') && !context.toLowerCase().includes('active param')) {
            return num;
          }
        }
      }
    }

    return null;
  } catch (e) {
    // Model card not found or error reading - that's OK
    return null;
  }
}

/**
 * Main function to fetch open-source models
 */
async function fetchOpenSourceModels() {
  console.log('🔍 Fetching open-source models from Hugging Face...\n');

  const models = [];
  const seenModels = new Set();

  // Query only the configured vendors (exclusive whitelist)
  const searchStrategies = VENDORS.map(vendor => {
    const limit = CONFIG.vendorQueryLimits?.[vendor] || 100;
    return {
      url: `https://huggingface.co/api/models?author=${vendor}&filter=text-generation&limit=${limit}`,
      desc: `${vendor} org`
    };
  });

  let allRawModels = [];

  for (const strategy of searchStrategies) {
    console.log(`📡 Querying: ${strategy.desc}...`);
    try {
      const batch = await fetchJson(strategy.url);
      allRawModels.push(...batch);
    } catch (e) {
      console.log(`⚠️  Failed to fetch ${strategy.desc}: ${e.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
  }

  // Deduplicate by model ID
  const uniqueModels = Array.from(new Map(allRawModels.map(m => [m.id, m])).values());

  console.log(`✓ Found ${uniqueModels.length} unique text-generation models\n`);

  let skipped = { wrongVendor: 0, tooSmall: 0, tooLarge: 0, noConfig: 0, tooOld: 0 };
  let seenLicenses = new Set();

  // Track specific major models for detailed logging
  const majorModels = [
    'meta-llama/Llama-3.1-405B-Instruct',
    'deepseek-ai/DeepSeek-V3',
    'deepseek-ai/DeepSeek-R1',
    'Qwen/Qwen2.5-72B-Instruct',
    'Qwen/Qwen3-235B-A22B-Instruct-2507',
    'openai/gpt-oss-120b'
  ];

  // Process each model
  for (const model of uniqueModels) {
    const isMajor = majorModels.includes(model.id);

    // Skip if already processed
    if (seenModels.has(model.id)) {
      if (isMajor) console.log(`⚠️  ${model.id}: DUPLICATE`);
      continue;
    }

    // Filter: Only models from past 2 years (use createdAt or lastModified)
    // Use lastModified as fallback if createdAt is missing (HF API inconsistency)
    const dateString = model.createdAt || model.lastModified;
    const createdAt = dateString ? new Date(dateString) : null;

    if (!createdAt || createdAt < CUTOFF_DATE) {
      if (isMajor) console.log(`⚠️  ${model.id}: TOO OLD (${createdAt ? createdAt.toISOString().split('T')[0] : 'no date'})`);
      skipped.tooOld++;
      continue;
    }
    const lastModified = model.lastModified ? new Date(model.lastModified) : createdAt;

    // Extract license from tags (format: "license:apache-2.0")
    const licenseTag = (model.tags || []).find(tag => tag.startsWith('license:'));
    const license = licenseTag ? licenseTag.replace('license:', '') : 'unknown';

    if (license && license !== 'unknown') {
      seenLicenses.add(license);
    }

    // Check vendor whitelist (exclusive filtering)
    const modelOrg = model.id.split('/')[0];
    if (!VENDORS.includes(modelOrg)) {
      // Skip models not from our vendor whitelist
      continue;
    }

    // NEW: Incremental Update Check
    if (EXISTING_MODELS.has(model.id)) {
      const existing = EXISTING_MODELS.get(model.id);
      const existingModified = existing.last_modified ? new Date(existing.last_modified) : null;

      // If the model hasn't been modified on HF since our last fetch, reuse it
      if (existingModified && lastModified && existingModified.getTime() >= new Date(lastModified).getTime()) {
        // But still try to add/update AA slug
        if (!existing.artificial_analysis_slug) {
          const aaSlug = findAASlugFromCache(model.id);
          if (aaSlug) {
            existing.artificial_analysis_slug = aaSlug;
            console.log(`   🔗 Added AA slug for cached model: ${model.id} → ${aaSlug}`);
          }
        }
        models.push(existing);
        seenModels.add(model.id);
        continue;
      }
    }

    // Fetch individual model metadata for safetensors data
    let modelMetadata = null;
    try {
      modelMetadata = await fetchModelMetadata(model.id);
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (e) {
      // Continue without metadata
    }

    // Fetch config.json for architecture details
    try {
      const configUrl = `https://huggingface.co/${model.id}/raw/main/config.json`;
      const config = await fetchJson(configUrl);

      // Check if this model has a manual override
      const hasOverride = OVERRIDES.has(model.id);
      const override = hasOverride ? OVERRIDES.get(model.id) : null;

      // STEP 4: Validate and choose best parameter estimate
      let finalParams = null;
      let paramSource = null;

      // Priority 0: Manual override (highest priority)
      if (override && override.parameters_billion) {
        finalParams = override.parameters_billion;
        paramSource = 'manual_override';
      }

      // Priority 1: Safetensors (from individual model API)
      if (!finalParams && modelMetadata && modelMetadata.safetensors && modelMetadata.safetensors.total) {
        finalParams = modelMetadata.safetensors.total / 1e9;
        paramSource = 'safetensors';
      }

      // Priority 2: Stated (from README)
      if (!finalParams) {
        const statedParams = await fetchStatedParams(model.id);
        if (statedParams && statedParams >= MIN_PARAMS_BILLION) {
          finalParams = statedParams;
          paramSource = 'stated';
        }
      }

      // Priority 3: Estimated (Physics)
      const estimatedParams = estimateParams(config);
      if (!finalParams) {
        if (estimatedParams && estimatedParams >= MIN_PARAMS_BILLION) {
          finalParams = estimatedParams;
          paramSource = 'estimated';
        }
      }

      // Final validation - check parameter range
      if (!finalParams || finalParams < MIN_PARAMS_BILLION) {
        if (isMajor) console.log(`⚠️  ${model.id}: TOO SMALL or UNKNOWN (${(finalParams || estimatedParams || 0).toFixed(1)}B)`);
        skipped.tooSmall++;
        continue;
      }

      if (finalParams > MAX_PARAMS_BILLION) {
        if (isMajor) console.log(`⚠️  ${model.id}: TOO LARGE (${finalParams.toFixed(1)}B, max: ${MAX_PARAMS_BILLION}B)`);
        skipped.tooLarge++;
        continue;
      }

      // Warn if estimation differs significantly from authoritative source
      if (paramSource !== 'estimated' && estimatedParams && Math.abs(estimatedParams - finalParams) / finalParams > 0.3) {
        console.log(`   ⚠️  ${model.id}: Physics estimated ${estimatedParams.toFixed(1)}B but ${paramSource} says ${finalParams.toFixed(1)}B (using ${paramSource})`);
      }

      const msg = `✓ ${model.id}: ${finalParams.toFixed(1)}B params [${paramSource}] (${license}) [${createdAt.toISOString().split('T')[0]}]`;
      console.log(isMajor ? `🎯 ${msg}` : msg);

      seenModels.add(model.id);

      // Attempt to find valid Artificial Analysis slug from cache
      let aaSlug = null;
      try {
        aaSlug = findAASlugFromCache(model.id);
        if (aaSlug) {
          console.log(`   🔗 AA benchmark: artificialanalysis.ai/models/${aaSlug}`);
        }
      } catch (e) {
        // Ignore AA lookup failures - not critical
      }

      // Build model data, merging override fields with live HF data
      const modelData = {
        id: model.id,
        name: override?.name || formatModelName(model.id),
        parameters_billion: Math.round(finalParams * 10) / 10,
        active_parameters_billion: override?.active_parameters_billion || null,
        architecture: override?.architecture || detectArchitecture(config),
        hidden_size: override?.hidden_size || config.hidden_size || null,
        num_layers: override?.num_layers || config.num_hidden_layers || config.num_layers || null,
        num_heads: override?.num_heads || config.num_attention_heads || null,
        num_kv_heads: override?.num_kv_heads || config.num_key_value_heads || config.num_attention_heads || null,
        vocab_size: override?.vocab_size || config.vocab_size || null,
        max_seq_length: override?.max_seq_length || config.max_position_embeddings || config.max_sequence_length || null,
        intermediate_size: override?.intermediate_size || config.intermediate_size || null,
        // MoE fields (if present)
        moe_num_experts: override?.moe_num_experts || config.num_local_experts || config.n_routed_experts || null,
        moe_top_k: override?.moe_top_k || config.num_experts_per_tok || null,
        // Metadata (always from live HF data)
        license: override?.license || (licenseTag ? licenseTag.replace('license:', '') : 'unknown'),
        downloads: model.downloads || 0,
        likes: model.likes || 0,
        created_at: createdAt ? createdAt.toISOString() : null,
        last_modified: lastModified ? lastModified.toISOString() : null,
        huggingface_url: `https://huggingface.co/${model.id}`,
        param_source: paramSource,
        artificial_analysis_slug: aaSlug,
      };

      if (hasOverride) {
        console.log(`   🎯 Applied override fields, merged with live HF data (downloads: ${modelData.downloads}, likes: ${modelData.likes})`);
      }

      models.push(modelData);

      // Rate limiting: small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (e) {
      // Skip models with missing or invalid config
      if (isMajor) console.log(`⚠️  ${model.id}: NO/INVALID CONFIG (${e.message})`);
      skipped.noConfig++;
      continue;
    }
  }

  // NEW: Add any overrides that weren't found in the search
  for (const [id, override] of OVERRIDES) {
    if (!seenModels.has(id)) {
      // Add AA slug if not present
      if (!override.artificial_analysis_slug) {
        const aaSlug = findAASlugFromCache(id);
        if (aaSlug) {
          override.artificial_analysis_slug = aaSlug;
        }
      }
      console.log(`🎯 ${id}: Adding manual override (not found in search)`);
      models.push(override);
      seenModels.add(id);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   - Skipped (older than 2 years): ${skipped.tooOld}`);
  console.log(`   - Skipped (not in vendor whitelist): ${skipped.wrongVendor}`);
  console.log(`   - Skipped (< ${MIN_PARAMS_BILLION}B params): ${skipped.tooSmall}`);
  console.log(`   - Skipped (> ${MAX_PARAMS_BILLION}B params): ${skipped.tooLarge}`);
  console.log(`   - Skipped (no/invalid config): ${skipped.noConfig}`);
  console.log(`   - Matched: ${models.length}`);
  console.log(`\n📋 Licenses found: ${Array.from(seenLicenses).slice(0, 20).join(', ')}`);

  // Sort by parameters descending
  models.sort((a, b) => b.parameters_billion - a.parameters_billion);

  // NEW: Validation Layer (Sanity Check)
  const anomalies = [];
  for (const model of models) {
    if (EXISTING_MODELS.has(model.id)) {
      const oldModel = EXISTING_MODELS.get(model.id);
      const oldParams = oldModel.parameters_billion;
      const newParams = model.parameters_billion;

      if (oldParams > 0) {
        const ratio = newParams / oldParams;
        if (ratio > 1.5 || ratio < 0.66) {
          anomalies.push({
            id: model.id,
            oldParams: `${oldParams}B`,
            newParams: `${newParams}B`,
            change: `${((ratio - 1) * 100).toFixed(1)}%`
          });
        }
      }
    }
  }

  if (anomalies.length > 0) {
    console.log('\n⚠️  ANOMALIES DETECTED:');
    console.table(anomalies);
    // In a real CI environment, we might want to fail the build if anomalies are severe
  }

  // Generate output
  const cutoffDate = new Date(CUTOFF_DATE).toISOString().split('T')[0];
  const output = {
    metadata: {
      updated_at: new Date().toISOString(),
      source: 'Hugging Face Hub API',
      filter: `Vendors: ${VENDORS.join(', ')} | Parameters: ${MIN_PARAMS_BILLION}-${MAX_PARAMS_BILLION}B | Released after ${cutoffDate}`,
      count: models.length,
      vendors: VENDORS,
      paramRange: { min: MIN_PARAMS_BILLION, max: MAX_PARAMS_BILLION },
    },
    models: models,
  };

  // Write to file
  const outputPath = path.join(__dirname, '../data/models.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✅ Saved ${models.length} open-source models to data/models.json`);

  return { models };
}

/**
 * STEP 2: Get intermediate FFN size with extended field recognition
 * Different MoE architectures use different field names
 */
function getIntermediateSize(config, h, isMoE) {
  // Try various field names in priority order
  const candidateFields = [
    'expert_ffn_hidden_size',    // DeepSeek-V3, LongCat-Flash
    'moe_intermediate_size',     // Standard MoE naming
    'ffn_dim',                   // Some architectures
    'intermediate_size',         // Dense models and some MoE
  ];

  for (const field of candidateFields) {
    if (config[field] && config[field] > 0) {
      return config[field];
    }
  }

  // Fallback: estimate based on model type
  // Most modern models use 4x or larger expansion
  return 4 * h;
}

/**
 * STEP 3: Estimate parameter count with improved MoE handling
 */
function estimateParams(config) {
  const h = config.hidden_size || config.d_model || 0;
  const L = config.num_hidden_layers || config.num_layers || 0;
  const V = config.vocab_size || 0;

  if (h === 0 || L === 0) {
    return 0;
  }

  // Check for explicit parameter count in config (some models have this)
  if (config.num_parameters && config.num_parameters > 1e9) {
    return config.num_parameters / 1e9;
  }
  if (config.total_params && config.total_params > 1e9) {
    return config.total_params / 1e9;
  }

  // Detect MoE architecture
  const numExperts = config.num_local_experts || config.n_routed_experts || 1;
  const isMoE = numExperts > 1;

  // Check if model uses gated FFN (SwiGLU, etc.)
  // Modern models (especially MoE) almost always use gated FFN
  const hasGatedFFN =
    config.hidden_act === 'silu' ||
    config.activation_function === 'silu' ||
    config.model_type === 'llama' ||
    config.model_type === 'qwen2' ||
    config.model_type === 'mistral' ||
    config.model_type === 'deepseek_v3' ||
    isMoE; // Default to gated FFN for MoE models (almost all modern MoE use it)

  const ffnMultiplier = hasGatedFFN ? 3 : 2;

  // Get intermediate size with extended field recognition
  const I = getIntermediateSize(config, h, isMoE);

  // Calculate parameters
  // Attention layers: shared across all tokens (not multiplied by experts)
  const attentionParams = L * 4 * h * h;

  // Embeddings: shared
  const embeddingParams = V * h;

  // FFN parameters: For MoE, each expert is an alternative, not additive
  let ffnParams;
  if (isMoE) {
    // Each expert has: ffnMultiplier * h * I parameters
    // Total FFN params = (single expert size) * numExperts
    const singleExpertParams = ffnMultiplier * h * I;
    ffnParams = L * singleExpertParams * numExperts;

    // Router/gating network overhead (very small, ~1% of expert params)
    const routerParams = L * h * numExperts * 0.01;
    ffnParams += routerParams;
  } else {
    // Dense model: just one FFN per layer
    ffnParams = L * ffnMultiplier * h * I;
  }

  const totalParams = attentionParams + embeddingParams + ffnParams;

  return totalParams / 1e9;
}

/**
 * Detect if model is dense or MoE
 */
function detectArchitecture(config) {
  const numExperts = config.num_local_experts || config.n_routed_experts || config.num_experts || 1;
  if (numExperts > 1) {
    return 'moe';
  }
  if (config.model_type && config.model_type.toLowerCase().includes('moe')) {
    return 'moe';
  }
  return 'dense';
}

/**
 * Format model name for display
 * "meta-llama/Llama-3.1-405B-Instruct" → "Llama 3.1 405B Instruct"
 */
function formatModelName(modelId) {
  const name = modelId.split('/').pop();
  return name
    .replace(/-/g, ' ')
    .replace(/\./g, '.')
    .replace(/(\d)([A-Z])/g, '$1 $2');
}

// Run if executed directly
if (require.main === module) {
  fetchOpenSourceModels()
    .then(({ models }) => {
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { fetchOpenSourceModels };
