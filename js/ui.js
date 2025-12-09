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
    title: "LLM Resource Sizer",
    lead: "Estimate compute, memory, and bandwidth to hit a target tokens/sec and TTFT for an open-source LLM.",
    langLabel: "Language",
    reset: "Reset to defaults",
    sectionModel: "Model",
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
    promptTokens: "Prompt tokens",
    newTokens: "Max new tokens",
    batchSize: "Batch size / concurrency",
    targetTps: "Target throughput (tokens/sec per stream)",
    ttftMs: "Target TTFT (ms)",
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
    title: "LLM 资源估算",
    lead: "估算达到目标输出速率与 TTFT 所需的算力、显存与带宽。",
    langLabel: "语言",
    reset: "恢复默认",
    sectionModel: "模型",
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
    promptTokens: "提示词长度",
    newTokens: "生成上限",
    batchSize: "并发/批量",
    targetTps: "单流输出速率 (token/s)",
    ttftMs: "目标 TTFT (ms)",
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

function t(key) {
  const dict = I18N[currentLang] || I18N.en;
  return dict[key] || I18N.en[key] || key;
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

  byId("vramCard").innerHTML = `
    <strong>${t("requiredVram")}</strong>
    <div class="metric">${fmt(results.totalVramGb, 2)} GB</div>
    <div class="sub">${t("weightsLabel") ?? "Weights"}: ${fmt(results.weightBytesTotal / 1e9, 2)} GB · KV: ${fmt(results.kvCacheBytes / 1e9, 2)} GB</div>
  `;

  byId("computeCard").innerHTML = `
    <strong>${t("requiredCompute")}</strong>
    <div class="metric">${fmtCompute(computeValue)} ${unitLabel}</div>
    <div class="sub">${t("activeParamsLabel")}: ${fmt(results.activeParamsB, 1)}B · ${t("totalParamsLabel")}: ${fmt(results.paramsB, 1)}B</div>
    <div class="sub">${speedNote}</div>
  `;

  byId("bandwidthCard").innerHTML = `
    <strong>${t("requiredBandwidth")}</strong>
    <div class="metric">${bwCon} GB/s</div>
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
  byId("ttftCard").innerHTML = ttftKnown
    ? `
      <strong>${t("ttftLabel")}</strong>
      <div class="metric">${fmt(results.ttftMs, 0)} ms</div>
      <div class="sub">${t("budgetLabel") ?? "Budget"}: ${fmt(results.ttftBudgetMs, 0)} ms · ${t("promptLabel") ?? "Prompt"}: ${results.totalSeq - results.newTokens || "?"}</div>
    `
    : `
      <strong>${t("ttftLabel")}</strong>
      <div class="metric">${t("ttftNeedHardware")}</div>
      <div class="sub">${t("ttftPrefillNote")}</div>
    `;

  const assumptionLines = I18N[currentLang]?.assumptions || I18N.en.assumptions;
  byId("assumptions").textContent = assumptionLines.join(" ");
}

function computeAndRender() {
  const inputs = gatherInputs();
  const results = calcRequirements(inputs);
  render(results);
}

function init() {
  populatePresetSelect();
  applyPreset(MODEL_PRESETS[0]);
  updatePresetLink(MODEL_PRESETS[0]);
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

  computeAndRender();
}

document.addEventListener("DOMContentLoaded", init);
