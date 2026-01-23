# LLMscript System

## Introduction

LLMscript is a new pseudo-programming system designed to revolutionize how we interact with AI-centric software development. It focuses on natural language and pseudo-code to make programming more intuitive for a wide range of users. It's particularly aimed at program engineers and enthusiasts in the "prompt programming" field, emphasizing task-oriented and outcome-focused programming over traditional coding syntax.

## Use Cases and Integration Opportunities:

- **Automated Workflow Creation:** LLMscript can automate complex workflows using simple, natural language instructions, making it easier for users to define processes without deep technical know-how.

- **Data Analysis and Reporting:** It enables prompt engineers to construct sophisticated data analysis and reporting tools through high-level commands, catering to the needs of businesses for in-context and actionable insights.

- **Custom Application Development:** Developers can use LLMscript to build custom applications tailored to specific needs, leveraging natural language prompts to define functionality and behavior.

- **Integration with LLM-centric Prompt Approaches:** LLMscript offers seamless integration opportunities with various LLM-centric prompt approaches, facilitating more advanced programmatic access and in-context learning systems. This integration is pivotal for developing applications that require nuanced understanding and manipulation of data, enabling systems to learn and adapt from the prompts and interactions.

- **Addressing Larger Context Windows:** The advent of larger context windows in LLMs has fundamentally altered how we approach working with intelligence and data analysis. LLMscript is at the forefront of this change, providing a framework that leverages these expanded contexts to create more sophisticated and intuitive programming constructs. This capability is instrumental in harnessing the full potential of LLMs for a range of applications, from AI-driven content creation to complex decision-making systems.

## The First Programming Language for Prompt Engineers:

LLMscript is built specifically for prompt engineers. This focus highlights its unique position in the software development landscape, offering tools and functionalities tailored to the needs of those working at the intersection of natural language processing and application development. It opens up new avenues for prompt engineers to contribute more significantly to software projects, even without traditional programming skills.

LLMscript is not just a tool but a paradigm shift in software development, designed to bridge the gap between human intuition and machine execution. It offers a unique platform for prompt engineers and developers to explore new possibilities in programming, leveraging the advancements in LLM and AI technologies to create more accessible, efficient, and intelligent systems.

## Syntax
```toml
title = "Simple Test Script for LLMscript using aiTWS"
description = "This script demonstrates basic Python library function executions and simple operations within an aiTWS framework."

# Define workflow stages and actions

[[workflow_stages]]
name = "Get Current Working Directory"
[[workflow_stages.actions]]
name = "Retrieve CWD"
type = "python_lib"
module = "os"
function = "getcwd"
args = []
description = "Retrieve the current working directory."

[[workflow_stages]]
name = "Calculate Square Root"
[[workflow_stages.actions]]
name = "Square Root of 16"
type = "python_lib"
module = "math"
function = "sqrt"
args = [16]
description = "Calculate the square root of 16."

[[workflow_stages]]
name = "Fetch TODO Item 2"
[[workflow_stages.actions]]
name = "GET Request for TODO 2"
type = "python_lib"
module = "requests"
function = "get"
args = ["https://jsonplaceholder.typicode.com/todos/2"]
description = "Perform a GET request to retrieve the second TODO item."

[[workflow_stages]]
name = "Fetch TODO Item 1"
[[workflow_stages.actions]]
name = "GET Request for TODO 1"
type = "operation"
module = "requests"
function = "get"
args = ["https://jsonplaceholder.typicode.com/todos/3"]
description = "Perform a GET request to retrieve the first TODO item."

[[workflow_stages]]
name = "Fetch TODO Item by ID"
[[workflow_stages.actions]]
name = "GET Request for TODO by ID"
type = "operation"
module = "requests"
function = "get"
args = ["https://jsonplaceholder.typicode.com/todos/${todo_id}"]
description = "Perform a GET request to retrieve a TODO item by its ID."

```
 
## Output Code 
```text
Executing LLMscript: test.llm

2024-02-28 19:02:43 - INFO - LLMscript file loaded and parsed successfully: test.llm
✅ LLMscript Started.
Executing Workflow Stage: Get Current Working Directory
2024-02-28 19:02:43 - INFO - Starting action: Retrieve CWD
2024-02-28 19:02:43 - INFO - Executing Python lib: os.getcwd with args: []
2024-02-28 19:02:43 - INFO - Executing: os.getcwd()
2024-02-28 19:02:43 - INFO - Result: /home/runner/LLMScript
2024-02-28 19:02:43 - INFO - Completed action: Retrieve CWD
Executing Workflow Stage: Calculate Square Root
2024-02-28 19:02:43 - INFO - Starting action: Square Root of 16
2024-02-28 19:02:43 - INFO - Executing Python lib: math.sqrt with args: [16]
2024-02-28 19:02:43 - INFO - Executing: math.sqrt(16)
2024-02-28 19:02:43 - INFO - Result: 4.0
2024-02-28 19:02:43 - INFO - Completed action: Square Root of 16
Executing Workflow Stage: Fetch TODO Item 2
2024-02-28 19:02:43 - INFO - Starting action: GET Request for TODO 2
2024-02-28 19:02:43 - INFO - Executing Python lib: requests.get with args: ['https://jsonplaceholder.typicode.com/todos/2']
2024-02-28 19:02:43 - INFO - Executing: requests.get('https://jsonplaceholder.typicode.com/todos/2')
2024-02-28 19:02:43 - INFO - Result: {
  "userId": 1,
  "id": 2,
  "title": "quis ut nam facilis et officia qui",
  "completed": false
}
2024-02-28 19:02:43 - INFO - Completed action: GET Request for TODO 2
Executing Workflow Stage: Fetch TODO Item 1
2024-02-28 19:02:43 - INFO - Starting action: GET Request for TODO 1
2024-02-28 19:02:43 - INFO - Executing operation: requests.get with args: ['https://jsonplaceholder.typicode.com/todos/3']
2024-02-28 19:02:43 - INFO - Executing: requests.get('https://jsonplaceholder.typicode.com/todos/3')
2024-02-28 19:02:44 - INFO - Result: {
  "userId": 1,
  "id": 3,
  "title": "fugiat veniam minus",
  "completed": false
}
2024-02-28 19:02:44 - INFO - Completed action: GET Request for TODO 1
Executing Workflow Stage: Fetch TODO Item by ID
2024-02-28 19:02:44 - INFO - Starting action: GET Request for TODO by ID
2024-02-28 19:02:44 - INFO - Executing operation: requests.get with args: ['https://jsonplaceholder.typicode.com/todos/1']
2024-02-28 19:02:44 - INFO - Executing: requests.get('https://jsonplaceholder.typicode.com/todos/1')
2024-02-28 19:02:44 - INFO - Result: {
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
2024-02-28 19:02:44 - INFO - Completed action: GET Request for TODO by ID
✅ LLMscript execution completed successfully.
```

## Python Code 
```python
#              - LLMScript
#     /\__/\   - llm.py 
#    ( o.o  )  - v0.0.1
#      >^<     - by @rUv


import logging
import importlib
import toml
import re
import sys
import os
import time
import json
import requests

from concurrent.futures import ThreadPoolExecutor, as_completed

# Define a default script file path
default_script_path = 'test.llm'

WHITELISTED_MODULES = {
    'os': ['getcwd', 'listdir'],
    'math': ['sqrt', 'ceil'],
    'requests': ['get', 'post']
}
# Setup basic logging configuration

class DetailedExecutionHandler(logging.Handler):
  def __init__(self, filename='detailed_results.txt'):
      super().__init__()
      self.filename = filename

  def emit(self, record):
      with open(self.filename, 'a') as file:
          file.write(self.format(record) + '\n')

# This should be at the module level, not inside DetailedExecutionHandler class
logging_configured = False

def configure_logging(log_to_file=False, detailed_log_file_path='detailed_results.txt', log_file_path='execution.log'):
  global logging_configured
  if logging_configured:
      return  # Logging already configured, do nothing

  log_format = '%(asctime)s - %(levelname)s - %(message)s'
  datefmt = '%Y-%m-%d %H:%M:%S'
  console_handler = logging.StreamHandler()
  console_handler.setFormatter(logging.Formatter(log_format, datefmt=datefmt))

  # Clear existing handlers to prevent duplicates
  logging.getLogger().handlers.clear()
  logging.basicConfig(level=logging.INFO, format=log_format, datefmt=datefmt, handlers=[console_handler])

  if log_to_file:
      file_handler = logging.FileHandler(log_file_path, mode='a')
      file_handler.setFormatter(logging.Formatter(log_format, datefmt=datefmt))
      logging.getLogger().addHandler(file_handler)

  detailed_handler = DetailedExecutionHandler(detailed_log_file_path)
  detailed_handler.setFormatter(logging.Formatter(log_format, datefmt=datefmt))
  logging.getLogger().addHandler(detailed_handler)

  logging_configured = True  # Set flag to indicate logging has been configured

def load_llmscript(file_path):
  """
  Loads and parses an LLMscript file (.llm) using the TOML format. This updated version supports
  aiTWS sections for defining workflow stages, conditions, external services, etc., alongside
  the existing [[python_lib]] and [[operation]] sections.

  :param file_path: The path to the LLMscript (.llm) file.
  :return: A complex dictionary containing both the parsed TOML data and constructed objects
          for aiTWS workflow components.
  """
  try:
      with open(file_path, 'r') as file:
          script_data = toml.load(file)

      # Correctly initialize aiTWS_components before using it
      aiTWS_components = {
          'workflow_stages': []
      }

      # Process and construct WorkflowStage objects from the TOML data
      if 'workflow_stages' in script_data:
          for stage_data in script_data['workflow_stages']:
              # Initialize an empty list for actions for this stage
              actions = []
              # Check if there are actions defined for the current stage
              if 'actions' in stage_data:
                  for action_data in stage_data['actions']:
                      # Construct WorkflowAction objects and add them to the actions list
                      action = WorkflowAction(
                          name=action_data['name'],
                          action_type=action_data['type'],
                          details=action_data  # Pass the whole action_data as details
                      )
                      actions.append(action)
              # Create a WorkflowStage object with the collected actions
              stage = WorkflowStage(name=stage_data['name'], actions=actions)
              # Append the constructed stage to the aiTWS_components
              aiTWS_components['workflow_stages'].append(stage)

      logging.info(f"LLMscript file loaded and parsed successfully: {file_path}")

      # Return a combined structure containing both raw script data and aiTWS components
      return {
          'script_data': script_data,  # Original script data
          'aiTWS_components': aiTWS_components,  # Parsed and constructed aiTWS components
      }
  except FileNotFoundError:
      logging.error(f"LLMscript file not found: {file_path}")
      raise
  except toml.TomlDecodeError as e:
      logging.error(f"Error decoding TOML: {e}")
      raise
  except Exception as e:
      logging.error(f"An unexpected error occurred: {e}")
      raise

def sanitize_input(input_string):
    """
    Sanitizes input strings by removing potentially dangerous characters.

    :param input_string: The input string to sanitize.
    :return: The sanitized string.
    """
    return re.sub(r'[^\w\.]', '', input_string)

def validate_module_and_function(module_name, function_name):
    """
    Validates module and function names against a specific pattern.

    :param module_name: The module name to validate.
    :param function_name: The function name to validate.
    :return: True if both are valid, False otherwise.
    """
    if re.match(r'^[\w\.]+$', module_name) and re.match(r'^\w+$', function_name):
        return True
    else:
        logging.warning(f"Invalid module or function name: {module_name}, {function_name}")
        return False

def is_whitelisted(module_name, function_name):
    """
    Checks if the module and function are whitelisted.

    :param module_name: The module name to check.
    :param function_name: The function name to check.
    :return: True if whitelisted, False otherwise.
    """
    if module_name in WHITELISTED_MODULES and function_name in WHITELISTED_MODULES[module_name]:
        return True
    else:
        logging.error(f"Module or function not whitelisted: {module_name}, {function_name}")
        return False

def substitute_parameters(arg, params):
    """
    Substitute dynamic parameters in the argument string.

    :param arg: The argument, can be a string with placeholders or other types.
    :param params: A dictionary of parameters to substitute into the string, if arg is a string.
    :return: The argument with substituted values, if applicable.
    """
    # Ensure the argument is a string before attempting to replace placeholders
    if isinstance(arg, str):
        for key, value in params.items():
            placeholder = "${" + key + "}"
            arg = arg.replace(placeholder, str(value))
    return arg

def dynamic_import_and_execute(module_name, function_name, args=[]):
  # Assume params are passed via command line or another method
  # For example, params could be: {"todo_id": "1"}
  # This is a simple implementation; consider securing and validating external input in production
  params = {}
  if len(sys.argv) > 2:
      try:
          params = json.loads(sys.argv[2])
      except json.JSONDecodeError:
          logging.error("Failed to decode JSON parameters.")
          return

  substituted_args = [substitute_parameters(arg, params) for arg in args]

  args_repr = ", ".join(repr(arg) for arg in substituted_args)
  code_str = f"{module_name}.{function_name}({args_repr})"
  logging.info(f"Executing: {code_str}")

  try:
      module = importlib.import_module(module_name)
      function = getattr(module, function_name)
      result = function(*substituted_args)

      if module_name == "requests" and function_name in ["get", "post"]:
          result_content = result.json() if result.headers.get('Content-Type') == 'application/json' else result.text
          logging.info(f"Result: {json.dumps(result_content, indent=4) if isinstance(result_content, dict) else result_content[:22500]}")
      else:
          logging.info(f"Result: {result}")

  except Exception as e:
      logging.error(f"Error executing {code_str}: {e}")
def save_execution_detail(detail, file_path='detailed_results.txt'):
  """
  Saves the executed Python code and its result to a specified file.

  :param detail: The detail to save, including executed code and result.
  :param file_path: The file path to save the details to.
  """
  with open(file_path, 'a') as file:
      file.write(detail + '\n\n')

def execute_python_libs(script_data):
  """
  Executes specified Python libraries from the script data.
  Logs descriptions for understanding the purpose and logic of each operation.
  """
  if 'python_lib' in script_data:
      for lib in script_data['python_lib']:
          module_name = lib['name']
          function_name = lib['function']
          args = lib.get('args', [])
          description = lib.get('description', 'No description provided.')
          logging.info(f"Description: {description}")
          logging.info(f"Executing {function_name} from {module_name} with args: {args}")
          dynamic_import_and_execute(module_name, function_name, args)

def execute_operations(script_data):
  """
  Executes the operations specified in the script data.
  Logs descriptions for understanding the purpose and logic of each operation.
  """
  if 'operation' in script_data:
      for operation in script_data['operation']:
          module_name = operation['module']
          function_name = operation['function']
          args = operation.get('args', [])
          description = operation.get('description', 'No description provided.')
          logging.info(f"Description: {description}")
          # Check if the operation is allowed (whitelisted)
          if not is_whitelisted(module_name, function_name):
              logging.error(f"Operation not allowed: {module_name}.{function_name}")
              continue
          logging.info(f"Executing operation {function_name} from {module_name} with args: {args}")
          dynamic_import_and_execute(module_name, function_name, args)

def save_execution_result(result, file_path='results.txt'):
  """
  Saves the execution result to a specified file.

  :param result: The result to save.
  :param file_path: The file path to save the result to.
  """
  with open(file_path, 'a') as file:  # 'a' to append to the file
      file.write(str(result) + '\n')

# Check if a script path is provided as a command-line argument, with a default fallback
script_path = sys.argv[1] if len(sys.argv) > 1 else "test.llm"

class WorkflowStage:
  def __init__(self, name, actions=None):
      self.name = name
      self.actions = actions if actions is not None else []

  def execute(self):
      for action in self.actions:
          action.execute()

class WorkflowAction:
    def __init__(self, name, action_type, details):
        self.name = name
        self.action_type = action_type  # 'python_lib' or 'operation'
        self.details = details  # Dictionary containing action specifics

    def execute(self):
        logging.info(f"Starting action: {self.name}")
        if self.action_type == 'python_lib':
            # Execute a Python library function
            module_name = self.details['module']
            function_name = self.details['function']
            args = self.details.get('args', [])
            logging.info(f"Executing Python lib: {module_name}.{function_name} with args: {args}")
            dynamic_import_and_execute(module_name, function_name, args)
        elif self.action_type == 'operation':
            # Execute an operation, treated similarly to a python_lib call for this example
            module_name = self.details['module']
            function_name = self.details['function']
            args = [arg.replace("${todo_id}", "1") for arg in self.details.get('args', [])]  # Example substitution
            logging.info(f"Executing operation: {module_name}.{function_name} with args: {args}")
            dynamic_import_and_execute(module_name, function_name, args)
        else:
            logging.error(f"Action type {self.action_type} not supported: {self.name}")
        logging.info(f"Completed action: {self.name}")
      
class WorkflowCondition:
  def __init__(self, condition, true_branch, false_branch=None):
      self.condition = condition  # Condition to evaluate
      self.true_branch = true_branch  # WorkflowStage to execute if condition is True
      self.false_branch = false_branch  # Optional: WorkflowStage to execute if condition is False

  def evaluate_and_execute(self):
      if self.condition.evaluate():
          print(f"Condition {self.condition} is true, executing true branch.")
          self.true_branch.execute()
      elif self.false_branch:
          print(f"Condition {self.condition} is false, executing false branch.")
          self.false_branch.execute()


class WorkflowParallelExecutor:
  def __init__(self, actions=[]):
      self.actions = actions

  def execute(self):
      logging.info("Executing actions in parallel")
      with ThreadPoolExecutor() as executor:
          futures = {executor.submit(action.execute): action for action in self.actions}
          for future in as_completed(futures):
              action = futures[future]
              try:
                  future.result()  # Ensures the action completes
                  logging.info(f"Parallel action completed: {action.name}")
              except Exception as e:
                  logging.error(f"Parallel action failed: {action.name} with error: {e}")

class ExternalService:
  def __init__(self, name, service_type, config):
      self.name = name
      self.service_type = service_type  # E.g., 'database', 'api', 'messaging'
      self.config = config  # Configuration details specific to the service type

  def call_service(self, *args, **kwargs):
      # Logic to interact with the external service
      pass


# Optional: Define functions for colored console output
def green_text(text): return f"\033[92m{text}\033[0m"
def yellow_text(text): return f"\033[93m{text}\033[0m"
def red_text(text): return f"\033[91m{text}\033[0m"
def dark_red_text(text): return f"\033[31m{text}\033[0m"


# Assuming load_llmscript has been updated as previously described
# and now returns both script_data and aiTWS_components

if __name__ == "__main__":
  print(yellow_text(f"Executing LLMscript: {script_path}\n"))
  script_path = sys.argv[1] if len(sys.argv) > 1 else default_script_path
  log_to_file = True
  log_file_path = 'execution.log'

  configure_logging(log_to_file=log_to_file, log_file_path=log_file_path)

  try:
      loaded_script = load_llmscript(script_path)
      script_data = loaded_script.get('script_data', {})
      aiTWS_components = loaded_script.get('aiTWS_components', {'workflow_stages': []})

      print(green_text("✅ LLMscript Started."))

      # Execute [[python_lib]] sections
      if 'python_lib' in script_data:
          execute_python_libs(script_data)

      # Execute [[operation]] sections
      if 'operation' in script_data:
          execute_operations(script_data)

      # Now, execute aiTWS components, specifically workflow stages, only once here
      for stage in aiTWS_components['workflow_stages']:
          if isinstance(stage, WorkflowStage):
              print(dark_red_text(f"Executing Workflow Stage: {stage.name}"))
              stage.execute()
          else:
              logging.error(f"Encountered an improperly defined stage in aiTWS_components: {stage}")

      print(green_text("✅ LLMscript execution completed successfully."))

  except FileNotFoundError:
      logging.error("The specified LLMscript file was not found.")
  except toml.TomlDecodeError:
      logging.error("Failed to decode the LLMscript file. Please check its format.")
  except Exception as e:
      logging.error(f"An unexpected error occurred: {e}")

```

## Setup and Implementation

### Requirements

- Python 3.x
- `toml` library for Python

### Installation Steps

1. Ensure Python 3.x is installed.
2. Install the `toml` library via pip:

```bash
pip install toml
```

3. Create a Python script, e.g., `llmscript.py`, and input the LLMscript system code.

## Usage

To run an `.llm` script:

```bash
python llmscript.py path/to/script.llm
```

## `.llm` TOML Syntax and File Specifications

### Sections

- `python_lib`: Defines Python libraries/modules to import, functions to execute, and arguments for those functions.

- `skill`: Defines custom skills with descriptions, input prompts, response templates, and invocation details.

### Hello World Example

```toml
[[python_lib]]
name = "builtins"
function = "print"
args = ["Hello, World!"]
```

### TOML Examples

#### Simple Print Example

```toml
[[python_lib]]
name = "builtins"
function = "print"
args = ["This is a simple print function."]
```

#### Math Library Example

```toml
[[python_lib]]
name = "math"
function = "sqrt"
args = [9]
```

#### Complex Example with OS Library

```toml
[[python_lib]]
name = "os"
function = "listdir"
args = ["."]
```

### Additional Security Note

When executing complex code, especially involving external libraries like OpenAI's, it's paramount to ensure the security of API keys and sensitive data. Always use environment variables or secure vaults to store API keys, and never hard-code them into scripts.

### Complex TOML Examples

#### OpenAI GPT Text Generation

This example demonstrates how to define a script that uses OpenAI's GPT model to generate text based on a prompt. It assumes you have the OpenAI Python library installed (`pip install openai`) and have set up an environment variable `OPENAI_API_KEY` with your API key.

```toml
[[python_lib]]
name = "openai"
function = "Completion.create"
args = ["engine='text-davinci-002'", "prompt='Write a poem about the sea.'", "max_tokens=100"]
```

**Important**: The actual implementation of passing arguments, especially complex ones like dictionaries or named arguments, may require adapting the `dynamic_import_and_execute` function in the Python code to parse and properly format these arguments before execution.

#### Advanced Image Recognition with TensorFlow or PyTorch

This example outlines using an image recognition model built with TensorFlow or PyTorch. It implies the presence of a predefined function `recognize_image` within a module `image_recognition` that you've implemented, which uses a pre-trained model to classify images.

```toml
[[python_lib]]
name = "image_recognition"
function = "recognize_image"
args = ["path/to/image.jpg"]
```

This example assumes that the `image_recognition` module and the `recognize_image` function are designed to handle image paths and return classification results. Ensure this module is included in your `WHITELISTED_MODULES`.

#### Sentiment Analysis with NLTK

Perform sentiment analysis on a given text using the NLTK library, which must be installed (`pip install nltk`) and properly set up with necessary data (e.g., running `nltk.download('vader_lexicon')`).

```toml
[[python_lib]]
name = "nltk.sentiment.vader"
function = "SentimentIntensityAnalyzer().polarity_scores"
args = ["'This is an amazing library!'"]
```

This example leverages NLTK's VADER tool to analyze the sentiment of a given sentence. As with the OpenAI example, adapting the Python execution code to correctly handle method chains or instances like `SentimentIntensityAnalyzer().polarity_scores` is crucial.

### Implementing Complex Argument Handling

For the examples above, especially those involving method calls with complex arguments or requiring instantiation of classes (e.g., `SentimentIntensityAnalyzer()`), you might need to extend the `dynamic_import_and_execute` function. This could involve parsing string representations of arguments into Python objects or handling specific cases where a library method needs to be called on an instantiated object.

### Final Thoughts

These complex examples highlight the flexibility and potential of the LLMscript system to integrate with a wide array of Python libraries, enabling the execution of advanced AI and machine learning tasks. When implementing these examples, pay close attention to security, especially regarding API keys and handling sensitive data, and ensure your script interpreter can safely and accurately process the arguments for library functions.

### Security Considerations

Whitelisting and input sanitization are critical. Ensure that `WHITELISTED_MODULES` contains only safe modules and functions. Regularly review and update security.

