const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/aa-models-cache.json', 'utf8'));

// Find models with Qwen1.5 in name or slug
const matches = Object.entries(data.models).filter(([slug, m]) =>
    slug.toLowerCase().includes('qwen1.5') ||
    m.name.toLowerCase().includes('qwen1.5')
);

console.log('Qwen1.5 Matches in AA Cache:', JSON.stringify(matches.map(([k, v]) => ({ key: k, name: v.name, slug: v.slug })), null, 2));

// Also check the slug map
const slugMatches = Object.entries(data.slug_map || {}).filter(([k, v]) => k.toLowerCase().includes('qwen1.5'));
console.log('Qwen1.5 Matches in Slug Map:', JSON.stringify(slugMatches, null, 2));
