#!/usr/bin/env node
/**
 * Fetch open-source LLM models (80B+) from Hugging Face Hub API
 * 
 * Usage: node scripts/fetch-models.js
 * 
 * Env vars (optional):
 *   HF_TOKEN - Hugging Face API token for higher rate limits
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MIN_PARAMS_BILLION = 80; // 80B+ parameters as specified

// Date cutoff: 2 years to include important models like Llama 3.1 (July 2024) and Qwen 2.5 (Sept 2024)
// For large models (80B+), 2-year window is appropriate because:
// - Major releases are infrequent (months apart)
// - Enterprise adoption lags cutting-edge releases  
// - Model stability/maturity matters more than recency
const CUTOFF_DAYS = 730; // 2 years
const CUTOFF_DATE = new Date(Date.now() - CUTOFF_DAYS * 24 * 60 * 60 * 1000);

// Permissive open-source licenses we accept
const OPEN_SOURCE_LICENSES = [
  'apache-2.0',
  'mit',
  'bsd-3-clause',
  'llama3.1',
  'llama3.2',
  'llama3.3',
  'llama3',
  'llama2',
  'qwen',
  'other', // Qwen models often use this tag
  'gemma',
  'deepseek',
  'yi',
  'mistral',
  'openrail',
  'cc-by-4.0',
  'cc-by-sa-4.0',
];

// Map of common "other" license tags to their permissive equivalents
const LICENSE_ALIASES = {
  'tongyi-qianwen-license-agreement': 'qwen',
  'deepseek-license': 'deepseek',
  'yi-license': 'yi',
};

// Known open-source model families (for models without license tags)
const KNOWN_OPEN_SOURCE_ORGS = [
  'deepseek-ai', // DeepSeek models are MIT licensed
  'Qwen',
  'meta-llama',
  'mistralai',
];

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
  
  // Strategic organizations - leading foundation model providers only
  const STRATEGIC_ORGS = [
    { author: 'Qwen', limit: 200 },
    { author: 'deepseek-ai', limit: 100 },
    { author: 'openai', limit: 50 },
    { author: 'google', limit: 100 },
    { author: 'anthropics', limit: 50 },
    { author: 'apple', limit: 50 },
  ];
  
  // Search strategies to find 80B+ models
  const searchStrategies = [
    // Tier 1: Broad discovery (catches popular models)
    { url: 'https://huggingface.co/api/models?filter=text-generation&sort=downloads&direction=-1&limit=500', desc: 'top downloads' },
    { url: 'https://huggingface.co/api/models?filter=text-generation&sort=likes&direction=-1&limit=500', desc: 'most liked' },
    { url: 'https://huggingface.co/api/models?filter=text-generation&sort=lastModified&direction=-1&limit=500', desc: 'recently updated' },
    { url: 'https://huggingface.co/api/models?filter=text-generation&sort=createdAt&direction=-1&limit=1000', desc: 'recently created' },
    
    // Tier 2: Strategic organizations (ensures comprehensive coverage of key providers)
    ...STRATEGIC_ORGS.map(org => ({
      url: `https://huggingface.co/api/models?author=${org.author}&filter=text-generation&limit=${org.limit}`,
      desc: `${org.author} org`
    }))
  ];
  
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
  
  let skipped = { noLicense: 0, tooSmall: 0, noConfig: 0, tooOld: 0 };
  let seenLicenses = new Set();
  
  // Track specific major models
  const majorModels = [
    'meta-llama/Llama-3.1-405B-Instruct',
    'deepseek-ai/DeepSeek-V3',
    'Qwen/Qwen2.5-72B-Instruct',
    'mistralai/Mixtral-8x22B-Instruct-v0.1'
  ];
  
  // Process each model
  for (const model of uniqueModels) {
    const isMajor = majorModels.includes(model.id);
    
    // Skip if already processed
    if (seenModels.has(model.id)) {
      if (isMajor) console.log(`⚠️  ${model.id}: DUPLICATE`);
      continue;
    }

    // NEW: Check for manual overrides first
    if (OVERRIDES.has(model.id)) {
      const override = OVERRIDES.get(model.id);
      console.log(`🎯 ${model.id}: Using manual override (${override.parameters_billion}B)`);
      models.push(override);
      seenModels.add(model.id);
      continue;
    }
    
    // Filter: Only models from past 2 years (use createdAt for release date)
    const createdAt = model.createdAt ? new Date(model.createdAt) : null;
    if (!createdAt || createdAt < CUTOFF_DATE) {
      if (isMajor) console.log(`⚠️  ${model.id}: TOO OLD (${createdAt ? createdAt.toISOString().split('T')[0] : 'no date'})`);
      skipped.tooOld++;
      continue;
    }
    const lastModified = model.lastModified ? new Date(model.lastModified) : createdAt;
    
    // Extract license from tags (format: "license:apache-2.0")
    const licenseTag = (model.tags || []).find(tag => tag.startsWith('license:'));
    let license = licenseTag ? licenseTag.replace('license:', '').toLowerCase() : '';
    
    // Resolve license aliases (e.g., "tongyi-qianwen" -> "qwen")
    if (LICENSE_ALIASES[license]) {
      license = LICENSE_ALIASES[license];
    }
    
    if (license) {
      seenLicenses.add(license);
    }
    
    // Check if open-source: either by license tag or known organization
    const modelOrg = model.id.split('/')[0];
    const isOpenSource = 
      (license && OPEN_SOURCE_LICENSES.some(l => license.includes(l.toLowerCase()))) ||
      KNOWN_OPEN_SOURCE_ORGS.includes(modelOrg);
    
    if (!isOpenSource) {
      if (isMajor) console.log(`⚠️  ${model.id}: NOT OPEN SOURCE (license: ${license || 'none'}, org: ${modelOrg})`);
      skipped.noLicense++;
      continue;
    }

    // NEW: Incremental Update Check
    if (EXISTING_MODELS.has(model.id)) {
      const existing = EXISTING_MODELS.get(model.id);
      const existingModified = existing.last_modified ? new Date(existing.last_modified) : null;
      
      // If the model hasn't been modified on HF since our last fetch, reuse it
      if (existingModified && lastModified && existingModified.getTime() >= new Date(lastModified).getTime()) {
        // console.log(`⏭️ ${model.id}: Unchanged, skipping fetch`);
        models.push(existing);
        seenModels.add(model.id);
        continue;
      }
    }
    
    // Fetch config.json for architecture details
    try {
      const configUrl = `https://huggingface.co/${model.id}/raw/main/config.json`;
      const config = await fetchJson(configUrl);
      
      // STEP 4: Validate and choose best parameter estimate
      const estimatedParams = estimateParams(config);
      const statedParams = await fetchStatedParams(model.id);
      
      let finalParams = estimatedParams;
      let paramSource = 'estimated';
      
      // Prefer stated params if available and reasonable
      if (statedParams && statedParams >= MIN_PARAMS_BILLION) {
        finalParams = statedParams;
        paramSource = 'stated';
        
        // Warn if estimation differs significantly from stated value
        if (estimatedParams && Math.abs(estimatedParams - statedParams) / statedParams > 0.3) {
          console.log(`   ⚠️  ${model.id}: Estimated ${estimatedParams.toFixed(1)}B but model card states ${statedParams.toFixed(1)}B (using stated)`);
        }
      } else if (!estimatedParams || estimatedParams < MIN_PARAMS_BILLION) {
        if (isMajor) console.log(`⚠️  ${model.id}: TOO SMALL (${(estimatedParams || 0).toFixed(1)}B)`);
        skipped.tooSmall++;
        continue;
      }
      
      if (finalParams < MIN_PARAMS_BILLION) {
        if (isMajor) console.log(`⚠️  ${model.id}: TOO SMALL (${finalParams.toFixed(1)}B)`);
        skipped.tooSmall++;
        continue;
      }
      
      const msg = `✓ ${model.id}: ${finalParams.toFixed(1)}B params [${paramSource}] (${license}) [${createdAt.toISOString().split('T')[0]}]`;
      console.log(isMajor ? `🎯 ${msg}` : msg);
      
      seenModels.add(model.id);
      
      const modelData = {
        id: model.id,
        name: formatModelName(model.id),
        parameters_billion: Math.round(finalParams * 10) / 10,
        architecture: detectArchitecture(config),
        hidden_size: config.hidden_size || null,
        num_layers: config.num_hidden_layers || config.num_layers || null,
        num_heads: config.num_attention_heads || null,
        num_kv_heads: config.num_key_value_heads || config.num_attention_heads || null,
        vocab_size: config.vocab_size || null,
        max_seq_length: config.max_position_embeddings || config.max_sequence_length || null,
        intermediate_size: config.intermediate_size || null,
        // MoE fields (if present)
        moe_num_experts: config.num_local_experts || config.n_routed_experts || null,
        moe_top_k: config.num_experts_per_tok || null,
        // Metadata
        license: licenseTag ? licenseTag.replace('license:', '') : 'unknown',
        downloads: model.downloads || 0,
        likes: model.likes || 0,
        created_at: createdAt ? createdAt.toISOString() : null,
        last_modified: lastModified ? lastModified.toISOString() : null,
        huggingface_url: `https://huggingface.co/${model.id}`,
        param_source: paramSource, // Track whether we used stated or estimated value
      };
      
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
      console.log(`🎯 ${id}: Adding manual override (not found in search)`);
      models.push(override);
      seenModels.add(id);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   - Skipped (older than 1 year): ${skipped.tooOld}`);
  console.log(`   - Skipped (no open-source license): ${skipped.noLicense}`);
  console.log(`   - Skipped (< ${MIN_PARAMS_BILLION}B params): ${skipped.tooSmall}`);
  console.log(`   - Skipped (no/invalid config): ${skipped.noConfig}`);
  console.log(`   - Matched: ${models.length}`);
  console.log(`\n📋 Open-source licenses found: ${Array.from(seenLicenses).slice(0, 20).join(', ')}`);
  
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
      filter: `open-source licenses only, 80B+ parameters, released after ${cutoffDate} (2 years)`,
      count: models.length,
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
