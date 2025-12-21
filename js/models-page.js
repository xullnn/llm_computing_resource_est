/**
 * Models Page Script
 * Handles model grid, filtering, search, and comparison
 */

let modelsData = [];
let originalMetadata = null; // Store original metadata for re-renders
let selectedModels = new Set();
let trendingModels = [];
let trendingExpanded = false;
let currentView = 'vendor'; // 'vendor' or 'hardware'
let expandedVendors = new Set(); // Track which vendor groups are expanded
let filters = {
    recency: 'all',
    architecture: 'all',
    org: 'all',
    size: 'all',
    sort: 'newest'
};

/**
 * Calculate trending score for a model
 * Based on recency (40%), downloads (40%), and engagement/likes (20%)
 */
function calculateTrendingScore(model) {
    const now = new Date();
    const createdDate = new Date(model.created_at);
    const daysSinceCreated = (now - createdDate) / (1000 * 60 * 60 * 24);
    const monthsSinceCreated = daysSinceCreated / 30.44;
    
    // Must be released within 3 months
    if (monthsSinceCreated > 3) return 0;
    
    // Recency score (100 for today, 0 for 90 days ago)
    const recencyScore = Math.max(0, (90 - daysSinceCreated) / 90) * 100;
    
    // Download score (normalized, cap at 100K downloads = 100 points)
    // Minimum 10K downloads in 3 months to qualify
    const downloadScore = model.downloads < 10000 ? 0 : Math.min(model.downloads / 1000, 100);
    
    // Like/engagement score (normalized, cap at 10K likes = 100 points)
    // Minimum 1K likes in 3 months to qualify
    const likeScore = model.likes < 1000 ? 0 : Math.min(model.likes / 100, 100);
    
    // If doesn't meet minimum thresholds, return 0
    if (downloadScore === 0 || likeScore === 0) return 0;
    
    // Weighted combination: 40% recency, 40% downloads, 20% likes
    const score = (recencyScore * 0.4) + (downloadScore * 0.4) + (likeScore * 0.2);
    
    return score;
}

/**
 * Calculate and populate trending models
 */
function populateTrendingModels() {
    // Calculate trending scores
    const modelsWithScores = modelsData
        .map(model => ({
            ...model,
            trendingScore: calculateTrendingScore(model)
        }))
        .filter(model => model.trendingScore > 0)
        .sort((a, b) => b.trendingScore - a.trendingScore);
    
    trendingModels = modelsWithScores;
    
    // Debug: Log trending models with scores
    if (trendingModels.length > 0) {
        console.log('🔥 Trending Models (last 90 days):');
        trendingModels.slice(0, 10).forEach((model, i) => {
            const daysAgo = Math.floor((new Date() - new Date(model.created_at)) / (1000 * 60 * 60 * 24));
            console.log(`${i + 1}. ${model.name} (score: ${model.trendingScore.toFixed(1)}, ${daysAgo} days ago, ${model.downloads.toLocaleString()} downloads, ${model.likes.toLocaleString()} likes)`);
        });
    }
    
    if (trendingModels.length === 0) {
        document.getElementById('trendingBar').style.display = 'none';
        return;
    }
    
    // Show trending bar
    document.getElementById('trendingBar').style.display = 'block';
    renderTrendingBar();
}

/**
 * Render trending bar (top 3 or all if expanded)
 */
function renderTrendingBar() {
    const container = document.getElementById('trendingBarTags');
    const expandBtn = document.getElementById('trendingExpandBtn');
    const moreCount = document.getElementById('trendingMoreCount');
    
    const displayCount = trendingExpanded ? trendingModels.length : Math.min(3, trendingModels.length);
    const visibleModels = trendingModels.slice(0, displayCount);
    
    container.innerHTML = visibleModels.map(model => `
        <a class="trending-bar-tag" onclick="openCalculatorDrawer('${model.id}'); event.preventDefault();" href="#">
            <span class="fire-emoji">🔥</span>
            <span>${model.name.replace(/Instruct|Chat|Base/gi, '').trim()}</span>
        </a>
    `).join('');
    
    // Show "expand more" button if there are more than 3
    if (trendingModels.length > 3 && !trendingExpanded) {
        expandBtn.style.display = 'block';
        moreCount.textContent = trendingModels.length - 3;
    } else if (trendingModels.length > 3 && trendingExpanded) {
        expandBtn.style.display = 'block';
        document.getElementById('trendingExpandText').textContent = 'Show less';
    } else {
        expandBtn.style.display = 'none';
    }
}

// Toggle trending expansion
document.getElementById('trendingExpandBtn')?.addEventListener('click', () => {
    trendingExpanded = !trendingExpanded;
    renderTrendingBar();
});

// Toggle trending criteria display
document.getElementById('trendingInfoBtn')?.addEventListener('click', () => {
    const criteriaPanel = document.getElementById('trendingCriteria');
    const isVisible = criteriaPanel.style.display !== 'none';
    criteriaPanel.style.display = isVisible ? 'none' : 'block';
});

/**
 * Group models by vendor
 */
function groupModelsByVendor(models) {
    const grouped = {};
    
    models.forEach(model => {
        const vendor = model.id.split('/')[0];
        if (!grouped[vendor]) {
            grouped[vendor] = [];
        }
        grouped[vendor].push(model);
    });
    
    // Sort models within each vendor group (small to large)
    Object.keys(grouped).forEach(vendor => {
        grouped[vendor].sort((a, b) => a.parameters_billion - b.parameters_billion);
    });
    
    return grouped;
}

/**
 * Render vendor groups view
 */
function renderVendorGroups(models) {
    const grouped = groupModelsByVendor(models);
    const container = document.getElementById('vendorGroups');
    
    // Sort vendors by name
    const sortedVendors = Object.keys(grouped).sort();
    
    container.innerHTML = sortedVendors.map(vendor => {
        const vendorModels = grouped[vendor];
        const minParam = vendorModels[0].parameters_billion;
        const maxParam = vendorModels[vendorModels.length - 1].parameters_billion;
        const isExpanded = expandedVendors.has(vendor) || expandedVendors.size === 0; // All expanded by default initially
        
        // Show first 4 models (1 row) by default when expanded
        const visibleModels = isExpanded ? vendorModels.slice(0, 4) : [];
        const hasMore = vendorModels.length > 4;
        
        return `
            <div class="vendor-group ${isExpanded ? '' : 'collapsed'}" data-vendor="${vendor}">
                <div class="vendor-header" onclick="toggleVendor('${vendor}')">
                    <button class="vendor-toggle">${isExpanded ? '🔽' : '▷'}</button>
                    <h3 class="vendor-title">
                        ${vendor}
                        <span class="vendor-count">(${vendorModels.length} models)</span>
                    </h3>
                    <span class="vendor-param-range">${minParam}B ◄─► ${maxParam}B</span>
                </div>
                <div class="vendor-content ${isExpanded ? 'expanded' : ''}">
                    <div class="vendor-models-grid">
                        ${visibleModels.map(model => renderModelCardHTML(model)).join('')}
                    </div>
                    ${hasMore && isExpanded ? `
                        <button class="vendor-show-more" onclick="showAllVendorModels('${vendor}')">
                            ▼ ${t('showMoreBtn', { n: vendorModels.length - 4, vendor: vendor })}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Toggle vendor group expansion
 */
window.toggleVendor = function(vendor) {
    const group = document.querySelector(`[data-vendor="${vendor}"]`);
    const isExpanded = !group.classList.contains('collapsed');
    
    if (isExpanded) {
        group.classList.add('collapsed');
        expandedVendors.delete(vendor);
    } else {
        group.classList.remove('collapsed');
        expandedVendors.add(vendor);
    }
    
    // Re-render this vendor group
    renderModels();
}

/**
 * Show all models for a vendor
 */
window.showAllVendorModels = function(vendor) {
    const models = modelsData.filter(m => m.id.split('/')[0] === vendor);
    const filtered = applyFilters(models);
    const sorted = filtered.sort((a, b) => a.parameters_billion - b.parameters_billion);
    
    const group = document.querySelector(`[data-vendor="${vendor}"]`);
    const grid = group.querySelector('.vendor-models-grid');
    const button = group.querySelector('.vendor-show-more');
    
    // Render all models
    grid.innerHTML = sorted.map(model => renderModelCardHTML(model)).join('');
    
    // Hide the "show more" button
    if (button) button.style.display = 'none';
}

/**
 * Extract model card HTML (for reuse) - COMPACT VERSION
 */
function renderModelCardHTML(model) {
    // Calculate resource requirements with real math
    const quickCalcInt8 = calcRequirements({
        paramsB: model.parameters_billion,
        activeParamsB: model.active_parameters_billion || model.parameters_billion,
        weightPrecision: 'int8',
        kvPrecision: 'int8',
        layers: model.num_layers,
        hiddenSize: model.hidden_size,
        heads: model.num_heads,
        promptTokens: 8192,
        newTokens: 512,
        batchSize: 1,
        targetTps: 10  // Target 10 tokens/second
    });
    
    const quickCalcBf16 = calcRequirements({
        paramsB: model.parameters_billion,
        activeParamsB: model.active_parameters_billion || model.parameters_billion,
        weightPrecision: 'bf16',
        kvPrecision: 'bf16',
        layers: model.num_layers,
        hiddenSize: model.hidden_size,
        heads: model.num_heads,
        promptTokens: 8192,
        newTokens: 512,
        batchSize: 1,
        targetTps: 10
    });
    
    const vramInt8 = quickCalcInt8.totalVramGb;
    const vramBf16 = quickCalcBf16.totalVramGb;
    const bandwidthInt8 = quickCalcInt8.requiredBwGbps;
    
    // Estimate tokens/second on common GPUs based on bandwidth
    // RTX 4090: ~1TB/s, H100: ~3.35TB/s
    const tokensPerSecRTX4090 = Math.min(30, Math.floor(1000 / bandwidthInt8 * 10));
    const tokensPerSecH100 = Math.min(100, Math.floor(3350 / bandwidthInt8 * 10));
    
    // Check if this model is trending
    const isTrending = trendingModels.some(tm => tm.id === model.id);
    const trendingBadge = isTrending ? '<span class="trending-badge">🔥</span>' : '';
    
    return `
    <div class="model-card-compact ${isTrending ? 'is-trending' : ''}" onclick="openCalculatorDrawer('${model.id}')">
        <!-- Compare toggle with label (top-left) -->
        <label class="compare-toggle" onclick="event.stopPropagation();">
            <input type="checkbox" class="compare-checkbox" data-id="${model.id}" 
                ${selectedModels.has(model.id) ? 'checked' : ''} 
                onchange="toggleComparison('${model.id}')">
            <span class="compare-label">${t('compareLabel')}</span>
        </label>
        
        <!-- Header: Name + Badge + Trending -->
        <div class="card-header-compact">
            <h4 class="model-name-compact">${model.name}</h4>
            <div class="card-badges">
                ${trendingBadge}
                <span class="arch-badge badge-${model.architecture}">
                    ${model.architecture.toUpperCase()}
                </span>
            </div>
        </div>
        
        <!-- Param size (prominent) -->
        <div class="param-size-compact">${model.parameters_billion}B</div>
        
        <!-- Key metrics: VRAM + Bandwidth -->
        <div class="resource-metrics">
            <div class="metric-row vram-row">
                <span class="metric-label">${t('vramLabel')}</span>
                <span class="metric-value">${Math.ceil(vramInt8)}GB INT8 · ${Math.ceil(vramBf16)}GB BF16</span>
            </div>
            <div class="metric-row bandwidth-row">
                <span class="metric-label">${t('speedLabel')}</span>
                <span class="metric-value">~${Math.ceil(bandwidthInt8)} GB/s</span>
            </div>
            <div class="metric-row perf-row">
                <span class="metric-label">${t('estLabel')}</span>
                <span class="metric-value">${tokensPerSecRTX4090} tok/s (4090) · ${tokensPerSecH100} tok/s (H100)</span>
            </div>
        </div>
        
        <!-- Actions -->
        <div class="model-actions-compact">
            <a href="calculator.html?preset=${encodeURIComponent(model.id)}" 
               class="btn btn-primary btn-sm" 
               onclick="event.stopPropagation();">
                ${t('calculateBtn')}
            </a>
            <button class="btn btn-secondary btn-sm" 
                    onclick="event.stopPropagation(); openCalculatorDrawer('${model.id}');">
                ${t('detailsBtn')}
            </button>
        </div>
    </div>
`;
}

// Load models data
fetch('data/models.json')
    .then(res => res.json())
    .then(data => {
        modelsData = data.models;
        originalMetadata = data.metadata;
        populateOrgFilters();
        updateFilterCounts();
        populateTrendingModels();
        renderModels();
        renderMetadata(data.metadata);
    })
    .catch(err => {
        console.error('Failed to load models:', err);
        const vendorGroups = document.getElementById('vendorGroups');
        const modelsGrid = document.getElementById('modelsGrid');
        if (vendorGroups) {
            vendorGroups.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 2rem;">Failed to load models data</p>';
        }
        if (modelsGrid) {
            modelsGrid.innerHTML = '<p style="text-align: center; opacity: 0.7;">Failed to load models data</p>';
        }
    });

// Filter toggle
document.getElementById('filterToggleBtn')?.addEventListener('click', () => {
    const filterGroup = document.getElementById('filterGroup');
    if (filterGroup.style.display === 'none') {
        filterGroup.style.display = 'flex';
    } else {
        filterGroup.style.display = 'none';
    }
});

// Extract orgs and populate buttons
function populateOrgFilters() {
    const orgs = [...new Set(modelsData.map(m => m.id.split('/')[0]))].sort();
    const container = document.getElementById('orgFilterTags');
    
    orgs.forEach(org => {
        const btn = document.createElement('button');
        btn.className = 'filter-tag';
        btn.dataset.val = org;
        btn.textContent = org;
        btn.onclick = () => setFilter('org', org);
        container.appendChild(btn);
    });
}

// Relative time helper
function getRelativeTime(dateString) {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30.44);
        return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    const years = Math.floor(diffDays / 365.25);
    return years === 1 ? '1 year ago' : `${years} years ago`;
}

// Freshness color helper
function getFreshnessClass(dateString) {
    if (!dateString) return 'fresh-standard';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 7) return 'fresh-new';
    if (diffDays < 30) return 'fresh-recent';
    return 'fresh-standard';
}

// Provenance label helper
function getProvenanceLabel(source) {
    const labels = {
        'safetensors': '⚡ Safetensors',
        'stated': '📄 Stated',
        'estimated': '🧮 Estimated',
        'manual_override': '🛠️ Override'
    };
    return labels[source] || 'Unknown';
}

// Update counts on filter tags
function updateFilterCounts() {
    // Recency counts
    document.querySelectorAll('[data-group="recency"] .filter-tag').forEach(tag => {
        const val = tag.dataset.val;
        if (val === 'all') {
            tag.innerHTML = `All Time <span class="count">${modelsData.length}</span>`;
            return;
        }
        const months = parseInt(val);
        const count = modelsData.filter(m => {
            const diffMonths = (new Date() - new Date(m.created_at)) / (1000 * 60 * 60 * 24 * 30.44);
            return diffMonths <= months;
        }).length;
        const text = tag.textContent.split('\n')[0].trim().replace(/\d+$/, '');
        tag.innerHTML = `${text} <span class="count">${count}</span>`;
    });

    // Architecture counts
    document.querySelectorAll('[data-group="architecture"] .filter-tag').forEach(tag => {
        const val = tag.dataset.val;
        if (val === 'all') {
            tag.innerHTML = `All Types <span class="count">${modelsData.length}</span>`;
            return;
        }
        const count = modelsData.filter(m => m.architecture === val).length;
        const text = tag.textContent.split('\n')[0].trim().replace(/\d+$/, '');
        tag.innerHTML = `${text} <span class="count">${count}</span>`;
    });

    // Organization counts
    document.querySelectorAll('[data-group="org"] .filter-tag').forEach(tag => {
        const val = tag.dataset.val;
        if (val === 'all') {
            tag.innerHTML = `All Orgs <span class="count">${modelsData.length}</span>`;
            return;
        }
        const count = modelsData.filter(m => m.id.startsWith(val + '/')).length;
        tag.innerHTML = `${val} <span class="count">${count}</span>`;
    });

    // Size counts
    document.querySelectorAll('[data-group="size"] .filter-tag').forEach(tag => {
        const val = tag.dataset.val;
        if (val === 'all') {
            tag.innerHTML = `Any Size <span class="count">${modelsData.length}</span>`;
            return;
        }
        let count = 0;
        if (val === '70-100') count = modelsData.filter(m => m.parameters_billion >= 70 && m.parameters_billion < 100).length;
        if (val === '100-200') count = modelsData.filter(m => m.parameters_billion >= 100 && m.parameters_billion < 200).length;
        if (val === '200-400') count = modelsData.filter(m => m.parameters_billion >= 200 && m.parameters_billion < 400).length;
        if (val === '400+') count = modelsData.filter(m => m.parameters_billion >= 400).length;
        const text = tag.textContent.split('\n')[0].trim().replace(/\d+$/, '');
        tag.innerHTML = `${text} <span class="count">${count}</span>`;
    });
}

// Update active filter chips
function updateFilterChips() {
    const container = document.getElementById('activeFilterChips');
    let chips = [];
    
    if (filters.recency !== 'all') {
        const label = document.querySelector(`[data-group="recency"] [data-val="${filters.recency}"]`).textContent.split('\n')[0];
        chips.push(`<div class="filter-chip">📅 ${label} <button onclick="setFilter('recency', 'all')">×</button></div>`);
    }
    if (filters.architecture !== 'all') {
        const label = filters.architecture === 'moe' ? 'MoE' : 'Dense';
        chips.push(`<div class="filter-chip">🏗️ ${label} <button onclick="setFilter('architecture', 'all')">×</button></div>`);
    }
    if (filters.org !== 'all') {
        chips.push(`<div class="filter-chip">🏢 ${filters.org} <button onclick="setFilter('org', 'all')">×</button></div>`);
    }
    if (filters.size !== 'all') {
        chips.push(`<div class="filter-chip">📊 ${filters.size}B <button onclick="setFilter('size', 'all')">×</button></div>`);
    }

    if (chips.length > 0) {
        container.innerHTML = chips.join('') + `<button class="clear-filters" onclick="clearAllFilters()">Clear All</button>`;
        container.style.display = 'flex';
    } else {
        container.style.display = 'none';
    }
}

function setFilter(group, val) {
    filters[group] = val;
    
    // Update UI tags
    document.querySelectorAll(`[data-group="${group}"] .filter-tag`).forEach(tag => {
        tag.classList.toggle('active', tag.dataset.val === val);
    });

    updateFilterChips();
    renderModels();
}

function clearAllFilters() {
    filters = { recency: 'all', architecture: 'all', org: 'all', size: 'all', sort: 'newest' };
    document.querySelectorAll('.filter-tag').forEach(tag => {
        const group = tag.parentElement.dataset.group;
        tag.classList.toggle('active', tag.dataset.val === filters[group]);
    });
    updateFilterChips();
    renderModels();
}

// Comparison Logic
function toggleComparison(modelId) {
    if (selectedModels.has(modelId)) {
        selectedModels.delete(modelId);
    } else {
        if (selectedModels.size >= 4) {
            alert('You can compare up to 4 models at once.');
            document.querySelector(`input[data-id="${modelId}"]`).checked = false;
            return;
        }
        selectedModels.add(modelId);
    }
    updateCompareBar();
}

function updateCompareBar() {
    const bar = document.getElementById('compareBar');
    const count = document.getElementById('compareCount');
    count.textContent = selectedModels.size;
    
    if (selectedModels.size > 0) {
        bar.classList.add('visible');
    } else {
        bar.classList.remove('visible');
    }
}

function clearComparison() {
    selectedModels.clear();
    document.querySelectorAll('.compare-checkbox').forEach(cb => cb.checked = false);
    updateCompareBar();
}

function showComparison() {
    const container = document.getElementById('compareTableContainer');
    const selected = Array.from(selectedModels).map(id => modelsData.find(m => m.id === id));
    
    let html = `<table class="compare-table">
        <thead>
            <tr>
                <th>${t('compareSpecLabel')}</th>
                ${selected.map(m => `<th class="compare-header-cell">${m.name}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>${t('compareParametersLabel')}</th>
                ${selected.map(m => `<td>${m.parameters_billion}B</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareArchitectureLabel')}</th>
                ${selected.map(m => `<td>${m.architecture.toUpperCase()}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareContextLabel')}</th>
                ${selected.map(m => `<td>${formatNumber(m.max_seq_length)}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareHiddenSizeLabel')}</th>
                ${selected.map(m => `<td>${formatNumber(m.hidden_size)}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareLayersLabel')}</th>
                ${selected.map(m => `<td>${m.num_layers}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareLicenseLabel')}</th>
                ${selected.map(m => `<td>${m.license}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareReleaseLabel')}</th>
                ${selected.map(m => `<td>${getRelativeTime(m.created_at)}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareMoeLabel')}</th>
                ${selected.map(m => `<td>${m.moe_num_experts || 'N/A'}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareDataSourceLabel')}</th>
                ${selected.map(m => `<td>${getProvenanceLabel(m.param_source)}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareActionsLabel')}</th>
                ${selected.map(m => `<td style="display: flex; gap: 0.5rem;"><a href="calculator.html?preset=${encodeURIComponent(m.id)}" class="btn btn-primary btn-sm" style="text-decoration: none; justify-content: center;">${t('calculateBtn')}</a><button class="btn btn-secondary btn-sm" onclick="hideComparison(); openCalculatorDrawer('${m.id}')">${t('detailsBtn')}</button></td>`).join('')}
            </tr>
        </tbody>
    </table>`;
    
    container.innerHTML = html;
    document.getElementById('compareModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideComparison() {
    document.getElementById('compareModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

/**
 * Apply filters to models (reusable)
 */
function applyFilters(models) {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    
    return models.filter(model => {
        // Search filter - support tags like "moe", "70b", "qwen"
        const matchesSearch = 
            model.name.toLowerCase().includes(searchTerm) ||
            model.id.toLowerCase().includes(searchTerm) ||
            model.license.toLowerCase().includes(searchTerm) ||
            model.architecture.toLowerCase().includes(searchTerm) ||
            (searchTerm.includes('b') && model.parameters_billion.toString().includes(searchTerm.replace('b', '')));
        
        if (!matchesSearch) return false;
        
        // Recency filter
        if (filters.recency !== 'all') {
            const months = parseInt(filters.recency);
            const diffMonths = (new Date() - new Date(model.created_at)) / (1000 * 60 * 60 * 24 * 30.44);
            if (diffMonths > months) return false;
        }

        // Architecture filter
        if (filters.architecture !== 'all' && model.architecture !== filters.architecture) return false;
        
        // Org filter
        if (filters.org !== 'all' && !model.id.startsWith(filters.org + '/')) return false;

        // Size filter
        if (filters.size !== 'all') {
            const val = filters.size;
            const p = model.parameters_billion;
            if (val === '70-100' && (p < 70 || p >= 100)) return false;
            if (val === '100-200' && (p < 100 || p >= 200)) return false;
            if (val === '200-400' && (p < 200 || p >= 400)) return false;
            if (val === '400+' && p < 400) return false;
        }
        
        return true;
    });
}

// Render models
function renderModels() {
    const filtered = applyFilters(modelsData);

    // Sorting (for hardware view)
    const sorted = [...filtered].sort((a, b) => {
        if (filters.sort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (filters.sort === 'largest') return b.parameters_billion - a.parameters_billion;
        if (filters.sort === 'popular') return (b.downloads + b.likes) - (a.downloads + a.likes);
        return 0;
    });
    
    // Toggle visibility based on current view
    const vendorContainer = document.getElementById('vendorGroups');
    const gridContainer = document.getElementById('modelsGrid');
    
    if (currentView === 'vendor') {
        vendorContainer.style.display = 'flex';
        gridContainer.style.display = 'none';
        
        if (filtered.length === 0) {
            vendorContainer.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 2rem;">No models found matching your criteria</p>';
            return;
        }
        
        renderVendorGroups(filtered);
    } else {
        // Hardware view (existing grid)
        vendorContainer.style.display = 'none';
        gridContainer.style.display = 'grid';
        
        const grid = gridContainer;
        
        if (sorted.length === 0) {
            grid.innerHTML = '<p style="text-align: center; opacity: 0.7; grid-column: 1/-1;">No models found matching your criteria</p>';
            return;
        }
        
        renderHardwareGrid(sorted);
    }
}

/**
 * Render hardware tier grid (existing grid view)
 */
function renderHardwareGrid(models) {
    const grid = document.getElementById('modelsGrid');
    
    grid.innerHTML = models.map(model => renderModelCardHTML(model)).join('');
}

// Legacy function - can be removed later (keeping for backwards compatibility)
function _oldRenderGrid(models) {
    return models.map(model => {
        // Use real calculator for accurate tooltip estimates
        const quickCalcInt8 = calcRequirements({
            paramsB: model.parameters_billion,
            activeParamsB: model.active_parameters_billion || model.parameters_billion,
            weightPrecision: 'int8',
            kvPrecision: 'int8',
            layers: model.num_layers,
            hiddenSize: model.hidden_size,
            heads: model.num_heads,
            promptTokens: 8192,
            newTokens: 512,
            batchSize: 1
        });
        
        const quickCalcBf16 = calcRequirements({
            paramsB: model.parameters_billion,
            activeParamsB: model.active_parameters_billion || model.parameters_billion,
            weightPrecision: 'bf16',
            kvPrecision: 'bf16',
            layers: model.num_layers,
            hiddenSize: model.hidden_size,
            heads: model.num_heads,
            promptTokens: 8192,
            newTokens: 512,
            batchSize: 1
        });
        
        const vramInt8 = quickCalcInt8.totalVramGb;
        const vramBf16 = quickCalcBf16.totalVramGb;
        const minGpus = vramInt8 <= 24 ? '1× RTX 4090' : 
                        vramInt8 <= 48 ? '1× A6000' :
                        vramInt8 <= 80 ? '1× H100' :
                        vramInt8 <= 160 ? '2× H100' :
                        `${Math.ceil(vramInt8/80)}× H100`;
        
        // Check if this model is trending
        const isTrending = trendingModels.some(tm => tm.id === model.id);
        const trendingBadge = isTrending ? '<span class="trending-badge">🔥 Trending</span>' : '';
        
        return `
        <div class="model-card ${isTrending ? 'is-trending' : ''}" onclick="openCalculatorDrawer('${model.id}')">
            ${trendingBadge}
            <div class="model-tooltip">
                <div class="tooltip-title">Quick Estimate (8K context)</div>
                <div class="tooltip-row">
                    <span class="tooltip-label">INT8:</span>
                    <span class="tooltip-value">${vramInt8.toFixed(1)} GB</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">BF16:</span>
                    <span class="tooltip-value">${vramBf16.toFixed(1)} GB</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Min GPU:</span>
                    <span class="tooltip-value">${minGpus}</span>
                </div>
            </div>
            <div class="compare-checkbox-container">
                <input type="checkbox" class="compare-checkbox" data-id="${model.id}" 
                    ${selectedModels.has(model.id) ? 'checked' : ''} 
                    onchange="toggleComparison('${model.id}')" onclick="event.stopPropagation();" title="Add to comparison">
            </div>
            <div class="model-card-header">
                <h3 class="model-name">
                    <span class="freshness-indicator ${getFreshnessClass(model.created_at)}"></span>
                    ${model.name}
                </h3>
                <span class="model-badge badge-${model.architecture}">
                    ${model.architecture.toUpperCase()}
                </span>
            </div>

            <div class="model-meta-row">
                <span class="meta-item">📅 ${getRelativeTime(model.created_at)}</span>
                <span class="provenance-badge">${getProvenanceLabel(model.param_source)}</span>
            </div>
            
            <div class="model-params">
                ${model.parameters_billion}B
            </div>
            
            <div class="model-stats">
                <div class="model-stat">
                    <div class="model-stat-label">Context</div>
                    <div class="model-stat-value">${formatNumber(model.max_seq_length)}</div>
                </div>
                <div class="model-stat">
                    <div class="model-stat-label">Hidden Size</div>
                    <div class="model-stat-value">${formatNumber(model.hidden_size)}</div>
                </div>
                <div class="model-stat">
                    <div class="model-stat-label">Layers</div>
                    <div class="model-stat-value">${model.num_layers}</div>
                </div>
                <div class="model-stat">
                    <div class="model-stat-label">License</div>
                    <div class="model-stat-value">${model.license}</div>
                </div>
                ${model.moe_num_experts ? `
                <div class="model-stat" style="grid-column: span 2; margin-top: 0.25rem;">
                    <div class="model-stat-label">MoE Routing</div>
                    <div class="model-stat-value">${model.moe_num_experts} experts (top-${model.moe_top_k})</div>
                </div>
                ` : ''}
            </div>
            
            <div class="model-actions">
                <a href="calculator.html?preset=${encodeURIComponent(model.id)}" class="btn btn-primary" style="flex: 1; text-decoration: none; justify-content: center; display: flex;" onclick="event.stopPropagation();">
                    Calculate
                </a>
                <button class="btn btn-secondary" style="flex: 1;" onclick="event.stopPropagation(); openCalculatorDrawer('${model.id}');">
                    Details
                </button>
            </div>
        </div>
    `;
    }).join('');
}

// Render metadata
function renderMetadata(metadata) {
    const date = new Date(metadata.updated_at);
    const trendingCount = trendingModels.length;
    const trendingInfo = trendingCount > 0 
        ? `${trendingCount} ${t('metadataTrending')}` 
        : t('metadataNoTrending');
    
    document.getElementById('metadata').innerHTML = `
        ${t('metadataLastUpdated')} ${date.toLocaleDateString()} | 
        ${metadata.count} ${t('metadataModels')} | 
        ${trendingInfo} | 
        ${t('metadataSource')} ${t('metadataSourceValue')} | 
        <a href="about.html" style="color: var(--accent); text-decoration: none;">About</a>
    `;
}

// Format large numbers
function formatNumber(num) {
    if (!num) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Search functionality
document.getElementById('searchBox').addEventListener('input', renderModels);

// Filter functionality initialization
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        const group = tag.parentElement.dataset.group;
        const val = tag.dataset.val;
        setFilter(group, val);
    });
});

// View toggle functionality
document.getElementById('viewVendorBtn')?.addEventListener('click', () => {
    currentView = 'vendor';
    document.getElementById('viewVendorBtn').classList.add('active');
    document.getElementById('viewHardwareBtn').classList.remove('active');
    renderModels();
});

document.getElementById('viewHardwareBtn')?.addEventListener('click', () => {
    currentView = 'hardware';
    document.getElementById('viewHardwareBtn').classList.add('active');
    document.getElementById('viewVendorBtn').classList.remove('active');
    renderModels();
});

// Listen to language change events and re-render
window.addEventListener('languageChanged', () => {
    renderModels();
    if (originalMetadata) {
        renderMetadata(originalMetadata);
    }
});

