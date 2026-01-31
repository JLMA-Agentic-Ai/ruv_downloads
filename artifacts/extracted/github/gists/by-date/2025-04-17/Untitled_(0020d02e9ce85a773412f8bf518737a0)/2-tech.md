Below is a complete, technical implementation of the tutorial. The repository is structured as follows:

```
deepseek-medical-ai/
├── pyproject.toml
├── README.md
├── fine_tune.py
├── rl_finetune.py
├── pipeline.py
├── deploy.py
└── Dockerfile
```

Each file is detailed below.

---

## 1. `pyproject.toml`

This file uses Poetry to manage dependencies. Adjust package versions as needed.

```toml
[tool.poetry]
name = "deepseek-medical-ai"
version = "0.1.0"
description = "Fine-tuning DeepSeek R1 for medical applications with DSPy integration and RL reinforcement"
authors = ["Your Name <your.email@example.com>"]
license = "MIT"
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.10"
torch = "^1.13.0"  # adjust to your CUDA version if needed
transformers = "^4.30.0"
datasets = "^2.9.0"
accelerate = "^0.20.3"
unsloth = "^0.1.0"  # ensure this version is available
trl = "^0.4.0"
dspy = "^0.3.0"     # adjust version per DSPy releases
fastapi = "^0.95.0"
uvicorn = "^0.22.0"
pydantic = "^1.10.5"

[tool.poetry.dev-dependencies]
pytest = "^7.2.0"
black = "^23.1.0"
isort = "^5.10.1"
```

---

## 2. `README.md`

A short guide to get started.

```markdown
# DeepSeek Medical AI with DSPy Pipeline

This repository provides a complete technical implementation for:

- **Fine-tuning DeepSeek R1** on a specialized medical dataset using LoRA (with Unsloth).
- Building a **DSPy pipeline** for medical diagnosis (chain-of-thought reasoning).
- Integrating **reinforcement learning** (using PPO via the TRL library) to refine responses.
- Deploying the solution with a **FastAPI** web server, containerized via Docker.

## Setup

1. **Install Poetry** (if not already installed):

   ```bash
   pip install poetry
   ```

2. **Install dependencies:**

   ```bash
   poetry install
   ```

3. **Set your Hugging Face API token** (if required by your model):

   ```bash
   export HF_API_TOKEN=your_hf_api_token_here
   ```

## Scripts

- **Fine-tuning:**  
  ```bash
  poetry run python fine_tune.py
  ```
  
- **Reinforcement Learning (PPO step):**  
  ```bash
  poetry run python rl_finetune.py
  ```

- **DSPy Pipeline demo:**  
  ```bash
  poetry run python pipeline.py
  ```

- **Deployment (FastAPI server):**  
  ```bash
  poetry run python deploy.py
  ```

## Docker Deployment

1. **Build the Docker image:**

   ```bash
   docker build -t deepseek-medical-ai .
   ```

2. **Run the Docker container:**

   ```bash
   docker run --gpus all -p 8000:8000 deepseek-medical-ai
   ```

Access the API at [http://localhost:8000/diagnose](http://localhost:8000/diagnose).

## License

MIT License.
```

---

## 3. `fine_tune.py`

A script to fine-tune DeepSeek R1 using LoRA with Unsloth and TRL’s SFTTrainer.  
*(Adjust dataset field names and slicing as needed.)*

```python
#!/usr/bin/env python
import os
import torch
from datasets import load_dataset
from unsloth import FastLanguageModel
from transformers import TrainingArguments
from trl import SFTTrainer

# --- Configuration ---
MODEL_NAME = "deepseek-ai/DeepSeek-R1-Distill-Llama-8B"
MAX_SEQ_LENGTH = 2048
# Use environment variable for your Hugging Face API token
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "your_hf_api_token_here")


def format_example(example):
    """
    Format an example from the dataset into a text prompt.
    Adjust the keys if your dataset fields differ.
    """
    instruction = "Provide a medical diagnosis with reasoning."
    # Assuming the dataset has the keys: 'case_description', 'chain_of_thought', 'answer'
    formatted_text = (
        f"Instruction: {instruction}\n"
        f"Input: {example.get('case_description', 'N/A')}\n"
        f"Thought: {example.get('chain_of_thought', '')}\n"
        f"Diagnosis: {example.get('answer', '')}\n"
    )
    return {"text": formatted_text}


def main():
    # --- Dataset Preparation ---
    # For demonstration, we load a subset of the dataset.
    # Replace the dataset identifier with your specialized medical dataset if needed.
    dataset = load_dataset("FreedomIntelligence/medical-o1-reasoning-SFT", "en", split="train[:100]")
    dataset = dataset.map(format_example, batched=False)

    # --- Model Loading ---
    # Load the base model and tokenizer with 4-bit quantization
    model, tokenizer = FastLanguageModel.from_pretrained(
        MODEL_NAME,
        max_seq_length=MAX_SEQ_LENGTH,
        load_in_4bit=True,
        token=HF_API_TOKEN
    )

    # --- LoRA Integration ---
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    lora_rank = 16
    model = FastLanguageModel.get_peft_model(
        model,
        r=lora_rank,
        target_modules=target_modules,
        lora_alpha=16,
        lora_dropout=0.0,
        bias="none",
        use_gradient_checkpointing="unsloth"
    )

    # --- Training Setup ---
    training_args = TrainingArguments(
        output_dir="outputs",
        max_steps=100,  # Increase as needed for full training
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        learning_rate=2e-5,
        warmup_steps=5,
        logging_steps=10,
        fp16=True,
        weight_decay=0.01,
        report_to=["none"],
    )

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=MAX_SEQ_LENGTH,
        args=training_args
    )

    # --- Fine-Tuning ---
    trainer.train()

    # Save the learned LoRA adapter weights for later inference or further training.
    model.save_pretrained("outputs/lora_weights")


if __name__ == "__main__":
    main()
```

---

## 4. `rl_finetune.py`

This script demonstrates an example reinforcement learning (PPO) update using the TRL library.  
*(For a production RL loop, you would iterate over a dataset and accumulate gradients over many steps.)*

```python
#!/usr/bin/env python
import os
import torch
from transformers import AutoTokenizer
from trl import PPOTrainer, PPOConfig
from unsloth import FastLanguageModel

# --- Configuration ---
MODEL_NAME = "deepseek-ai/DeepSeek-R1-Distill-Llama-8B"
MAX_SEQ_LENGTH = 2048
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "your_hf_api_token_here")


def get_reward(prompt: str, response: str) -> float:
    """
    A sample reward function.
    For demonstration, reward 1.0 if the output contains 'Diagnosis:'.
    In a real scenario, compare the response against ground truth or use expert feedback.
    """
    return 1.0 if "Diagnosis:" in response else 0.0


def main():
    # --- Load Model & Tokenizer ---
    model, tokenizer = FastLanguageModel.from_pretrained(
        MODEL_NAME,
        max_seq_length=MAX_SEQ_LENGTH,
        load_in_4bit=True,
        token=HF_API_TOKEN
    )
    
    # Optionally, load previously saved LoRA adapter weights:
    # model.load_state_dict(torch.load("outputs/lora_weights/pytorch_model.bin"), strict=False)
    
    # --- PPO Configuration ---
    ppo_config = PPOConfig(
        batch_size=1,
        forward_batch_size=1,
        learning_rate=1e-5,
        log_with=None,
    )
    
    ppo_trainer = PPOTrainer(config=ppo_config, model=model, ref_model=model, tokenizer=tokenizer)
    
    # --- Example RL Step ---
    prompt = "Patient: 45-year-old male with chest pain radiating to the left arm. Provide diagnosis and reasoning."
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to(model.device)
    
    # Generate a response from the model
    response_ids = model.generate(input_ids, max_length=MAX_SEQ_LENGTH)
    response_text = tokenizer.decode(response_ids[0], skip_special_tokens=True)
    
    # Compute reward based on the response
    reward = get_reward(prompt, response_text)
    
    # Apply PPO update (expects lists of prompts, responses, and rewards)
    ppo_trainer.step([prompt], [response_text], [reward])
    
    print("RL PPO step completed. Reward:", reward)


if __name__ == "__main__":
    main()
```

---

## 5. `pipeline.py`

A demonstration of a DSPy pipeline that uses modular components for medical diagnosis.  
*(Note: The DSPy API may change; adjust the code according to the version you are using.)*

```python
#!/usr/bin/env python
import dsp

def build_pipeline():
    # Define a module to summarize or pre-process patient information.
    summarize = dsp.Predict("raw_text -> summary")
    # Define a module that uses chain-of-thought prompting for diagnosis.
    diagnose = dsp.ChainOfThought("summary -> reasoning, diagnosis")
    
    def diagnose_patient(case_text: str):
        summary_out = summarize(raw_text=case_text)
        diagnosis_out = diagnose(summary=summary_out.summary)
        return diagnosis_out
    
    return diagnose_patient

def main():
    pipeline = build_pipeline()
    # Example patient case
    case = "45-year-old male with sudden chest pain radiating to left arm, shortness of breath, and sweating."
    result = pipeline(case)
    
    print("Chain-of-Thought Reasoning:")
    print(result.reasoning)
    print("Diagnosis:")
    print(result.diagnosis)

if __name__ == "__main__":
    main()
```

---

## 6. `deploy.py`

A FastAPI application that exposes the DSPy pipeline as a web service.

```python
#!/usr/bin/env python
from fastapi import FastAPI
from pydantic import BaseModel
import dsp

app = FastAPI()

# Define DSPy modules
summarize = dsp.Predict("raw_text -> summary")
diagnose = dsp.ChainOfThought("summary -> reasoning, diagnosis")

def diagnose_patient(case_text: str):
    summary_out = summarize(raw_text=case_text)
    diagnosis_out = diagnose(summary=summary_out.summary)
    return diagnosis_out

# Request model for FastAPI
class CaseRequest(BaseModel):
    description: str

@app.post("/diagnose")
def diagnose_case(request: CaseRequest):
    result = diagnose_patient(request.description)
    return {
        "reasoning": result.reasoning,
        "diagnosis": result.diagnosis
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 7. `Dockerfile`

This Dockerfile builds a container for deployment using Poetry to install dependencies.  
*(If you need GPU support, use a CUDA-based image and ensure your runtime has the appropriate drivers.)*

```dockerfile
# Use an official Python image with slim variant
FROM python:3.10-slim

# Install system dependencies (e.g., build tools)
RUN apt-get update && apt-get install -y build-essential curl

# Install Poetry
RUN pip install poetry

# Set the working directory
WORKDIR /app

# Copy Poetry configuration files
COPY pyproject.toml poetry.lock* /app/

# Configure Poetry to not use a virtual environment inside the container and install dependencies
RUN poetry config virtualenvs.create false && poetry install --no-dev --no-interaction --no-ansi

# Copy the rest of the application code
COPY . /app

# Expose port 8000 for the FastAPI app
EXPOSE 8000

# Command to run the FastAPI app using Uvicorn
CMD ["uvicorn", "deploy:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Final Notes

- **Environment Variables:**  
  Set your Hugging Face API token in your environment (e.g., `export HF_API_TOKEN=your_hf_api_token_here`) so that the scripts can download the model.

- **Adjustments:**  
  Depending on the actual dataset and DSPy version, you may need to adjust field names, module signatures, or training parameters.

- **Testing & Monitoring:**  
  Run each script individually (using Poetry, e.g., `poetry run python fine_tune.py`) and verify the outputs. Once satisfied, deploy the web service locally or via Docker/Kubernetes for production.

This implementation provides a solid foundation to fine-tune DeepSeek R1 for medical applications, integrate DSPy for structured reasoning, and extend the system using reinforcement learning methods. Enjoy building your medical AI solution!