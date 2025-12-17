// Quick test of specific known 80B+ models
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Test' } }, (res) => {
      let data = '';
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function test() {
  const models = [
    'meta-llama/Llama-3.1-405B-Instruct',
    'Qwen/Qwen2.5-72B-Instruct'
  ];
  
  for (const id of models) {
    console.log(`\n${id}:`);
    try {
      const config = await fetchJson(`https://huggingface.co/${id}/raw/main/config.json`);
      const h = config.hidden_size || 0;
      const L = config.num_hidden_layers || 0;
      const V = config.vocab_size || 0;
      const I = config.intermediate_size || (4 * h);
      
      const params = (L * 4 * h * h + L * 3 * h * I + V * h) / 1e9;
      
      console.log(`  hidden: ${h}, layers: ${L}, vocab: ${V}, intermediate: ${I}`);
      console.log(`  Estimated params: ${params.toFixed(1)}B`);
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }
}

test();

