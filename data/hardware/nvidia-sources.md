# NVIDIA Data Center GPU - Official Sources

**Purpose:** Authoritative documentation sources for NVIDIA hardware specifications  
**Last Updated:** 2025-12-16  
**Curator:** Track A - Person 1  

---

## 🏢 Official NVIDIA Resources

### Main Product Pages

| Product Family | Official URL | Notes |
|----------------|--------------|-------|
| **Data Center Overview** | https://www.nvidia.com/en-us/data-center/ | Landing page for all data center products |
| **GPU Products** | https://www.nvidia.com/en-us/data-center/products/gpu/ | Complete GPU lineup |

---

## 📋 Individual GPU Product Pages

### Hopper Generation

| GPU Model | Official Product Page | Datasheet/White Paper |
|-----------|----------------------|------------------------|
| **H100 SXM** | https://www.nvidia.com/en-us/data-center/h100/ | https://resources.nvidia.com/en-us-tensor-core |
| **H100 PCIe** | https://www.nvidia.com/en-us/data-center/h100/ | (Same as SXM) |
| **H200** | https://www.nvidia.com/en-us/data-center/h200/ | https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/h200/h200-datasheet.pdf |

### Ampere Generation

| GPU Model | Official Product Page | Datasheet/White Paper |
|-----------|----------------------|------------------------|
| **A100 SXM (80GB)** | https://www.nvidia.com/en-us/data-center/a100/ | https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf |
| **A100 SXM (40GB)** | https://www.nvidia.com/en-us/data-center/a100/ | (Same as 80GB) |
| **A100 PCIe (80GB)** | https://www.nvidia.com/en-us/data-center/a100/ | (Same as 80GB) |

### Blackwell Generation

| GPU Model | Official Product Page | Datasheet/White Paper |
|-----------|----------------------|------------------------|
| **B100** | https://www.nvidia.com/en-us/data-center/b100/ | TBD - Product announced, detailed specs pending |
| **B200** | https://www.nvidia.com/en-us/data-center/b200/ | https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/b200/nvidia-b200-datasheet.pdf |
| **GB200 NVL72** | https://www.nvidia.com/en-us/data-center/gb200-nvl72/ | https://resources.nvidia.com/en-us-blackwell-architecture |

---

## 📊 Technical Documentation

### Architecture White Papers

| Generation | Document | URL |
|------------|----------|-----|
| **Hopper** | Hopper Architecture White Paper | https://resources.nvidia.com/en-us-tensor-core/hopper-architecture-whitepaper |
| **Ampere** | Ampere Architecture White Paper | https://images.nvidia.com/aem-dam/en-zz/Solutions/data-center/nvidia-ampere-architecture-whitepaper.pdf |
| **Blackwell** | Blackwell Architecture White Paper | https://resources.nvidia.com/en-us-blackwell-architecture |

### Technical Specs Reference

| Resource | URL | Content |
|----------|-----|---------|
| **GPU Specifications** | https://www.nvidia.com/en-us/data-center/resources/gpu-specifications/ | Comparison tables for all GPUs |
| **NVLink Specifications** | https://www.nvidia.com/en-us/data-center/nvlink/ | Interconnect specs by generation |
| **CUDA Compute Capability** | https://developer.nvidia.com/cuda-gpus | Compute capability per GPU |

---

## 🔍 Verification Strategy

### Primary Sources (Use First)
1. **Product page** → Basic specs (VRAM, form factor, TDP)
2. **Official datasheet PDF** → Detailed specs (bandwidth, TFLOPS, interconnect)
3. **Architecture white paper** → Technical deep-dive

### Cross-Reference
- If specs conflict between sources, prioritize: Datasheet > Product page > White paper
- Always note the source and date in `nvidia.json` entries

### Update Frequency
- **Check quarterly** for new product announcements
- **Check monthly** for Blackwell generation (2024-2025) as specs finalize
- **Announced products** marked with "TBD" until official datasheet available

---

## 🆕 New Product Monitoring

### Official Announcement Sources

| Source | URL | Check Frequency |
|--------|-----|----------------|
| **NVIDIA Blog** | https://blogs.nvidia.com/blog/category/data-center/ | Monthly |
| **NVIDIA Press Releases** | https://nvidianews.nvidia.com/ | Monthly |
| **GTC Announcements** | https://www.nvidia.com/gtc/ | During GTC events |

---

## 📌 Key Specifications to Extract

For each GPU, always collect:

### Memory
- VRAM capacity (GB)
- Memory type (HBM2, HBM2e, HBM3, HBM3e)
- Memory bandwidth (GB/s)

### Compute
- FP16 TFLOPS
- BF16 TFLOPS (if available)
- FP8 TFLOPS (if available)
- FP4 TFLOPS (if available)
- INT8 TOPS (if available)

### Physical
- Form factor (SXM4, SXM5, PCIe Gen4, PCIe Gen5)
- TDP (watts)

### Interconnect
- Type (NVLink 3.0, 4.0, 5.0, PCIe)
- Bandwidth per link (GB/s)
- Max cards per node

### Metadata
- Release year
- Availability status (available/announced/eol)
- Product page URL
- Verification date

---

## 🛠️ Tools & Utilities

### Official NVIDIA Tools
- **nvidia-smi** → Runtime GPU queries (for verification)
- **NVML API** → Programmatic access to GPU specs
- **CUDA Toolkit docs** → Architecture-specific limits

---

## 📝 Notes

### Known Spec Variations
- **H100 SXM vs PCIe:** Different TDP (700W vs 350W), bandwidth (3350 vs 2000 GB/s)
- **A100 40GB vs 80GB:** Different HBM generation (HBM2 vs HBM2e), bandwidth
- **Announced products:** Specs may change before GA (general availability)

### Blackwell Status (as of 2025-12-16)
- B100: Announced, limited specs available
- B200: Datasheet available
- GB200 NVL72: Full system specs available, individual GPU specs combined

---

## 🔄 Update Workflow

When updating `nvidia.json`:

1. **Check new products** → Visit main data center page
2. **For each new GPU** → Navigate to product page
3. **Download datasheet** → If available (prefer PDF for archiving)
4. **Extract specs** → Follow checklist above
5. **Add entry to nvidia.json** → Include `source_url` and `verified_date`
6. **Update this file** → Add new product to relevant section

---

**Maintained by:** Track A Team  
**Contact:** See project contributors  
**License:** This source list is part of the LLM Resource Sizer project

