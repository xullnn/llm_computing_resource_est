/**
 * Models Page Script
 * Handles model grid, filtering, search, and comparison
 */

let modelsData = [];
let originalMetadata = null; // Store original metadata for re-renders
let selectedModels = new Set();
// Initialize selected models from localStorage
try {
    const saved = localStorage.getItem('llm_compare_cart');
    if (saved) {
        JSON.parse(saved).forEach(id => selectedModels.add(id));
    }
} catch (e) {
    console.error('Failed to load comparison cart', e);
}

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

    // Lower thresholds to allow growing models to appear
    // Old: 10k downloads, 1k likes. New: 1k downloads, 100 likes.
    const downloadScore = (model.downloads || 0) < 1000 ? 0 : Math.min((model.downloads || 0) / 1000, 100);
    const likeScore = (model.likes || 0) < 100 ? 0 : Math.min((model.likes || 0) / 100, 100);

    // Remove the strict "AND" condition (if (downloadScore === 0 || likeScore === 0) return 0;)
    // Now a model can trend if it has EITHER valid downloads OR valid likes
    if (downloadScore === 0 && likeScore === 0) return 0;

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

    const displayCount = trendingExpanded ? trendingModels.length : Math.min(5, trendingModels.length);
    const visibleModels = trendingModels.slice(0, displayCount);

    container.innerHTML = visibleModels.map(model => `
        <a class="trending-bar-tag" onclick="openCalculatorDrawer('${model.id}'); event.preventDefault();" href="#">
            <span class="fire-emoji">🔥</span>
            <span>${(model.name || '').replace(/Instruct|Chat|Base/gi, '').trim()}</span>
        </a>
    `).join('');

    if (expandBtn) {
        if (trendingModels.length > 5) {
            expandBtn.style.display = 'block';
            const moreCount = document.getElementById('trendingMoreCount');
            const expandText = document.getElementById('trendingExpandText');
            if (trendingExpanded) {
                if (expandText) expandText.textContent = 'Show less';
            } else {
                if (moreCount) moreCount.textContent = trendingModels.length - 5;
                if (expandText) expandText.innerHTML = `+<span id="trendingMoreCount">${trendingModels.length - 5}</span> more`;
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
 * Variant type priority order
 * Lower number = higher priority
 */
const VARIANT_TYPES = {
    REASONING: { priority: 1, icon: '🧠', label: 'Reasoning' },
    CHAT: { priority: 2, icon: '💬', label: 'Chat' },
    INSTRUCT: { priority: 3, icon: '📖', label: 'Instruct' },
    CODER: { priority: 4, icon: '💻', label: 'Code Specialist' },
    MATH: { priority: 4, icon: '🔢', label: 'Math Specialist' },
    PROVER: { priority: 4, icon: '🔬', label: 'Proof Specialist' },
    BASE: { priority: 5, icon: '📦', label: 'Base Model' },
    OTHER: { priority: 6, icon: '⚙️', label: 'Variant' }
};

/**
 * Classify a model variant type based on name
 */
function classifyVariant(model) {
    const name = model.name.toLowerCase();
    const id = model.id.toLowerCase();

    // Reasoning/Thinking models (highest priority)
    if (name.includes('r1') || name.includes('thinking') || name.includes('reason')) {
        return VARIANT_TYPES.REASONING;
    }

    // Specialized models
    if (name.includes('coder') || id.includes('coder')) {
        return VARIANT_TYPES.CODER;
    }
    if (name.includes('math')) {
        return VARIANT_TYPES.MATH;
    }
    if (name.includes('prover')) {
        return VARIANT_TYPES.PROVER;
    }

    // Base models
    if (name.includes('base')) {
        return VARIANT_TYPES.BASE;
    }

    // Instruct models
    if (name.includes('instruct')) {
        return VARIANT_TYPES.INSTRUCT;
    }

    // Chat models (explicit chat or version numbers without other keywords)
    if (name.includes('chat') || (/v\d+(\.\d+)?(\s|$)/.test(name) && !name.includes('base') && !name.includes('instruct'))) {
        return VARIANT_TYPES.CHAT;
    }

    // Default to other
    return VARIANT_TYPES.OTHER;
}

/**
 * Group models by parameter class (similar sizes grouped together)
 * Groups models within ~2B tolerance to handle 684.5B and 685.4B as same family
 */
function groupByParameterClass(models) {
    if (!models || models.length === 0) return {};

    // Sort by parameter size descending
    const sorted = [...models].sort((a, b) => b.parameters_billion - a.parameters_billion);

    const classes = {};
    const tolerance = 5; // Group models within 5B of each other

    sorted.forEach(model => {
        const params = model.parameters_billion;

        // Find existing class within tolerance
        let classKey = null;
        for (const key of Object.keys(classes)) {
            const classParams = parseFloat(key);
            if (Math.abs(params - classParams) <= tolerance) {
                classKey = key;
                break;
            }
        }

        // If no matching class found, create new one with rounded key
        if (!classKey) {
            const roundedParams = Math.round(params);
            classKey = roundedParams.toString();
        }

        if (!classes[classKey]) {
            classes[classKey] = [];
        }
        classes[classKey].push(model);
    });

    // Sort models within each class by variant priority
    Object.keys(classes).forEach(classKey => {
        classes[classKey].sort((a, b) => {
            const typeA = classifyVariant(a);
            const typeB = classifyVariant(b);

            // Primary sort: by variant priority
            if (typeA.priority !== typeB.priority) {
                return typeA.priority - typeB.priority;
            }

            // Secondary sort: by downloads/popularity
            const popularityA = (a.downloads || 0) + (a.likes || 0);
            const popularityB = (b.downloads || 0) + (b.likes || 0);
            return popularityB - popularityA;
        });
    });

    return classes;
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
 * Render vendor groups with parameter class grouping
 */
function renderVendorGroups(models) {
    const container = document.getElementById('vendorGroups');
    if (!container) return;
    const grouped = groupModelsByVendor(models);
    const sortedVendors = Object.keys(grouped).sort();

    // Controls for Expand/Collapse All
    const allExpanded = sortedVendors.every(v => expandedVendors.has(v));


    const groupsHTML = sortedVendors.map(vendor => {
        const vendorModels = grouped[vendor];
        const isExpanded = expandedVendors.has(vendor); // Default collapsed

        // Group vendor models by parameter class
        const paramClasses = groupByParameterClass(vendorModels);
        // Sort param classes ascending (smaller first) for better UX
        const sortedClassKeys = Object.keys(paramClasses).sort((a, b) => parseFloat(a) - parseFloat(b));

        // Always show first row (smallest model)
        const firstClassKey = sortedClassKeys[0];
        const remainingClassKeys = sortedClassKeys.slice(1);
        const hasMore = remainingClassKeys.length > 0;

        // Generate param class pills
        const paramClassPills = sortedClassKeys
            .map(classKey => `
                <span class="param-pill" onclick="expandVendorAndScrollToClass(event, '${vendor}', '${classKey}')">
                    ${Math.round(parseFloat(classKey))}B <span class="pill-count">x${paramClasses[classKey].length}</span>
                </span>
            `)
            .join('');

        return `
            <div class="vendor-group ${isExpanded ? '' : 'collapsed'}" data-vendor="${vendor}">
                <div class="vendor-header" onclick="${hasMore ? `toggleVendor('${vendor}')` : ''}" style="${!hasMore ? 'cursor: default' : ''}">
                    <div class="vendor-header-info">
                        <div class="vendor-title-row">
                            <h3 class="vendor-title">${vendor}</h3>
                            <span class="vendor-count">${vendorModels.length} models</span>
                        </div>
                        <div class="vendor-param-pills">${paramClassPills}</div>
                    </div>
                    
                    ${hasMore ? `
                    <div class="vendor-toggle-wrapper">
                        <span class="vendor-toggle-text">${isExpanded ? 'Collapse' : 'Expand'}</span>
                        <button class="vendor-toggle-btn">
                            ${isExpanded ? '−' : '+'}
                        </button>
                    </div>` : ''}
                </div>
                
                <div class="vendor-preview">
                    ${firstClassKey ? renderParameterClassHTML(firstClassKey, paramClasses[firstClassKey]) : ''}
                </div>

                <div class="vendor-content ${isExpanded ? 'expanded' : ''}">
                    ${remainingClassKeys.map(classKey =>
            renderParameterClassHTML(classKey, paramClasses[classKey])
        ).join('')}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = groupsHTML;
}

/**
 * Render a parameter class row with horizontal layout
 */
function renderParameterClassHTML(classKey, models) {
    if (!models || models.length === 0) return '';

    const paramSize = Math.round(parseFloat(classKey));
    const firstModel = models[0];
    const architecture = firstModel.architecture;

    // Calculate specs for default 10 tokens/s
    const specs10 = calcRequirements({
        paramsB: firstModel.parameters_billion,
        activeParamsB: firstModel.active_parameters_billion || firstModel.parameters_billion,
        weightPrecision: 'int8',
        kvPrecision: 'int8',
        layers: firstModel.num_layers,
        hiddenSize: firstModel.hidden_size,
        heads: firstModel.num_heads,
        promptTokens: 8192,
        newTokens: 512,
        batchSize: 1,
        targetTps: 10
    });

    const specs10BF16 = calcRequirements({
        paramsB: firstModel.parameters_billion,
        activeParamsB: firstModel.active_parameters_billion || firstModel.parameters_billion,
        weightPrecision: 'bf16',
        kvPrecision: 'bf16',
        layers: firstModel.num_layers,
        hiddenSize: firstModel.hidden_size,
        heads: firstModel.num_heads,
        promptTokens: 8192,
        newTokens: 512,
        batchSize: 1,
        targetTps: 10
    });

    // Determine visibility - show first 2-3 model cards, hide rest
    const maxVisible = 2;
    const visibleModels = models.slice(0, maxVisible);
    const hiddenModels = models.slice(maxVisible);

    // Generate TTFT chart thumbnail
    const ttftThumbnail = renderTTFTChartThumbnail(firstModel.parameters_billion);

    // Generate TTFT modal (will be hidden initially)
    const ttftModal = renderTTFTChartModal(
        firstModel.parameters_billion,
        `${paramSize}B Class`,
        classKey
    );

    // Generate model cards HTML
    const modelCardsHTML = models.map((model, idx) => {
        const variantType = classifyVariant(model);
        const isPrimary = idx === 0;
        const isHidden = idx >= maxVisible;

        return `
            <div class="model-card ${isPrimary ? 'primary' : ''} ${isHidden ? 'overflow-hidden' : ''}" onclick="openCalculatorDrawer('${model.id}')">
                <div class="model-card-header">
                    <span class="model-icon">${variantType.icon}</span>
                    <div class="model-info">
                        <div class="model-name">${model.name}</div>
                        <div class="model-type">${variantType.label}${isPrimary ? ' <span class="primary-badge">⭐ PRIMARY</span>' : ''}</div>
                    </div>
                </div>
                <div class="model-stats">
                    <span class="stat-pill">📥 ${formatNumber(model.downloads || 0)} / ${formatNumber(model.downloads_all_time)} (30d / All)</span>
                    <span class="stat-pill">♥ ${formatNumber(model.likes || 0)}</span>
                </div>
                <button class="compare-add-btn ${selectedModels.has(model.id) ? 'active' : ''}" 
                    onclick="event.stopPropagation(); toggleComparison('${model.id}')"
                    title="${selectedModels.has(model.id) ? 'Remove from comparison' : 'Add to comparison'}">
                    <span class="btn-icon">${selectedModels.has(model.id) ? '✓' : '+'}</span><span class="btn-text">${selectedModels.has(model.id) ? 'Added' : 'Compare'}</span>
                </button>
                <div class="model-release-date">
                    <span class="date-pill">📅 ${formatDate(model.created_at)}</span>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="param-row" data-class="${classKey}" data-params-b="${firstModel.parameters_billion}" data-active-params-b="${firstModel.active_parameters_billion || firstModel.parameters_billion}" data-layers="${firstModel.num_layers}" data-hidden-size="${firstModel.hidden_size}" data-heads="${firstModel.num_heads}">
            <div class="param-info">
                <div class="param-size">${paramSize}B</div>
                <div class="param-count">${models.length} models</div>
                <span class="arch-badge ${architecture === 'moe' ? '' : 'dense'}">${architecture === 'moe' ? 'MOE' : 'DENSE'}</span>
            </div>

            <div class="specs-section">
                <div class="spec-box">
                    <div class="spec-box-header">
                        <div style="display: flex; align-items: center; gap: 0.4rem;">
                            <span class="spec-box-icon">⚡</span>
                            <span class="spec-box-title">Output Speed</span>
                        </div>
                        <select class="speed-dropdown" onchange="updateSpeedRequirements(this, '${classKey}')">
                            <option value="10" selected>10 tokens/s</option>
                            <option value="100">100 tokens/s</option>
                            <option value="1000">1,000 tokens/s</option>
                            <option value="10000">10,000 tokens/s</option>
                        </select>
                    </div>
                    <div class="spec-box-content" data-speed-content="${classKey}">
                        <strong>VRAM:</strong> ${Math.ceil(specs10.totalVramGb)} GB <span class="detail">(INT8)</span><br>
                        <span class="detail">or ${Math.ceil(specs10BF16.totalVramGb)} GB (BF16)</span><br>
                        <strong>Bandwidth:</strong> ~${Math.ceil(specs10.requiredBwGbps)} GB/s
                    </div>
                </div>
                <div class="spec-box">
                    <div class="spec-box-header" style="justify-content: flex-start;">
                        <span class="spec-box-icon">⏱</span>
                        <span class="spec-box-title">Time To First Token</span>
                    </div>
                    <div class="spec-box-content">
                        <div class="ttft-mini-chart" onclick="openTTFTChart('${classKey}', event)" style="cursor: pointer;">
                            ${ttftThumbnail}
                        </div>
                        <div class="ttft-action-btn" onclick="openTTFTChart('${classKey}', event)">Click to explore TTFT vs FLOPs</div>
                    </div>
                </div>
            </div>

            ${ttftModal}

            <div class="models-section">
                <div class="models-container" id="models-${classKey}">
                    ${modelCardsHTML}
                </div>
                ${hiddenModels.length > 0 ? `
                    <div class="more-models-trigger">
                        <button class="more-btn" onclick="toggleMoreModels(this, 'models-${classKey}', ${hiddenModels.length})">
                            + ${hiddenModels.length} models <span class="more-btn-icon">→</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Render individual variant chip
 */
function renderVariantChipHTML(model, isPrimary) {
    const variantType = classifyVariant(model);
    const popularity = (model.downloads || 0) + (model.likes || 0);

    return `
        <div class="variant-chip ${isPrimary ? 'primary' : ''}" onclick="openCalculatorDrawer('${model.id}'); event.stopPropagation();">
            <span class="variant-icon">${variantType.icon}</span>
            <div class="variant-info">
                <div class="variant-name">${model.name}</div>
                <div class="variant-type">${variantType.label}${isPrimary ? ' ⭐ Primary' : ''}</div>
                ${model.downloads || model.likes ? `
                    <div class="variant-stats">
                        ${model.downloads ? `<span class="stat-pill">📥 ${formatNumber(model.downloads)} / ${formatNumber(model.downloads_all_time)} (30d / All)</span>` : ''}

                        ${model.likes ? `<span class="stat-pill">♥ ${formatNumber(model.likes)}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Toggle expanded variants section
 */
window.toggleExpandedVariants = function (classKey) {
    const expandedSection = document.querySelector(`.expanded-variants[data-class="${classKey}"]`);
    const overflowChip = event.currentTarget;

    if (expandedSection) {
        if (expandedSection.classList.contains('show')) {
            expandedSection.classList.remove('show');
            const hiddenCount = expandedSection.children.length;
            overflowChip.querySelector('.variant-name').textContent = `+${hiddenCount} more variants`;
        } else {
            expandedSection.classList.add('show');
            overflowChip.querySelector('.variant-name').textContent = 'Show less';
        }
    }
};

/**
 * Update speed requirements based on dropdown selection
 */
window.updateSpeedRequirements = function (selectElement, classKey) {
    const targetTps = parseInt(selectElement.value);
    const paramRow = selectElement.closest('.param-row');
    if (!paramRow) return;

    // Get model parameters from data attributes
    const paramsB = parseFloat(paramRow.dataset.paramsB);
    const activeParamsB = parseFloat(paramRow.dataset.activeParamsB || paramsB);
    const layers = parseInt(paramRow.dataset.layers);
    const hiddenSize = parseInt(paramRow.dataset.hiddenSize);
    const heads = parseInt(paramRow.dataset.heads);

    // Recalculate specs for selected speed
    const specsInt8 = calcRequirements({
        paramsB,
        activeParamsB,
        weightPrecision: 'int8',
        kvPrecision: 'int8',
        layers,
        hiddenSize,
        heads,
        promptTokens: 8192,
        newTokens: 512,
        batchSize: 1,
        targetTps
    });

    const specsBF16 = calcRequirements({
        paramsB,
        activeParamsB,
        weightPrecision: 'bf16',
        kvPrecision: 'bf16',
        layers,
        hiddenSize,
        heads,
        promptTokens: 8192,
        newTokens: 512,
        batchSize: 1,
        targetTps
    });

    // Update the spec box content
    const contentEl = paramRow.querySelector(`[data-speed-content="${classKey}"]`);
    if (contentEl) {
        contentEl.innerHTML = `
            <strong>VRAM:</strong> ${Math.ceil(specsInt8.totalVramGb)} GB <span class="detail">(INT8)</span><br>
            <span class="detail">or ${Math.ceil(specsBF16.totalVramGb)} GB (BF16)</span><br>
            <strong>Bandwidth:</strong> ~${Math.ceil(specsInt8.requiredBwGbps)} GB/s
        `;
    }
};

/**
 * Toggle more models visibility and scrolling
 */
window.toggleMoreModels = function (btn, containerId, hiddenCount) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isExpanded = container.classList.contains('expanded');

    if (isExpanded) {
        // Collapse: hide overflow models and remove scrollable
        container.classList.remove('expanded', 'scrollable');
        btn.classList.remove('active');
        btn.innerHTML = `+ ${hiddenCount} models <span class="more-btn-icon">→</span>`;

        // Scroll back to start
        container.scrollLeft = 0;
    } else {
        // Expand: show overflow models and make scrollable
        container.classList.add('expanded', 'scrollable');
        btn.classList.add('active');
        btn.innerHTML = `Collapse <span class="more-btn-icon">←</span>`;

        // Scroll to reveal new models
        setTimeout(() => {
            container.scrollLeft = container.scrollWidth;
        }, 100);
    }
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
        <button class="compare-add-btn ${selectedModels.has(model.id) ? 'active' : ''}" 
            onclick="event.stopPropagation(); toggleComparison('${model.id}')"
            title="${selectedModels.has(model.id) ? 'Remove from comparison' : 'Add to comparison'}">
            <span class="btn-icon">${selectedModels.has(model.id) ? '✓' : '+'}</span><span class="btn-text">${selectedModels.has(model.id) ? 'Added' : 'Compare'}</span>
        </button>
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
// Compare Mode Logic
let isCompareMode = false;

// Compare Mode Logic - Now acting as "Shopping Cart" trigger
document.getElementById('compareModeTrigger')?.addEventListener('click', () => {
    // If we have selected models, toggle the tray
    if (selectedModels.size > 0) {
        toggleCompareTray();
    } else {
        // Optional: Show a toast or tooltip saying "Select models to compare first"
        // For now, just wiggle the button
        const btn = document.getElementById('compareModeTrigger');
        btn.classList.add('shake');
        setTimeout(() => btn.classList.remove('shake'), 500);
    }
});

// Force default view to vendor, remove switching logic
currentView = 'vendor';

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
    if (!num && num !== 0) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return 'N/A';
    }
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
/**
 * Comparison Logic
 */
window.toggleComparison = function (modelId) {
    if (selectedModels.has(modelId)) {
        selectedModels.delete(modelId);
    } else {
        selectedModels.add(modelId);
    }

    // Save to localStorage
    localStorage.setItem('llm_compare_cart', JSON.stringify([...selectedModels]));

    updateCompareBar();

    // Show tray if we just added the first item or if tray is already open
    const tray = document.getElementById('compareTray');
    if (selectedModels.size > 0 && selectedModels.has(modelId)) {
        // Optional: auto-open tray on first add? 
        // For now, let's just make sure it re-renders if visible
        if (tray && tray.classList.contains('visible')) {
            renderCompareTray();
        }
    } else if (selectedModels.size === 0) {
        if (tray) tray.classList.remove('visible');
    }

    // Update buttons in UI
    const btns = document.querySelectorAll(`.compare-add-btn[onclick*="'${modelId}'"]`);
    btns.forEach(btn => {
        const isSelected = selectedModels.has(modelId);
        if (isSelected) {
            btn.classList.add('active');
            btn.innerHTML = '<span class="btn-icon">✓</span><span class="btn-text">Added</span>';
            btn.title = 'Remove from comparison';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<span class="btn-icon">+</span><span class="btn-text">Compare</span>';
            btn.title = 'Add to comparison';
        }
    });

    // If modal is open, re-render it
    const modal = document.getElementById('compareModal');
    if (modal && modal.style.display === 'block') {
        renderComparisonTable();
    }
};

window.renderCompareTray = function () {
    const list = document.getElementById('compareTrayList');
    if (!list) return;

    const selected = Array.from(selectedModels)
        .map(id => modelsData.find(m => m.id === id))
        .filter(m => m);

    if (selected.length === 0) {
        list.innerHTML = '<span style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">No models selected</span>';
        // Add a "Compare" button that is disabled? Or just leave empty.
        // Also show a clear button if needed, but usually we hide tray if empty.
    } else {
        list.innerHTML = selected.map(m => `
            <div class="tray-item">
                <span class="tray-item-name">${m.name}</span>
                <button class="tray-remove-btn" onclick="toggleComparison('${m.id}'); renderCompareTray();">×</button>
            </div>
        `).join('') + `
            <div style="width: 100%; display: flex; gap: 1rem; margin-top: 0.5rem;">
               <button class="btn btn-secondary btn-sm" style="flex: 1; border: 1px solid rgba(255,255,255,0.2); background: transparent;" onclick="clearComparison()">Clear All</button>
               <button class="btn btn-primary btn-sm" style="flex: 2; background: linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%); color: #fff; font-weight: 700; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);" onclick="showComparison(); toggleCompareTray(false);">Compare (${selected.length})</button>
            </div>
        `;
    }
};

window.toggleCompareTray = function (forceState) {
    const tray = document.getElementById('compareTray');
    if (!tray) return;

    const isVisible = tray.classList.contains('visible');
    const newState = forceState !== undefined ? forceState : !isVisible;

    if (newState) {
        renderCompareTray();
        tray.classList.add('visible');
    } else {
        tray.classList.remove('visible');
    }
};

window.clearComparison = function () {
    selectedModels.clear();
    localStorage.removeItem('llm_compare_cart');
    updateCompareBar();
    renderModels(); // Redraw to reset buttons
    hideComparison();
    toggleCompareTray(false);
};


// Close tray when clicking outside
document.addEventListener('click', (e) => {
    const tray = document.getElementById('compareTray');
    const trigger = document.getElementById('compareModeTrigger');

    // Check if the click is outside the tray AND not on the trigger button
    if (tray && tray.classList.contains('visible') &&
        !tray.contains(e.target) &&
        !trigger.contains(e.target) &&
        !e.target.closest('.compare-add-btn')) { // Also ignore add buttons to prevent immediate toggle
        toggleCompareTray(false);
    }
});

function updateCompareBar() {
    const bar = document.getElementById('compareBar'); // Now just the counter badge on FAB
    const trigger = document.getElementById('compareModeTrigger');
    const count = selectedModels.size;

    // Update floating button badge
    if (trigger) {
        let badge = trigger.querySelector('.compare-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'compare-badge';
            trigger.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';

        // Pulse animation if count increased
        if (count > 0) {
            trigger.classList.add('has-items');
        } else {
            trigger.classList.remove('has-items');
        }
    }

    // Update legacy bar if it exists (though we plan to rely on FAB)
    const countEl = document.getElementById('compareCount');
    if (countEl) countEl.textContent = count;
}

// Initial update on load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for DOM to be ready
    setTimeout(() => {
        updateCompareBar();
    }, 100);
});

window.renderComparisonTable = function () {
    const container = document.getElementById('compareTableContainer');
    if (!container) return;

    // Convert Set to Array and fetch model objects
    const selected = Array.from(selectedModels)
        .map(id => modelsData.find(m => m.id === id))
        .filter(m => m); // Filter out any undefineds (stale IDs)

    if (selected.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">No models selected for comparison.</p>';
        return;
    }

    let html = `<table class="compare-table">
        <thead>
            <tr>
                <th>${t('compareSpecLabel') || 'Spec'}</th>
                ${selected.map(m => `<th class="compare-header-cell">
                    ${m.name}
                    <button class="remove-col-btn" onclick="toggleComparison('${m.id}')">×</button>
                </th>`).join('')}
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>${t('compareParametersLabel') || 'Parameters'}</th>
                ${selected.map(m => `<td>${m.parameters_billion}B</td>`).join('')}
            </tr>
            <tr>
                <th>${t('compareArchitectureLabel') || 'Architecture'}</th>
                ${selected.map(m => `<td>${m.architecture ? m.architecture.toUpperCase() : 'N/A'}</td>`).join('')}
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
                ${selected.map(m => `<td>${m.license || 'Unknown'}</td>`).join('')}
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
};

window.showComparison = function () {
    const modal = document.getElementById('compareModal');
    if (modal) {
        modal.style.display = 'block'; // Or 'flex' if styled that way
        document.body.style.overflow = 'hidden';
        renderComparisonTable();
    }
};

window.hideComparison = function () {
    const modal = document.getElementById('compareModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
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

/**
 * Toggle all vendors
 */
window.toggleAllVendors = function (shouldExpand) {
    const models = applyFilters(modelsData);
    const grouped = groupModelsByVendor(models);

    // Clear first to ensure we don't have stale state
    if (!shouldExpand) {
        expandedVendors.clear();
    } else {
        Object.keys(grouped).forEach(vendor => expandedVendors.add(vendor));
    }

    renderModels();
};

/**
 * Expand vendor and scroll to specific param class
 */
window.expandVendorAndScrollToClass = function (event, vendor, classKey) {
    event.stopPropagation(); // Prevent header toggle

    let needsRender = false;
    if (!expandedVendors.has(vendor)) {
        expandedVendors.add(vendor);
        needsRender = true;
    }

    if (needsRender) {
        renderModels();
    }

    // Slight delay to allow DOM update
    setTimeout(() => {
        const element = document.querySelector(`.param-row[data-class="${classKey}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a highlight effect
            element.classList.add('highlight-flash');
            setTimeout(() => element.classList.remove('highlight-flash'), 2000);
        }
    }, 50);
};
