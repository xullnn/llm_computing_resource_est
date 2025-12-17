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
const ONE_YEAR_AGO = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Exactly 1 year (365 days) as requested

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

// Known open-source model families (for models without license tags)
const KNOWN_OPEN_SOURCE_ORGS = [
  'deepseek-ai', // DeepSeek models are MIT licensed
  'Qwen',
  'meta-llama',
  'mistralai',
];

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
 * Main function to fetch open-source models
 */
async function fetchOpenSourceModels() {
  console.log('🔍 Fetching open-source models from Hugging Face...\n');
  
  const models = [];
  const seenModels = new Set();
  
  // Search strategies to find 80B+ models (they're not always top downloads)
  const searchStrategies = [
    { url: 'https://huggingface.co/api/models?filter=text-generation&sort=downloads&direction=-1&limit=500', desc: 'top downloads' },
    { url: 'https://huggingface.co/api/models?filter=text-generation&sort=likes&direction=-1&limit=500', desc: 'most liked' },
    { url: 'https://huggingface.co/api/models?filter=text-generation&sort=lastModified&direction=-1&limit=500', desc: 'recently updated' },
    { url: 'https://huggingface.co/api/models?filter=text-generation&sort=createdAt&direction=-1&limit=1000', desc: 'recently created' },
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
    
    // Filter: Only models from past 1 year (use createdAt for release date)
    const createdAt = model.createdAt ? new Date(model.createdAt) : null;
    if (!createdAt || createdAt < ONE_YEAR_AGO) {
      if (isMajor) console.log(`⚠️  ${model.id}: TOO OLD (${createdAt ? createdAt.toISOString().split('T')[0] : 'no date'})`);
      skipped.tooOld++;
      continue;
    }
    const lastModified = model.lastModified ? new Date(model.lastModified) : createdAt;
    
    // Extract license from tags (format: "license:apache-2.0")
    const licenseTag = (model.tags || []).find(tag => tag.startsWith('license:'));
    const license = licenseTag ? licenseTag.replace('license:', '').toLowerCase() : '';
    
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
    
    // Fetch config.json for architecture details
    try {
      const configUrl = `https://huggingface.co/${model.id}/raw/main/config.json`;
      const config = await fetchJson(configUrl);
      
      // Estimate parameter count from architecture
      const params = estimateParams(config);
      
      if (params < MIN_PARAMS_BILLION) {
        if (isMajor) console.log(`⚠️  ${model.id}: TOO SMALL (${params.toFixed(1)}B)`);
        skipped.tooSmall++;
        continue;
      }
      
      const msg = `✓ ${model.id}: ${params.toFixed(1)}B params (${license}) [${createdAt.toISOString().split('T')[0]}]`;
      console.log(isMajor ? `🎯 ${msg}` : msg);
      
      seenModels.add(model.id);
      
      const modelData = {
        id: model.id,
        name: formatModelName(model.id),
        parameters_billion: Math.round(params * 10) / 10,
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
  
  console.log(`\n📊 Summary:`);
  console.log(`   - Skipped (older than 1 year): ${skipped.tooOld}`);
  console.log(`   - Skipped (no open-source license): ${skipped.noLicense}`);
  console.log(`   - Skipped (< ${MIN_PARAMS_BILLION}B params): ${skipped.tooSmall}`);
  console.log(`   - Skipped (no/invalid config): ${skipped.noConfig}`);
  console.log(`   - Matched: ${models.length}`);
  console.log(`\n📋 Open-source licenses found: ${Array.from(seenLicenses).slice(0, 20).join(', ')}`);
  
  // Sort by parameters descending
  models.sort((a, b) => b.parameters_billion - a.parameters_billion);
  
  // Generate output
  const oneYearAgo = new Date(ONE_YEAR_AGO).toISOString().split('T')[0];
  const output = {
    metadata: {
      updated_at: new Date().toISOString(),
      source: 'Hugging Face Hub API',
      filter: `open-source licenses only, 80B+ parameters, released after ${oneYearAgo}`,
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
 * Estimate parameter count from model config
 */
function estimateParams(config) {
  const h = config.hidden_size || config.d_model || 0;
  const L = config.num_hidden_layers || config.num_layers || 0;
  const V = config.vocab_size || 0;
  
  if (h === 0 || L === 0) {
    return 0;
  }
  
  // Transformer parameter estimation:
  // - Attention: 4 * h^2 per layer (Q, K, V, O projections)
  // - FFN: 2 * h * I or 3 * h * I for gated FFN
  // - Embeddings: V * h
  
  const hasGatedFFN = 
    config.hidden_act === 'silu' || 
    config.activation_function === 'silu' ||
    config.model_type === 'llama' ||
    config.model_type === 'qwen2' ||
    config.model_type === 'mistral' ||
    config.model_type === 'deepseek_v3';
  
  const ffnMultiplier = hasGatedFFN ? 3 : 2;
  
  // For MoE models, use moe_intermediate_size if present, otherwise intermediate_size
  const numExperts = config.num_local_experts || config.n_routed_experts || 1;
  const isMoE = numExperts > 1;
  const I = (isMoE && config.moe_intermediate_size) 
    ? config.moe_intermediate_size 
    : (config.intermediate_size || (4 * h));
  
  const attentionParams = L * 4 * h * h;
  const ffnParams = L * ffnMultiplier * h * I * (isMoE ? numExperts : 1);
  const embeddingParams = V * h;
  
  return (attentionParams + ffnParams + embeddingParams) / 1e9;
}

/**
 * Detect if model is dense or MoE
 */
function detectArchitecture(config) {
  if (config.num_local_experts && config.num_local_experts > 1) {
    return 'moe';
  }
  if (config.model_type && config.model_type.includes('moe')) {
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
