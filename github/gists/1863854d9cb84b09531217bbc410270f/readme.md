# Gradio FastAPI Conductor -- Dashboard Creator

This repository showcases a FastAPI application seamlessly orchestrating Gradio for crafting UIs, executing dynamic code, and managing interactive sessions. Experience the power of running code snippets, generating intuitive Gradio UIs from prompts, and handling session outputs with ease.

## Introduction

Welcome to the Gradio FastAPI Conductor, a powerful toolkit designed to automate the creation of interactive dashboards using Gradio. With this integration, you can effortlessly generate sophisticated UIs by simply asking for what you need. 

### What is Gradio FastAPI Conductor?

The Gradio FastAPI Conductor is an application that merges the simplicity and flexibility of Gradio with the robustness of FastAPI. It allows users to:

- **Run Code**: Execute Python snippets or initiate Gradio sessions.
- **Generate Gradio UIs**: Create interactive Gradio interfaces from user-defined prompts.
- **Manage Sessions**: Handle and retrieve outputs from active sessions.
- **Integrate with CodeSandbox**: Share and collaborate on interactive projects through CodeSandbox URLs.


## Features

### Code Execution
- **Dynamic Code Execution**: Execute Python code snippets directly from the provided API endpoint. Whether you want to test a small piece of code or run complex logic, this feature supports on-the-fly execution.
- **Gradio Session Management**: For code involving Gradio, initiate sessions that keep the UI alive and interactive, capturing real-time user interactions and responses.

### Gradio UI Generation
- **Prompt-Based UI Creation**: Generate Gradio UIs by simply providing a prompt. The system interprets your requirements and creates a fully functional Gradio interface.
- **Component Integration**: Supports a wide range of Gradio components such as Textbox, Button, Slider, Dropdown, and more, allowing you to build rich, interactive dashboards.
- **Event Handling**: Define and handle events like clicks and changes within the Gradio UI, making your applications highly interactive and user-friendly.

### Interactive Session Management
- **Session Registry**: Manage multiple concurrent sessions with a robust session registry that tracks session IDs, outputs, and URLs.
- **Output Retrieval**: Easily retrieve and view the outputs of your executed code, including real-time updates and final results.
- **Error Handling**: Comprehensive error management ensures that any issues during code execution or session handling are gracefully managed and reported.

### CodeSandbox Integration
- **Automated Sandbox Generation**: Convert your Gradio projects into CodeSandbox URLs effortlessly, enabling you to share your interactive dashboards with a wider audience.
- **Collaborative Development**: Use CodeSandbox for real-time collaboration, allowing multiple users to view, edit, and improve the same project simultaneously.
- **Compressed and Encoded Sharing**: Efficiently compress and encode your project files for seamless integration and sharing through CodeSandbox.

### Smart Middleware
- **Automatic Documentation Redirection**: Enhance user experience by redirecting root URL requests to the interactive API documentation. This ensures users can easily explore and understand available endpoints and their usage.
- **Customizable Middleware**: Extend and customize middleware to fit your specific needs, ensuring flexibility and adaptability of the application.


### Why is it Important and Powerful?

In today's data-driven world, interactive dashboards are crucial for visualizing complex data, making informed decisions, and enhancing user engagement. However, creating such dashboards often requires significant time and expertise. Gradio FastAPI Conductor simplifies this process by:
- **Automating UI Generation**: Just provide a prompt, and the system generates a fully functional Gradio UI.
- **Streamlining Code Execution**: Run and manage Python code seamlessly, capturing and processing outputs efficiently.
- **Facilitating Collaboration**: Use CodeSandbox integration to share and refine your interactive projects with others.

### How it Works

By leveraging an automated, agentic approach, the Gradio FastAPI Conductor can create whatever you need based on your prompts. Whether it's a simple form, a complex data visualization, or an interactive machine learning model, just describe what you want, and the system takes care of the rest.

#### CodeSandbox Integration

CodeSandbox is an online editor tailored for rapid web development. With Gradio FastAPI Conductor, you can:
- **Generate CodeSandbox URLs**: Instantly create shareable and collaborative environments for your interactive dashboards.
- **Seamless Integration**: Push your Gradio projects to CodeSandbox, enabling real-time collaboration and refinement.

Harness the power of automation and collaboration with the Gradio FastAPI Conductor and transform your ideas into interactive realities with ease.



## Jupyter Integration Overview

- **Kernel Management**: Leverage Jupyter's `KernelManager` to start, manage, and communicate with Jupyter kernels for executing code snippets.
- **Output Handling**: Capture and process outputs from Jupyter kernels, including streams, display data, and execution results.
- **Session Management**: Use a session registry to handle multiple concurrent code execution sessions, storing outputs and URLs for retrieval.
- **Error Handling**: Gracefully manage errors during kernel startup, execution, and shutdown, ensuring robust session handling.

## Endpoints

### `/run_code/`
- **Method**: POST
- **Description**: Executes provided Python code. If the code contains Gradio elements, it starts a Gradio session.
- **Request Body**: 
  ```json
  {
    "code": "your_python_code_here"
  }
  ```
- **Response**:
  ```json
  {
    "output": "execution_output",
    "url": "gradio_session_url_if_applicable",
    "session_id": "unique_session_id",
    "activity_duration": "72 hours"
  }
  ```

### `/session/{session_id}`
- **Method**: GET
- **Description**: Retrieves the output and URL of a specific session.
- **Response**:
  ```json
  {
    "output": "session_output",
    "url": "gradio_session_url",
    "session_id": "unique_session_id",
    "activity_duration": "72 hours"
  }
  ```

### `/gradio_ui/`
- **Method**: POST
- **Description**: Generates and runs a Gradio UI based on provided code.
- **Request Body**: 
  ```json
  {
    "code": "your_gradio_code_here"
  }
  ```
- **Response**:
  ```json
  {
    "output": "execution_output",
    "url": "gradio_session_url",
    "session_id": "unique_session_id",
    "activity_duration": "72 hours"
  }
  ```

### `/generate_ui/`
- **Method**: POST
- **Description**: Generates Gradio UI code based on a provided prompt.
- **Request Body**:
  ```json
  {
    "prompt": "your_prompt_here"
  }
  ```
- **Response**:
  ```json
  {
    "openai_response": "raw_response_from_openai",
    "gradio_ui_response": "response_from_gradio_ui_endpoint",
    "generated_code": "generated_gradio_code",
    "posted_data": "data_posted_to_gradio_ui_endpoint"
  }
  ```

### `/generate_sandbox/`
- **Method**: POST
- **Description**: Generates CodeSandbox URL based on a provided prompt.
- **Request Body**:
  ```json
  {
    "prompt": "your_prompt_here"
  }
  ```
- **Response**:
  ```json
  {
    "generated_code_files": "generated_code_files",
    "sandbox_url": "codesandbox_url"
  }
  ```

### `/specification/`
- **Method**: POST
- **Description**: Generates a detailed specification for a Gradio application based on a user prompt.
- **Request Body**:
  ```json
  {
    "prompt": "your_prompt_here"
  }
  ```
- **Response**:
  ```json
  {
    "prompt": "generated_detailed_prompt"
  }
  ```

## Environment Variables and Secrets

This application requires certain environment variables and secrets to function correctly. Create a `.env` file in the root directory and add the following variables:

```dotenv
# .env file
OPENAI_API_KEY=your_openai_api_key
OTHER_SECRET_KEY=your_other_secret_key
```

Ensure that you do not commit the `.env` file to version control.
 
1. **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2. **Set Environment Variables**:
    Create a `.env` file in the root directory and add the necessary environment variables as described above.

3. **Run the Application**:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000
    ```

## Usage

- Access the API documentation at `http://localhost:8000/docs`.
- Use the provided endpoints to execute code, generate UIs, manage sessions, and more.

## Logging

The application uses a logger to log important information and errors. Logs are output to the console.

## License

This project is licensed under the MIT License.
 