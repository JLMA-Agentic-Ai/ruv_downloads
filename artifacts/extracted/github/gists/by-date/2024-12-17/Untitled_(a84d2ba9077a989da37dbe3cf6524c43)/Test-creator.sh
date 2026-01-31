#!/bin/bash

# Function to display help message
function show_help {
  echo "Usage: $0 [OPTIONS] [component_name]"
  echo ""
  echo "Options:"
  echo "  --all       Generate tests for all components in ./src"
  echo "  --help      Display this help message"
  echo ""
  echo "Arguments:"
  echo "  component_name   Name of the specific component to create tests for (optional if --all is used)"
  echo ""
  echo "Examples:"
  echo "  $0 ButtonComponent     # Create unit tests for ButtonComponent"
  echo "  $0 --all               # Create unit tests for all components in ./src"
  exit 0
}

# Initialize variables
all_components=false
component_name=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --all)
      all_components=true
      shift # Remove --all from processing
      ;;
    --help)
      show_help
      ;;
    -*|--*) # Unknown option
      echo "Error: Unknown option $1"
      show_help
      ;;
    *) # Component name
      if [ -n "$component_name" ]; then
        echo "Error: Multiple component names provided. Please provide only one component name or use --all."
        show_help
      fi
      component_name="$1"
      shift # Remove component_name from processing
      ;;
  esac
done

if [ "$all_components" = true ] && [ -n "$component_name" ]; then
  echo "Error: Cannot specify a component name and --all at the same time."
  exit 1
fi

if [ "$all_components" = false ] && [ -z "$component_name" ]; then
  echo "Error: Please provide a component name or use --all."
  echo "Use --help for usage information."
  exit 1
fi

echo "Starting test creation process..."

original_dir=$(pwd)

if [ "$all_components" = true ]; then
  # Get a list of all component names in ./src
  component_names=($(find ./src -type f -name '*.tsx' | sed 's|.*/||' | sed 's|\.tsx||'))
else
  component_names=("$component_name")
fi

for component_name in "${component_names[@]}"; do
  component_file="./src/$component_name.tsx"
  test_file="./src/$component_name.test.tsx"

  if [ ! -f "$component_file" ]; then
    echo "Skipping $component_name: Component file does not exist."
    continue
  fi

  if [ -f "$test_file" ]; then
    echo "Skipping $component_name: Test file already exists."
    continue
  fi

  echo "Creating unit tests for component: $component_name"

  aider_message="Create a unit test file for the React component located at $component_file. 

Key requirements:
- Use Jest and React Testing Library.
- Test rendering and interaction logic, including props, state changes, and event handlers.
- Ensure the test covers edge cases and verifies expected outputs.
- Save the test file at $test_file."

  # Run Aider to generate the test file
  aider --message "$aider_message" --yes-always \
    "$component_file" \
    "$test_file"

  echo "Test file created for component: $component_name at $test_file."
done

echo "Test creation process completed."