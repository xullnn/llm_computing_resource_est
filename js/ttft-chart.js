/**
 * TTFT (Time To First Token) Calculation Module
 * Handles TTFT calculations and chart data generation
 */

/**
 * Calculate TTFT in seconds
 * @param {number} parametersB - Model parameters in billions
 * @param {number} promptLength - Prompt length in tokens
 * @param {number} hardwareTflops - Hardware compute in TFLOPs
 * @returns {number} TTFT in seconds
 */
function calculateTTFT(parametersB, promptLength, hardwareTflops) {
    if (!hardwareTflops || hardwareTflops <= 0) return null;

    // Prefill FLOPs = 2 × promptLength × parameters
    const prefillFlops = 2 * promptLength * parametersB * 1e9;

    // TTFT = prefillFlops / (hardwareTflops × 10^12)
    const ttftSeconds = prefillFlops / (hardwareTflops * 1e12);

    return ttftSeconds;
}

/**
 * Calculate required FLOPs to achieve a target TTFT
 * @param {number} parametersB - Model parameters in billions
 * @param {number} promptLength - Prompt length in tokens
 * @param {number} targetTTFT - Target TTFT in seconds
 * @returns {number} Required TFLOPs
 */
function calculateRequiredFLOPs(parametersB, promptLength, targetTTFT) {
    if (!targetTTFT || targetTTFT <= 0) return null;

    // Prefill FLOPs = 2 × promptLength × parameters
    const prefillFlops = 2 * promptLength * parametersB * 1e9;

    // Required TFLOPs = prefillFlops / (targetTTFT × 10^12)
    const requiredTflops = prefillFlops / (targetTTFT * 1e12);

    return requiredTflops;
}

/**
 * Generate TTFT chart data points for multiple prompt lengths
 * @param {number} parametersB - Model parameters in billions
 * @param {Array<number>} promptLengths - Array of prompt lengths (e.g., [2048, 4096, 8192])
 * @param {number} minFLOPs - Minimum FLOPs for chart (default: 50)
 * @param {number} maxFLOPs - Maximum FLOPs for chart (default: 2000)
 * @param {number} points - Number of data points per curve (default: 50)
 * @returns {Object} Chart data with curves for each prompt length
 */
function generateTTFTChartData(parametersB, promptLengths = [2048, 4096, 8192], minFLOPs = 50, maxFLOPs = 2000, points = 50) {
    const curves = {};

    promptLengths.forEach(promptLength => {
        const dataPoints = [];

        // Generate logarithmically spaced FLOPs values for smoother hyperbolic curves
        for (let i = 0; i < points; i++) {
            const t = i / (points - 1); // 0 to 1
            const flops = minFLOPs * Math.pow(maxFLOPs / minFLOPs, t);
            const ttft = calculateTTFT(parametersB, promptLength, flops);

            dataPoints.push({
                flops: flops,
                ttft: ttft
            });
        }

        curves[promptLength] = dataPoints;
    });

    return {
        parametersB,
        promptLengths,
        curves,
        minFLOPs,
        maxFLOPs
    };
}

/**
 * Get TTFT threshold lines (for UI indicators)
 * @returns {Array<Object>} Array of threshold definitions
 */
function getTTFTThresholds() {
    return [
        { value: 1, label: 'Instant', color: '#4ade80' },    // Green
        { value: 3, label: 'Acceptable', color: '#fbbf24' }, // Amber
        { value: 10, label: 'Baseline', color: '#f87171' }   // Red
    ];
}

/**
 * Format TTFT value for display
 * @param {number} ttftSeconds - TTFT in seconds
 * @returns {string} Formatted string
 */
function formatTTFT(ttftSeconds) {
    if (!ttftSeconds || ttftSeconds < 0) return 'N/A';
    if (ttftSeconds < 1) return `${(ttftSeconds * 1000).toFixed(0)}ms`;
    if (ttftSeconds < 60) return `${ttftSeconds.toFixed(1)}s`;
    return `${(ttftSeconds / 60).toFixed(1)}min`;
}

/**
 * Format FLOPs value for display
 * @param {number} tflops - TFLOPs value
 * @returns {string} Formatted string
 */
function formatFLOPs(tflops) {
    if (!tflops || tflops < 0) return 'N/A';
    if (tflops >= 1000) return `${(tflops / 1000).toFixed(1)} PFLOPs`;
    return `${Math.round(tflops)} TFLOPs`;
}

// Export functions if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateTTFT,
        calculateRequiredFLOPs,
        generateTTFTChartData,
        getTTFTThresholds,
        formatTTFT,
        formatFLOPs
    };
}
