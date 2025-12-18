// GPU database and hardware recommendation logic
// Embedded directly to work offline without fetch/CORS issues

let gpuDatabase = [
  {
    "id": "rtx-4090",
    "name": "NVIDIA RTX 4090",
    "category": "consumer",
    "vram_gb": 24,
    "tflops_fp32": 82.6,
    "tflops_fp16": 165.2,
    "tflops_bf16": 165.2,
    "tops_int8": 660,
    "bandwidth_gbps": 1008,
    "price_usd": 1599,
    "notes": "Best consumer GPU for LLM inference",
    "popular": true
  },
  {
    "id": "rtx-4080",
    "name": "NVIDIA RTX 4080",
    "category": "consumer",
    "vram_gb": 16,
    "tflops_fp32": 48.7,
    "tflops_fp16": 97.4,
    "tflops_bf16": 97.4,
    "tops_int8": 389,
    "bandwidth_gbps": 716,
    "price_usd": 1199,
    "notes": "Strong mid-range option",
    "popular": true
  },
  {
    "id": "rtx-3090",
    "name": "NVIDIA RTX 3090",
    "category": "consumer",
    "vram_gb": 24,
    "tflops_fp32": 35.6,
    "tflops_fp16": 71.2,
    "tflops_bf16": 35.6,
    "tops_int8": 142,
    "bandwidth_gbps": 936,
    "price_usd": 699,
    "notes": "Previous gen, still viable for inference",
    "popular": true
  },
  {
    "id": "rtx-3080",
    "name": "NVIDIA RTX 3080",
    "category": "consumer",
    "vram_gb": 10,
    "tflops_fp32": 29.8,
    "tflops_fp16": 59.6,
    "tflops_bf16": 29.8,
    "tops_int8": 119,
    "bandwidth_gbps": 760,
    "price_usd": 499,
    "notes": "Budget option for small models",
    "popular": false
  },
  {
    "id": "a100-80gb",
    "name": "NVIDIA A100 80GB",
    "category": "datacenter",
    "vram_gb": 80,
    "tflops_fp32": 19.5,
    "tflops_fp16": 312,
    "tflops_bf16": 312,
    "tops_int8": 624,
    "bandwidth_gbps": 2039,
    "price_usd": 15000,
    "cloud_hourly": 4.10,
    "notes": "Industry standard datacenter GPU",
    "popular": true
  },
  {
    "id": "a100-40gb",
    "name": "NVIDIA A100 40GB",
    "category": "datacenter",
    "vram_gb": 40,
    "tflops_fp32": 19.5,
    "tflops_fp16": 312,
    "tflops_bf16": 312,
    "tops_int8": 624,
    "bandwidth_gbps": 1555,
    "price_usd": 11000,
    "cloud_hourly": 2.88,
    "notes": "More affordable A100 variant",
    "popular": false
  },
  {
    "id": "h100-80gb",
    "name": "NVIDIA H100 80GB",
    "category": "datacenter",
    "vram_gb": 80,
    "tflops_fp32": 51,
    "tflops_fp16": 989,
    "tflops_bf16": 989,
    "tops_int8": 1979,
    "bandwidth_gbps": 3350,
    "price_usd": 30000,
    "cloud_hourly": 8.50,
    "notes": "Latest datacenter GPU, highest performance",
    "popular": true
  },
  {
    "id": "h100-sxm5-80gb",
    "name": "NVIDIA H100 SXM5 80GB",
    "category": "datacenter",
    "vram_gb": 80,
    "tflops_fp32": 51,
    "tflops_fp16": 989,
    "tflops_bf16": 989,
    "tops_int8": 1979,
    "bandwidth_gbps": 3350,
    "price_usd": 35000,
    "cloud_hourly": 9.20,
    "notes": "H100 with NVLink, best for multi-GPU",
    "popular": false
  },
  {
    "id": "l40s",
    "name": "NVIDIA L40S",
    "category": "datacenter",
    "vram_gb": 48,
    "tflops_fp32": 91.6,
    "tflops_fp16": 183.2,
    "tflops_bf16": 183.2,
    "tops_int8": 733,
    "bandwidth_gbps": 864,
    "price_usd": 8000,
    "cloud_hourly": 3.20,
    "notes": "Balanced price/performance for inference",
    "popular": true
  },
  {
    "id": "l4",
    "name": "NVIDIA L4",
    "category": "datacenter",
    "vram_gb": 24,
    "tflops_fp32": 30.3,
    "tflops_fp16": 121,
    "tflops_bf16": 60.6,
    "tops_int8": 242,
    "bandwidth_gbps": 300,
    "price_usd": 4000,
    "cloud_hourly": 1.45,
    "notes": "Cost-effective inference GPU",
    "popular": false
  },
  {
    "id": "v100-32gb",
    "name": "NVIDIA V100 32GB",
    "category": "datacenter",
    "vram_gb": 32,
    "tflops_fp32": 15.7,
    "tflops_fp16": 125,
    "tflops_bf16": 62.5,
    "tops_int8": 250,
    "bandwidth_gbps": 900,
    "price_usd": 6000,
    "cloud_hourly": 2.48,
    "notes": "Older generation, still available in cloud",
    "popular": false
  },
  {
    "id": "a6000",
    "name": "NVIDIA RTX A6000",
    "category": "professional",
    "vram_gb": 48,
    "tflops_fp32": 38.7,
    "tflops_fp16": 77.4,
    "tflops_bf16": 77.4,
    "tops_int8": 309,
    "bandwidth_gbps": 768,
    "price_usd": 4500,
    "notes": "Workstation GPU with large VRAM",
    "popular": true
  },
  {
    "id": "a5000",
    "name": "NVIDIA RTX A5000",
    "category": "professional",
    "vram_gb": 24,
    "tflops_fp32": 27.8,
    "tflops_fp16": 55.6,
    "tflops_bf16": 55.6,
    "tops_int8": 222,
    "bandwidth_gbps": 768,
    "price_usd": 2500,
    "notes": "Mid-range workstation option",
    "popular": false
  },
  {
    "id": "mac-m2-ultra-192gb",
    "name": "Mac Studio M2 Ultra (192GB)",
    "category": "apple",
    "vram_gb": 192,
    "tflops_fp32": 27.2,
    "tflops_fp16": 54.4,
    "tflops_bf16": 54.4,
    "tops_int8": 109,
    "bandwidth_gbps": 800,
    "price_usd": 6499,
    "notes": "Unified memory, excellent for large context",
    "popular": true
  },
  {
    "id": "mac-m2-ultra-128gb",
    "name": "Mac Studio M2 Ultra (128GB)",
    "category": "apple",
    "vram_gb": 128,
    "tflops_fp32": 27.2,
    "tflops_fp16": 54.4,
    "tflops_bf16": 54.4,
    "tops_int8": 109,
    "bandwidth_gbps": 800,
    "price_usd": 5799,
    "notes": "Unified memory, good for 70B models",
    "popular": true
  },
  {
    "id": "mac-m3-max-128gb",
    "name": "MacBook Pro M3 Max (128GB)",
    "category": "apple",
    "vram_gb": 128,
    "tflops_fp32": 14.2,
    "tflops_fp16": 28.4,
    "tflops_bf16": 28.4,
    "tops_int8": 57,
    "bandwidth_gbps": 400,
    "price_usd": 4499,
    "notes": "Portable option with unified memory",
    "popular": false
  },
  {
    "id": "mac-m3-max-96gb",
    "name": "MacBook Pro M3 Max (96GB)",
    "category": "apple",
    "vram_gb": 96,
    "tflops_fp32": 14.2,
    "tflops_fp16": 28.4,
    "tflops_bf16": 28.4,
    "tops_int8": 57,
    "bandwidth_gbps": 400,
    "price_usd": 3999,
    "notes": "Portable, good for smaller models",
    "popular": false
  },
  {
    "id": "mi250x",
    "name": "AMD Instinct MI250X",
    "category": "datacenter",
    "vram_gb": 128,
    "tflops_fp32": 47.9,
    "tflops_fp16": 383,
    "tflops_bf16": 383,
    "tops_int8": 766,
    "bandwidth_gbps": 3277,
    "price_usd": 12000,
    "notes": "AMD datacenter alternative",
    "popular": false
  },
  {
    "id": "mi300x",
    "name": "AMD Instinct MI300X",
    "category": "datacenter",
    "vram_gb": 192,
    "tflops_fp32": 163,
    "tflops_fp16": 1307,
    "tflops_bf16": 1307,
    "tops_int8": 2614,
    "bandwidth_gbps": 5300,
    "price_usd": 15000,
    "cloud_hourly": 10.50,
    "notes": "Latest AMD GPU, highest VRAM",
    "popular": true
  },
  {
    "id": "rx-7900-xtx",
    "name": "AMD Radeon RX 7900 XTX",
    "category": "consumer",
    "vram_gb": 24,
    "tflops_fp32": 61,
    "tflops_fp16": 122,
    "tflops_bf16": 61,
    "tops_int8": 244,
    "bandwidth_gbps": 960,
    "price_usd": 999,
    "notes": "AMD consumer alternative to RTX 4090",
    "popular": false
  }
];

// Load GPU database (now synchronous, kept for API compatibility)
async function loadGPUDatabase() {
  return gpuDatabase;
}

// Get GPU by ID
function getGPUById(id) {
  if (!gpuDatabase) return null;
  return gpuDatabase.find(gpu => gpu.id === id);
}

// Get popular GPUs (for quick selection)
function getPopularGPUs() {
  if (!gpuDatabase) return [];
  return gpuDatabase.filter(gpu => gpu.popular);
}

// Filter GPUs by category
function getGPUsByCategory(category) {
  if (!gpuDatabase) return [];
  return gpuDatabase.filter(gpu => gpu.category === category);
}

// Find GPUs that can handle given requirements
function findSuitableGPUs(requirements, singleGPU = true) {
  if (!gpuDatabase) return [];
  
  const {
    totalVramGb = 0,
    requiredTflops = 0,
    requiredBwGbps = 0,
    weightPrecision = 'bf16'
  } = requirements;
  
  // Determine which TFLOPS/TOPS to use based on precision
  const getThroughput = (gpu) => {
    if (weightPrecision === 'int8') return gpu.tops_int8 / 1000; // Convert TOPS to TFLOPS equivalent
    if (weightPrecision === 'int4') return (gpu.tops_int4 || gpu.tops_int8 * 2) / 1000;
    if (weightPrecision === 'fp8') return gpu.tflops_fp16; // FP8 typically similar to FP16
    if (weightPrecision === 'bf16') return gpu.tflops_bf16 || gpu.tflops_fp16;
    return gpu.tflops_fp16; // default to FP16
  };
  
  const suitable = [];
  
  for (const gpu of gpuDatabase) {
    const throughput = getThroughput(gpu);
    
    if (singleGPU) {
      // Check if single GPU can handle it
      if (gpu.vram_gb >= totalVramGb &&
          throughput >= requiredTflops &&
          gpu.bandwidth_gbps >= requiredBwGbps) {
        suitable.push({
          ...gpu,
          count: 1,
          effective_tflops: throughput,
          vram_headroom: gpu.vram_gb - totalVramGb,
          compute_headroom: throughput - requiredTflops,
          bandwidth_headroom: gpu.bandwidth_gbps - requiredBwGbps
        });
      }
    } else {
      // Calculate how many GPUs needed
      const gpusForVram = Math.ceil(totalVramGb / gpu.vram_gb);
      const gpusForCompute = Math.ceil(requiredTflops / throughput);
      const gpusForBandwidth = Math.ceil(requiredBwGbps / gpu.bandwidth_gbps);
      const gpusNeeded = Math.max(gpusForVram, gpusForCompute, gpusForBandwidth);
      
      if (gpusNeeded <= 8) { // Reasonable limit
        suitable.push({
          ...gpu,
          count: gpusNeeded,
          effective_tflops: throughput * gpusNeeded,
          total_vram: gpu.vram_gb * gpusNeeded,
          total_cost: gpu.price_usd ? gpu.price_usd * gpusNeeded : null
        });
      }
    }
  }
  
  // Sort by cost-effectiveness (price if available)
  return suitable.sort((a, b) => {
    if (a.price_usd && b.price_usd) {
      const costA = a.price_usd * a.count;
      const costB = b.price_usd * b.count;
      return costA - costB;
    }
    // If no price, prefer fewer GPUs, then higher performance
    if (a.count !== b.count) return a.count - b.count;
    return b.effective_tflops - a.effective_tflops;
  });
}

// Get best hardware recommendations
function getHardwareRecommendations(requirements) {
  const singleGPU = findSuitableGPUs(requirements, true).slice(0, 5);
  const multiGPU = findSuitableGPUs(requirements, false).slice(0, 5);
  
  // Categorize by user type
  const consumer = singleGPU.filter(g => g.category === 'consumer');
  const professional = singleGPU.filter(g => g.category === 'professional' || g.category === 'apple');
  const datacenter = [...singleGPU, ...multiGPU].filter(g => g.category === 'datacenter');
  
  return {
    consumer: consumer.slice(0, 3),
    professional: professional.slice(0, 3),
    datacenter: datacenter.slice(0, 3),
    all: [...singleGPU, ...multiGPU.slice(0, 2)]
  };
}

// Format GPU name with count
function formatGPURecommendation(gpu) {
  if (gpu.count > 1) {
    return `${gpu.count}× ${gpu.name}`;
  }
  return gpu.name;
}

// Calculate estimated cloud cost
function estimateCloudCost(gpu, hoursPerMonth = 730) {
  if (!gpu.cloud_hourly) return null;
  
  const monthlyCost = gpu.cloud_hourly * hoursPerMonth * (gpu.count || 1);
  const yearlyCost = monthlyCost * 12;
  
  return {
    hourly: gpu.cloud_hourly * (gpu.count || 1),
    monthly: monthlyCost,
    yearly: yearlyCost
  };
}

// Search GPUs by name
function searchGPUs(query) {
  if (!gpuDatabase || !query) return [];
  
  const lowerQuery = query.toLowerCase();
  return gpuDatabase.filter(gpu => 
    gpu.name.toLowerCase().includes(lowerQuery) ||
    gpu.id.toLowerCase().includes(lowerQuery) ||
    (gpu.notes && gpu.notes.toLowerCase().includes(lowerQuery))
  );
}

// Auto-fill calculator with GPU specs
function applyGPUToCalculator(gpuId) {
  const gpu = getGPUById(gpuId);
  if (!gpu) return null;
  
  // Return specs that can be fed into calcRequirements
  return {
    peakTflops: gpu.tflops_bf16 || gpu.tflops_fp16,
    peakTops: gpu.tops_int8,
    memBandwidth: gpu.bandwidth_gbps,
    totalVramAvailable: gpu.vram_gb
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadGPUDatabase,
    getGPUById,
    getPopularGPUs,
    getGPUsByCategory,
    findSuitableGPUs,
    getHardwareRecommendations,
    formatGPURecommendation,
    estimateCloudCost,
    searchGPUs,
    applyGPUToCalculator
  };
}

