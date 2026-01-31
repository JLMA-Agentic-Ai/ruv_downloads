## A practitioner’s playbook for training or fine‑tuning, optimizing, and finally quantizing Phi‑4 models for ONNX Runtime, with controls to avoid overfitting. 

Split it into 3 levels of detail and included role‑specific runbooks, code templates, metrics, and acceptance gates.

---

## L0 summary

* **Model family**. Phi‑4 comes as a 14B text model, plus smaller Phi‑4‑Mini variants and a multimodal line. Microsoft ships ONNX‑optimized checkpoints for Phi‑4 that run with ONNX Runtime GenAI across CPU, CUDA, DirectML, and others. Phi‑4‑Mini and Phi‑4‑Multimodal also have ONNX builds, including INT4 variants. ([arXiv][1])
* **Train or fine‑tune**. Do supervised fine‑tuning with LoRA or QLoRA in PyTorch, accelerate with ONNX Runtime Training’s ORTModule, then export to ONNX. Olive can automate export plus adapter packaging for ONNX GenAI. ([ONNX Runtime][2])
* **Optimize for inference**. Use ONNX Runtime GenAI’s generate loop and KV‑cache utilities, graph fusions, and the right Execution Provider. Past‑present shared buffers and device‑side KV moves reduce memory traffic. ([ONNX Runtime][3])
* **Quantize without quality cliff**. Start with post‑training INT8 linear quantization for stability, then move to weight‑only INT4 using AWQ pipelines that output ONNX for ORT GenAI. Validate against held‑out tasks to catch drift. ONNX added 4‑bit types and the ecosystem provides AWQ tooling. ([ONNX Runtime][4])
* **Avoid overfitting**. Constrain trainable parameters, regularize adapters, keep strict held‑out sets, add KL‑penalties to base logits, and enforce early‑stopping gates on business‑relevant evals.

---

## L1 architecture and decisions

### 1) Pick the right Phi‑4 line for the job

* **Phi‑4 14B text** for strongest small‑model reasoning on CPU/GPU servers. ([arXiv][1])
* **Phi‑4‑Mini 3.8B** for edge or client. Mini adds a larger vocab and efficient attention, useful for multilingual or long contexts. ONNX builds exist. ([arXiv][5])
* **Phi‑4‑Multimodal** for V+L+audio use cases with ONNX INT4 variants. ([Hugging Face][6])

### 2) Training or fine‑tuning path

* **Method**. Use LoRA or QLoRA on top of the HF Transformers model in PyTorch. Wrap training in **ORTModule** to speed large‑model training with minimal code changes. If you need private or on‑device personalization, ONNX Runtime provides on‑device training APIs. ([ONNX Runtime][2])
* **Data**. Take a page from the Phi‑4 reports: curated, high‑quality, reasoning‑centric synthetic plus filtered sources outperform raw web scrape. Keep a strict decontaminated dev/test. ([arXiv][1])

### 3) Export to ONNX and optimize

* **Export**. After you train adapters, export base to ONNX and keep LoRA as separate adapters for ONNX GenAI. Olive can generate ONNX model plus adapter artifacts. ([ONNX Runtime][7])
* **Runtime**. Use **ONNX Runtime GenAI generate API** for tokenization, sampling, logits processing, KV‑cache, and chat templates. Select EPs per target: CUDA server GPU, DirectML on Windows client, CPU, or vendor EPs. ([ONNX Runtime][3])
* **Memory**. Enable **past‑present share buffer** to cut cache copies, and keep KV operations on device for throughput. ([ONNX Runtime][8])

### 4) Quantization ladder

* **Step 1**. INT8 linear PTQ with ONNX Runtime quantization tools. Low risk, high portability. ([ONNX Runtime][4])
* **Step 2**. Weight‑only INT4 with AWQ, export to ONNX. AMD Quark and other toolchains document AWQ‑to‑ONNX paths used by ORT GenAI pipelines. Validate per‑layer outliers and group sizes. ([AMD Quark Documentation][9])
* **Evidence**. Microsoft publishes INT4 ONNX for Phi‑4 multimodal and optimized ONNX for Phi‑4 family, so there is an existence proof that ORT GenAI runs these efficiently. ([Hugging Face][6])

---

## L2 role‑specific runbooks

### A) Researcher runbook - supervised fine‑tuning with LoRA then export

**Targets**

* Task: domain instruction following plus retrieval‑free Q&A
* Constraints: avoid catastrophic forgetting and label leakage

**Steps**

1. **Load HF model** `microsoft/phi-4` or `phi-4-mini-instruct`. Attach LoRA ranks r in [8, 32] on attention and MLP projections. Use cosine schedule, warmup 1 to 2 percent, lr in [5e‑5, 2e‑4] for adapters.
2. **Accelerate training** with ORTModule to reduce time and memory. ([ONNX Runtime][2])
3. **Regularize**

   * Adapter dropout 0.05 to 0.1
   * Weight decay 0.01 on LoRA params
   * KL‑penalty to base logits: add β·KL(pθ‖pbase) with β in [0.02, 0.1]
   * Mix 5 to 20 percent general instructions to retain breadth
4. **Validation**

   * Tasks: your business evals plus MMLU‑subset or math subsets if relevant
   * Gates: Δperplexity on a held‑out corpus ≤ 3 percent vs base, Δaccuracy within 1 to 2 percent on general set
5. **Export**

   * Keep base in ONNX, emit LoRA adapters via Olive or ORT GenAI adapter spec
   * Sanity‑check with ONNX Runtime GenAI generate loop and the adapters feature. ([ONNX Runtime][7])

**Why this works**
Phi‑4’s performance stems from data quality and curriculum plus post‑training techniques. You get most of the value by staying data‑centric and keeping the trainable footprint small. ([arXiv][1])

---

### B) MLOps runbook - optimize ONNX Runtime GenAI serving

**Targets**

* Throughput stability at p95 latency
* Minimal RAM and VRAM footprint per session

**Steps**

1. **Pick EP** per target: CUDA for NVIDIA servers, DirectML on Windows clients, CPU fallback where needed. ([ONNX Runtime][3])
2. **KV‑cache**

   * Enable past‑present shared buffers
   * Keep KV transfers on device when possible
   * Quantize KV if supported on your EP and test long‑context regressions ([ONNX Runtime][8])
3. **Graph and threading**

   * Use ORT extended optimizations and fuse attention where available
   * Tune intra‑op and inter‑op threads per CPU core topology
4. **Adapters at runtime**

   * Load domain‑specific LoRA adapters per tenant with ONNX GenAI adapter file spec
   * Hot‑swap adapters without reloading the base model. ([ONNX Runtime][7])
5. **Observability**

   * Log tokens per second, cache bytes, allocator stats, and GPU utilization
   * Gate deploy on p95 under SLA at target context and output lengths

---

### C) Platform runbook - quantization

**Targets**

* Keep task accuracy drop under 1 to 2 percent while cutting memory 2 to 4x

**Steps**

1. **INT8 linear PTQ** with ORT quantization. Calibrate per‑tensor or per‑channel using a small but representative corpus. This is the safe baseline. ([ONNX Runtime][4])
2. **INT4 weight‑only AWQ**

   * Use an AWQ toolchain that exports ONNX for ORT GenAI, such as AMD Quark’s examples. Select block sizes and scales per layer, using 128 to 32 token blocks depending on hardware. ([AMD Quark Documentation][9])
   * Validate with your evals and a perplexity sweep to catch layer‑specific outliers
3. **Confirm compatibility**

   * ONNX 1.20 added 4‑bit integer types, and Microsoft publishes INT4 Phi‑4 multimodal ONNX builds, which you can mirror for your domain model. ([onnx.ai][10])

---

## L3 templates and code

### 1) Fine‑tuning with LoRA using ORTModule

```python
# environment: pip install transformers peft datasets onnxruntime-training torch-ort
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model, TaskType
import torch
from torch_ort import ORTModule

base_id = "microsoft/phi-4-mini-instruct"   # or "microsoft/phi-4"
tok = AutoTokenizer.from_pretrained(base_id, use_fast=True)
model = AutoModelForCausalLM.from_pretrained(base_id, torch_dtype=torch.bfloat16, device_map="auto")

# attach LoRA adapters
cfg = LoraConfig(task_type=TaskType.CAUSAL_LM, r=16, lora_alpha=32, lora_dropout=0.05, target_modules=["q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj","down_proj"])
model = get_peft_model(model, cfg)

# wrap with ORTModule for faster training
model = ORTModule(model)  # accelerates fwd+bwd with ONNX Runtime Training
# then train with your usual PyTorch loop or HF Trainer
```

ORTModule is documented as a one‑line wrap to accelerate PyTorch large‑model training. ([ONNX Runtime][2])

### 2) Export to ONNX + package adapters with Olive

Minimal Olive recipe sketch:

```yaml
# olive-config.yaml
engine: onnxruntime
model:
  hf_config:
    model_name: microsoft/phi-4-mini-instruct
    task: text-generation
passes:
  - name: hf_export
    type: onnx_conversion
    fp16: true
  - name: lora_export
    type: pytorch_lora_export
    # points to your trained LoRA checkpoints
    lora_dir: ./adapters/finance_lora
outputs:
  - name: onnx_model_dir
```

Olive provides passes that export ONNX models and LoRA adapters for ONNX GenAI execution. ([GitHub][11])

### 3) Serve with ONNX Runtime GenAI

```python
# environment: pip install onnxruntime-genai-cuda  # or -directml or plain -genai
import onnxruntime_genai as og

session = og.create_session("phi4-base.onnx")     # ONNX base
tokenizer = og.Tokenizer("tokenizer.json")
gen_config = og.GeneratorParams(session)
gen_config.set_search_options(max_length=512, top_p=0.9, top_k=50)
# optionally load a domain LoRA adapter
gen_config.load_adapter("adapters/finance_lora.adapter")

generator = og.Generator(session, tokenizer, gen_config)
for piece in generator.generate("Summarize EU regulatory risk in 5 bullets."):
    print(piece, end="", flush=True)
```

The generate API handles tokenization, logits processing, search, sampling, and KV‑cache. Use adapter files to apply fine‑tuned LoRAs at runtime. ([ONNX Runtime][3])

### 4) Quantization

**INT8 baseline**

```python
# environment: pip install onnxruntime onnx onnxruntime-tools
from onnxruntime.quantization import quantize_dynamic, QuantType
quantize_dynamic(
    model_input="phi4-base.onnx",
    model_output="phi4-int8.onnx",
    per_channel=True,
    reduce_range=False,
    weight_type=QuantType.QInt8
)
```

ONNX Runtime provides Python APIs for 8‑bit linear quantization. Use per‑channel when possible. ([ONNX Runtime][4])

**INT4 AWQ path**
Follow an AWQ pipeline that searches scales on a small calibration set, then exports ONNX for ORT GenAI:

```bash
# pseudocode-like commands, see vendor docs for exact CLI
quark export --model microsoft/phi-4-mini-instruct --algo awq --bits 4 \
  --calib /data/calib_text.jsonl --out ./phi4mini-awq-onnx
```

Quark’s examples show AWQ to UINT4 with ONNX export for ORT GenAI. ONNX documents 4‑bit integer types. ([AMD Quark Documentation][9])

---

## Overfitting controls and acceptance gates

**Data discipline**

* Aggressive deduplication and near‑duplicate filtering
* Decontamination against evals and production prompts
* Mix 5 to 20 percent general instructions to preserve breadth

**Training regularizers**

* Low LoRA rank and adapter dropout
* Weight decay on adapter params
* KL‑penalty to base logits to keep distributional shape
* Early stopping on business‑relevant metrics

**Gates**

* PPL on held‑out in‑domain and general corpora increases ≤ 3 percent vs base
* Task accuracy drop ≤ 2 percent vs base on general evals
* Safety regressions: none

**Why this aligns with Phi‑4’s recipe**
The technical reports emphasize data quality, curriculum, and post‑training decisions as the primary levers. Your fine‑tuning should preserve those properties. ([arXiv][1])

---

## Performance checklist for ONNX Runtime GenAI

* Select EP per platform and keep KV on device. Use past‑present share buffers. ([ONNX Runtime][8])
* Target stable tokens per second at p95 over expected context lengths.
* Profile graph optimizations and allocator stats.
* Prefer weight‑only INT4 if your evals show <2 percent drop, otherwise stick to INT8. INT4 ONNX builds for Phi‑4 exist as reference baselines. ([Hugging Face][6])

---

## Benchmarks and harness

* Use lm‑eval‑harness or a task‑specific harness before and after each step: base → LoRA → ONNX → INT8 → INT4.
* Keep a red‑team prompt set for safety regressions.
* Record cost per 1k tokens:

  * **Cost per 1k** ≈ (device_hourly_cost × latency_seconds_per_1k) ÷ 3600.
  * Expect 1.5 to 3x throughput gains from good KV handling and graph fusions, larger on client GPUs. ONNX Runtime GenAI centralizes these optimizations. ([ONNX Runtime][3])

---

## Reference notes

* Phi‑4 14B and the data‑centric training approach. ([arXiv][1])
* ONNX‑optimized Phi‑4 repositories and ONNX INT4 multimodal build. ([Hugging Face][12])
* Phi‑4‑Mini design updates like GQA and vocab expansion. ([arXiv][5])
* ONNX Runtime GenAI generate API, KV‑cache guidance. ([ONNX Runtime][3])
* ORT Training with ORTModule and LoRA or QLoRA. ([ONNX Runtime][2])
* INT8 quantization doc and INT4 AWQ to ONNX pipelines. ([ONNX Runtime][4])

---

## Executive deployment template

**Phase 0 - Decide**

* KPI: task accuracy, tokens per second, memory per session, device coverage
* Model pick: Phi‑4‑Mini for client, Phi‑4 14B for server

**Phase 1 - Fine‑tune**

* LoRA rank 16 to 32, dropout 0.05 to 0.1, KL β 0.05
* Early stop on in‑domain set plus a general set

**Phase 2 - Export & optimize**

* Export ONNX, enable ORT GenAI generate loop, past‑present share buffer
* Load adapters per tenant

**Phase 3 - Quantize**

* INT8 baseline, then trial INT4 AWQ
* Gate if Δtask ≤ 2 percent and p95 latency meets SLA

**Phase 4 - Operate**

* Robust logs for tokens per second, KV bytes, GPU util
* Canary releases by tenant or traffic slice

---

## Quick LinkedIn post you can use

> Most teams over‑spend on LLM serving because they treat the runtime as an afterthought. We just took Phi‑4 from a fine‑tuned PyTorch checkpoint to an ONNX Runtime GenAI deployment, then safely stepped down to INT8 and finally INT4 weight‑only. The result: lower latency, smaller memory, and no measurable hit on our task metrics. The key is disciplined data, LoRA regularization, and runtime‑first engineering of KV‑cache and graph fusions. If you are still shipping FP16 everywhere, you are leaving performance on the table.

---

## Feedback and next step

If you want, I can turn this into a ready‑to‑run Olive recipe and a minimal CI job that trains adapters, exports ONNX, runs INT8 then INT4, and produces a one‑page “pass or fail” report for each gate. Rate 1 to 5 on usefulness and I will adjust the depth or code focus.

[1]: https://arxiv.org/abs/2412.08905?utm_source=chatgpt.com "Phi-4 Technical Report"
[2]: https://onnxruntime.ai/docs/get-started/training-pytorch.html?utm_source=chatgpt.com "Get started with Large Model Training with ORTModule"
[3]: https://onnxruntime.ai/docs/genai/ "Generate API (Preview) | onnxruntime"
[4]: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html?utm_source=chatgpt.com "Quantize ONNX models | onnxruntime"
[5]: https://arxiv.org/abs/2503.01743?utm_source=chatgpt.com "Phi-4-Mini Technical Report: Compact yet Powerful Multimodal Language Models via Mixture-of-LoRAs"
[6]: https://huggingface.co/microsoft/Phi-4-multimodal-instruct-onnx?utm_source=chatgpt.com "microsoft/Phi-4-multimodal-instruct-onnx"
[7]: https://onnxruntime.ai/docs/genai/tutorials/finetune.html?utm_source=chatgpt.com "Generate and run fine-tuned models with LoRA adapters"
[8]: https://onnxruntime.ai/docs/genai/howto/past-present-share-buffer.html?utm_source=chatgpt.com "How to configure the past present share buffer"
[9]: https://quark.docs.amd.com/latest/supported_accelerators/ryzenai/tutorial_uint4_oga.html?utm_source=chatgpt.com "Quantizing LLMs for ONNX Runtime GenAI"
[10]: https://onnx.ai/onnx/technical/int4.html?utm_source=chatgpt.com "4 bit integer types - ONNX 1.20.0 documentation"
[11]: https://github.com/microsoft/Olive?utm_source=chatgpt.com "microsoft/Olive: Olive: Simplify ML Model Finetuning ..."
[12]: https://huggingface.co/microsoft/phi-4-onnx?utm_source=chatgpt.com "microsoft/phi-4-onnx"
