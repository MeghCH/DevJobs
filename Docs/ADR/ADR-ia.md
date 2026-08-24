
# Architecture Decision Record (ADR): AI Model Selection & Feature Scope

## Status

Accepted

## Context

Per the project specifications, the platform must integrate at least one lightweight AI feature that solves a concrete task. The system is subject to strict operational constraints: the chosen model must be hosted locally, occupy **less than 500 MB on disk**, execute its task in **under 5 seconds per job offer**, and require no fine-tuning or training at container startup.

Initially, the team experimented with **SmollLM2:135M** as a baseline model. However, during early testing, its generation quality and understanding of complex job descriptions proved insufficient for production-grade results. We needed a model that delivers significantly higher performance while strictly adhering to the project's hard hardware and time boundaries.

## Decision

We choose to deploy **Qwen2.5-0.5B-Instruct-Q5_0.GGUF** as our local core LLM engine.

Regarding the feature scope, although we successfully developed and tested two distinct capabilities—**Automated Job Summarization** and a **Stack/Keyword Extraction Tool**—we made the definitive product decision to **restrict the final user interface scope exclusively to the Job Summarization feature** to maintain a clean, high-value, and reliable user experience.

---

## Why (Rationale)

### 1. Model Selection (Qwen2.5-0.5B vs SmollLM2)

* **Performance & Reasoning:** The **Qwen2.5-0.5B-Instruct** architecture offers a massive leap in semantic comprehension and instruction-following accuracy compared to **SmollLM2:135M**. It minimizes text hallucinations and structures its outputs reliably.
* **Strict Constraint Compliance:** Quantized to **Q5_0 (5-bit integer quantization)**, the total model size on disk drops to approximately **~450 MB**. This safely fits below the mandatory **500 MB limit**.


* 
**Execution Latency:** In our containerized local environment, Qwen2.5-0.5B-Q5_0 processes an average job offer and generates its response in **approximately 2 seconds**, easily satisfying the **under 5 seconds** constraint.



### 2. Feature Selection (Why Only Summarization?)

* **Feature Evolution:** We originally designed a dual-feature pipeline:
1. 
*Summarization:* Condensing long, verbose job text into quick, actionable insights.


2. 
*Stack Analysis:* Parsing technical keywords to list the primary tools/frameworks required for an offer.




* **Product Focus:** During validation, we observed that Qwen2.5's summarization naturally captured the essential context of an offer. Retaining the dedicated stack analysis widget added visual clutter and redundant database processing. Keeping only the summarization delivers a fast, precise, and streamlined value proposition for the applicant.



---

## How (Implementation)

* 
**Runtime:** The model is executed inside the backend container using an inference engine optimized for CPU (such as `llama.cpp` node bindings or `ONNX Runtime`), ensuring it runs independently without requiring an external GPU or a cloud-hosted API.


* 
**Inference Lifecycle:** When a job offer is successfully ingested via the manual trigger or accessed by a user, the raw description is passed to an asynchronous execution worker.


* **Prompt Engineering:** The backend passes a strict system prompt to the model:
```text
 f"You are an expert tech recruiter. Your task is to summarize job offers technically and concisely.\n"
    f"CRITICAL RULES:\n"
    f"1. You MUST respond in FRENCH.\n"
    f"2. Extract the core role, the technical stack (languages/frameworks), and the company's sector.\n"
    f"3. If the company's business sector is not mentioned, omit it completely.\n"
    f"4. If the remote policy is 'hybrid' or 'remote', you MUST use the exact word 'TÉLÉTRAVAIL'.\n"
    f"5. STRICT FORMAT: Développeur [Rôle] ([Stack]) pour [Mission].\n"
    f"6. LENGTH CONSTRAINT: Maximum 25 words. No fluff, no introductory text, get straight to the point.<|im_end|>\n"
    f"<|im_start|>user\n"
    f"Summarize this job offer technically and accurately: {desc}<|im_end|>\n"
    f"<|im_start|>assistant\n""

```


* 
**UI Integration:** The resulting 2-second summary is saved directly into the relational database and seamlessly rendered on the responsive **Offer Details Page** without requiring extra navigation from the candidate.



---

## Trade-offs

### Pros

* 
**High Efficiency:** At ~450 MB and a ~2-second response time, we achieve a highly optimized performance-to-size ratio that fully respects Epitech's strict criteria.


* 
**No External Costs:** Being fully hosted locally within our Docker Compose stack, the feature incurs zero API call expenses, functions entirely offline, and guarantees complete user data privacy.


* 
**Product Quality over Quantity:** Trimming the stack analysis feature ensures our engineering efforts are entirely focused on guaranteeing the absolute stability, formatting, and responsiveness of the job summary layout.



### Cons & Limitations

* **Quantization Trade-offs:** Utilizing a 5-bit quantized version (Q5_0) means the model loses a small fraction of linguistic nuance compared to its full 16-bit unquantized counterpart. However, for short text summarization, this degradation is practically imperceptible.
* 
**Context Window Boundaries:** Being a 0.5B parameter model, processing exceptionally long corporate documents could result in minor details being overlooked compared to a heavy cloud model (e.g., GPT-4), which is explicitly forbidden by the project rules.



---

## Rejected Alternatives

### 1. SmollLM2:135M (Rejected)

* **Why Rejected:** While its disk footprint was remarkably low (~145 MB) and generation speeds were fast, its factual accuracy was severely limited. It consistently failed to generate coherent 3-bullet-point structures and mixed up technical languages during prompt execution.

### 2. Dedicated Technical Stack Analysis Tool (Rejected Feature)

* **Why Rejected:** Keeping both features active slowed down bulk ingestion pipelines and increased token consumption limits during continuous processing. Since the summary already provides a holistic overview of the required skill set, maintaining a separate keyword parser offered low marginal utility for the final candidate interface.



---

## Linked Evidence

* **Model File Path:** Checked into the backend asset pipeline workspace at `/AI-service/models/qwen2.5-0.5b-instruct-q5_0.gguf`.

* **Latency Benchmarks (Terminal Testing)** : Verified via manual terminal execution tests using curl commands hitting the backend inference endpoint locally. The terminal output consistently recorded stable HTTP response and generation times ranging between 1.8s and 2.1s, successfully tracking inside the local execution shell history.
