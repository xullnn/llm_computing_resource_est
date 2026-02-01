/**
 * TTFT Chart Renderer
 * Handles rendering of interactive TTFT charts (both thumbnail and full modal)
 */

/**
 * Render TTFT chart thumbnail (small inline version)
 * @param {number} parametersB - Model parameters in billions
 * @param {number} width - Chart width in pixels (default: 70)
 * @param {number} height - Chart height in pixels (default: 45)
 * @returns {string} SVG markup
 */
function renderTTFTChartThumbnail(parametersB, width = 70, height = 45) {
    const chartData = generateTTFTChartData(parametersB, [2048, 4096, 8192], 50, 1500, 20);
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxTTFT = 15; // Max TTFT to display (seconds)
    const colors = ['#60a5fa', '#34d399', '#f87171']; // Blue, Green, Red

    // Generate SVG paths for each curve
    const paths = chartData.promptLengths.map((promptLength, index) => {
        const points = chartData.curves[promptLength];
        const pathData = points.map((point, i) => {
            const x = padding + (chartWidth * (point.flops - chartData.minFLOPs) / (chartData.maxFLOPs - chartData.minFLOPs));
            const y = padding + chartHeight - (chartHeight * Math.min(point.ttft, maxTTFT) / maxTTFT);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        }).join(' ');

        return `<path d="${pathData}" stroke="${colors[index]}" stroke-width="1.5" fill="none" opacity="0.8"/>`;
    }).join('');

    return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="ttft-chart-thumbnail-svg">
            ${paths}
        </svg>
    `;
}

/**
 * Render full interactive TTFT chart modal
 * @param {number} parametersB - Model parameters in billions
 * @param {string} modelName - Model name for display
 * @param {string} classKey - Parameter class key (for modal ID)
 * @returns {string} HTML markup for modal
 */
function renderTTFTChartModal(parametersB, modelName, classKey) {
    const width = 800;
    const height = 500;
    const padding = { top: 20, right: 100, bottom: 100, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const chartData = generateTTFTChartData(parametersB, [2048, 4096, 8192], 50, 2000, 100);
    const maxTTFT = 15;
    const thresholds = getTTFTThresholds();
    const colors = {
        2048: '#60a5fa',
        4096: '#34d399',
        8192: '#f87171'
    };

    // Generate axis labels
    const yAxisLabels = [0, 1, 3, 5, 10, 15].map(ttft => {
        const y = padding.top + chartHeight - (chartHeight * ttft / maxTTFT);
        return `<text x="${padding.left - 10}" y="${y}" text-anchor="end" alignment-baseline="middle" fill="#64748b" font-size="11">${ttft}s</text>`;
    }).join('');

    const xAxisLabels = [100, 500, 1000, 1500, 2000].map(flops => {
        const x = padding.left + (chartWidth * (flops - chartData.minFLOPs) / (chartData.maxFLOPs - chartData.minFLOPs));
        return `<text x="${x}" y="${padding.top + chartHeight + 25}" text-anchor="middle" fill="#64748b" font-size="11">${flops}</text>`;
    }).join('');

    // Generate vertical hardware class bands
    const hardwareBands = [
        { min: 20, max: 200, color: '#60a5fa', label: 'Consumer', opacity: 0.1 },
        { min: 200, max: 500, color: '#fbbf24', label: 'Prosumer', opacity: 0.1 },
        { min: 500, max: 2000, color: '#4ade80', label: 'Datacenter', opacity: 0.1 }
    ].map(band => {
        const x1 = padding.left + (chartWidth * Math.max(0, (band.min - chartData.minFLOPs) / (chartData.maxFLOPs - chartData.minFLOPs)));
        const x2 = padding.left + (chartWidth * Math.min(1, (band.max - chartData.minFLOPs) / (chartData.maxFLOPs - chartData.minFLOPs)));
        const bandWidth = x2 - x1;

        // Only render if band is visible in chart range
        if (bandWidth > 0 && x2 > padding.left && x1 < padding.left + chartWidth) {
            return `
                <rect x="${x1}" y="${padding.top}" width="${bandWidth}" height="${chartHeight}" 
                      fill="${band.color}" opacity="${band.opacity}" class="hardware-band"/>
                <text x="${x1 + bandWidth / 2}" y="${padding.top + 15}" text-anchor="middle" 
                      fill="${band.color}" font-size="10" opacity="0.8" font-weight="600">${band.label}</text>
            `;
        }
        return '';
    }).join('');

    // Generate threshold lines
    const thresholdLines = thresholds.map(threshold => {
        const y = padding.top + chartHeight - (chartHeight * threshold.value / maxTTFT);
        return `
            <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}" 
                  stroke="${threshold.color}" stroke-width="1" stroke-dasharray="4 4" opacity="0.5"/>
            <text x="${padding.left + chartWidth - 10}" y="${y}" alignment-baseline="middle" text-anchor="end"
                  fill="${threshold.color}" font-size="10" opacity="0.9">${threshold.label}</text>
        `;
    }).join('');

    // Generate curves with hover areas
    const curves = chartData.promptLengths.map(promptLength => {
        const points = chartData.curves[promptLength];
        const pathData = points.map((point, i) => {
            const x = padding.left + (chartWidth * (point.flops - chartData.minFLOPs) / (chartData.maxFLOPs - chartData.minFLOPs));
            const y = padding.top + chartHeight - (chartHeight * Math.min(point.ttft, maxTTFT) / maxTTFT);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        }).join(' ');

        return `
            <path d="${pathData}" stroke="${colors[promptLength]}" stroke-width="2.5" fill="none" 
                  class="ttft-curve" data-prompt="${promptLength}"/>
        `;
    }).join('');

    return `
        <div class="ttft-chart-modal" id="ttft-modal-${classKey}" data-parameters-b="${parametersB}" style="display: none;">
            <div class="ttft-modal-overlay" onclick="closeTTFTChart('${classKey}')"></div>
            <div class="ttft-modal-content">
                <div class="ttft-modal-header">
                    <h3>⏱️ Time To First Token: ${modelName}</h3>
                    <button class="ttft-modal-close" onclick="closeTTFTChart('${classKey}')">&times;</button>
                </div>
                <div class="ttft-modal-body">
                    <svg width="${width}" height="${height}" class="ttft-chart-full" id="ttft-chart-${classKey}">
                        <!-- Y-axis -->
                        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" 
                              stroke="#cbd5e1" stroke-width="2"/>
                        ${yAxisLabels}
                        <text x="${padding.left / 2}" y="${padding.top + chartHeight / 2}" text-anchor="middle" 
                              fill="#64748b" font-size="12" transform="rotate(-90, ${padding.left / 2}, ${padding.top + chartHeight / 2})">
                            TTFT (seconds)
                        </text>
                        
                        <!-- X-axis -->
                        <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}" 
                              stroke="#cbd5e1" stroke-width="2"/>
                        ${xAxisLabels}
                        <text x="${padding.left + chartWidth / 2}" y="${height - 35}" text-anchor="middle" fill="#64748b" font-size="12">
                            Compute Capacity (TFLOPs)
                        </text>
                        
                        <!-- Hardware class bands -->
                        ${hardwareBands}
                        
                        <!-- Threshold lines -->
                        ${thresholdLines}
                        
                        <!-- Curves -->
                        ${curves}
                        
                        <!-- Hover indicator (initially hidden) -->
                        <circle id="hover-dot-${classKey}" r="5" fill="#fff" stroke="#000" stroke-width="2" style="display:none; pointer-events:none;"/>
                        
                        <!-- Crosshair lines (initially hidden) -->
                        <line id="crosshair-v-${classKey}" stroke="#334155" stroke-width="1" stroke-dasharray="4 4" opacity="0.6" style="display:none; pointer-events:none;"/>
                        <line id="crosshair-h-${classKey}" stroke="#334155" stroke-width="1" stroke-dasharray="4 4" opacity="0.6" style="display:none; pointer-events:none;"/>
                    </svg>
                    
                    <div class="ttft-chart-legend">
                        <div class="legend-item"><span style="background: ${colors[2048]}"></span> 2048 tokens</div>
                        <div class="legend-item"><span style="background: ${colors[4096]}"></span> 4096 tokens</div>
                        <div class="legend-item"><span style="background: ${colors[8192]}"></span> 8192 tokens</div>
                    </div>
                    
                    <div class="ttft-hover-tooltip" id="ttft-tooltip-${classKey}" style="display: none;">
                        <strong id="ttft-tooltip-prompt"></strong><br>
                        <span id="ttft-tooltip-value"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Open TTFT chart modal
 */
window.openTTFTChart = function (classKey, event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById(`ttft-modal-${classKey}`);
    if (modal) {
        modal.style.display = 'flex';
        // Attach interactive hover events
        attachTTFTHoverEvents(classKey);
    }
};

/**
 * Close TTFT chart modal
 */
window.closeTTFTChart = function (classKey) {
    const modal = document.getElementById(`ttft-modal-${classKey}`);
    if (modal) {
        modal.style.display = 'none';
    }
};

/**
 * Attach hover events to TTFT chart for interactivity
 */
function attachTTFTHoverEvents(classKey) {
    const svg = document.getElementById(`ttft-chart-${classKey}`);
    const tooltip = document.getElementById(`ttft-tooltip-${classKey}`);
    const hoverDot = document.getElementById(`hover-dot-${classKey}`);
    const crosshairV = document.getElementById(`crosshair-v-${classKey}`);
    const crosshairH = document.getElementById(`crosshair-h-${classKey}`);

    if (!svg || !tooltip || !hoverDot || !crosshairV || !crosshairH) return;

    // Get chart data from modal element
    const modal = document.getElementById(`ttft-modal-${classKey}`);
    if (!modal) return;

    const parametersB = parseFloat(modal.dataset.parametersB || 100);
    const chartData = generateTTFTChartData(parametersB, [2048, 4096, 8192], 50, 2000, 100);

    // Chart dimensions
    const padding = { top: 20, right: 100, bottom: 100, left: 80 };
    const rect = svg.getBoundingClientRect();
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    const maxTTFT = 15;

    // Curve colors for visual feedback
    const curveColors = {
        2048: '#60a5fa',  // Blue
        4096: '#34d399',  // Green
        8192: '#f87171'   // Red
    };

    svg.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if mouse is within chart bounds
        if (mouseX < padding.left || mouseX > rect.width - padding.right ||
            mouseY < padding.top || mouseY > rect.height - padding.bottom) {
            tooltip.style.display = 'none';
            hoverDot.style.display = 'none';
            crosshairV.style.display = 'none';
            crosshairH.style.display = 'none';
            return;
        }

        // Find nearest point on all curves using 2D distance
        let nearestPoint = null;
        let nearestDistance = Infinity;
        let nearestPrompt = null;
        let nearestPointX = 0;
        let nearestPointY = 0;

        chartData.promptLengths.forEach(promptLength => {
            const points = chartData.curves[promptLength];

            // For each curve, find the point closest to mouse position (in pixel space)
            points.forEach(point => {
                // Calculate SVG coordinates for this point
                const pointX = padding.left + (chartWidth * (point.flops - chartData.minFLOPs) / (chartData.maxFLOPs - chartData.minFLOPs));
                const pointY = padding.top + chartHeight - (chartHeight * Math.min(point.ttft, maxTTFT) / maxTTFT);

                // Calculate 2D pixel distance from mouse to this point
                const dx = mouseX - pointX;
                const dy = mouseY - pointY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestPoint = point;
                    nearestPrompt = promptLength;
                    nearestPointX = pointX;
                    nearestPointY = pointY;
                }
            });
        });

        if (nearestPoint && nearestPrompt) {
            // Get color for selected curve
            const selectedColor = curveColors[nearestPrompt];

            // Update hover dot position and color
            hoverDot.style.display = 'block';
            hoverDot.setAttribute('cx', nearestPointX);
            hoverDot.setAttribute('cy', nearestPointY);
            hoverDot.setAttribute('fill', selectedColor);
            hoverDot.setAttribute('stroke', selectedColor);

            // Update crosshair lines
            crosshairV.style.display = 'block';
            crosshairV.setAttribute('x1', nearestPointX);
            crosshairV.setAttribute('y1', padding.top);
            crosshairV.setAttribute('x2', nearestPointX);
            crosshairV.setAttribute('y2', padding.top + chartHeight);

            crosshairH.style.display = 'block';
            crosshairH.setAttribute('x1', padding.left);
            crosshairH.setAttribute('y1', nearestPointY);
            crosshairH.setAttribute('x2', padding.left + chartWidth);
            crosshairH.setAttribute('y2', nearestPointY);

            // Update tooltip content
            const promptDisplay = nearestPrompt >= 1000 ?
                `${(nearestPrompt / 1000).toFixed(1)}K` : nearestPrompt;
            const ttftDisplay = formatTTFT(nearestPoint.ttft);
            const flopsDisplay = formatFLOPs(nearestPoint.flops);

            tooltip.innerHTML = `
                <strong style="color: ${selectedColor};">${promptDisplay} tokens</strong> @ ${flopsDisplay}<br>
                <span style="color: #4ade80;">→ TTFT: ${ttftDisplay}</span>
            `;

            // Position tooltip near mouse but avoid edges
            const tooltipX = e.clientX + 15;
            const tooltipY = e.clientY - 50;

            tooltip.style.display = 'block';
            tooltip.style.left = `${tooltipX}px`;
            tooltip.style.top = `${tooltipY}px`;
        }
    });

    svg.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        hoverDot.style.display = 'none';
        crosshairV.style.display = 'none';
        crosshairH.style.display = 'none';
    });
}
