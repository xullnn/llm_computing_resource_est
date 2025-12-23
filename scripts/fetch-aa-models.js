#!/usr/bin/env node
/**
 * Fetch model data from Artificial Analysis API and create a slug mapping
 * 
 * This script fetches the list of LLM models from AA's API and creates
 * a normalized mapping that can be used to match HuggingFace models
 * to their AA benchmark pages.
 * 
 * Usage: node scripts/fetch-aa-models.js
 * 
 * Env vars:
 *   AA_API_KEY - Required. Artificial Analysis API key
 *                Get one at: https://artificialanalysis.ai/api-access-preview
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env file if present (for local development)
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#')) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    });
}

const AA_API_KEY = process.env.AA_API_KEY;
const AA_API_URL = 'https://artificialanalysis.ai/api/v2/data/llms/models';

/**
 * Fetch JSON from URL using https module
 */
function fetchJson(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'User-Agent': 'LLM-Resource-Tool/1.0',
                ...headers,
            },
        };

        https.request(options, (res) => {
            let data = '';

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
        }).on('error', reject).end();
    });
}

/**
 * Normalize a model name for matching
 * Converts to lowercase, removes common suffixes, replaces separators
 */
function normalizeForMatching(name) {
    return name
        .toLowerCase()
        // Remove vendor prefixes
        .replace(/^(meta-llama|deepseek-ai|qwen|mistralai|google|openai|anthropic|nvidia|apple|xiaomimimo)\//i, '')
        // Replace dots and underscores with dashes
        .replace(/[._]/g, '-')
        // Remove common suffixes that vary between platforms
        .replace(/-(instruct|chat|base|hf|it|preview|fp8|fp16|bf16|int4|int8|awq|gptq|gguf)$/gi, '')
        // Normalize version patterns (v3.2 -> v3-2)
        .replace(/v(\d+)-(\d+)/g, 'v$1$2')
        // Remove size indicators for matching
        .replace(/-\d+b(-|$)/gi, '$1')
        // Clean up multiple dashes
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Create multiple matching keys for a model
 */
function createMatchingKeys(name, slug, creatorSlug) {
    const keys = new Set();

    // Original slug
    keys.add(slug);

    // Normalized name
    keys.add(normalizeForMatching(name));

    // With creator prefix
    keys.add(`${creatorSlug}-${normalizeForMatching(name)}`);

    // Extract core model family (e.g., "deepseek-v3" from "DeepSeek V3 0324")
    const coreMatch = name.match(/^([a-zA-Z]+[\s-]*(?:v?\d+)?)/i);
    if (coreMatch) {
        keys.add(normalizeForMatching(coreMatch[1]));
    }

    return Array.from(keys).filter(k => k.length > 2);
}

/**
 * Fetch and process AA models
 */
async function fetchAAModels() {
    if (!AA_API_KEY) {
        console.error('❌ Error: AA_API_KEY environment variable is required');
        console.error('   Get an API key at: https://artificialanalysis.ai/api-access-preview');
        console.error('   Then set it in .env file or as environment variable');
        process.exit(1);
    }

    console.log('🔗 Fetching models from Artificial Analysis API...\n');

    try {
        const response = await fetchJson(AA_API_URL, {
            'x-api-key': AA_API_KEY,
        });

        if (response.status !== 200 || !response.data) {
            throw new Error(`API returned status ${response.status}`);
        }

        const models = response.data;
        console.log(`✓ Fetched ${models.length} models from AA\n`);

        // Build the mapping
        const slugMap = {};      // normalized_key -> slug
        const modelDetails = {}; // slug -> full model info

        for (const model of models) {
            const { id, name, slug, model_creator, evaluations } = model;

            if (!slug || !name) continue;

            const creatorSlug = model_creator?.slug || 'unknown';
            const creatorName = model_creator?.name || 'Unknown';

            // Store full model details
            modelDetails[slug] = {
                id,
                name,
                slug,
                creator: creatorName,
                creator_slug: creatorSlug,
                intelligence_index: evaluations?.artificial_analysis_intelligence_index || null,
                coding_index: evaluations?.artificial_analysis_coding_index || null,
                math_index: evaluations?.artificial_analysis_math_index || null,
                url: `https://artificialanalysis.ai/models/${slug}`,
            };

            // Create matching keys
            const matchKeys = createMatchingKeys(name, slug, creatorSlug);
            for (const key of matchKeys) {
                if (!slugMap[key]) {
                    slugMap[key] = slug;
                }
            }
        }

        // Create output
        const output = {
            metadata: {
                updated_at: new Date().toISOString(),
                source: 'Artificial Analysis API',
                count: Object.keys(modelDetails).length,
                attribution: 'Data from https://artificialanalysis.ai/',
            },
            models: modelDetails,
            slug_map: slugMap,
        };

        // Write to file
        const outputPath = path.join(__dirname, '../data/aa-models-cache.json');
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

        console.log('📊 Model breakdown by creator:');
        const byCreator = {};
        for (const model of Object.values(modelDetails)) {
            byCreator[model.creator] = (byCreator[model.creator] || 0) + 1;
        }
        Object.entries(byCreator)
            .sort((a, b) => b[1] - a[1])
            .forEach(([creator, count]) => {
                console.log(`   ${creator}: ${count}`);
            });

        console.log(`\n✅ Saved ${Object.keys(modelDetails).length} models to data/aa-models-cache.json`);
        console.log(`   Created ${Object.keys(slugMap).length} matching keys for lookup`);

        // Show some example mappings
        console.log('\n📝 Example matching keys:');
        const examples = Object.entries(slugMap).slice(0, 10);
        for (const [key, slug] of examples) {
            console.log(`   "${key}" → ${slug}`);
        }

        return output;
    } catch (error) {
        console.error(`❌ Error fetching AA models: ${error.message}`);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    fetchAAModels();
}

module.exports = { fetchAAModels, normalizeForMatching };
