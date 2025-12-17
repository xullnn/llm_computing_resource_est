// Test script to check specific known models
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'LLM-Resource-Tool/1.0' } }, (res) => {
      let data = '';
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchJson(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
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

async function testModels() {
  const testModels = [
    'meta-llama/Llama-3.1-405B-Instruct',
    'meta-llama/Llama-3.3-70B-Instruct',
    'Qwen/Qwen2.5-72B-Instruct',
    'deepseek-ai/DeepSeek-V3',
    'mistralai/Mixtral-8x22B-Instruct-v0.1'
  ];
  
  for (const modelId of testModels) {
    console.log(`\n🔍 Testing: ${modelId}`);
    
    try {
      // Check model info
      const info = await fetchJson(`https://huggingface.co/api/models/${modelId}`);
      const licenseTag = (info.tags || []).find(tag => tag.startsWith('license:'));
      console.log(`  License: ${licenseTag || 'NO LICENSE TAG'}`);
      console.log(`  Downloads: ${info.downloads}`);
      
      // Check config
      const config = await fetchJson(`https://huggingface.co/${modelId}/raw/main/config.json`);
      console.log(`  Config found: YES`);
      console.log(`  hidden_size: ${config.hidden_size}`);
      console.log(`  num_layers: ${config.num_hidden_layers || config.num_layers}`);
      console.log(`  vocab_size: ${config.vocab_size}`);
      console.log(`  num_local_experts: ${config.num_local_experts || 'N/A'}`);
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
  }
}

testModels().catch(console.error);
