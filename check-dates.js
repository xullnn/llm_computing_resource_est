// Check date fields for recent models
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

async function checkDates() {
  const recentModels = [
    'meta-llama/Llama-3.3-70B-Instruct', // Released Dec 2024
    'deepseek-ai/DeepSeek-R1-Distill-Llama-70B', // Released Jan 2025
  ];
  
  for (const id of recentModels) {
    console.log(`\n${id}:`);
    try {
      const info = await fetchJson(`https://huggingface.co/api/models/${id}`);
      console.log(`  createdAt: ${info.createdAt}`);
      console.log(`  lastModified: ${info.lastModified}`);
      console.log(`  tags: ${(info.tags || []).filter(t => t.startsWith('license:')).join(', ')}`);
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }
}

checkDates();

