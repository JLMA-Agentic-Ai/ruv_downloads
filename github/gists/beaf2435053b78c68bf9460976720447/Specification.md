# Agent Algorithm Repository Metadata Specification

## Overview
This specification outlines the metadata schema for describing algorithms in the Agent Algorithm Repository. The schema is designed to be comprehensive and flexible, allowing for detailed descriptions and the inclusion of arbitrary extra fields.

## Schema Definition

### Algorithm Model

```python
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, HttpUrl

class InputOutput(BaseModel):
    name: str = Field(..., description="The name of the input/output.")
    type: str = Field(..., description="The data type of the input/output.")
    description: Optional[str] = Field(None, description="A brief description of the input/output.")

class Example(BaseModel):
    description: str = Field(..., description="A description of the example.")
    code: str = Field(..., description="Example code demonstrating the algorithm usage.")

class Agent(BaseModel):
    agent_name: str = Field(..., description="The name of the agent.")
    role: str = Field(..., description="The role of the agent in the multi-agent system.")
    dependencies: Optional[Dict[str, str]] = Field(None, description="Dependencies required by the agent.")
    inputs: Optional[List[InputOutput]] = Field(None, description="List of inputs required by the agent.")
    outputs: Optional[List[InputOutput]] = Field(None, description="List of outputs produced by the agent.")
    examples: Optional[List[Example]] = Field(None, description="List of usage examples for the agent.")
    llm_choice: Optional[str] = Field(None, description="Chosen LLM for the agent.")
    prompt: Optional[str] = Field(None, description="Agent prompt.")
    learning_rate: Optional[float] = Field(None, description="Learning rate for the agent.")
    exploration_rate: Optional[float] = Field(None, description="Exploration rate for the agent.")
    training_iterations: Optional[int] = Field(None, description="Number of training iterations.")
    batch_size: Optional[int] = Field(None, description="Batch size for training.")
    max_tokens: Optional[int] = Field(None, description="Max tokens for agent's response.")
    temperature: Optional[float] = Field(None, description="Temperature setting for agent's response.")
    top_p: Optional[float] = Field(None, description="Top P setting for agent's response.")
    frequency_penalty: Optional[float] = Field(None, description="Frequency penalty setting.")
    presence_penalty: Optional[float] = Field(None, description="Presence penalty setting.")
    stop_sequences: Optional[str] = Field(None, description="Stop sequences for the agent.")

class Resources(BaseModel):
    documentation_url: Optional[HttpUrl] = Field(None, description="URL to the documentation.")
    source_code_url: Optional[HttpUrl] = Field(None, description="URL to the source code repository.")

class Build(BaseModel):
    base_image: Optional[str] = Field(None, description="Base image to use for the Docker container.")
    context: Optional[str] = Field(None, description="The build context directory.")
    steps: Optional[List[str]] = Field(None, description="Steps to build the Docker container.")

class Algorithm(BaseModel):
    name: str = Field(..., description="The name of the algorithm.")
    version: str = Field(..., description="The version of the algorithm.")
    description: str = Field(..., description="A brief description of the algorithm.")
    authors: List[str] = Field(..., description="List of authors.")
    license: str = Field(..., description="The license under which the algorithm is distributed.")
    language: str = Field(..., description="The programming language in which the algorithm is implemented.")
    dependencies: Dict[str, str] = Field(..., description="A list of dependencies required to run the algorithm.")
    inputs: List[InputOutput] = Field(..., description="List of inputs required by the algorithm.")
    outputs: List[InputOutput] = Field(..., description="List of outputs produced by the algorithm.")
    examples: Optional[List[Example]] = Field(None, description="List of usage examples for the algorithm.")
    complexity: Optional[str] = Field(None, description="The complexity level of the algorithm (e.g., basic, intermediate, advanced).")
    multi_agent_systems: Optional[List[Agent]] = Field(None, description="List of agents in the multi-agent system.")
    tags: Optional[List[str]] = Field(None, description="Tags associated with the algorithm for easier discovery.")
    resources: Optional[Resources] = Field(None, description="Additional resources related to the algorithm.")
    build: Optional[Build] = Field(None, description="Build specification for the algorithm, similar to a Dockerfile.")
    extra_fields: Optional[Dict[str, Any]] = Field(None, description="Additional arbitrary fields for the algorithm.")

    class Config:
        extra = "allow"  # Allow extra fields
```

### Key Components

#### InputOutput
- **name**: `str` - The name of the input/output.
- **type**: `str` - The data type of the input/output.
- **description**: `Optional[str]` - A brief description of the input/output.

#### Example
- **description**: `str` - A description of the example.
- **code**: `str` - Example code demonstrating the algorithm usage.

#### Agent
- **agent_name**: `str` - The name of the agent.
- **role**: `str` - The role of the agent in the multi-agent system.
- **dependencies**: `Optional[Dict[str, str]]` - Dependencies required by the agent.
- **inputs**: `Optional[List[InputOutput]]` - List of inputs required by the agent.
- **outputs**: `Optional[List[InputOutput]]` - List of outputs produced by the agent.
- **examples**: `Optional[List[Example]]` - List of usage examples for the agent.
- **llm_choice**: `Optional[str]` - Chosen LLM for the agent.
- **prompt**: `Optional[str]` - Agent prompt.
- **learning_rate**: `Optional[float]` - Learning rate for the agent.
- **exploration_rate**: `Optional[float]` - Exploration rate for the agent.
- **training_iterations**: `Optional[int]` - Number of training iterations.
- **batch_size**: `Optional[int]` - Batch size for training.
- **max_tokens**: `Optional[int]` - Max tokens for agent's response.
- **temperature**: `Optional[float]` - Temperature setting for agent's response.
- **top_p**: `Optional[float]` - Top P setting for agent's response.
- **frequency_penalty**: `Optional[float]` - Frequency penalty setting.
- **presence_penalty**: `Optional[float]` - Presence penalty setting.
- **stop_sequences**: `Optional[str]` - Stop sequences for the agent.

#### Resources
- **documentation_url**: `Optional[HttpUrl]` - URL to the documentation.
- **source_code_url**: `Optional[HttpUrl]` - URL to the source code repository.

#### Build
- **base_image**: `Optional[str]` - Base image to use for the Docker container.
- **context**: `Optional[str]` - The build context directory.
- **steps**: `Optional[List[str]]` - Steps to build the Docker container.

#### Algorithm
- **name**: `str` - The name of the algorithm.
- **version**: `str` - The version of the algorithm.
- **description**: `str` - A brief description of the algorithm.
- **authors**: `List[str]` - List of authors.
- **license**: `str` - The license under which the algorithm is distributed.
- **language**: `str` - The programming language in which the algorithm is implemented.
- **dependencies**: `Dict[str, str]` - A list of dependencies required to run the algorithm.
- **inputs**: `List[InputOutput]` - List of inputs required by the algorithm.
- **outputs**: `List[InputOutput]` - List of outputs produced by the algorithm.
- **examples**: `Optional[List[Example]]` - List of usage examples for the algorithm.
- **complexity**: `Optional[str]` - The complexity level of the algorithm (e.g., basic, intermediate, advanced).
- **multi_agent_systems**: `Optional[List[Agent]]` - List of agents in the multi-agent system.
- **tags**: `Optional[List[str]]` - Tags associated with the algorithm for easier discovery.
- **resources**: `Optional[Resources]` - Additional resources related to the algorithm.
- **build**: `Optional[Build]` - Build specification for the algorithm, similar to a Dockerfile.
- **extra_fields**: `Optional[Dict[str, Any]]` - Additional arbitrary fields for the algorithm.
