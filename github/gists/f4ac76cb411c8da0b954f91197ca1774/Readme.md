# Deploying LLaMA 3 70B with AirLLM and Gradio on Hugging Face Spaces

This tutorial guides you through the process of deploying a Gradio app with the LLaMA 3 70B language model using AirLLM on Hugging Face Spaces. The app provides a user-friendly interface for generating text based on user prompts.

## Overview

- **LLaMA 3 70B**: A large language model developed by Meta AI with 70 billion parameters, capable of generating coherent and contextually relevant text.
- **AirLLM**: A Python library that enables running large language models like LLaMA on consumer hardware with limited GPU memory by using layer-by-layer inferencing.
- **Gradio**: A Python library for quickly creating web interfaces for machine learning models, allowing users to interact with the models through a user-friendly UI.
- **Hugging Face Spaces**: A platform for hosting and sharing machine learning demos, allowing easy deployment and access to Gradio apps.

## Prerequisites

- A Hugging Face account (sign up at https://huggingface.co/)
- Basic knowledge of Python and Docker

## Step 1: Create the Dockerfile

Create a file named `Dockerfile` with the following contents:

```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

This Dockerfile sets up a Python 3.9 environment, installs the dependencies listed in `requirements.txt`, copies the application files, and runs `app.py` on container startup.

## Step 2: Create the requirements.txt file

Create a file named `requirements.txt` with the following contents:

```
gradio
torch
transformers
airllm
```

This file lists the necessary Python packages required for the app.

## Step 3: Create the app.py file

Create a file named `app.py` with the following contents:

```python
import gradio as gr
from airllm import HuggingFaceModelLoader, AutoModelForCausalLM

model_loader = HuggingFaceModelLoader("meta-llama/Meta-Llama-3-70B-Instruct")
model = AutoModelForCausalLM.from_pretrained(model_loader)

def generate_text(input_text):
    input_ids = model.tokenizer.encode(input_text, return_tensors="pt")
    output = model.generate(input_ids, max_length=100)
    return model.tokenizer.decode(output[0])

iface = gr.Interface(
    fn=generate_text, 
    inputs=gr.Textbox(placeholder="Enter prompt..."),
    outputs="text",
    title="LLaMA 3 70B Text Generation"
)

iface.launch(server_name="0.0.0.0", server_port=7860)
```

This code does the following:
1. Imports the necessary libraries: Gradio and AirLLM.
2. Loads the LLaMA 3 70B model using AirLLM's `HuggingFaceModelLoader` and `AutoModelForCausalLM`.
3. Defines a `generate_text` function that takes an input prompt, encodes it using the model's tokenizer, generates text using the model, and decodes the generated output.
4. Creates a Gradio interface with a text input box and a text output, using the `generate_text` function as the backend.
5. Launches the Gradio app server on port 7860.

## Step 4: Deploy to Hugging Face Spaces

1. Go to https://huggingface.co/spaces and click on "New Space".
2. Choose a name for your Space and select "Spaces with Docker" as the Space type.
3. Select the repository where you want to create the Space.
4. In the Space settings, enable "Secrets" and add your Hugging Face API token as a secret named `HF_API_TOKEN`. This allows the app to download the model weights.
5. Specify the hardware requirements in the Space settings, e.g., a GPU with at least 16GB VRAM.
6. Push the `Dockerfile`, `requirements.txt`, and `app.py` files to your Space repository.

Hugging Face Spaces will automatically build the Docker container and start the Gradio app. Once the build is complete, you will see a public URL where you can access the app.

## Troubleshooting

- If the app fails to start, check the logs in the Hugging Face Space to identify any error messages.
- Ensure that your Hugging Face API token is correctly set as a secret in the Space settings.
- Verify that the Space has sufficient hardware resources (e.g., GPU with enough memory) to run the LLaMA 3 70B model.
- Double-check that the `requirements.txt` file includes all the necessary dependencies.
- Make sure that the paths and filenames in your code match the actual file structure in your Space repository.

## Conclusion

By following this tutorial, you should now have a Gradio app deployed on Hugging Face Spaces, allowing users to interact with the LLaMA 3 70B language model through a user-friendly interface. The combination of AirLLM, Gradio, and Hugging Face Spaces makes it easy to deploy large language models and create accessible demos without requiring extensive setup or resources from the users.

Feel free to experiment with different prompts and explore the capabilities of the LLaMA 3 70B model. Happy generating!