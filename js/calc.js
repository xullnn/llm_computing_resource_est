const BYTES_PER_PREC = {
  bf16: 2,
  fp16: 2,
  fp8: 1,
  int8: 1,
  int4: 0.5,
};

function align(value, base = 64) {
  return Math.max(base, Math.round(value / base) * base);
}

function estimateLayers(paramsB, layersHint) {
  if (layersHint) return layersHint;
  if (paramsB >= 60) return 80;
  if (paramsB >= 30) return 64;
  if (paramsB >= 12) return 48;
  return 32;
}

function estimateHiddenSize(paramsB, layers) {
  const hidden = Math.sqrt((paramsB * 1e9) / (12 * layers)); // rough dense transformer rule-of-thumb
  return align(hidden);
}

function estimateHeads(hiddenSize, headsHint) {
  if (headsHint) return headsHint;
  // Modern configs often use head_dim ~128
  return Math.max(8, Math.round(hiddenSize / 128));
}

function calcRequirements(input) {
  const paramsB = Number(input.paramsB || 0);
  const activeParamsB = Number(input.activeParamsB || paramsB);
  const weightPrec = input.weightPrecision || "bf16";
  const kvPrec = input.kvPrecision || "bf16";
  const weightBytes = BYTES_PER_PREC[weightPrec] || 2;
  const kvBytes = BYTES_PER_PREC[kvPrec] || 2;

  const layers = estimateLayers(paramsB, input.layers);
  const hiddenSize = Number(input.hiddenSize) || estimateHiddenSize(paramsB, layers);
  const heads = estimateHeads(hiddenSize, input.heads);
  const headDim = Math.max(16, Math.round(hiddenSize / heads));

  const promptTokens = Number(input.promptTokens || 0);
  const newTokens = Number(input.newTokens || 0);
  const batch = Number(input.batchSize || 1);
  const targetTps = Number(input.targetTps || 1);
  const ttftBudgetMs = Number(input.ttftMs || 1000);

  const totalSeq = promptTokens + newTokens;
  const avgDecodeSeq = promptTokens + Math.max(newTokens, 1) * 0.5; // average seen length during generation
  const totalThroughput = targetTps * batch; // aggregate tokens/sec across concurrent streams

  // Memory (weights + KV cache + workspace)
  const weightBytesTotal = paramsB * 1e9 * weightBytes;
  const kvPerToken = layers * hiddenSize * 2 * kvBytes; // K and V per layer
  const kvCacheBytes = batch * totalSeq * kvPerToken;
  const workspaceBytes = weightBytesTotal * 0.12; // simple overhead estimate
  const totalVramBytes = weightBytesTotal + kvCacheBytes + workspaceBytes;
  const totalVramGb = totalVramBytes / 1e9;

  // Compute (FLOPs)
  // Prefill: forward pass through all layers for all prompt tokens
  // FLOPs = 2 * params * tokens (2 ops per parameter: multiply + add)
  const prefillFlops = 2 * activeParamsB * 1e9 * promptTokens * batch;
  // Attention prefill: QK^T and Attention*V both have O(seq^2) complexity
  // Total attention FLOPs = 4 * layers * seq^2 * hidden_size (Q@K^T + Attn@V)
  const attnPrefillFlops = 4 * layers * Math.pow(promptTokens, 2) * hiddenSize * batch;
  const totalPrefillFlops = prefillFlops + attnPrefillFlops;
  
  // Decode: single token forward pass (memory-bound typically)
  // FLOPs per token = 2 * active_params (forward pass only, not 4)
  const decodeFlopsPerTok =
    2 * activeParamsB * 1e9 + // dense forward per token
    4 * layers * avgDecodeSeq * hiddenSize; // attention term: Q@K^T + Attn@V for one query
  const requiredTflops = (decodeFlopsPerTok * totalThroughput) / 1e12;

  // Hardware effective
  const utilCompute = Number(input.utilCompute || 0.4);
  const utilBandwidth = Number(input.utilBandwidth || 0.6);
  // If hardware not provided, just report requirements; effective values stay undefined.
  const peakTflops = Number(input.peakTflops || 0);
  const peakTops = Number(input.peakTops || 0);
  const memBandwidthGbps = Number(input.memBandwidth || 0); // GB/s
  const effectiveTflops =
    peakTflops || peakTops ? Math.max(peakTflops * utilCompute, (peakTops * utilCompute) / 1000) : undefined;
  const effectiveBwGbps = memBandwidthGbps ? memBandwidthGbps * utilBandwidth : undefined;

  // Bandwidth approximation for decode phase (memory-bound)
  // For batch_size=1 decode: must read all weights + KV cache per token
  // Weights: entire model weights must be loaded from memory for each token
  const weightReadBytesPerTok = activeParamsB * 1e9 * weightBytes; // active weights read per token
  // KV cache: read existing K+V for attention, write new K+V
  const kvReadBytesPerTok = layers * Math.max(avgDecodeSeq, 1) * hiddenSize * 2 * kvBytes; // read K+V of context
  const kvWriteBytesPerTok = layers * hiddenSize * 2 * kvBytes; // write new K+V
  // Total bytes per token (decode phase is memory-bound)
  const bytesPerToken = weightReadBytesPerTok + kvReadBytesPerTok + kvWriteBytesPerTok;
  // For larger batches, weight loading amortized: bytes_per_tok ≈ weights/batch + KV
  const amortizedBytesPerTok = weightReadBytesPerTok / batch + kvReadBytesPerTok + kvWriteBytesPerTok;
  const requiredBwGbpsConservative = (amortizedBytesPerTok * totalThroughput) / 1e9;
  // Optimistic: assume weights stay resident/hot so only a small fraction is streamed each token
  const optimisticWeightFraction = 0.2; // assume ~80% reuse from caches
  const amortizedBytesPerTokOptimistic =
    (weightReadBytesPerTok * optimisticWeightFraction) / batch + kvReadBytesPerTok + kvWriteBytesPerTok;
  const requiredBwGbpsOptimistic = (amortizedBytesPerTokOptimistic * totalThroughput) / 1e9;

  // TTFT (prefill dominated). If no hardware throughput is provided, leave undefined.
  const ttftMs =
    effectiveTflops && effectiveTflops > 0
      ? (totalPrefillFlops / (effectiveTflops * 1e12)) * 1000 + 80 // add small overhead
      : undefined;

  return {
    promptTokens,
    newTokens,
    paramsB,
    activeParamsB,
    hiddenSize,
    headDim,
    heads,
    layers,
    weightBytes,
    kvBytes,
    totalSeq,
    weightBytesTotal,
    kvCacheBytes,
    workspaceBytes,
    totalVramGb,
    requiredTflops,
    effectiveTflops,
    requiredBwGbps: requiredBwGbpsConservative,
    requiredBwGbpsConservative,
    requiredBwGbpsOptimistic,
    effectiveBwGbps,
    ttftMs,
    ttftBudgetMs,
    computeOk: effectiveTflops ? effectiveTflops >= requiredTflops : undefined,
    vramOk: undefined,
    bandwidthOk: effectiveBwGbps ? effectiveBwGbps >= requiredBwGbpsConservative : undefined,
  };
}

if (typeof module !== "undefined") {
  module.exports = { calcRequirements };
}
