# Auto-Fixer Script

## Introduction

The Auto-Fixer script is a powerful tool designed to automatically test and fix React components in a project. It leverages the London school of Test-Driven Development (TDD) and uses an AI-powered code assistant to iteratively improve failing tests and component code.

## Features

- Automatically runs tests for specified React components
- Analyzes test failures and error messages
- Uses AI to suggest and implement fixes for failing tests and components
- Supports fixing a single component or all components in a project
- Implements an iterative approach with a configurable maximum number of attempts
- Provides detailed output and logging of the fixing process

## Usage

To use the Auto-Fixer script, run it from the command line with the following syntax:

```
./auto-fixer.sh [OPTIONS] [test_name]
```

Options:
- `--all`: Fix all tests in the components directory
- `--help`: Display the help message

Arguments:
- `test_name`: Name of the specific test to fix (optional if --all is used)

Examples:
```
./auto-fixer.sh AgentNetwork     # Fix tests for AgentNetwork
./auto-fixer.sh --all            # Fix all tests in components
```

## Configuration

The Auto-Fixer script can be configured by modifying the following variables in the script:

- `max_iterations`: Maximum number of fix attempts per component (default: 5)
- `test_file`: Path to the test file (default: "src/components/$test_name/$test_name.test.tsx")
- `component_file`: Path to the component file (default: "src/components/$test_name/$test_name.tsx")

To use the AI-powered code assistant, ensure you have set up the following:

1. Install aider.chat:
   ```
   pip install aider-chat
   ```

2. Create a `.env` file in the project root with your AI model configuration:
   ```
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-4-1106-preview  # or another compatible model
   ```

   Alternatively, you can use other LiteLLM models or Sonnet 3.5 by adjusting the `OPENAI_MODEL` value accordingly.

The script uses the configured AI model in "architect mode" to analyze test failures and suggest fixes. It follows the London school of TDD by focusing on the behavior and interactions of components, using mocks and stubs to isolate the component under test.