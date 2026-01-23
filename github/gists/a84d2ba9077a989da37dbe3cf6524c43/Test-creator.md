# Test Creator Script

The Test Creator script is an automated tool designed to generate unit tests for React components. It leverages AI-powered insights to create comprehensive test suites, saving developers time and ensuring consistent test coverage across components.

## Features

- Automatically generates unit tests for React components in the `./src` directory
- Uses Jest and React Testing Library for robust testing
- Ensures coverage for props, state changes, event handlers, and edge cases
- Supports generating tests for a single component or all components in the project
- Skips components that already have existing test files to prevent overwriting
- Provides detailed output and logging of the test creation process

## Usage

To use the Test Creator script, run it from the command line with the following syntax:

```
./test-creator.sh [OPTIONS] [component_name]
```

Options:
- `--all`: Generate tests for all components in ./src
- `--help`: Display the help message

Arguments:
- `component_name`: Name of the specific component to create tests for (optional if --all is used)

Examples:
```
./test-creator.sh ButtonComponent    # Create unit tests for ButtonComponent
./test-creator.sh --all              # Create unit tests for all components in ./src
```

## Configuration

To use the AI-powered code assistant for test generation, ensure you have set up the following:

1. Install aider-chat:
   ```
   pip install aider-chat
   ```

2. Create a `.env` file in the project root with your AI model configuration:
   ```
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-4-1106-preview  # or another compatible model
   ```

   You can use other LiteLLM models or Sonnet 3.5 by adjusting the `OPENAI_MODEL` value accordingly.

## How It Works

1. The script identifies the target component(s) in the `./src` directory.
2. For each component, it checks if a test file already exists to avoid overwriting.
3. If no test file exists, it uses the AI-powered assistant to generate a comprehensive unit test.
4. The generated test file is saved in the same directory as the component, with a `.test.tsx` extension.
5. The script provides progress updates and the locations of newly created test files.

## Notes

- Component files should be located in the `./src` directory and use the `.tsx` extension.
- The script assumes a standard structure for React components.
- For complex components or edge cases, manual review and adjustment of generated tests may be necessary.

## Benefits

- Saves time on repetitive test writing tasks
- Ensures consistent test coverage across components
- Leverages AI to create comprehensive test suites
- Simplifies the process of maintaining high code quality through testing

Start using the Test Creator script today to automate your test creation process and focus on building great React components!

