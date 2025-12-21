function byId(id) {
  return document.getElementById(id);
}

function fmt(num, digits = 2) {
  if (!Number.isFinite(num)) return "—";
  if (Math.abs(num) >= 1000) return num.toFixed(0);
  return num.toFixed(digits);
}

function fmtCompute(num) {
  if (!Number.isFinite(num)) return "—";
  const abs = Math.abs(num);
  if (abs >= 1000) return num.toFixed(0);
  if (abs >= 1) return num.toFixed(2);
  if (abs >= 0.01) return num.toFixed(3);
  return num.toExponential(2);
}

const SPEEDUP = {
  tops_int8: 2.0,
  tops_int4: 3.5,
};

// I18N system now loaded from shared js/i18n.js
// Remove local dictionary and use shared I18N, currentLang, and t() function

let currentMode = null; // 'local', 'cloud', 'compare', or null

// URL Parameter handling for deep linking and persona pages
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    mode: params.get('mode'),           // 'local', 'cloud', 'compare'
    preset: params.get('preset'),       // model preset ID
    gpu: params.get('gpu'),             // GPU ID
    gpuCount: params.get('gpuCount'),   // Number of GPUs
    lang: params.get('lang'),           // 'en' or 'zh'
    promptTokens: params.get('prompt'),
    newTokens: params.get('new'),
    batchSize: params.get('batch'),
    targetTps: params.get('tps'),
    ttftMs: params.get('ttft'),
  };
}

function applyURLParams(params) {
  // Language is now handled by js/i18n.js via URL params
  
  // Apply mode (for future use with persona-specific UI adjustments)
  if (params.mode) {
    currentMode = params.mode;
    document.body.setAttribute('data-mode', currentMode);
  }
  
  // Apply preset
  if (params.preset) {
    const presetSelect = byId('modelPreset');
    // Check if preset is already in hardcoded list or will be loaded later
    const presetExists = MODEL_PRESETS.find(m => m.id === params.preset);
    if (presetSelect && (presetExists || true)) { // Allow even if not loaded yet, fetch will handle
      presetSelect.value = params.preset;
      const preset = getSelectedPreset();
      if (preset) {
        applyPreset(preset);
        updatePresetLink(preset);
      }
    }
  }
  
  // Apply workload parameters
  if (params.promptTokens) byId('promptTokens').value = params.promptTokens;
  if (params.newTokens) byId('newTokens').value = params.newTokens;
  if (params.batchSize) byId('batchSize').value = params.batchSize;
  if (params.targetTps) byId('targetTps').value = params.targetTps;
  if (params.ttftMs) byId('ttftMs').value = params.ttftMs;
  
  // Apply GPU if provided
  if (params.gpu) {
    document.body.setAttribute('data-preset-gpu', params.gpu);
    const gpuCountSelect = byId('gpuCount');
    if (gpuCountSelect && params.gpuCount) {
      gpuCountSelect.value = params.gpuCount;
    }
  }
}

function generateShareableURL(includeResults = false) {
  const params = new URLSearchParams();
  
  const preset = byId('modelPreset').value;
  if (preset) params.set('preset', preset);
  
  if (currentMode) params.set('mode', currentMode);
  if (currentLang !== 'en') params.set('lang', currentLang);
  
  const gpu = byId('gpuSelect')?.value;
  if (gpu) {
    params.set('gpu', gpu);
    const gpuCount = byId('gpuCount')?.value;
    if (gpuCount && gpuCount !== "1") params.set('gpuCount', gpuCount);
  }

  if (includeResults) {
    params.set('prompt', byId('promptTokens').value);
    params.set('new', byId('newTokens').value);
    params.set('batch', byId('batchSize').value);
    params.set('tps', byId('targetTps').value);
    params.set('ttft', byId('ttftMs').value);
  }
  
  const url = new URL(window.location);
  url.search = params.toString();
  url.hash = '#calculator';
  return url.toString();
}

async function fetchDynamicData() {
  try {
    // 1. Fetch models
    const modelsRes = await fetch('data/models.json');
    if (modelsRes.ok) {
      const modelsData = await modelsRes.json();
      if (modelsData && modelsData.models) {
        // Map the structure if necessary. The automated fetch script structure:
        // { id, name, parameters_billion, architecture, hidden_size, num_layers, num_heads, ... }
        // Our MODEL_PRESETS structure:
        // { id, provider, name, repo, hfUrl, paramsB, hiddenSize, layers, heads, weightPrecision, kvPrecision }
        const mappedModels = modelsData.models.map(m => {
            const provider = m.id.split('/')[0];
            return {
                id: m.id,
                provider: provider.charAt(0).toUpperCase() + provider.slice(1),
                name: m.name,
                repo: m.id,
                hfUrl: m.huggingface_url,
                paramsB: m.parameters_billion,
                activeParamsB: m.active_parameters_billion || (m.moe_num_experts ? (m.parameters_billion / m.moe_num_experts * (m.moe_top_k || 1)) : m.parameters_billion),
                hiddenSize: m.hidden_size,
                layers: m.num_layers,
                heads: m.num_heads,
                weightPrecision: "bf16",
                kvPrecision: "bf16"
            };
        });
        
        // Merge or replace? User says "Replace hardcoded presets"
        MODEL_PRESETS = mappedModels;
        populatePresetSelect();
      }
    }

    // 2. Fetch hardware
    const [nvidiaRes, huaweiRes] = await Promise.all([
      fetch('data/hardware/nvidia.json'),
      fetch('data/hardware/huawei.json')
    ]);

    let newHardware = [];
    if (nvidiaRes.ok) {
      const data = await nvidiaRes.json();
      newHardware = newHardware.concat(data.hardware.map(h => ({
        ...h,
        category: 'datacenter', // default for these lists
        tflops_bf16: h.bf16_tflops,
        tflops_fp16: h.fp16_tflops,
        tops_int8: h.int8_tops,
        popular: h.id.includes('h100') || h.id.includes('a100')
      })));
    }
    if (huaweiRes.ok) {
      const data = await huaweiRes.json();
      newHardware = newHardware.concat(data.hardware.map(h => ({
        ...h,
        category: 'datacenter',
        tflops_bf16: h.bf16_tflops,
        tflops_fp16: h.fp16_tflops,
        tops_int8: h.int8_tops,
        popular: false
      })));
    }

    if (newHardware.length > 0) {
      // Merge with existing consumer/apple/pro gpus which aren't in the new JSONs yet
      const consumerGpus = gpuDatabase.filter(g => ['consumer', 'apple', 'professional'].includes(g.category));
      gpuDatabase = [...consumerGpus, ...newHardware];
      populateGPUSelect();
    }
  } catch (err) {
    console.error("Failed to fetch dynamic data:", err);
    // Fallback to hardcoded data already in memory
  }
}

// applyStaticTranslations() now handled by shared js/i18n.js

function populatePresetSelect() {
  const sel = byId("modelPreset");
  sel.innerHTML = "";
  MODEL_PRESETS.forEach((m, idx) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.provider} · ${m.name}`;
    sel.appendChild(opt);
    if (idx === 0) sel.value = m.id;
  });
}

function applyPreset(preset) {
  if (!preset) return;
  byId("paramsB").value = preset.paramsB;
  byId("activeParamsB").value = preset.activeParamsB || "";
  byId("weightPrecision").value = preset.weightPrecision || "bf16";
  byId("kvPrecision").value = preset.kvPrecision || "bf16";
  byId("hiddenSize").value = preset.hiddenSize || "";
  byId("numLayers").value = preset.layers || "";
}

function getSelectedPreset() {
  return MODEL_PRESETS.find((m) => m.id === byId("modelPreset").value);
}

function updatePresetLink(preset) {
  const link = byId("hfLink");
  if (!link) return;
  const url = preset?.hfUrl || (preset?.repo ? `https://huggingface.co/${preset.repo}` : "");
  if (url) {
    link.href = url;
    link.style.display = "inline-flex";
    const label = t("hfLinkLabel") || "Hugging Face";
    const modelName = preset ? `${preset.provider} ${preset.name}` : "";
    link.setAttribute("aria-label", `${label}: ${modelName}`.trim());
  } else {
    link.style.display = "none";
  }
}

function readNumber(id) {
  const v = parseFloat(byId(id).value);
  return Number.isFinite(v) ? v : undefined;
}

function gatherInputs() {
  const preset = getSelectedPreset();
  const gpuId = byId('gpuSelect')?.value;
  const gpu = gpuId ? getGPUById(gpuId) : null;
  const gpuCount = parseInt(byId('gpuCount')?.value || "1");

  const inputs = {
    paramsB: readNumber("paramsB"),
    activeParamsB: readNumber("activeParamsB") || (preset ? preset.activeParamsB : undefined),
    heads: preset ? preset.heads : undefined,
    weightPrecision: byId("weightPrecision").value,
    kvPrecision: byId("kvPrecision").value,
    hiddenSize: readNumber("hiddenSize"),
    layers: readNumber("numLayers"),
    promptTokens: readNumber("promptTokens"),
    newTokens: readNumber("newTokens"),
    batchSize: readNumber("batchSize"),
    targetTps: readNumber("targetTps"),
    ttftMs: readNumber("ttftMs"),
    utilCompute: readNumber("utilCompute"),
    utilBandwidth: readNumber("utilBandwidth"),
  };

  // If a GPU is selected, override hardware specs
  if (gpu) {
    inputs.peakTflops = (gpu.tflops_bf16 || gpu.tflops_fp16 || 0) * gpuCount;
    inputs.peakTops = (gpu.tops_int8 || 0) * gpuCount;
    inputs.memBandwidth = (gpu.bandwidth_gbps || 0) * gpuCount;
    inputs.totalVramAvailable = (gpu.vram_gb || 0) * gpuCount;
  }

  return inputs;
}

function convertCompute(valueTflops, unit) {
  if (!Number.isFinite(valueTflops)) return undefined;
  const speed = SPEEDUP[unit] || 1;
  const base = valueTflops / speed;
  switch (unit) {
    case "gflops":
      return base * 1e3;
    case "pflops":
      return base / 1e3;
    case "tops_int8":
    case "tops_int4":
      return base;
    case "tflops":
    default:
      return base;
  }
}

function getGPUFitStatus(required, available) {
  if (!available || !Number.isFinite(available)) return null;
  const ratio = required / available;
  if (ratio <= 0.85) return 'fit';
  if (ratio <= 1.0) return 'warn';
  return 'danger';
}

function renderProgressBar(required, available, label) {
  if (!available || !Number.isFinite(available)) return '';
  
  const ratio = Math.min(required / available, 1.5);
  const percentage = Math.min(ratio * 100, 100);
  const status = getGPUFitStatus(required, available);
  
  const statusText = status === 'fit' ? '✓ Fits' : 
                     status === 'warn' ? '~ Close' : 
                     '✗ Insufficient';
  
  return `
    <div class="result-bar">
      <div class="result-bar-fill ${status}" style="width: ${percentage}%"></div>
    </div>
    <div class="sub" style="display: flex; justify-content: space-between; align-items: center;">
      <span>${label}</span>
      <span class="result-status ${status}">${statusText}</span>
    </div>
  `;
}

function getVramSummary(vramGb) {
  if (vramGb <= 8) return 'Fits on entry-level gaming GPUs';
  if (vramGb <= 12) return 'Works on mid-range GPUs';
  if (vramGb <= 16) return 'Needs high-end consumer GPU';
  if (vramGb <= 24) return 'Requires enthusiast or pro GPU';
  if (vramGb <= 48) return 'Needs professional workstation card';
  if (vramGb <= 80) return 'Requires datacenter GPU';
  return 'Needs multi-GPU setup';
}

function getComputeSummary(tflops) {
  if (tflops <= 30) return 'Light compute requirements';
  if (tflops <= 60) return 'Moderate compute needs';
  if (tflops <= 100) return 'High compute requirements';
  if (tflops <= 200) return 'Very demanding workload';
  return 'Extreme compute needed';
}

function getBandwidthSummary(gbps) {
  if (gbps <= 400) return 'Light bandwidth usage';
  if (gbps <= 900) return 'Moderate bandwidth needs';
  if (gbps <= 2000) return 'High bandwidth required';
  if (gbps <= 3000) return 'Very high bandwidth demand';
  return 'Extreme bandwidth required';
}

function renderVerdictCard(results) {
  const verdictCard = byId('verdictCard');
  if (!verdictCard) return;
  
  const vram = results.totalVramGb;
  
  // Determine GPU tier based on VRAM requirements
  let emoji, title, message, status, gpuExamples;
  
  if (vram <= 12) {
    emoji = '🎮';
    title = 'Consumer GPU friendly';
    message = 'This model fits on mid-range gaming GPUs';
    status = 'fit';
    gpuExamples = 'RTX 4070, 3060 (12GB), AMD RX 7800 XT';
  } else if (vram <= 24) {
    emoji = '💪';
    title = 'High-end GPU recommended';
    message = 'You\'ll need a powerful consumer or professional GPU';
    status = 'fit';
    gpuExamples = 'RTX 4090, 3090, A5000, Mac Studio Ultra';
  } else if (vram <= 48) {
    emoji = '🏢';
    title = 'Professional / Workstation GPU needed';
    message = 'Requires enterprise-grade hardware';
    status = 'warn';
    gpuExamples = 'RTX A6000, dual RTX 3090, 2× A5000';
  } else if (vram <= 80) {
    emoji = '☁️';
    title = 'Datacenter GPU required';
    message = 'Best suited for cloud or on-prem datacenter deployment';
    status = 'warn';
    gpuExamples = 'A100 (80GB), H100 (80GB), dual A6000';
  } else {
    emoji = '🚀';
    title = 'Multi-GPU setup required';
    message = 'Needs multiple datacenter GPUs or specialized hardware';
    status = 'danger';
    gpuExamples = 'MI300X (192GB), 2× H100, multi-GPU cluster';
  }
  
  verdictCard.className = `verdict-card ${status}`;
  verdictCard.innerHTML = `
    <div class="verdict-emoji">${emoji}</div>
    <h3 class="verdict-title">${title}</h3>
    <p class="verdict-message">${message}</p>
    <div class="verdict-gpus">
      <strong>Examples:</strong> ${gpuExamples}
    </div>
  `;
}

function render(results) {
  const unit = byId("computeUnit").value || "tflops";
  const unitLabel = (I18N[currentLang]?.computeUnitOptions || I18N.en.computeUnitOptions)[unit] || unit;
  const computeValue = convertCompute(results.requiredTflops, unit);
  const speedNote =
    SPEEDUP[unit] && Number.isFinite(results.requiredTflops)
      ? (t("speedNote") || "").replace("{speed}", SPEEDUP[unit]).replace("{raw}", fmtCompute(results.requiredTflops))
      : "";
  const bwCon = fmt(results.requiredBwGbpsConservative ?? results.requiredBwGbps, 2);
  const bwOpt = fmt(results.requiredBwGbpsOptimistic ?? results.requiredBwGbps, 2);

  // Get selected GPU for comparison
  const gpuId = byId('gpuSelect')?.value;
  const gpu = gpuId ? getGPUById(gpuId) : null;
  const gpuCount = parseInt(byId('gpuCount')?.value || "1");
  
  const totalVramAvailable = gpu ? gpu.vram_gb * gpuCount : 0;
  const totalComputeAvailable = gpu ? (gpu.tflops_bf16 || gpu.tflops_fp16) * gpuCount : 0;
  const totalBwAvailable = gpu ? gpu.bandwidth_gbps * gpuCount : 0;

  const vramBar = gpu ? renderProgressBar(results.totalVramGb, totalVramAvailable, `vs ${totalVramAvailable}GB available (${gpuCount}× ${gpu.vram_gb}GB)`) : '';
  const computeBar = gpu ? renderProgressBar(results.requiredTflops, totalComputeAvailable, `vs ${fmt(totalComputeAvailable, 1)} TFLOPS available`) : '';
  const bwBar = gpu ? renderProgressBar(results.requiredBwGbps, totalBwAvailable, `vs ${totalBwAvailable} GB/s available`) : '';

  const vramSummary = getVramSummary(results.totalVramGb);
  const computeSummary = getComputeSummary(results.requiredTflops);
  const bwSummary = getBandwidthSummary(results.requiredBwGbps);

  const vramNeeded = Math.ceil(results.totalVramGb);
  byId("vramCard").innerHTML = `
    <strong>💾 Memory Needed</strong>
    <div class="metric">${fmt(results.totalVramGb, 2)} GB</div>
    ${vramBar}
    <div class="sub" style="color: var(--accent); font-weight: 600; margin: 8px 0 4px;">${vramSummary}</div>
    <div class="sub">${t("weightsLabel") ?? "Weights"}: ${fmt(results.weightBytesTotal / 1e9, 2)} GB · KV: ${fmt(results.kvCacheBytes / 1e9, 2)} GB</div>
    <a href="hardware/?min_vram=${vramNeeded}#search" class="card-action" data-i18n="findHardware">🔍 Find compatible hardware →</a>
  `;

  byId("computeCard").innerHTML = `
    <strong>⚡ Processing Power</strong>
    <div class="metric">${fmtCompute(computeValue)} ${unitLabel}</div>
    ${computeBar}
    <div class="sub" style="color: var(--accent); font-weight: 600; margin: 8px 0 4px;">${computeSummary}</div>
    <div class="sub">${t("activeParamsLabel")}: ${fmt(results.activeParamsB, 1)}B · ${t("totalParamsLabel")}: ${fmt(results.paramsB, 1)}B</div>
    <div class="sub">${speedNote}</div>
  `;

  byId("bandwidthCard").innerHTML = `
    <strong>🔄 Memory Bandwidth</strong>
    <div class="metric">${bwCon} GB/s</div>
    ${bwBar}
    <div class="sub" style="color: var(--accent); font-weight: 600; margin: 8px 0 4px;">${bwSummary}</div>
    <div class="sub-row">
      <span>${t("bandwidthConservative") || "Conservative"}</span>
      <span>${bwCon} GB/s</span>
    </div>
    <div class="sub-row">
      <span>${t("bandwidthOptimistic") || "Optimistic"}</span>
      <span>${bwOpt} GB/s</span>
    </div>
  `;

  const ttftKnown = Number.isFinite(results.ttftMs);
  let ttftSummary = '';
  if (ttftKnown) {
    if (results.ttftMs <= 500) ttftSummary = 'Very responsive';
    else if (results.ttftMs <= 1000) ttftSummary = 'Fast response';
    else if (results.ttftMs <= 2000) ttftSummary = 'Acceptable latency';
    else if (results.ttftMs <= 5000) ttftSummary = 'Slow response';
    else ttftSummary = 'Very slow response';
  }
  
  byId("ttftCard").innerHTML = ttftKnown
    ? `
      <strong>⏱️ First Response Time</strong>
      <div class="metric">${fmt(results.ttftMs, 0)} ms</div>
      <div class="sub" style="color: var(--accent); font-weight: 600; margin: 8px 0 4px;">${ttftSummary}</div>
      <div class="sub">${t("budgetLabel") ?? "Budget"}: ${fmt(results.ttftBudgetMs, 0)} ms · ${t("promptLabel") ?? "Prompt"}: ${results.totalSeq - results.newTokens || "?"}</div>
    `
    : `
      <strong>⏱️ First Response Time</strong>
      <div class="metric">${t("ttftNeedHardware")}</div>
      <div class="sub">${t("ttftPrefillNote")}</div>
    `;

  const assumptionLines = I18N[currentLang]?.assumptions || I18N.en.assumptions;
  byId("assumptions").textContent = assumptionLines.join(" ");
  
  // Render verdict card
  renderVerdictCard(results);
  
  // Render hardware recommendations
  renderHardwareRecommendations(results);
}

async function renderHardwareRecommendations(results) {
  const container = byId('hardwareRecommendations');
  if (!container) return;
  
  // Wait for GPU database to load
  if (!gpuDatabase) {
    await loadGPUDatabase();
  }
  
  if (!gpuDatabase || gpuDatabase.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  const recommendations = getHardwareRecommendations({
    totalVramGb: results.totalVramGb,
    requiredTflops: results.requiredTflops,
    requiredBwGbps: results.requiredBwGbps,
    weightPrecision: results.weightBytes === 2 ? 'bf16' : 
                     results.weightBytes === 1 ? 'int8' : 
                     results.weightBytes === 0.5 ? 'int4' : 'bf16'
  });
  
  if (!recommendations || 
      (recommendations.consumer.length === 0 && 
       recommendations.professional.length === 0 && 
       recommendations.datacenter.length === 0)) {
    container.innerHTML = `
      <div class="recommendation-section">
        <h3>💡 Hardware Recommendations</h3>
        <p class="no-recommendations">No single GPU in our database meets all requirements. Consider multi-GPU setup or cloud providers with custom configurations.</p>
      </div>
    `;
    return;
  }
  
  let html = '<div class="recommendation-section"><h3>💡 Recommended GPUs</h3>';
  
  // Consumer GPUs
  if (recommendations.consumer.length > 0) {
    html += '<div class="rec-category"><h4>🏠 Consumer / Gaming</h4><div class="rec-grid">';
    recommendations.consumer.forEach(gpu => {
      html += renderGPUCard(gpu);
    });
    html += '</div></div>';
  }
  
  // Professional GPUs
  if (recommendations.professional.length > 0) {
    html += '<div class="rec-category"><h4>💼 Professional / Workstation</h4><div class="rec-grid">';
    recommendations.professional.forEach(gpu => {
      html += renderGPUCard(gpu);
    });
    html += '</div></div>';
  }
  
  // Datacenter GPUs
  if (recommendations.datacenter.length > 0) {
    html += '<div class="rec-category"><h4>☁️ Datacenter / Cloud</h4><div class="rec-grid">';
    recommendations.datacenter.forEach(gpu => {
      html += renderGPUCard(gpu);
    });
    html += '</div></div>';
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function renderGPUCard(gpu) {
  const count = gpu.count > 1 ? `${gpu.count}×` : '';
  const cloudCost = gpu.cloud_hourly ? 
    `<div class="cloud-cost">☁️ ~$${fmt(gpu.cloud_hourly * (gpu.count || 1), 2)}/hr</div>` : '';
  const price = gpu.price_usd ? 
    `<div class="price">💰 ~$${(gpu.price_usd * (gpu.count || 1)).toLocaleString()}</div>` : '';
  const vramHeadroom = gpu.vram_headroom ? 
    `<span class="headroom">+${fmt(gpu.vram_headroom, 0)}GB headroom</span>` : '';
  
  return `
    <div class="gpu-card">
      <div class="gpu-card-header">
        <strong>${count} ${gpu.name}</strong>
      </div>
      <div class="gpu-card-specs">
        <div>VRAM: ${gpu.count > 1 ? fmt(gpu.total_vram, 0) : gpu.vram_gb} GB ${vramHeadroom}</div>
        <div>Compute: ${fmt(gpu.effective_tflops || gpu.tflops_bf16 || gpu.tflops_fp16, 1)} TFLOPS</div>
        <div>Bandwidth: ${gpu.bandwidth_gbps} GB/s</div>
      </div>
      ${price}
      ${cloudCost}
    </div>
  `;
}

function computeAndRender() {
  const inputs = gatherInputs();
  const results = calcRequirements(inputs);
  render(results);
  updateGPUFitness(results);
}

// Hardware picker functions
async function initHardwarePicker() {
  await loadGPUDatabase();
  populateGPUSelect();
  
  const toggleBtn = byId('toggleHardware');
  const picker = byId('hardwarePicker');
  const gpuSelect = byId('gpuSelect');
  
  if (toggleBtn && picker) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = picker.style.display === 'none';
      picker.style.display = isHidden ? 'block' : 'none';
      toggleBtn.setAttribute('aria-expanded', isHidden);
      toggleBtn.querySelector('[data-i18n]').setAttribute('data-i18n', 
        isHidden ? 'hideHardware' : 'showHardware');
      toggleBtn.querySelector('[data-i18n]').textContent = 
        t(isHidden ? 'hideHardware' : 'showHardware');
    });
  }
  
  if (gpuSelect) {
    gpuSelect.addEventListener('change', handleGPUSelection);
    
    // Check if GPU was preset via URL or mode=local
    const presetGPU = document.body.getAttribute('data-preset-gpu');
    const shouldAutoExpand = currentMode === 'local' || presetGPU;
    
    if (presetGPU) {
      gpuSelect.value = presetGPU;
      handleGPUSelection();
    }
    
    // Auto-expand picker if mode=local (hobbyist scenario)
    if (shouldAutoExpand && picker && toggleBtn) {
      picker.style.display = 'block';
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.querySelector('[data-i18n]').setAttribute('data-i18n', 'hideHardware');
      toggleBtn.querySelector('[data-i18n]').textContent = t('hideHardware');
    }
  }
}

function populateGPUSelect() {
  const sel = byId('gpuSelect');
  if (!sel || !gpuDatabase) return;
  
  // Clear existing options except first (None)
  while (sel.options.length > 1) {
    sel.remove(1);
  }
  
  // Group by category
  const categories = {
    consumer: 'Consumer GPUs',
    professional: 'Professional / Workstation',
    apple: 'Apple Silicon',
    datacenter: 'Datacenter / Enterprise accelerators'
  };
  
  Object.entries(categories).forEach(([category, label]) => {
    const gpus = getGPUsByCategory(category);
    if (gpus.length > 0) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = label;
      gpus.forEach(gpu => {
        const opt = document.createElement('option');
        opt.value = gpu.id;
        opt.textContent = gpu.name;
        optgroup.appendChild(opt);
      });
      sel.appendChild(optgroup);
    }
  });

  // Populate GPU count select (1-72)
  const countSel = byId('gpuCount');
  if (countSel) {
    const currentVal = countSel.value || "1";
    countSel.innerHTML = "";
    [1, 2, 4, 8, 16, 32, 64, 72].forEach(count => {
      const opt = document.createElement('option');
      opt.value = count;
      opt.textContent = count;
      countSel.appendChild(opt);
    });
    // Add custom option if not in the list
    if (![1, 2, 4, 8, 16, 32, 64, 72].includes(parseInt(currentVal))) {
        const opt = document.createElement('option');
        opt.value = currentVal;
        opt.textContent = currentVal;
        countSel.appendChild(opt);
    }
    countSel.value = currentVal;
  }
}

function handleGPUSelection() {
  const gpuId = byId('gpuSelect').value;
  const infoDiv = byId('gpuInfo');
  
  if (!gpuId || !infoDiv) {
    if (infoDiv) infoDiv.innerHTML = '';
    return;
  }
  
  const gpu = getGPUById(gpuId);
  if (!gpu) return;
  
  // Display GPU info
  infoDiv.innerHTML = `
    <div class="gpu-specs">
      <strong>${gpu.name}</strong>
      <div class="specs-grid">
        <span>VRAM:</span><span>${gpu.vram_gb} GB</span>
        <span>BF16:</span><span>${gpu.tflops_bf16 || gpu.tflops_fp16} TFLOPS</span>
        <span>Bandwidth:</span><span>${gpu.bandwidth_gbps} GB/s</span>
      </div>
      ${gpu.price_usd ? `<small>~$${gpu.price_usd.toLocaleString()}</small>` : ''}
    </div>
  `;
  
  // Will be used in render to show fit
  computeAndRender();
}

function updateGPUFitness(results) {
  const gpuId = byId('gpuSelect')?.value;
  if (!gpuId) return;
  
  const gpu = getGPUById(gpuId);
  if (!gpu) return;
  
  const gpuCount = parseInt(byId('gpuCount')?.value || "1");
  const infoDiv = byId('gpuInfo');
  if (!infoDiv) return;
  
  // Check if requirements fit
  const totalVram = gpu.vram_gb * gpuCount;
  const vramFits = totalVram >= results.totalVramGb;
  const totalTflops = (gpu.tflops_bf16 || gpu.tflops_fp16) * gpuCount;
  const computeFits = totalTflops >= results.requiredTflops;
  const totalBw = gpu.bandwidth_gbps * gpuCount;
  const bwFits = totalBw >= results.requiredBwGbps;
  
  const allFit = vramFits && computeFits && bwFits;
  
  const fitnessHtml = `
    <div class="gpu-fitness ${allFit ? 'fit' : 'no-fit'}">
      <div class="fitness-title">${allFit ? '✅ This configuration fits!' : '⚠️ May not meet requirements'}</div>
      <div class="fitness-details">
        <div class="${vramFits ? 'ok' : 'warn'}">VRAM: ${fmt(totalVram, 0)}GB ${vramFits ? '≥' : '<'} ${fmt(results.totalVramGb, 0)}GB needed</div>
        <div class="${computeFits ? 'ok' : 'warn'}">Compute: ${fmt(totalTflops, 0)} ${computeFits ? '≥' : '<'} ${fmt(results.requiredTflops, 0)} TFLOPS</div>
        <div class="${bwFits ? 'ok' : 'warn'}">Bandwidth: ${fmt(totalBw, 0)} ${bwFits ? '≥' : '<'} ${fmt(results.requiredBwGbps, 0)} GB/s</div>
      </div>
    </div>
  `;
  
  // Find existing fitness div or append
  const existingFitness = infoDiv.querySelector('.gpu-fitness');
  if (existingFitness) {
    existingFitness.outerHTML = fitnessHtml;
  } else {
    infoDiv.innerHTML += fitnessHtml;
  }
}

function initQuickStartButtons() {
  document.querySelectorAll('.quick-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetId = btn.getAttribute('data-preset');
      useModelInCalc(presetId);
    });
  });

  // Hero Search Logic
  const searchInput = byId('heroSearchInput');
  const searchBtn = byId('heroSearchBtn');
  
  const handleSearch = () => {
    const term = searchInput.value.toLowerCase().trim();
    if (!term) return;
    
    // Simple search: find first matching model
    const match = MODEL_PRESETS.find(m => 
      m.name.toLowerCase().includes(term) || 
      m.id.toLowerCase().includes(term) ||
      m.provider.toLowerCase().includes(term)
    );
    
    if (match) {
      useModelInCalc(match.id);
    } else {
      // If no match, maybe redirect to models page with search term?
      window.location.href = `models/index.html?search=${encodeURIComponent(term)}`;
    }
  };

  if (searchBtn) searchBtn.addEventListener('click', handleSearch);
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }

  // Trending tags
  document.querySelectorAll('.trending-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const id = tag.getAttribute('data-id');
      useModelInCalc(id);
    });
  });
}

/**
 * Bridges model selection to the calculator
 */
window.useModelInCalc = function(id) {
  const presetSelect = byId('modelPreset');
  if (!presetSelect) return;
  
  presetSelect.value = id;
  // If not in select yet (dynamic data still loading), wait or fallback
  if (presetSelect.value !== id) {
    // Attempt to apply from MODEL_PRESETS directly if available
    const preset = MODEL_PRESETS.find(m => m.id === id);
    if (preset) {
      applyPreset(preset);
      updatePresetLink(preset);
      computeAndRender();
    }
  } else {
    const preset = getSelectedPreset();
    applyPreset(preset);
    updatePresetLink(preset);
    computeAndRender();
  }
  
  // Smooth scroll to results
  setTimeout(() => {
    byId('verdictCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

async function initModelSpotlight() {
  const spotlightGrid = byId('featuredModelsGrid');
  if (!spotlightGrid) return;

  // We'll use MODEL_PRESETS which is populated in fetchDynamicData
  // Since fetchDynamicData is async, we might need to wait for it
  // or trigger this after it's done.
  
  const renderSpotlight = () => {
    if (!MODEL_PRESETS || MODEL_PRESETS.length === 0) return;
    
    // Pick flagships: Qwen 235B, DeepSeek-V3, Llama 3.1 70B
    const spotlightIds = [
      'Qwen/Qwen3-235B-A22B-Thinking-2507-FP8', 
      'deepseek-ai/DeepSeek-V3', 
      'meta-llama/Llama-3.1-70B-Instruct'
    ];
    
    // Filter and maintain order
    const featured = spotlightIds
      .map(id => MODEL_PRESETS.find(m => m.id === id))
      .filter(m => m !== undefined);

    if (featured.length === 0) {
      // Fallback: pick top 3 by size
      featured.push(...[...MODEL_PRESETS]
        .sort((a, b) => b.paramsB - a.paramsB)
        .slice(0, 3));
    }

    spotlightGrid.innerHTML = featured.map(model => {
      const vramInt8 = Math.ceil(model.paramsB * 1.05);
      const vramBf16 = Math.ceil(model.paramsB * 2);
      
      return `
        <div class="card-landing spotlight-card" onclick="useModelInCalc('${model.id}')" style="cursor: pointer;">
          <div class="pill">${model.provider}</div>
          <h3>${model.name}</h3>
          <div class="stat-row">
            <span class="stat-chip">${model.paramsB}B params</span>
            <span class="stat-chip">${model.layers} layers</span>
          </div>
          <div class="deployment-preview">
            <small>Est. VRAM:</small>
            <strong>INT8: ~${vramInt8} GB · BF16: ~${vramBf16} GB</strong>
          </div>
          <div class="card-actions-row" style="display: flex; gap: 8px; margin-top: 8px;">
            ${model.artificial_analysis_slug ? `
            <a href="https://artificialanalysis.ai/models/${model.artificial_analysis_slug}" target="_blank" class="btn ghost btn-sm" style="padding: 6px 10px; font-size: 0.8rem;" onclick="event.stopPropagation();">Benchmarks</a>
            ` : ''}
            <div class="card-cta">Calculate →</div>
          </div>
        </div>
      `;
    }).join('');
  };

  // Initial attempt
  renderSpotlight();
  
  // Return the function so it can be called again after dynamic fetch
  return renderSpotlight;
}

function initAdvancedToggles() {
  // Model advanced options
  const toggleAdvanced = byId('toggleAdvanced');
  const advancedOptions = byId('advancedOptions');
  if (toggleAdvanced && advancedOptions) {
    toggleAdvanced.addEventListener('click', () => {
      const isHidden = advancedOptions.style.display === 'none';
      advancedOptions.style.display = isHidden ? 'block' : 'none';
      toggleAdvanced.setAttribute('aria-expanded', isHidden);
    });
  }
  
  // Workload advanced options
  const toggleAdvancedWorkload = byId('toggleAdvancedWorkload');
  const advancedWorkloadOptions = byId('advancedWorkloadOptions');
  if (toggleAdvancedWorkload && advancedWorkloadOptions) {
    toggleAdvancedWorkload.addEventListener('click', () => {
      const isHidden = advancedWorkloadOptions.style.display === 'none';
      advancedWorkloadOptions.style.display = isHidden ? 'block' : 'none';
      toggleAdvancedWorkload.setAttribute('aria-expanded', isHidden);
    });
  }
}

async function init() {
  // Check for URL parameters first
  const urlParams = getURLParams();
  
  populatePresetSelect();
  
  // Apply URL params before setting defaults
  if (Object.values(urlParams).some(v => v !== null)) {
    applyURLParams(urlParams);
  } else {
    applyPreset(MODEL_PRESETS[0]);
    updatePresetLink(MODEL_PRESETS[0]);
  }
  
  applyStaticTranslations();

  // Initialize spotlight with current hardcoded data
  const reRenderSpotlight = await initModelSpotlight();

  // Load dynamic data in background
  fetchDynamicData().then(() => {
    // Re-render spotlight after dynamic data is loaded
    if (reRenderSpotlight) reRenderSpotlight();
    
    // Re-apply URL params in case the dynamic data added the requested preset
    if (urlParams.preset) {
        const presetSelect = byId('modelPreset');
        const presetExists = MODEL_PRESETS.find(m => m.id === urlParams.preset);
        if (presetSelect && presetExists) {
            presetSelect.value = urlParams.preset;
            const preset = getSelectedPreset();
            applyPreset(preset);
            updatePresetLink(preset);
            computeAndRender();
        }
    }
  });

  const handlePresetSelect = () => {
    const preset = getSelectedPreset();
    applyPreset(preset);
    updatePresetLink(preset);
    computeAndRender();
  };

  byId("modelPreset").addEventListener("change", handlePresetSelect);

  document.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", computeAndRender);
    el.addEventListener("change", computeAndRender);
  });

  // Language switching now handled by js/i18n.js
  // Listen to languageChanged event to update dynamic content
  window.addEventListener('languageChanged', () => {
    updatePresetLink(getSelectedPreset());
    computeAndRender();
  });

  // Initialize quick-start buttons
  initQuickStartButtons();
  
  // Initialize advanced toggles
  initAdvancedToggles();
  
  // Initialize hardware picker
  initHardwarePicker();

  // Initialize navigation
  initNavigation();

  computeAndRender();
}

document.addEventListener("DOMContentLoaded", init);

function initNavigation() {
  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.getElementById('navLinks');
  
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.textContent = isOpen ? '✕' : '☰';
    });
  }
  
  // Ecosystem grid dismissal
  const ecosystemGrid = byId('ecosystemGrid');
  const dismissBtn = byId('dismissEcosystem');
  
  if (ecosystemGrid && dismissBtn) {
    // Check localStorage
    const isDismissed = localStorage.getItem('ecosystemDismissed') === 'true';
    if (isDismissed) {
      ecosystemGrid.style.display = 'none';
    }
    
    dismissBtn.addEventListener('click', () => {
      ecosystemGrid.style.display = 'none';
      localStorage.setItem('ecosystemDismissed', 'true');
    });
  }
}
