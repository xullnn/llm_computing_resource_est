/**
 * Global Internationalization (i18n) Engine
 * Shared across all pages for consistent translations
 */

const I18N = {
  en: {
    // Navigation
    navModels: "Models",
    navCalculator: "Calculator",
    navHardware: "Hardware",
    navGuides: "Guides",
    
    // Homepage - Hero Section
    landingHeroTitle: "Open-Source LLM Deployment Planner",
    landingHeroLead: "Find models, calculate GPU and VRAM requirements, compare costs. All calculations run locally in your browser.",
    journeyExploreTitle: "Browse Models",
    journeyExploreDesc: "View available options",
    journeyCalculateTitle: "Calculate Hardware",
    journeyCalculateDesc: "Size requirements",
    
    // Models Page - Model Browser Section
    modelBrowserTitle: "Browse Production-Ready Models",
    modelBrowserSubhead: "Curated open-source models · Filter by vendor, size, or architecture",
    searchPlaceholder: "Search: Qwen3, DeepSeek, moe, 70-100B...",
    
    // Models Page - View Toggle
    viewVendor: "By Vendor",
    viewHardware: "By Hardware",
    
    // Models Page - Filters
    filtersBtn: "Filters",
    filterRecency: "Recency",
    filterAllTime: "All Time",
    filterLastMonth: "Last Month",
    filterLast3Months: "Last 3 Months",
    filterLast6Months: "Last 6 Months",
    filterLastYear: "Last Year",
    filterArchitecture: "Architecture",
    filterAllTypes: "All Types",
    filterDense: "Dense",
    filterMoe: "MoE",
    filterOrganization: "Organization",
    filterAllOrgs: "All Orgs",
    filterSize: "Size",
    filterAnySize: "Any Size",
    filterSortBy: "Sort By",
    sortNewest: "Newest First",
    sortLargest: "Largest First",
    sortPopular: "Most Popular",
    clearFilters: "Clear All",
    
    // Models Page - Trending
    trendingLabel: "Trending:",
    trendingAlgorithm: "Trending Algorithm",
    trendingTimeWindow: "Time Window",
    trendingTimeValue: "Released in last 90 days",
    trendingMinDownloads: "Min. Downloads",
    trendingMinDownloadsValue: "10,000+ in 3 months",
    trendingMinLikes: "Min. Likes",
    trendingMinLikesValue: "1,000+ in 3 months",
    trendingScoreFormula: "Score Formula: (Recency × 40%) + (Downloads × 40%) + (Engagement × 20%)",
    
    // Models Page - Cards
    compareLabel: "Compare",
    calculateBtn: "Calculate",
    detailsBtn: "Details",
    vramLabel: "VRAM",
    speedLabel: "SPEED",
    estLabel: "EST.",
    showMoreBtn: "Show {n} more {vendor} models",
    
    // Models Page - Comparison
    compareSelected: "Selected",
    compareModels: "models",
    compareClear: "Clear",
    compareAction: "Compare Side-by-Side",
    compareModalTitle: "Model Comparison",
    compareSpecLabel: "Spec",
    compareParametersLabel: "Parameters",
    compareArchitectureLabel: "Architecture",
    compareContextLabel: "Context Length",
    compareHiddenSizeLabel: "Hidden Size",
    compareLayersLabel: "Layers",
    compareLicenseLabel: "License",
    compareReleaseLabel: "Release",
    compareMoeLabel: "MoE Experts",
    compareDataSourceLabel: "Data Source",
    compareActionsLabel: "Actions",
    
    // Models Page - Metadata
    metadataLastUpdated: "Last updated:",
    metadataModels: "models",
    metadataTrending: "trending (90 days, 10K+ downloads, 1K+ likes)",
    metadataNoTrending: "No models trending (90-day window)",
    metadataSource: "Source:",
    metadataSourceValue: "Hugging Face Hub API",
    
    // Calculator Page (existing keys from ui.js)
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
    ecosystemTitle: "🔍 Explore the Platform",
    ecosystemSubtitle: "Not just a calculator — discover models, compare hardware, learn deployment strategies",
    ecoModelsDesc: "Browse 75+ open-source models (70B+) with specs and calculator integration.",
    ecoDiscover: "Discover →",
    ecoHardwareDesc: "Compare NVIDIA & Huawei multi-GPU configurations for LLM deployment.",
    ecoCompare: "Compare →",
    ecoGuidesDesc: "Pre-configured deployment scenarios and capacity planning workflows.",
    ecoLearn: "Learn →",
    ecoDismiss: "↓ Just show me the calculator",
    
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
    heroTitleCalc: "LLM Resource Calculator",
    heroSubheadCalc: "Find models and estimate hardware requirements.",
    title: "LLM Resource Calculator",
    lead: "Calculate hardware requirements for large language models.",
    quickLlama: "Try Llama 3 8B",
    quickQwen: "Try Qwen 32B",
    quickDeepseek: "Try DeepSeek-V3",
    browseModels: "Browse all",
    compareHardware: "Compare all",
    findHardware: "Find compatible hardware →",
    gpuCount: "Number of GPUs",
    gpuCountHelp: "Total VRAM = Count × Single GPU VRAM.",
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
    hfLinkLabel: "Hugging Face",
    modelParams: "Model params (B)",
    activeParams: "Active params for MoE (B, optional)",
    activeParamsHelp: "If MoE, set the activated parameters per token.",
    weightPrecision: "Quality / Size tradeoff",
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
    // Navigation
    navModels: "模型库",
    navCalculator: "计算器",
    navHardware: "硬件中心",
    navGuides: "企业指南",
    
    // Homepage - Hero Section
    landingHeroTitle: "开源大语言模型部署规划工具",
    landingHeroLead: "查找模型、计算 GPU 和显存需求、对比成本。所有计算在浏览器本地运行。",
    journeyExploreTitle: "浏览模型",
    journeyExploreDesc: "查看可用选项",
    journeyCalculateTitle: "计算硬件",
    journeyCalculateDesc: "测算需求",
    
    // Models Page - Model Browser Section
    modelBrowserTitle: "浏览生产级模型",
    modelBrowserSubhead: "精选开源模型 · 按厂商、大小或架构筛选",
    searchPlaceholder: "搜索: Qwen3, DeepSeek, moe, 70-100B...",
    
    // Models Page - View Toggle
    viewVendor: "按厂商",
    viewHardware: "按硬件",
    
    // Models Page - Filters
    filtersBtn: "筛选器",
    filterRecency: "发布时间",
    filterAllTime: "所有时间",
    filterLastMonth: "最近一月",
    filterLast3Months: "最近三月",
    filterLast6Months: "最近半年",
    filterLastYear: "最近一年",
    filterArchitecture: "架构",
    filterAllTypes: "所有类型",
    filterDense: "密集型",
    filterMoe: "混合专家",
    filterOrganization: "厂商",
    filterAllOrgs: "所有厂商",
    filterSize: "模型大小",
    filterAnySize: "任意大小",
    filterSortBy: "排序方式",
    sortNewest: "最新优先",
    sortLargest: "最大优先",
    sortPopular: "最受欢迎",
    clearFilters: "清除全部",
    
    // Models Page - Trending
    trendingLabel: "热门模型:",
    trendingAlgorithm: "热门算法",
    trendingTimeWindow: "时间窗口",
    trendingTimeValue: "最近 90 天发布",
    trendingMinDownloads: "最低下载量",
    trendingMinDownloadsValue: "3 个月内 10,000+",
    trendingMinLikes: "最低点赞数",
    trendingMinLikesValue: "3 个月内 1,000+",
    trendingScoreFormula: "评分公式: (时效性 × 40%) + (下载量 × 40%) + (热度 × 20%)",
    
    // Models Page - Cards
    compareLabel: "对比",
    calculateBtn: "计算需求",
    detailsBtn: "查看详情",
    vramLabel: "显存",
    speedLabel: "速度",
    estLabel: "预估",
    showMoreBtn: "查看剩余 {n} 个 {vendor} 模型",
    
    // Models Page - Comparison
    compareSelected: "已选",
    compareModels: "个模型",
    compareClear: "清除",
    compareAction: "并排对比",
    compareModalTitle: "模型对比",
    compareSpecLabel: "规格",
    compareParametersLabel: "参数量",
    compareArchitectureLabel: "架构",
    compareContextLabel: "上下文长度",
    compareHiddenSizeLabel: "隐藏维度",
    compareLayersLabel: "层数",
    compareLicenseLabel: "开源协议",
    compareReleaseLabel: "发布时间",
    compareMoeLabel: "MoE 专家数",
    compareDataSourceLabel: "数据来源",
    compareActionsLabel: "操作",
    
    // Models Page - Metadata
    metadataLastUpdated: "最后更新:",
    metadataModels: "个模型",
    metadataTrending: "个热门模型 (90 天, 10K+ 下载, 1K+ 点赞)",
    metadataNoTrending: "暂无热门模型 (90 天窗口)",
    metadataSource: "数据源:",
    metadataSourceValue: "Hugging Face Hub API",
    
    // Calculator Page (existing keys)
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
    ecoModelsDesc: "浏览 75+ 个开源模型 (70B+)，查看规格并一键计算。",
    ecoDiscover: "探索 →",
    ecoHardwareDesc: "对比 NVIDIA 和华为的多卡 GPU/NPU 配置。",
    ecoCompare: "对比 →",
    ecoGuidesDesc: "预设的部署场景和容量规划工作流。",
    ecoLearn: "学习 →",
    ecoDismiss: "↓ 直接显示计算器",
    
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
    heroTitleCalc: "LLM 资源计算器",
    heroSubheadCalc: "查找模型并估算硬件需求。",
    title: "LLM 资源计算器",
    lead: "计算大型语言模型的硬件需求。",
    quickLlama: "试试 Llama 3 8B",
    quickQwen: "试试 Qwen 32B",
    quickDeepseek: "试试 DeepSeek-V3",
    browseModels: "浏览全部",
    compareHardware: "对比全部",
    findHardware: "查找兼容硬件 →",
    gpuCount: "GPU 数量",
    gpuCountHelp: "总显存 = 数量 × 单卡显存。",
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

// Global language state
let currentLang = localStorage.getItem('preferred_lang') || 'en';

/**
 * Translation function with placeholder replacement
 * @param {string} key - Translation key
 * @param {object} replacements - Object with {placeholder: value} pairs
 * @returns {string} Translated text
 */
function t(key, replacements = {}) {
  const dict = I18N[currentLang] || I18N.en;
  let text = dict[key] || I18N.en[key] || key;
  
  // Replace placeholders like {n}, {vendor}, {speed}, {raw}
  for (const [k, v] of Object.entries(replacements)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  
  return text;
}

/**
 * Apply translations to all [data-i18n] elements
 */
function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = t(key);
    
    if (translation !== key) {
      // Handle input placeholders
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    }
  });
  
  // Update compute unit dropdown options (calculator page specific)
  const computeUnitSelect = document.getElementById('computeUnit');
  if (computeUnitSelect) {
    const unitOptions = (I18N[currentLang]?.computeUnitOptions || I18N.en.computeUnitOptions);
    Array.from(computeUnitSelect.options).forEach((opt) => {
      if (unitOptions[opt.value]) {
        opt.textContent = unitOptions[opt.value];
      }
    });
  }
  
  // Update language selector value
  const langSelects = document.querySelectorAll('#langSelect');
  langSelects.forEach(select => {
    select.value = currentLang;
  });
}

/**
 * Set language and persist to localStorage
 * @param {string} lang - Language code ('en' or 'zh')
 */
function setLanguage(lang) {
  if (!I18N[lang]) {
    console.warn(`Language '${lang}' not found, falling back to English`);
    lang = 'en';
  }
  
  currentLang = lang;
  localStorage.setItem('preferred_lang', lang);
  
  // Update static elements
  applyStaticTranslations();
  
  // Notify all dynamic components to re-render
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/**
 * Initialize i18n system on page load
 */
function initI18n() {
  // Check URL parameter first (for deep linking like ?lang=zh)
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  if (langParam && I18N[langParam]) {
    currentLang = langParam;
    localStorage.setItem('preferred_lang', currentLang);
  }
  
  // Apply initial translations
  applyStaticTranslations();
  
  // Enable and setup all language selectors on the page
  document.querySelectorAll('#langSelect').forEach(select => {
    // Enable the selector (it might be disabled)
    select.disabled = false;
    select.style.opacity = '1';
    select.style.cursor = 'pointer';
    select.removeAttribute('title');
    
    // Add Chinese option if missing
    if (!Array.from(select.options).some(opt => opt.value === 'zh')) {
      const zhOption = document.createElement('option');
      zhOption.value = 'zh';
      zhOption.textContent = '中文';
      select.appendChild(zhOption);
    }
    
    // Set current language
    select.value = currentLang;
    
    // Add change listener
    select.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

