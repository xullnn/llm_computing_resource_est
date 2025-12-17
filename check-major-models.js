const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'test' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function checkModel(id) {
  try {
    const info = await fetchJson(`https://huggingface.co/api/models/${id}`);
    console.log(`\n${id}:`);
    console.log(`  Created: ${info.createdAt}`);
    console.log(`  Modified: ${info.lastModified}`);
    const licenseTag = (info.tags || []).find(t => t.startsWith('license:'));
    console.log(`  License: ${licenseTag || 'NONE'}`);
  } catch (e) {
    console.log(`\n${id}: ERROR - ${e.message}`);
  }
}

(async () => {
  const models = [
    'meta-llama/Llama-3.1-405B-Instruct',
    'meta-llama/Llama-3.3-70B-Instruct',
    'Qwen/Qwen2.5-72B-Instruct',
    'deepseek-ai/DeepSeek-V3',
    'mistralai/Mixtral-8x22B-Instruct-v0.1'
  ];
  for (const m of models) await checkModel(m);
})();
