const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/aa-models-cache.json', 'utf8'));

// Find models with Qwen and 72B in name
const matches = Object.entries(data.models).filter(([slug, m]) =>
    (slug.toLowerCase().includes('qwen') && slug.includes('72')) ||
    (m.name.toLowerCase().includes('qwen') && m.name.includes('72'))
);

console.log('Qwen 72B Candidates:', JSON.stringify(matches.map(([k, v]) => ({ key: k, name: v.name })), null, 2));
