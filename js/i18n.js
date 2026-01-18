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
    navQuickStart: "Quick Start",
    navAbout: "About",

    // Quick Start Page
    qsHeroTitle: "Quick Start",
    qsHeroHeadline: "Get Started in 3 Steps",
    qsHeroSubhead: "Find a model, calculate requirements, match hardware.",
    qsStep1Title: "1. Find a Model",
    qsStep1Desc: "Select an open-source LLM to see its hardware requirements. Click a model below to open the calculator with preset parameters.",
    qsStep1Browse: "→ Browse all 75 models",
    qsStep2Title: "2. Calculate Requirements",
    qsStep2Desc: "Adjust context length, batch size, and precision to see VRAM, compute, and bandwidth requirements. All calculations run locally in your browser.",
    qsStep2Btn: "Open Calculator →",
    qsStep3Title: "3. Match Hardware",
    qsStep3Desc: "Compare NVIDIA and Huawei GPUs to find configurations that meet your VRAM and bandwidth requirements.",
    qsStep3Btn: "View Hardware Specs →",

    // Homepage - Hero Section
    landingHeroTitle: "Open-Source LLM Deployment Planner",
    landingHeroTitleTop: "Open-Source LLM",
    landingHeroTitleBottom: "Deployment Planner",
    landingHeroLead: "Get practical resource estimates for running large language models locally. Calculate GPU, VRAM, and RAM requirements under real-world workloads.",
    journeyExploreTitle: "Browse Models",
    journeyExploreDesc: "View available options",
    journeyCalculateTitle: "Calculate Hardware",
    journeyCalculateDesc: "Size requirements",

    // Models Page - Model Browser Section
    modelBrowserTitle: "Browse Production-Ready Models",
    modelBrowserSubhead: "Curated open-source models · Filter by vendor, size, or architecture",
    searchPlaceholder: "Search 75+ models (e.g. DeepSeek-V3, Qwen 2.5, Llama 3...)",

    // Models Page - Tabs (New)
    tabExplore: "Explore Models",
    tabHardware: "Hardware Match",

    // Models Page - Compare Mode
    compareLabel: "Compare",
    compareExit: "Done",

    // Models Page - View Toggle (Deprecated but kept for safety)
    viewVendor: "By Vendor",
    viewHardware: "By Hardware Tier",

    // Hardware Tiers
    tierConsumerTitle: "Consumer Tier",
    tierConsumerDesc: "Fits on common consumer GPUs (< 24GB VRAM)",
    tierWorkstationTitle: "Workstation Tier",
    tierWorkstationDesc: "Professional GPUs or single-node workstation (24GB - 80GB)",
    tierInfrastructureTitle: "Infrastructure Tier",
    tierInfrastructureDesc: "Multi-GPU clusters or datacenter scale (> 80GB)",

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
    "70-100": "70-100B",
    "100-200": "100-200B",
    "200-400": "200-400B",
    "400+": "400B+",
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
    ecoCompare: "Compare →",
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
    findHardware: "Find hardware →",
    verdictCalculating: "Calculating...",
    verdictTier1: "🟢 Single Consumer GPU",
    verdictTier2: "🟡 Pro/Workstation GPU",
    verdictTier3: "🟠 Datacenter Class",
    verdictTier4: "🔴 Multi-GPU Cluster",
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
    workloadPreset: "Workload Preset",
    workloadLow: "Low",
    workloadMedium: "Medium",
    workloadHigh: "High",
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
    activeLabel: "active",
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

    // About Page
    aboutTitle: "About & Methodology",
    aboutLead: "Technical documentation for the model database and calculation engine.",
    specModelCount: "Model Count",
    specParamRange: "Parameter Range",
    specVendors: "Vendors",
    specUpdateFreq: "Update Frequency",
    specUpdateFreqValue: "Mon/Wed/Fri",
    specDataSource: "Data Source",
    specTimeWindow: "Time Window",
    specTimeWindowValue: "24 months",
    faqTitle: "Frequently Asked Questions",
    faqWhyParamRange: "Why only 70B-700B models?",
    faqWhyParamRangeAnswer: "70B is the threshold where deployment becomes an infrastructure challenge, requiring multiple consumer GPUs or datacenter hardware. 700B excludes experimental ultra-large MoE models that aren't production-ready.",
    faqWhyVendors: "Why only 8 vendors?",
    faqWhyVendorsAnswer: "We focus on tier-1 organizations (Google, Anthropic, OpenAI, Qwen, DeepSeek, NVIDIA, Apple, XiaomiMiMo) with proven track records. This excludes community fine-tunes and smaller research labs to maintain quality standards.",
    faqUpdateFrequency: "How often is data updated?",
    faqUpdateFrequencyAnswer: "Automatically 3 times per week (Monday, Wednesday, Friday at 02:00 UTC) via GitHub Actions. Data is fetched from Hugging Face Hub API and benchmarks are validated against Artificial Analysis.",
    faqHowCalculated: "How are requirements calculated?",
    faqCalcVRAM: "VRAM:",
    faqCalcVRAMDesc: "Model weights + KV cache + workspace overhead",
    faqCalcBandwidth: "Bandwidth:",
    faqCalcBandwidthDesc: "Memory read/write per token (decode phase is memory-bound)",
    faqCalcPerformance: "Performance:",
    faqCalcPerformanceDesc: "Based on GPU memory bandwidth and model size",
    faqCalcDefaults: "Default scenario:",
    faqCalcDefaultsDesc: "8K context, batch size 1, INT8/BF16 precision",
    faqWhatExcluded: "What's NOT included?",
    faqExcludeSmall: "Models below 70B (different deployment profile)",
    faqExcludeQuant: "Pre-quantized variants (GPTQ, AWQ, GGUF - we calculate quantization)",
    faqExcludeFinetunes: "Community fine-tunes (quality varies)",
    faqExcludeTraining: "Training costs (inference only)",
    faqExcludeOld: "Models older than 24 months (superseded by newer versions)",
    faqAccuracy: "How accurate are the calculations?",
    faqAccuracyAnswer: "Calculations are physics-based estimates using transformer architecture formulas, not empirical benchmarks. Actual performance varies based on inference framework, kernel optimizations, and hardware configuration. Typical accuracy: ±10-15% for VRAM, ±20-30% for performance.",
    faqParameterSource: "How are parameter counts determined?",
    faqParameterSourceAnswer: "Priority order: (1) Safetensors metadata, (2) Model card statements, (3) Physics-based estimation from architecture, (4) Manual verification. Each model displays its data source.",
    faqPrivacy: "Is my data collected?",
    faqPrivacyAnswer: "No. All calculations run entirely in your browser using JavaScript. No data is sent to servers, no analytics, no tracking. The site is 100% client-side.",

    // Drawer
    drawerVramTitle: "VRAM Requirements",
    drawerInt8Label: "INT8 (Recommended)",
    drawerFp8Label: "FP8",
    drawerBf16Label: "BF16 (Full Precision)",
    drawerVramNote: "Includes weights + KV cache (8K context) + workspace overhead",
    drawerGpuTitle: "GPU Recommendation",
    drawerPerfTitle: "Performance Estimate",
    drawerComputeLabel: "Required Compute",
    drawerBandwidthLabel: "Memory Bandwidth",
    drawerTtftLabel: "Estimated TTFT",
    drawerSpecsTitle: "Model Specifications",
    drawerParamsLabel: "Parameters",
    drawerArchLabel: "Architecture",
    drawerLayersLabel: "Layers",
    drawerHiddenLabel: "Hidden Size",
    drawerContextLabel: "Context Length",
    drawerMoeLabel: "MoE Experts",
    drawerLicenseLabel: "License",
    drawerResourcesTitle: "External Resources",
    drawerHfBtn: "View on Hugging Face →",
    drawerAaBtn: "View Benchmarks →",
    drawerCalcBtn: "Open Full Calculator →",
    drawerCalcNote: "Adjust workload, hardware, and advanced settings in the full calculator",
  },
  zh: {
    // Navigation
    navModels: "模型库",
    navCalculator: "计算器",
    navHardware: "硬件中心",
    navQuickStart: "快速开始",
    navAbout: "关于",

    // Quick Start Page
    qsHeroTitle: "快速开始",
    qsHeroHeadline: "只需三个步骤",
    qsHeroSubhead: "选择模型、计算需求、匹配硬件",
    qsStep1Title: "1. 查找模型",
    qsStep1Desc: "选择一个开源模型以查看其硬件需求。点击下方模型可直接在计算器中预设参数。",
    qsStep1Browse: "→ 浏览全部 75 个模型",
    qsStep2Title: "2. 计算需求",
    qsStep2Desc: "调整上下文长度、批量大小和精度，实时查看显存、算力和带宽需求。所有计算均在本地执行。",
    qsStep2Btn: "打开计算器 →",
    qsStep3Title: "3. 匹配硬件",
    qsStep3Desc: "对比 NVIDIA 和华为 GPU，寻找符合显存和带宽需求的硬件配置。",
    qsStep3Btn: "查看硬件参数 →",

    // Homepage - Hero Section
    landingHeroTitle: "开源大语言模型部署规划工具",
    landingHeroTitleTop: "开源大语言模型",
    landingHeroTitleBottom: "部署规划工具",
    landingHeroLead: "获取在本地运行大语言模型的实用资源估算。在真实工作负载下计算 GPU、VRAM 和内存需求。",
    journeyExploreTitle: "浏览模型",
    journeyExploreDesc: "查看可用选项",
    journeyCalculateTitle: "计算硬件",
    journeyCalculateDesc: "测算需求",

    // Models Page - Model Browser Section
    modelBrowserTitle: "浏览生产级模型",
    modelBrowserSubhead: "精选开源模型 · 按厂商、大小或架构筛选",
    searchPlaceholder: "搜索 75+ 个模型 (例如 DeepSeek-V3, Qwen 2.5, Llama 3...)",

    // Models Page - Tabs (New)
    tabExplore: "探索模型",
    tabHardware: "硬件匹配",

    // Models Page - Compare Mode
    compareLabel: "对比模型",
    compareExit: "完成",

    // Models Page - View Toggle
    viewVendor: "按厂商",
    viewHardware: "按硬件等级",

    // Hardware Tiers
    tierConsumerTitle: "消费级 (Consumer)",
    tierConsumerDesc: "适用于常见消费级 GPU (< 24GB 显存)",
    tierWorkstationTitle: "工作站级 (Workstation)",
    tierWorkstationDesc: "专业级 GPU 或单节点工作站 (24GB - 80GB)",
    tierInfrastructureTitle: "基础设施级 (Infrastructure)",
    tierInfrastructureDesc: "多卡集群或数据中心规模 (> 80GB)",

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
    "70-100": "70-100B",
    "100-200": "100-200B",
    "200-400": "200-400B",
    "400+": "400B+",
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
    ecoCompare: "对比 →",
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
    findHardware: "查找硬件 →",
    verdictCalculating: "计算中...",
    verdictTier1: "🟢 消费级单卡 (Consumer)",
    verdictTier2: "🟡 专业级/工作站 (Pro/WS)",
    verdictTier3: "🟠 数据中心级 (Datacenter)",
    verdictTier4: "🔴 多卡集群 (Multi-GPU)",
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
    workloadPreset: "负载预设",
    workloadLow: "低",
    workloadMedium: "中",
    workloadHigh: "高",
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
    activeLabel: "激活",
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

    // About Page
    aboutTitle: "关于 & 方法论",
    aboutLead: "模型数据库和计算引擎的技术文档。",
    specModelCount: "模型数量",
    specParamRange: "参数范围",
    specVendors: "厂商数量",
    specUpdateFreq: "更新频率",
    specUpdateFreqValue: "每周一/三/五",
    specDataSource: "数据来源",
    specTimeWindow: "时间窗口",
    specTimeWindowValue: "24 个月",
    faqTitle: "常见问题",
    faqWhyParamRange: "为什么只有 70B-700B 模型？",
    faqWhyParamRangeAnswer: "70B 是部署成为基础设施挑战的门槛，需要多张消费级 GPU 或数据中心硬件。700B 排除了尚未成熟的实验性超大规模 MoE 模型。",
    faqWhyVendors: "为什么只有 8 个厂商？",
    faqWhyVendorsAnswer: "我们专注于一线机构（Google、Anthropic、OpenAI、Qwen、DeepSeek、NVIDIA、Apple、XiaomiMiMo），它们有经过验证的记录。这排除了社区微调模型和小型研究实验室，以保持质量标准。",
    faqUpdateFrequency: "数据多久更新一次？",
    faqUpdateFrequencyAnswer: "每周自动更新 3 次（周一、周三、周五 UTC 02:00），通过 GitHub Actions。数据从 Hugging Face Hub API 获取，基准测试通过 Artificial Analysis 验证。",
    faqHowCalculated: "需求如何计算？",
    faqCalcVRAM: "显存：",
    faqCalcVRAMDesc: "模型权重 + KV 缓存 + 工作空间开销",
    faqCalcBandwidth: "带宽：",
    faqCalcBandwidthDesc: "每 token 的内存读写（解码阶段受内存限制）",
    faqCalcPerformance: "性能：",
    faqCalcPerformanceDesc: "基于 GPU 内存带宽和模型大小",
    faqCalcDefaults: "默认场景：",
    faqCalcDefaultsDesc: "8K 上下文，批量大小 1，INT8/BF16 精度",
    faqWhatExcluded: "不包含哪些内容？",
    faqExcludeSmall: "70B 以下模型（部署配置不同）",
    faqExcludeQuant: "预量化变体（GPTQ、AWQ、GGUF - 我们计算量化）",
    faqExcludeFinetunes: "社区微调模型（质量参差不齐）",
    faqExcludeTraining: "训练成本（仅推理）",
    faqExcludeOld: "24 个月前的模型（已被新版本取代）",
    faqAccuracy: "计算的准确度如何？",
    faqAccuracyAnswer: "计算基于 Transformer 架构公式的物理估算，而非实证基准测试。实际性能因推理框架、内核优化和硬件配置而异。典型精度：显存 ±10-15%，性能 ±20-30%。",
    faqParameterSource: "参数量如何确定？",
    faqParameterSourceAnswer: "优先级顺序：(1) Safetensors 元数据，(2) 模型卡说明，(3) 基于架构的物理估算，(4) 人工验证。每个模型都显示其数据来源。",
    faqPrivacy: "是否收集我的数据？",
    faqPrivacyAnswer: "否。所有计算完全在您的浏览器中使用 JavaScript 运行。不向服务器发送数据，无分析，无跟踪。该网站 100% 客户端运行。",

    // Drawer
    drawerVramTitle: "显存需求",
    drawerInt8Label: "INT8 (推荐)",
    drawerFp8Label: "FP8",
    drawerBf16Label: "BF16 (全精度)",
    drawerVramNote: "包含权重 + KV 缓存 (8K 上下文) + 工作空间开销",
    drawerGpuTitle: "GPU 推荐",
    drawerPerfTitle: "性能预估",
    drawerComputeLabel: "算力需求",
    drawerBandwidthLabel: "内存带宽",
    drawerTtftLabel: "预计 TTFT",
    drawerSpecsTitle: "模型规格",
    drawerParamsLabel: "参数量",
    drawerArchLabel: "架构",
    drawerLayersLabel: "层数",
    drawerHiddenLabel: "隐藏维度",
    drawerContextLabel: "上下文长度",
    drawerMoeLabel: "MoE 专家数",
    drawerLicenseLabel: "许可证",
    drawerResourcesTitle: "外部资源",
    drawerHfBtn: "在 Hugging Face 查看 →",
    drawerAaBtn: "查看基准测试 →",
    drawerCalcBtn: "打开完整计算器 →",
    drawerCalcNote: "在完整计算器中调整负载、硬件和高级设置",
  },
};

// Global language state
window.currentLang = 'en';
try {
  window.currentLang = localStorage.getItem('preferred_lang') || 'en';
} catch (e) {
  console.warn('Failed to read language preference:', e);
}

// Shortcut for the global state
let currentLang = window.currentLang;

/**
 * Translation function with placeholder replacement
 * @param {string} key - Translation key
 * @param {object} replacements - Object with {placeholder: value} pairs
 * @returns {string} Translated text
 */
function t(key, replacements = {}) {
  const dict = I18N[window.currentLang] || I18N.en;
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
        // If element has dynamic children (like the count span), 
        // we should only update the text node to avoid wiping children.
        // For simplicity, we check if there's a .count span.
        const countSpan = el.querySelector('.count');
        if (countSpan) {
          // Preserve the count span
          const temp = countSpan.cloneNode(true);
          el.textContent = translation + ' '; // Space for separation
          el.appendChild(temp);
        } else {
          el.textContent = translation;
        }
      }
    }
  });

  // Update Document Title if it has data-i18n
  const titleEl = document.querySelector('title[data-i18n]');
  if (titleEl) {
    document.title = t(titleEl.getAttribute('data-i18n'));
  }

  // Update compute unit dropdown options (calculator page specific)
  const computeUnitSelect = document.getElementById('computeUnit');
  if (computeUnitSelect) {
    const unitOptions = (I18N[window.currentLang]?.computeUnitOptions || I18N.en.computeUnitOptions);
    Array.from(computeUnitSelect.options).forEach((opt) => {
      if (unitOptions[opt.value]) {
        opt.textContent = unitOptions[opt.value];
      }
    });
  }

  // Update language selector value
  const langSelects = document.querySelectorAll('#langSelect');
  langSelects.forEach(select => {
    select.value = window.currentLang;
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

  window.currentLang = lang;
  currentLang = lang; // Update local shortcut too
  try {
    localStorage.setItem('preferred_lang', lang);
  } catch (e) {
    console.warn('Failed to save language preference:', e);
  }

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
    window.currentLang = langParam;
    currentLang = langParam;
    try {
      localStorage.setItem('preferred_lang', window.currentLang);
    } catch (e) {
      // ignore
    }
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
    select.value = window.currentLang;

    // Add change listener (only once)
    if (!select.dataset.hasListener) {
      select.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
      select.dataset.hasListener = "true";
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

