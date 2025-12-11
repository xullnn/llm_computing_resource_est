---
name: Model Presets
description: Data layer with flagship LLM configurations
file: js/models.js
load_when: Adding new models, updating parameters, debugging preset behavior
go_deeper:
  - interface.md: MODEL_PRESETS schema details
last_updated: 2025-12-10
---

# Model Presets Module

## What
Array of 16 flagship open-source LLM configurations with architecture parameters 
sourced from Hugging Face `config.json` files.

## Models Included
- **Qwen** (5 models): 8B, 14B, 32B, 80B-A3B (MoE), 235B-A22B-FP8 (MoE)
- **DeepSeek** (3 models): V2-Chat (MoE), V3 (MoE), R1 (MoE)
- **Meta** (2 models): Llama 3.1 8B, 70B
- **Mistral** (2 models): Mixtral 8x7B, 8x22B (MoE)
- **Google** (2 models): Gemma 2 9B, 27B
- **Databricks** (1 model): DBRX (MoE)
- **01.AI** (1 model): Yi-1.5 34B

## Structure
Each preset contains:
- **Identity**: `id`, `provider`, `name`, `repo`, `hfUrl`
- **Parameters**: `paramsB` (total), `activeParamsB` (MoE active)
- **Architecture**: `hiddenSize`, `layers`, `heads` (Q heads)
- **Precision**: `weightPrecision`, `kvPrecision`

## Usage Pattern
1. UI populates dropdown from `MODEL_PRESETS`
2. User selects preset → fields auto-fill
3. User can override any value (presets are starting points)
4. Calculator uses active values (not preset itself)

## Key Insights
- **MoE models**: `paramsB` >> `activeParamsB` (e.g., DeepSeek-V3: 671B total, 37B active)
- **Dense models**: `paramsB` == `activeParamsB`
- **Precision**: Most use BF16; FP8 used for largest models (Qwen3-235B-FP8)
- **Hidden size**: Varies widely (2048–8192); not strictly correlated with params

## When to Update
- New flagship model releases (Llama 4, GPT variants if open-sourced)
- Architecture parameter corrections (verify against HF config)
- Precision format additions (e.g., FP6, INT2)

## 📚 Go Deeper
- **Schema details**: See `interface.md`
- **How presets are used**: See `../../integration/data-flow.md`

