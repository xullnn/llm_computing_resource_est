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

const I18N = {
  en: {
    eyebrow: "Offline · Serverless",
    calculatorEyebrow: "Calculator",
    backToTop: "Back to overview",
    landingEyebrow: "Offline · Private · Open",
    landingTitle: "Estimate LLM hardware in seconds",
    landingSubhead: "Plan VRAM, FLOPs, bandwidth, and TTFT before you buy or deploy. Serverless, privacy-safe, tuned for Qwen, DeepSeek, Llama, and more.",
    landingCtaPrimary: "Launch calculator",
    landingCtaSecondary: "See how it works",
    landingStatOffline: "100% offline. No telemetry.",
    landingStatPresets: "16 presets incl. DeepSeek, Qwen, Llama.",
    landingStatBilingual: "English / 中文 in one click.",
    landingCallout: "Serverless physics-based calculator",
    landingCalloutOffline: "Runs entirely in your browser.",
    landingCalloutAccuracy: "Prefill + decode math for VRAM, FLOPs, bandwidth.",
    landingCalloutUseCases: "Benchmark Llama, Qwen, DeepSeek, Phi and more.",
    sectionLandingWhy: "Why this calculator",
    sectionLandingFeatures: "Built for accuracy and privacy",
    featureOfflineTitle: "Offline & private",
    featureOfflineDesc: "No sign-in, no telemetry, no servers. Your workload stays on your device.",
    featurePhysicsTitle: "Physics-backed",
    featurePhysicsDesc: "Transformer math for prefill and decode, including KV cache and bandwidth limits.",
    featurePresetsTitle: "Model presets",
    featurePresetsDesc: "16 curated presets (Qwen, DeepSeek, Llama, Phi, Gemma) with editable overrides.",
    featureBilingualTitle: "Bilingual UI",
    featureBilingualDesc: "English / 中文 translations for teams across regions.",
    sectionHowEyebrow: "How it works",
    sectionHowTitle: "From inputs to hardware sizing",
    howStepInputTitle: "Set workload",
    howStepInputDesc: "Pick a preset or enter params, prompt length, new tokens, batch size, and targets.",
    howStepCalcTitle: "Apply transformer math",
    howStepCalcDesc: "Prefill (O(seq²)) + decode FLOPs, KV cache, and bandwidth are combined with utilization.",
    howStepResultTitle: "Read requirements",
    howStepResultDesc: "See VRAM, compute, bandwidth, and TTFT targets to match your hardware budget.",
    sectionUseCasesEyebrow: "Where it helps",
    sectionUseCasesTitle: "Use cases we see most",
    useCaseHobbyistTitle: "Builders & hobbyists",
    useCaseHobbyistDesc: "Check if a single consumer GPU can host a chosen model at your target speed.",
    useCaseResearchTitle: "Research & benchmarking",
    useCaseResearchDesc: "Estimate FLOPs and KV cache pressure before running large sweeps.",
    useCaseTeamsTitle: "Infra & product teams",
    useCaseTeamsDesc: "Size hardware budgets for pilots and RFPs without exposing data to third parties.",
    sectionModelsEyebrow: "Model coverage",
    sectionModelsTitle: "Preset roster you can edit",
    sectionModelsDesc: "Qwen, DeepSeek, Llama, Phi, Gemma, Yi, GLM, Mistral, Mixtral, StableLM, Command R, DBRX, OLMo, InternLM, Llama Guard, and Code models.",
    title: "LLM Resource Sizer",
    lead: "Find out if your GPU can run AI models like Llama, Qwen, or DeepSeek — and how fast.",
    quickLlama: "Try Llama 3 8B",
    quickQwen: "Try Qwen 32B",
    quickDeepseek: "Try DeepSeek-V3",
    langLabel: "Language",
    reset: "Reset to defaults",
    sectionModel: "Model",
    sectionHardware: "Hardware (optional)",
    showHardware: "+ Select GPU to test fit",
    hideHardware: "− Hide hardware picker",
    showAdvanced: "Advanced options",
    hideAdvanced: "Advanced options",
    selectGPU: "Select GPU",
    gpuHelp: "Auto-fills specs to check if requirements fit.",
    sectionWorkload: "Workload",
    sectionResults: "Results",
    modelPreset: "Preset",
    modelPresetHelp: "You can edit any value after prefilling.",
    hfLinkLabel: "Hugging Face repo",
    modelParams: "Model params (B)",
    activeParams: "Active params for MoE (B, optional)",
    activeParamsHelp: "If MoE, set the activated parameters per token.",
    weightPrecision: "Weight precision",
    kvPrecision: "KV precision",
    hiddenSize: "Hidden size (override, optional)",
    layers: "Layers (override, optional)",
    weightPrecisionHelp: "Lower = smaller & faster, but less accurate",
    kvPrecisionHelp: "Usually matches weight precision",
    promptTokens: "Input length (tokens)",
    promptTokensHelp: "Short: 500 · Document: 8K · Long: 32K",
    newTokens: "Output length (tokens)",
    newTokensHelp: "Typical: 100-500 · Long: 1K-2K",
    batchSize: "Simultaneous users",
    batchSizeHelp: "Personal: 1 · Team: 4-8 · Production: 16+",
    targetTps: "Speed (tokens/sec)",
    targetTpsHelp: "Slow: 5 · Good: 15 · Fast: 30+",
    ttftMs: "First response time (ms)",
    ttftMsHelp: "Fast: 500 · Acceptable: 2000",
    utilCompute: "Utilization (compute)",
    utilComputeHelp: "Effective fraction of peak TFLOPS/TOPS.",
    utilBw: "Utilization (bandwidth)",
    utilBwHelp: "Effective fraction of peak memory bandwidth.",
    computeUnit: "Compute unit",
    computeUnitOptions: {
      tflops: "TFLOPS",
      gflops: "GFLOPS",
      pflops: "PFLOPS",
      tops_int8: "TOPS (INT8)",
      tops_int4: "TOPS (INT4)",
    },
    requiredVram: "Required VRAM / HBM",
    requiredCompute: "Required compute",
    requiredBandwidth: "Required memory bandwidth",
    bandwidthConservative: "Conservative (weights streamed per token + KV)",
    bandwidthOptimistic: "Optimistic (weights resident; mostly KV)",
    weightsLabel: "Weights",
    promptLabel: "Prompt tokens",
    budgetLabel: "Budget",
    ttftLabel: "TTFT",
    ttftNeedHardware: "Provide peak TFLOPS to estimate TTFT.",
    ttftPrefillNote: "Prefill depends on hardware throughput.",
    activeParamsLabel: "Active params",
    totalParamsLabel: "Total params",
    speedNote: "Assumes speedup x{speed} vs BF16/FP16. Raw: {raw} TFLOPS.",
    assumptions: [
      "Prefill FLOPs = 2 * active_params * prompt_tokens + attention ~ 4 * layers * prompt² * hidden_size;",
      "Decode FLOPs/token ≈ 2 * active_params + 4 * layers * avg_seq * hidden_size (avg_seq ≈ prompt + new/2).",
      "Bandwidth (conservative) = weight_bytes/batch + KV_read + KV_write per token; optimistic assumes weights stay resident and KV dominates.",
      "KV cache = batch * seq * layers * hidden * 2 * bytes (K+V); workspace = 12% of weights.",
    ],
  },
  zh: {
    eyebrow: "离线 · 无服务器",
    calculatorEyebrow: "计算器",
    backToTop: "返回顶部",
    landingEyebrow: "离线 · 隐私 · 开源",
    landingTitle: "几秒估算 LLM 硬件需求",
    landingSubhead: "在采购或部署前规划显存、FLOPs、带宽与 TTFT。完全本地，保护隐私，涵盖 Qwen、DeepSeek、Llama 等模型。",
    landingCtaPrimary: "打开计算器",
    landingCtaSecondary: "查看原理",
    landingStatOffline: "100% 本地，无遥测。",
    landingStatPresets: "16 个预设，覆盖 DeepSeek、Qwen、Llama。",
    landingStatBilingual: "一键切换 English / 中文。",
    landingCallout: "无服务器的物理建模计算器",
    landingCalloutOffline: "完全在浏览器中运行。",
    landingCalloutAccuracy: "基于 prefill + decode 数学模型估算显存、FLOPs、带宽。",
    landingCalloutUseCases: "可对 Llama、Qwen、DeepSeek、Phi 等进行预估。",
    sectionLandingWhy: "为何使用本工具",
    sectionLandingFeatures: "准确且重视隐私",
    featureOfflineTitle: "离线 & 隐私",
    featureOfflineDesc: "无需登录、无遥测、无服务器。你的负载留在本地。",
    featurePhysicsTitle: "物理模型支撑",
    featurePhysicsDesc: "基于 Transformer 的 prefill / decode 数学模型，覆盖 KV Cache 与带宽瓶颈。",
    featurePresetsTitle: "模型预设",
    featurePresetsDesc: "16 个精选预设（Qwen、DeepSeek、Llama、Phi、Gemma），并可自定义参数。",
    featureBilingualTitle: "双语界面",
    featureBilingualDesc: "English / 中文 适用于跨地区团队。",
    sectionHowEyebrow: "工作原理",
    sectionHowTitle: "从输入到硬件测算",
    howStepInputTitle: "设置负载",
    howStepInputDesc: "选择预设或填写参数、提示长度、生成上限、批量与目标指标。",
    howStepCalcTitle: "套用 Transformer 公式",
    howStepCalcDesc: "综合 prefill（O(seq²)）与 decode FLOPs、KV Cache 与带宽，并考虑利用率。",
    howStepResultTitle: "读取需求",
    howStepResultDesc: "查看显存、算力、带宽与 TTFT 需求，对应你的硬件预算。",
    sectionUseCasesEyebrow: "适用场景",
    sectionUseCasesTitle: "常见使用方式",
    useCaseHobbyistTitle: "个人 / 开发者",
    useCaseHobbyistDesc: "评估单卡消费级 GPU 是否能以目标速度承载模型。",
    useCaseResearchTitle: "科研 / Benchmark",
    useCaseResearchDesc: "在大规模实验前预估 FLOPs 和 KV Cache 压力。",
    useCaseTeamsTitle: "基础设施 / 产品团队",
    useCaseTeamsDesc: "为试点或招标估算硬件预算，无需把数据交给第三方。",
    sectionModelsEyebrow: "覆盖的模型",
    sectionModelsTitle: "可编辑的预设清单",
    sectionModelsDesc: "Qwen、DeepSeek、Llama、Phi、Gemma、Yi、GLM、Mistral、Mixtral、StableLM、Command R、DBRX、OLMo、InternLM、Llama Guard 与多款 Code 模型。",
    title: "LLM 资源估算",
    lead: "查看你的 GPU 能否运行 Llama、Qwen、DeepSeek 等 AI 模型 — 以及速度如何。",
    quickLlama: "试试 Llama 3 8B",
    quickQwen: "试试 Qwen 32B",
    quickDeepseek: "试试 DeepSeek-V3",
    langLabel: "语言",
    reset: "恢复默认",
    sectionModel: "模型",
    sectionHardware: "硬件（可选）",
    showHardware: "+ 选择 GPU 测试是否适配",
    hideHardware: "− 隐藏硬件选择",
    showAdvanced: "高级选项",
    hideAdvanced: "高级选项",
    selectGPU: "选择 GPU",
    gpuHelp: "自动填充规格以检查需求是否满足。",
    sectionWorkload: "负载",
    sectionResults: "结果",
    modelPreset: "预设",
    modelPresetHelp: "预填后可修改任何数值。",
    hfLinkLabel: "Hugging Face 仓库",
    modelParams: "模型参数量 (B)",
    activeParams: "MoE 激活参数量 (B，可选)",
    activeParamsHelp: "MoE 模型可填写每 token 激活的参数量。",
    weightPrecision: "权重量化",
    kvPrecision: "KV 精度",
    hiddenSize: "隐藏维度 (可选覆盖)",
    layers: "层数 (可选覆盖)",
    weightPrecisionHelp: "数值越小 = 体积更小、速度更快，但精度较低",
    kvPrecisionHelp: "通常与权重精度保持一致",
    promptTokens: "输入长度 (tokens)",
    promptTokensHelp: "短文本：500 · 文档：8K · 长文本：32K",
    newTokens: "输出长度 (tokens)",
    newTokensHelp: "典型：100-500 · 长回复：1K-2K",
    batchSize: "同时用户数",
    batchSizeHelp: "个人：1 · 团队：4-8 · 生产：16+",
    targetTps: "速度 (tokens/秒)",
    targetTpsHelp: "慢：5 · 良好：15 · 快：30+",
    ttftMs: "首次响应时间 (ms)",
    ttftMsHelp: "快速：500 · 可接受：2000",
    utilCompute: "算力利用率",
    utilComputeHelp: "占峰值 TFLOPS/TOPS 的有效比例。",
    utilBw: "带宽利用率",
    utilBwHelp: "占峰值显存带宽的有效比例。",
    computeUnit: "算力单位",
    computeUnitOptions: {
      tflops: "TFLOPS",
      gflops: "GFLOPS",
      pflops: "PFLOPS",
      tops_int8: "TOPS（INT8）",
      tops_int4: "TOPS（INT4）",
    },
    requiredVram: "显存 / HBM 需求",
    requiredCompute: "算力需求",
    requiredBandwidth: "带宽需求",
    bandwidthConservative: "保守：每 token 读取权重 + KV",
    bandwidthOptimistic: "乐观：权重常驻，主要是 KV 带宽",
    weightsLabel: "权重",
    promptLabel: "提示词",
    budgetLabel: "预算",
    ttftLabel: "TTFT",
    ttftNeedHardware: "需要提供峰值 TFLOPS 才能估算 TTFT。",
    ttftPrefillNote: "Prefill 取决于硬件吞吐。",
    activeParamsLabel: "激活参数量",
    totalParamsLabel: "总参数量",
    speedNote: "假设较 BF16/FP16 加速 x{speed}。原始：{raw} TFLOPS。",
    assumptions: [
      "Prefill FLOPs = 2 * active_params * prompt_tokens + 注意力项 ~ 4 * layers * prompt² * hidden_size；",
      "Decode FLOPs/token ≈ 2 * active_params + 4 * layers * avg_seq * hidden_size（avg_seq ≈ prompt + new/2）。",
      "带宽（保守）= weight_bytes/batch + KV_read + KV_write 每 token；乐观假设权重常驻，KV 为主要带宽。",
      "KV cache = batch * seq * layers * hidden * 2 * bytes (K+V)；workspace = 权重的 12%。",
    ],
  },
};

let currentLang = "en";
let currentMode = null; // 'local', 'cloud', 'compare', or null

function t(key) {
  const dict = I18N[currentLang] || I18N.en;
  return dict[key] || I18N.en[key] || key;
}

// URL Parameter handling for deep linking and persona pages
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    mode: params.get('mode'),           // 'local', 'cloud', 'compare'
    preset: params.get('preset'),       // model preset ID
    gpu: params.get('gpu'),             // GPU ID
    lang: params.get('lang'),           // 'en' or 'zh'
    promptTokens: params.get('prompt'),
    newTokens: params.get('new'),
    batchSize: params.get('batch'),
    targetTps: params.get('tps'),
    ttftMs: params.get('ttft'),
  };
}

function applyURLParams(params) {
  // Apply language
  if (params.lang && ['en', 'zh'].includes(params.lang)) {
    currentLang = params.lang;
    const langSelect = byId('langSelect');
    if (langSelect) langSelect.value = currentLang;
  }
  
  // Apply mode (for future use with persona-specific UI adjustments)
  if (params.mode) {
    currentMode = params.mode;
    document.body.setAttribute('data-mode', currentMode);
  }
  
  // Apply preset
  if (params.preset) {
    const presetSelect = byId('modelPreset');
    const presetExists = MODEL_PRESETS.find(m => m.id === params.preset);
    if (presetSelect && presetExists) {
      presetSelect.value = params.preset;
      const preset = getSelectedPreset();
      applyPreset(preset);
      updatePresetLink(preset);
    }
  }
  
  // Apply workload parameters
  if (params.promptTokens) byId('promptTokens').value = params.promptTokens;
  if (params.newTokens) byId('newTokens').value = params.newTokens;
  if (params.batchSize) byId('batchSize').value = params.batchSize;
  if (params.targetTps) byId('targetTps').value = params.targetTps;
  if (params.ttftMs) byId('ttftMs').value = params.ttftMs;
  
  // Apply GPU if provided (will be used with hardware picker)
  if (params.gpu) {
    // Store for later use when hardware picker is initialized
    document.body.setAttribute('data-preset-gpu', params.gpu);
  }
}

function generateShareableURL(includeResults = false) {
  const params = new URLSearchParams();
  
  const preset = byId('modelPreset').value;
  if (preset) params.set('preset', preset);
  
  if (currentMode) params.set('mode', currentMode);
  if (currentLang !== 'en') params.set('lang', currentLang);
  
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

function applyStaticTranslations() {
  const dict = I18N[currentLang] || I18N.en;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (dict[k]) el.textContent = dict[k];
  });
  const unitOptions = dict.computeUnitOptions || I18N.en.computeUnitOptions;
  const sel = byId("computeUnit");
  if (sel) {
    Array.from(sel.options).forEach((opt) => {
      if (unitOptions[opt.value]) opt.textContent = unitOptions[opt.value];
    });
  }
}

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
  return {
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
  
  const vramBar = gpu ? renderProgressBar(results.totalVramGb, gpu.vram_gb, `vs ${gpu.vram_gb}GB available`) : '';
  const computeBar = gpu ? renderProgressBar(results.requiredTflops, gpu.tflops_bf16 || gpu.tflops_fp16, `vs ${fmt(gpu.tflops_bf16 || gpu.tflops_fp16, 1)} TFLOPS available`) : '';
  const bwBar = gpu ? renderProgressBar(results.requiredBwGbps, gpu.bandwidth_gbps, `vs ${gpu.bandwidth_gbps} GB/s available`) : '';

  const vramSummary = getVramSummary(results.totalVramGb);
  const computeSummary = getComputeSummary(results.requiredTflops);
  const bwSummary = getBandwidthSummary(results.requiredBwGbps);

  byId("vramCard").innerHTML = `
    <strong>💾 Memory Needed</strong>
    <div class="metric">${fmt(results.totalVramGb, 2)} GB</div>
    ${vramBar}
    <div class="sub" style="color: var(--accent); font-weight: 600; margin: 8px 0 4px;">${vramSummary}</div>
    <div class="sub">${t("weightsLabel") ?? "Weights"}: ${fmt(results.weightBytesTotal / 1e9, 2)} GB · KV: ${fmt(results.kvCacheBytes / 1e9, 2)} GB</div>
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
    datacenter: 'Datacenter GPUs'
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
  
  const infoDiv = byId('gpuInfo');
  if (!infoDiv) return;
  
  // Check if requirements fit
  const vramFits = gpu.vram_gb >= results.totalVramGb;
  const tflops = gpu.tflops_bf16 || gpu.tflops_fp16;
  const computeFits = tflops >= results.requiredTflops;
  const bwFits = gpu.bandwidth_gbps >= results.requiredBwGbps;
  
  const allFit = vramFits && computeFits && bwFits;
  
  const fitnessHtml = `
    <div class="gpu-fitness ${allFit ? 'fit' : 'no-fit'}">
      <div class="fitness-title">${allFit ? '✅ This GPU fits!' : '⚠️ May not meet requirements'}</div>
      <div class="fitness-details">
        <div class="${vramFits ? 'ok' : 'warn'}">VRAM: ${fmt(gpu.vram_gb, 0)}GB ${vramFits ? '≥' : '<'} ${fmt(results.totalVramGb, 0)}GB needed</div>
        <div class="${computeFits ? 'ok' : 'warn'}">Compute: ${fmt(tflops, 0)} ${computeFits ? '≥' : '<'} ${fmt(results.requiredTflops, 0)} TFLOPS</div>
        <div class="${bwFits ? 'ok' : 'warn'}">Bandwidth: ${fmt(gpu.bandwidth_gbps, 0)} ${bwFits ? '≥' : '<'} ${fmt(results.requiredBwGbps, 0)} GB/s</div>
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
      const presetSelect = byId('modelPreset');
      if (presetSelect && presetId) {
        presetSelect.value = presetId;
        const preset = getSelectedPreset();
        applyPreset(preset);
        updatePresetLink(preset);
        computeAndRender();
        // Scroll to results
        setTimeout(() => {
          document.querySelector('.results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  });
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

function init() {
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

  byId("langSelect").addEventListener("change", (e) => {
    currentLang = e.target.value;
    applyStaticTranslations();
    updatePresetLink(getSelectedPreset());
    computeAndRender();
  });

  // Initialize quick-start buttons
  initQuickStartButtons();
  
  // Initialize advanced toggles
  initAdvancedToggles();
  
  // Initialize hardware picker
  initHardwarePicker();

  computeAndRender();
}

document.addEventListener("DOMContentLoaded", init);
