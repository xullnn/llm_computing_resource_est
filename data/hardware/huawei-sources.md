# Huawei Hardware Authoritative Sources

**Purpose:** Official documentation links for verifying Huawei Ascend/Atlas NPU specifications.  
**Last Updated:** 2025-12-16  
**Curator:** Person 2 (Track B)

---

## 🏢 Official Company Resources

### Primary Sources (Authoritative)

| Resource | URL | Language | Content |
|----------|-----|----------|---------|
| **Huawei Ascend Portal** | https://www.hiascend.com/ | 中文/EN | Main NPU product hub, technical docs |
| **Huawei Enterprise (CN)** | https://e.huawei.com/cn/products/computing/ascend/ | 中文 | Product specs, datasheets |
| **Huawei Enterprise (EN)** | https://e.huawei.com/en/products/computing/ascend/ | English | English product pages |
| **Ascend Community** | https://www.hiascend.com/forum | 中文/EN | Technical forums, developer docs |

---

## 📦 Product-Specific Pages

### Ascend 910 Series

#### Ascend 910B
- **Product Page (CN):** https://e.huawei.com/cn/products/computing/ascend/ascend-910
- **Product Page (EN):** https://e.huawei.com/en/products/computing/ascend/ascend-910
- **Key Specs Available:**
  - VRAM capacity
  - Memory bandwidth
  - Compute performance (FP16/BF16/INT8)
  - TDP
- **Notes:** 910B is the latest variant, some specs may only be in Chinese docs

#### Ascend 910 (Original)
- **Product Page (CN):** https://e.huawei.com/cn/products/computing/ascend/ascend-910
- **Product Page (EN):** https://e.huawei.com/en/products/computing/ascend/ascend-910
- **Spec Sheet:** Look for "Ascend 910 White Paper" on hiascend.com
- **Key Specs Available:**
  - 32GB HBM2 memory
  - 1.2TB/s memory bandwidth
  - FP16: ~320 TFLOPS
  - HCCS interconnect
- **Notes:** Released 2019, well-documented

### Atlas Series

#### Atlas 300I Duo
- **Product Page (CN):** https://e.huawei.com/cn/products/computing/ascend/atlas-300i-duo
- **Product Page (EN):** https://e.huawei.com/en/products/servers/atlas/atlas-300i-duo
- **Spec Sheet:** Look for PDF downloads on product page
- **Key Specs Available:**
  - Dual NPU configuration
  - PCIe form factor
  - Memory per NPU
  - Power consumption
- **Notes:** Inference-focused card, may have multiple variants

#### Atlas 800 Series
- **Product Page (CN):** https://e.huawei.com/cn/products/servers/atlas
- **Product Page (EN):** https://e.huawei.com/en/products/servers/atlas
- **Models:** 
  - Atlas 800 Model 9000
  - Atlas 800 Model 3000
- **Key Specs Available:**
  - Number of NPUs per server
  - Total system memory
  - Interconnect topology
  - Power and cooling requirements
- **Notes:** These are complete server systems, not individual cards

#### Atlas 800 Training Server
- **Product Page:** https://e.huawei.com/en/products/servers/atlas/atlas-800-training
- **Spec Sheet:** Downloadable PDFs usually available
- **Notes:** 8× Ascend 910 configuration

---

## 📄 Technical Documentation

### Datasheets & White Papers

| Document | URL | Notes |
|----------|-----|-------|
| **Ascend Technical Documentation** | https://www.hiascend.com/document | Requires registration |
| **CANN Documentation** | https://www.hiascend.com/document/detail/en/CANNCommunityEdition/80RC1alpha003/overview/index.html | Compute Architecture docs |
| **Support Documents** | https://support.huawei.com/enterprise/en/ai-computing/ | Technical specs, FAQs |

### Downloadable Resources
- **Location:** Product pages often have "Download" or "Resources" sections
- **File Types:** PDF datasheets, white papers, technical manuals
- **Access:** Some require account registration

---

## 🔧 Technical Specifications Sources

### Where to Find Each Spec

| Specification | Best Source | Notes |
|---------------|-------------|-------|
| **VRAM Capacity** | Product page specs table | Usually prominently listed |
| **Memory Type** | Datasheet PDF | Look for "HBM2" or "HBM2e" |
| **Memory Bandwidth** | Datasheet PDF or white paper | In GB/s or TB/s |
| **FP16 Performance** | White paper, performance section | In TFLOPS |
| **BF16 Performance** | Technical docs, may need calculation | Often same as FP16 for Ascend |
| **INT8 Performance** | White paper | In TOPS |
| **TDP** | Datasheet "Power Consumption" | In Watts |
| **Form Factor** | Product page | PCIe card, SXM-like module, etc. |
| **Interconnect** | Technical docs, architecture section | HCCS (Huawei Cache Coherence System) |
| **Interconnect Bandwidth** | White paper or CANN docs | HCCS bandwidth specs |
| **Max Cards per Node** | Server/platform documentation | Atlas 800 specs |

---

## 🌐 Alternative Research Paths

### If Official Docs Unavailable

1. **Huawei Developer Forums**
   - https://www.hiascend.com/forum
   - Often has spec discussions from Huawei engineers

2. **Academic Papers**
   - Search "Ascend 910" on arXiv or IEEE
   - Papers often include verified specs

3. **Third-party Reviews**
   - **Use with caution** — only if from authoritative sources
   - Cross-reference with multiple sources
   - Not preferred for our database

---

## ⚠️ Verification Checklist

When updating specs from these sources:

- [ ] URL is from official Huawei domain (.hiascend.com, e.huawei.com)
- [ ] Document date is recent (or specified release date)
- [ ] Specs match across Chinese and English versions (if both available)
- [ ] PDF datasheets match web specs
- [ ] Cross-referenced with at least 2 authoritative sources
- [ ] `verified_date` field updated in JSON
- [ ] `source_url` field links to specific product page
- [ ] Remove "PLACEHOLDER" warnings from JSON after verification

---

## 🗓️ Update Schedule

**Quarterly Check (Every 3 months):**
- Visit main Ascend portal for new product announcements
- Check for updated datasheets
- Verify specs haven't changed
- Add new products if released

**Next Scheduled Review:** 2025-03-16

---

## 📞 Contact for Access

Some documents may require:
- **Huawei Account:** Register at https://www.hiascend.com
- **Enterprise Portal Access:** May need business email
- **Developer Program:** For detailed technical docs

---

## 📝 Research Log

| Date | Researcher | Action | Notes |
|------|-----------|--------|-------|
| 2025-12-16 | Person 2 | Initial source compilation | Created placeholder JSON with 4 products |
| _TBD_ | _TBD_ | Spec verification pass 1 | _Verify against official datasheets_ |
| _TBD_ | _TBD_ | Spec verification pass 2 | _Cross-reference Chinese docs_ |

---

## 🔍 Quick Access Links

**For immediate spec lookup:**

```
Ascend 910:     https://e.huawei.com/en/products/computing/ascend/ascend-910
Atlas 300I Duo: https://e.huawei.com/en/products/servers/atlas/atlas-300i-duo  
Atlas 800:      https://e.huawei.com/en/products/servers/atlas
Docs Portal:    https://www.hiascend.com/document
```

---

**Document Status:** ✅ Ready for use  
**Next Action:** Use these sources to verify placeholder specs in `huawei.json`

