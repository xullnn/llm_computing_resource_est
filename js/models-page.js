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
 */
function calculateTrendingScore(model) {
    if (!model.created_at) return 0;
    const now = new Date();
    const createdDate = new Date(model.created_at);
    const daysSinceCreated = (now - createdDate) / (1000 * 60 * 60 * 24);
    const monthsSinceCreated = daysSinceCreated / 30.44;

    if (monthsSinceCreated > 3) return 0;

    const recencyScore = Math.max(0, (90 - daysSinceCreated) / 90) * 100;
    const downloadScore = (model.downloads || 0) < 10000 ? 0 : Math.min((model.downloads || 0) / 1000, 100);
    const likeScore = (model.likes || 0) < 1000 ? 0 : Math.min((model.likes || 0) / 100, 100);

    if (downloadScore === 0 || likeScore === 0) return 0;

    return (recencyScore * 0.4) + (downloadScore * 0.4) + (likeScore * 0.2);
}

/**
 * Calculate and populate trending models
 */
function populateTrendingModels() {
    if (!modelsData || modelsData.length === 0) return;

    const modelsWithScores = modelsData
        .map(model => ({
            ...model,
            trendingScore: calculateTrendingScore(model)
        }))
        .filter(model => model.trendingScore > 0)
        .sort((a, b) => b.trendingScore - a.trendingScore);

    trendingModels = modelsWithScores;

    const bar = document.getElementById('trendingBar');
    if (bar) {
        if (trendingModels.length === 0) {
            bar.style.display = 'none';
        } else {
            bar.style.display = 'block';
            renderTrendingBar();
        }
    }
}

/**
 * Render trending bar
 */
function renderTrendingBar() {
    const container = document.getElementById('trendingBarTags');
    const expandBtn = document.getElementById('trendingExpandBtn');
    if (!container) return;

    const displayCount = trendingExpanded ? trendingModels.length : Math.min(3, trendingModels.length);
    const visibleModels = trendingModels.slice(0, displayCount);

    container.innerHTML = visibleModels.map(model => `
        <a class="trending-bar-tag" onclick="openCalculatorDrawer('${model.id}'); event.preventDefault();" href="#">
            <span class="fire-emoji">🔥</span>
            <span>${(model.name || '').replace(/Instruct|Chat|Base/gi, '').trim()}</span>
        </a>
    `).join('');

    if (expandBtn) {
        if (trendingModels.length > 3) {
            expandBtn.style.display = 'block';
            const moreCount = document.getElementById('trendingMoreCount');
            const expandText = document.getElementById('trendingExpandText');
            if (trendingExpanded) {
                if (expandText) expandText.textContent = 'Show less';
            } else {
                if (moreCount) moreCount.textContent = trendingModels.length - 3;
                if (expandText) expandText.innerHTML = `+<span id="trendingMoreCount">${trendingModels.length - 3}</span> more`;
            }
        } else {
            expandBtn.style.display = 'none';
        }
    }
}

/**
 * Group models by vendor
 */
function groupModelsByVendor(models) {
    const grouped = {};
    models.forEach(model => {
        const vendor = model.id.split('/')[0];
        if (!grouped[vendor]) grouped[vendor] = [];
        grouped[vendor].push(model);
    });
    Object.keys(grouped).forEach(v => {
        grouped[v].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    });
    return grouped;
}

/**
 * Group models by hardware tier
 */
function groupModelsByHardware(models) {
    const tiers = { consumer: [], workstation: [], infrastructure: [] };
    models.forEach(model => {
        const req = calcRequirements({
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
        const vram = req.totalVramGb;
        if (vram < 24) tiers.consumer.push(model);
        else if (vram <= 80) tiers.workstation.push(model);
        else tiers.infrastructure.push(model);
    });
    Object.keys(tiers).forEach(k => {
        tiers[k].sort((a, b) => (a.parameters_billion || 0) - (b.parameters_billion || 0));
    });
    return tiers;
}

/**
 * Render vendor groups
 */
function renderVendorGroups(models) {
    const container = document.getElementById('vendorGroups');
    if (!container) return;
    const grouped = groupModelsByVendor(models);
    const sortedVendors = Object.keys(grouped).sort();

    container.innerHTML = sortedVendors.map(vendor => {
        const vendorModels = grouped[vendor];
        const isExpanded = expandedVendors.has(vendor) || expandedVendors.size === 0;
        const visibleModels = isExpanded ? vendorModels.slice(0, 4) : [];
        const hasMore = vendorModels.length > 4;

        return `
            <div class="vendor-group ${isExpanded ? '' : 'collapsed'}" data-vendor="${vendor}">
                <div class="vendor-header" onclick="toggleVendor('${vendor}')">
                    <button class="vendor-toggle">${isExpanded ? '🔽' : '▷'}</button>
                    <h3 class="vendor-title">${vendor} <span class="vendor-count">(${vendorModels.length} models)</span></h3>
                    <span class="vendor-param-range">${Math.min(...vendorModels.map(m => m.parameters_billion))}B ◄─► ${Math.max(...vendorModels.map(m => m.parameters_billion))}B</span>
                </div>
                <div class="vendor-content ${isExpanded ? 'expanded' : ''}">
                    <div class="vendor-models-grid">${visibleModels.map(renderModelCardHTML).join('')}</div>
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
 * Extract model card HTML
 */
function renderModelCardHTML(model) {
    const q8 = calcRequirements({
        paramsB: model.parameters_billion,
        activeParamsB: model.active_parameters_billion || model.parameters_billion,
        weightPrecision: 'int8', kvPrecision: 'int8',
        layers: model.num_layers, hiddenSize: model.hidden_size, heads: model.num_heads,
        promptTokens: 8192, newTokens: 512, batchSize: 1, targetTps: 10
    });
    const bf = calcRequirements({
        paramsB: model.parameters_billion,
        activeParamsB: model.active_parameters_billion || model.parameters_billion,
        weightPrecision: 'bf16', kvPrecision: 'bf16',
        layers: model.num_layers, hiddenSize: model.hidden_size, heads: model.num_heads,
        promptTokens: 8192, newTokens: 512, batchSize: 1, targetTps: 10
    });

    const isTrending = trendingModels.some(tm => tm.id === model.id);
    const tokens4090 = Math.min(30, Math.floor(1000 / q8.requiredBwGbps * 10));
    const tokensH100 = Math.min(100, Math.floor(3350 / q8.requiredBwGbps * 10));

    return `
    <div class="model-card-compact ${isTrending ? 'is-trending' : ''}" onclick="openCalculatorDrawer('${model.id}')">
        <label class="compare-toggle" onclick="event.stopPropagation();">
            <input type="checkbox" class="compare-checkbox" data-id="${model.id}" 
                ${selectedModels.has(model.id) ? 'checked' : ''} onchange="toggleComparison('${model.id}')">
            <span class="compare-label">${t('compareLabel')}</span>
        </label>
        <div class="card-header-compact">
            <h4 class="model-name-compact">${model.name}</h4>
            <div class="card-badges">
                ${isTrending ? '<span class="trending-badge">🔥</span>' : ''}
                <span class="arch-badge badge-${model.architecture}">${model.architecture.toUpperCase()}</span>
            </div>
        </div>
        <div class="param-size-compact">${model.parameters_billion}B</div>
        <div class="resource-metrics">
            <div class="metric-row vram-row">
                <span class="metric-label">${t('vramLabel')}</span>
                <span class="metric-value">${Math.ceil(q8.totalVramGb)}GB INT8 · ${Math.ceil(bf.totalVramGb)}GB BF16</span>
            </div>
            <div class="metric-row bandwidth-row">
                <span class="metric-label">${t('speedLabel')}</span>
                <span class="metric-value">~${Math.ceil(q8.requiredBwGbps)} GB/s</span>
            </div>
            <div class="metric-row perf-row">
                <span class="metric-label">${t('estLabel')}</span>
                <span class="metric-value">${tokens4090} tok/s (4090) · ${tokensH100} tok/s (H100)</span>
            </div>
        </div>
        <div class="model-actions-compact">
            <a href="calculator.html?preset=${encodeURIComponent(model.id)}" class="btn btn-primary btn-sm" onclick="event.stopPropagation();">${t('calculateBtn')}</a>
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openCalculatorDrawer('${model.id}');">${t('detailsBtn')}</button>
        </div>
    </div>`;
}

// Global functions
window.toggleVendor = function (vendor) {
    const group = document.querySelector(`[data-vendor="${vendor}"]`);
    if (!group) return;
    if (group.classList.contains('collapsed')) {
        group.classList.remove('collapsed');
        expandedVendors.add(vendor);
    } else {
        group.classList.add('collapsed');
        expandedVendors.delete(vendor);
    }
    renderModels();
};

window.showAllVendorModels = function (vendor) {
    const models = modelsData.filter(m => m.id.split('/')[0] === vendor);
    const filtered = applyFilters(models);
    const group = document.querySelector(`[data-vendor="${vendor}"]`);
    if (!group) return;
    const grid = group.querySelector('.vendor-models-grid');
    const button = group.querySelector('.vendor-show-more');
    if (grid) grid.innerHTML = filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).map(renderModelCardHTML).join('');
    if (button) button.style.display = 'none';
};

/**
 * Filter and Sort logic
 */
function applyFilters(models) {
    const searchEl = document.getElementById('searchBox');
    const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
    return models.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm) || m.id.toLowerCase().includes(searchTerm) || m.architecture.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
        if (filters.recency !== 'all') {
            const diff = (new Date() - new Date(m.created_at)) / (1000 * 60 * 60 * 24 * 30.44);
            if (diff > parseInt(filters.recency)) return false;
        }
        if (filters.architecture !== 'all' && m.architecture !== filters.architecture) return false;
        if (filters.org !== 'all' && !m.id.startsWith(filters.org + '/')) return false;
        if (filters.size !== 'all') {
            const p = m.parameters_billion;
            if (filters.size === '70-100' && (p < 70 || p >= 100)) return false;
            if (filters.size === '100-200' && (p < 100 || p >= 200)) return false;
            if (filters.size === '200-400' && (p < 200 || p >= 400)) return false;
            if (filters.size === '400+' && p < 400) return false;
        }
        return true;
    });
}

function renderModels() {
    const filtered = applyFilters(modelsData);
    const sorted = [...filtered].sort((a, b) => {
        if (filters.sort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (filters.sort === 'largest') return b.parameters_billion - a.parameters_billion;
        if (filters.sort === 'popular') return (b.downloads + b.likes) - (a.downloads + a.likes);
        return 0;
    });

    const vC = document.getElementById('vendorGroups');
    const gC = document.getElementById('modelsGrid');

    if (currentView === 'vendor') {
        if (vC) {
            vC.style.display = 'flex';
            if (filtered.length === 0) vC.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 2rem;">No models found</p>';
            else renderVendorGroups(filtered);
        }
        if (gC) gC.style.display = 'none';
    } else {
        if (vC) vC.style.display = 'none';
        if (gC) {
            gC.style.display = 'flex'; gC.style.flexDirection = 'column'; gC.style.gap = '1.5rem';
            if (sorted.length === 0) gC.innerHTML = '<p style="text-align: center; opacity: 0.7;">No models found</p>';
            else renderHardwareGrid(sorted);
        }
    }
}

function renderHardwareGrid(models) {
    const tiered = groupModelsByHardware(models);
    const container = document.getElementById('modelsGrid');
    if (!container) return;
    const tierOrder = ['consumer', 'workstation', 'infrastructure'];
    container.innerHTML = tierOrder.map(tierKey => {
        const tierModels = tiered[tierKey];
        if (tierModels.length === 0) return '';
        const title = t(`tier${tierKey.charAt(0).toUpperCase() + tierKey.slice(1)}Title`);
        const desc = t(`tier${tierKey.charAt(0).toUpperCase() + tierKey.slice(1)}Desc`);
        const tierId = `tier-${tierKey}`;
        const isExpanded = expandedVendors.has(tierId) || expandedVendors.size === 0;
        return `
            <div class="vendor-group ${isExpanded ? '' : 'collapsed'}" data-vendor="${tierId}">
                <div class="vendor-header" onclick="toggleVendor('${tierId}')">
                    <button class="vendor-toggle">${isExpanded ? '🔽' : '▷'}</button>
                    <h3 class="vendor-title">${title} <span class="vendor-count">(${tierModels.length} models)</span></h3>
                    <span class="vendor-param-range" style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">${desc}</span>
                </div>
                <div class="vendor-content ${isExpanded ? 'expanded' : ''}">
                    <div class="vendor-models-grid">${tierModels.map(renderModelCardHTML).join('')}</div>
                </div>
            </div>`;
    }).join('');
}

function renderMetadata(metadata) {
    const el = document.getElementById('metadata');
    if (!el || !metadata) return;
    const date = new Date(metadata.updated_at);
    const trendingInfo = trendingModels.length > 0 ? `${trendingModels.length} ${t('metadataTrending')}` : t('metadataNoTrending');
    el.innerHTML = `${t('metadataLastUpdated')} ${date.toLocaleDateString()} | ${metadata.count} ${t('metadataModels')} | ${trendingInfo} | ${t('metadataSource')} ${t('metadataSourceValue')} | <a href="about.html" style="color: var(--accent); text-decoration: none;">About</a>`;
}

function updateFilterCounts() {
    document.querySelectorAll('.filter-tag').forEach(tag => {
        const group = tag.parentElement.dataset.group;
        if (!group) return;
        const val = tag.dataset.val;
        let count = 0;
        if (group === 'recency') {
            if (val === 'all') count = modelsData.length;
            else count = modelsData.filter(m => ((new Date() - new Date(m.created_at)) / (1000 * 60 * 60 * 24 * 30.44)) <= parseInt(val)).length;
        } else if (group === 'architecture') {
            if (val === 'all') count = modelsData.length;
            else count = modelsData.filter(m => m.architecture === val).length;
        } else if (group === 'org') {
            if (val === 'all') count = modelsData.length;
            else count = modelsData.filter(m => m.id.startsWith(val + '/')).length;
        } else if (group === 'size') {
            if (val === 'all') count = modelsData.length;
            else {
                if (val === '70-100') count = modelsData.filter(m => m.parameters_billion >= 70 && m.parameters_billion < 100).length;
                else if (val === '100-200') count = modelsData.filter(m => m.parameters_billion >= 100 && m.parameters_billion < 200).length;
                else if (val === '200-400') count = modelsData.filter(m => m.parameters_billion >= 200 && m.parameters_billion < 400).length;
                else if (val === '400+') count = modelsData.filter(m => m.parameters_billion >= 400).length;
            }
        }
        const text = tag.textContent.split('\n')[0].trim().replace(/\d+$/, '');
        tag.innerHTML = `${text} <span class="count">${count}</span>`;
    });
}

function updateFilterChips() {
    const container = document.getElementById('activeFilterChips');
    if (!container) return;

    let chips = [];

    if (filters.recency !== 'all') {
        const el = document.querySelector(`[data-group="recency"] [data-val="${filters.recency}"]`);
        const label = el ? el.textContent.split('\n')[0].trim() : filters.recency;
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

window.setFilter = function (group, val) {
    filters[group] = val;

    // Update UI tags
    document.querySelectorAll(`[data-group="${group}"] .filter-tag`).forEach(tag => {
        tag.classList.toggle('active', tag.dataset.val === val);
    });

    updateFilterChips();
    renderModels();
};

window.clearAllFilters = function () {
    filters = { recency: 'all', architecture: 'all', org: 'all', size: 'all', sort: 'newest' };
    document.querySelectorAll('.filter-tag').forEach(tag => {
        const group = tag.parentElement.dataset.group;
        if (group) {
            tag.classList.toggle('active', tag.dataset.val === filters[group]);
        }
    });
    updateFilterChips();
    renderModels();
};

// Initialize
fetch('data/models.json')
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
        modelsData = data.models;
        originalMetadata = data.metadata;

        // Populate Org Filters
        const orgs = [...new Set(modelsData.map(m => m.id.split('/')[0]))].sort();
        const orgContainer = document.getElementById('orgFilterTags');
        if (orgContainer) {
            orgs.forEach(org => {
                const btn = document.createElement('button');
                btn.className = 'filter-tag'; btn.dataset.val = org; btn.textContent = org;
                btn.onclick = () => setFilter('org', org);
                orgContainer.appendChild(btn);
            });
        }

        updateFilterCounts();
        populateTrendingModels();
        renderModels();
        renderMetadata(data.metadata);
    })
    .catch(err => {
        console.error('Failed to load models:', err);
        const vC = document.getElementById('vendorGroups');
        const gC = document.getElementById('modelsGrid');
        const msg = `<p style="text-align: center; opacity: 0.7; padding: 2rem;">Failed to load models data</p>`;
        if (vC) vC.innerHTML = msg;
        if (gC) gC.innerHTML = msg;
    });

document.getElementById('searchBox')?.addEventListener('input', renderModels);
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

window.addEventListener('languageChanged', () => {
    renderModels();
    updateFilterCounts();
    if (originalMetadata) renderMetadata(originalMetadata);
});

// Initialize filter listeners
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        const group = tag.parentElement.dataset.group;
        if (group) {
            setFilter(group, tag.dataset.val);
        }
    });
});

// Utility functions
function formatNumber(num) {
    if (!num) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

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

function getProvenanceLabel(source) {
    const labels = {
        'safetensors': '⚡ Safetensors',
        'stated': '📄 README',
        'estimated': '🧮 Physics',
        'manual_override': '🛠️ Manual'
    };
    return labels[source] || 'Unknown';
}

// Comparison Logic
window.toggleComparison = function (modelId) {
    if (selectedModels.has(modelId)) {
        selectedModels.delete(modelId);
    } else {
        if (selectedModels.size >= 4) {
            alert('You can compare up to 4 models at once.');
            // Uncheck the checkbox
            const cb = document.querySelector(`.compare-checkbox[data-id="${modelId}"]`);
            if (cb) cb.checked = false;
            return;
        }
        selectedModels.add(modelId);
    }
    updateCompareBar();
};

function updateCompareBar() {
    const bar = document.getElementById('compareBar');
    const count = document.getElementById('compareCount');
    if (!bar || !count) return;

    count.textContent = selectedModels.size;

    if (selectedModels.size > 0) {
        bar.classList.add('visible');
    } else {
        bar.classList.remove('visible');
    }
}

window.clearComparison = function () {
    selectedModels.clear();
    document.querySelectorAll('.compare-checkbox').forEach(cb => cb.checked = false);
    updateCompareBar();
};

window.showComparison = function () {
    const container = document.getElementById('compareTableContainer');
    const selected = Array.from(selectedModels).map(id => modelsData.find(m => m.id === id));

    let html = `<table class="compare-table">
        <thead>
            <tr>
                <th>${t('compareSpecLabel') || 'Spec'}</th>
                ${selected.map(m => `<th class="compare-header-cell">${m.name}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>${t('compareParametersLabel') || 'Parameters'}</th>
                ${selected.map(m => `<td>${m.parameters_billion}B</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareArchitectureLabel') || 'Architecture'}</th>
                ${selected.map(m => `<td>${m.architecture.toUpperCase()}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareContextLabel') || 'Context Length'}</th>
                ${selected.map(m => `<td>${formatNumber(m.max_seq_length)}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareHiddenSizeLabel') || 'Hidden Size'}</th>
                ${selected.map(m => `<td>${formatNumber(m.hidden_size)}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareLayersLabel') || 'Layers'}</th>
                ${selected.map(m => `<td>${m.num_layers}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareLicenseLabel') || 'License'}</th>
                ${selected.map(m => `<td>${m.license}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareReleaseLabel') || 'Release'}</th>
                ${selected.map(m => `<td>${getRelativeTime(m.created_at)}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareMoeLabel') || 'MoE Experts'}</th>
                ${selected.map(m => `<td>${m.moe_num_experts || 'N/A'}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareDataSourceLabel') || 'Data Source'}</th>
                ${selected.map(m => `<td>${getProvenanceLabel(m.param_source)}</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareActionsLabel') || 'Actions'}</th>
                ${selected.map(m => `<td><button class="btn btn-primary btn-sm" onclick="window.useInCalculator('${m.id}')">${t('calculateBtn') || 'Size'}</button></td>`).join('')}
            </tr>
        </tbody>
    </table>`;

    container.innerHTML = html;
    document.getElementById('compareModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.hideComparison = function () {
    document.getElementById('compareModal').style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.useInCalculator = function (modelId) {
    // In index.html context, we want to open the calculator drawer
    if (window.openCalculatorDrawer) {
        window.hideComparison();
        window.openCalculatorDrawer(modelId);
    } else {
        // Fallback to calculator.html page
        window.location.href = `calculator.html?preset=${encodeURIComponent(modelId)}`;
    }
};

// Toggle filter group
document.getElementById('filterToggleBtn')?.addEventListener('click', () => {
    const group = document.getElementById('filterGroup');
    if (group) {
        const isHidden = group.style.display === 'none';
        group.style.display = isHidden ? 'block' : 'none';
        document.getElementById('filterToggleBtn').classList.toggle('active', isHidden);
    }
});

// Trending info tooltip toggle
document.getElementById('trendingInfoBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const criteria = document.getElementById('trendingCriteria');
    if (criteria) {
        criteria.style.display = criteria.style.display === 'none' ? 'block' : 'none';
    }
});

document.addEventListener('click', () => {
    const criteria = document.getElementById('trendingCriteria');
    if (criteria) criteria.style.display = 'none';
});

document.getElementById('trendingExpandBtn')?.addEventListener('click', () => {
    trendingExpanded = !trendingExpanded;
    renderTrendingBar();
});
