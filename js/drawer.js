/**
 * Calculator Drawer Script
 * Handles opening/closing the drawer and loading calculator with model data
 */

// Open calculator drawer with a specific model
window.openCalculatorDrawer = function(modelId) {
    const drawer = document.getElementById('calculatorDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    const drawerModelName = document.getElementById('drawerModelName');
    const drawerContent = document.getElementById('drawerContent');
    
    // Find the model
    const model = modelsData.find(m => m.id === modelId);
    if (!model) {
        console.error('Model not found:', modelId);
        return;
    }
    
    // Update drawer title
    drawerModelName.textContent = model.name;
    
    // Use the real calculator for accurate estimates
    // Scenario 1: INT8, single user, typical workload (8K context)
    const resultsInt8 = calcRequirements({
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
        targetTps: 10,
        ttftMs: 1500,
        utilCompute: 0.45,
        utilBandwidth: 0.6
    });
    
    // Scenario 2: BF16 (full precision)
    const resultsBf16 = calcRequirements({
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
        targetTps: 10,
        ttftMs: 1500,
        utilCompute: 0.45,
        utilBandwidth: 0.6
    });
    
    // Scenario 3: FP8
    const resultsFp8 = calcRequirements({
        paramsB: model.parameters_billion,
        activeParamsB: model.active_parameters_billion || model.parameters_billion,
        weightPrecision: 'fp8',
        kvPrecision: 'fp8',
        layers: model.num_layers,
        hiddenSize: model.hidden_size,
        heads: model.num_heads,
        promptTokens: 8192,
        newTokens: 512,
        batchSize: 1,
        targetTps: 10,
        ttftMs: 1500,
        utilCompute: 0.45,
        utilBandwidth: 0.6
    });
    
    const vramInt8 = resultsInt8.totalVramGb;
    const vramBf16 = resultsBf16.totalVramGb;
    const vramFp8 = resultsFp8.totalVramGb;
    
    // Determine GPU recommendation based on INT8 requirements
    let gpuRecommendation = '';
    if (vramInt8 <= 24) {
        gpuRecommendation = '1× RTX 4090 (24GB) or similar';
    } else if (vramInt8 <= 48) {
        gpuRecommendation = '2× RTX 4090 or 1× A6000 (48GB)';
    } else if (vramInt8 <= 80) {
        gpuRecommendation = '1× H100 (80GB) or A100 (80GB)';
    } else if (vramInt8 <= 160) {
        gpuRecommendation = '2× H100 (80GB each)';
    } else if (vramInt8 <= 320) {
        gpuRecommendation = '4× H100 (80GB each)';
    } else {
        gpuRecommendation = '8+ H100 GPUs or MI300X (192GB)';
    }
    
    // Build drawer content
    drawerContent.innerHTML = `
        <div class="drawer-result-card">
            <h4>💾 VRAM Requirements</h4>
            <div class="drawer-metric">
                <span class="drawer-metric-label">INT8 (Recommended)</span>
                <span class="drawer-metric-value">${Math.ceil(vramInt8)} GB</span>
            </div>
            <div class="drawer-metric">
                <span class="drawer-metric-label">FP8</span>
                <span class="drawer-metric-value">${Math.ceil(vramFp8)} GB</span>
            </div>
            <div class="drawer-metric">
                <span class="drawer-metric-label">BF16 (Full Precision)</span>
                <span class="drawer-metric-value">${Math.ceil(vramBf16)} GB</span>
            </div>
            <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                Includes weights + KV cache (8K context) + workspace overhead
            </div>
        </div>
        
        <div class="drawer-result-card">
            <h4>🎯 GPU Recommendation</h4>
            <p style="margin: 0; font-size: 0.9rem; line-height: 1.5;">
                ${gpuRecommendation}
            </p>
        </div>
        
        <div class="drawer-result-card">
            <h4>⚡ Performance Estimate</h4>
            <div class="drawer-metric">
                <span class="drawer-metric-label">Required Compute</span>
                <span class="drawer-metric-value">${Math.ceil(resultsInt8.requiredTflops)} TFLOPS</span>
            </div>
            <div class="drawer-metric">
                <span class="drawer-metric-label">Memory Bandwidth</span>
                <span class="drawer-metric-value">${Math.ceil(resultsInt8.requiredBwGbps)} GB/s</span>
            </div>
            <div class="drawer-metric">
                <span class="drawer-metric-label">Estimated TTFT</span>
                <span class="drawer-metric-value">${resultsInt8.ttftMs ? Math.ceil(resultsInt8.ttftMs) + ' ms' : 'N/A'}</span>
            </div>
        </div>
        
        <div class="drawer-section">
            <h3>Model Specifications</h3>
            <div class="drawer-metric">
                <span class="drawer-metric-label">Parameters</span>
                <span class="drawer-metric-value">${model.parameters_billion}B</span>
            </div>
            <div class="drawer-metric">
                <span class="drawer-metric-label">Architecture</span>
                <span class="drawer-metric-value">${model.architecture.toUpperCase()}</span>
            </div>
            <div class="drawer-metric">
                <span class="drawer-metric-label">Layers</span>
                <span class="drawer-metric-value">${model.num_layers}</span>
            </div>
            <div class="drawer-metric">
                <span class="drawer-metric-label">Hidden Size</span>
                <span class="drawer-metric-value">${model.hidden_size}</span>
            </div>
            <div class="drawer-metric">
                <span class="drawer-metric-label">Context Length</span>
                <span class="drawer-metric-value">${formatNumber(model.max_seq_length)}</span>
            </div>
            ${model.moe_num_experts ? `
            <div class="drawer-metric">
                <span class="drawer-metric-label">MoE Experts</span>
                <span class="drawer-metric-value">${model.moe_num_experts} (top-${model.moe_top_k})</span>
            </div>
            ` : ''}
            <div class="drawer-metric">
                <span class="drawer-metric-label">License</span>
                <span class="drawer-metric-value">${model.license}</span>
            </div>
        </div>
        
        <div class="drawer-section">
            <h3>External Resources</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <a href="${model.huggingface_url}" target="_blank" class="btn btn-secondary" style="width: 100%; text-decoration: none; justify-content: center;">
                    View on Hugging Face →
                </a>
                <a href="https://artificialanalysis.ai/models/${model.id.split('/')[1]?.toLowerCase() || ''}" target="_blank" class="btn btn-secondary" style="width: 100%; text-decoration: none; justify-content: center;">
                    View Benchmarks →
                </a>
            </div>
        </div>
        
        <div style="margin-top: 2rem;">
            <a href="calculator.html?preset=${encodeURIComponent(modelId)}" class="btn btn-primary" style="width: 100%; text-decoration: none; justify-content: center; display: flex;">
                Open Full Calculator →
            </a>
            <p style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); text-align: center; margin-top: 0.75rem;">
                Adjust workload, hardware, and advanced settings in the full calculator
            </p>
        </div>
    `;
    
    // Open drawer
    drawer.classList.add('open');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
};

// Close drawer
function closeDrawer() {
    const drawer = document.getElementById('calculatorDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    
    drawer.classList.remove('open');
    backdrop.classList.remove('visible');
    document.body.style.overflow = 'auto';
}

// Event listeners
document.getElementById('drawerCloseBtn')?.addEventListener('click', closeDrawer);
document.getElementById('drawerBackdrop')?.addEventListener('click', closeDrawer);

// Keyboard shortcut: ESC to close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const drawer = document.getElementById('calculatorDrawer');
        if (drawer.classList.contains('open')) {
            closeDrawer();
        }
    }
});

