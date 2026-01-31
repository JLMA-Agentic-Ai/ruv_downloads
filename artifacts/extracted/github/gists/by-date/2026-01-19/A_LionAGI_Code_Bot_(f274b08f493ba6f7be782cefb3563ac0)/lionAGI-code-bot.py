import os
import asyncio
import subprocess
import importlib
import sys
from dotenv import load_dotenv
from lionagi import Session
from e2b_code_interpreter import CodeInterpreter
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
)
from itertools import cycle
from time import sleep
from threading import Thread

# Configure logging
import logging
import sys

# Configure the root logger
logging.basicConfig(stream=sys.stdout, level=logging.INFO)

# Get the logger for httpx and set its level to WARNING
httpx_logger = logging.getLogger("httpx")
httpx_logger.setLevel(logging.WARNING)

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
E2B_API_KEY = os.getenv("E2B_API_KEY")

system_prompt = "You are a helpful Python coding assistant."

async def generate_code(instruction, context):
    print(f"\n=== Generating Code ===")
    print(f"Instruction: {instruction}")
    print(f"Context: {context}\n")
    
    guidance_response = """
    Guidance from super intelligent code bot:
    {guidance_response}
    Please generate a Python function that satisfies the prompt and follows the provided guidance, while adhering to these coding standards:
    - Use descriptive and meaningful names for variables, functions, and classes.
    - Follow the naming conventions: lowercase with underscores for functions and variables, CamelCase for classes.
    - Keep functions small and focused, doing one thing well.
    - Use 4 spaces for indentation, and avoid mixing spaces and tabs.
    - Limit line length to 79 characters for better readability.
    - Use docstrings to document functions, classes, and modules, describing their purpose, parameters, and return values.
    - Use comments sparingly, and prefer descriptive names and clear code structure over comments.
    - Handle exceptions appropriately and raise exceptions with clear error messages.
    - Use blank lines to separate logical sections of code, but avoid excessive blank lines.
    - Import modules in a specific order: standard library, third-party, and local imports, separated by blank lines.
    - Use consistent quotes (single or double) for strings throughout the codebase.
    - Follow the PEP 8 style guide for more detailed coding standards and best practices.
    """
    
    coder = Session(system_prompt)
    
    # Display thinking animation
    print("=== Generating code ===", end="", flush=True)
    animation = "|/-\\"
    idx = 0
    while True:
        code_result = await coder.chat(f"""
        {instruction}
        
        {guidance_response}
        Please generate a Python function that satisfies the prompt and follows the provided guidance.
        """)
        if code_result:
            break
        print(f"\rGenerating code {animation[idx % len(animation)]}", end="", flush=True)
        idx += 1
        await asyncio.sleep(0.1)
    print("\rGenerated code successfully!")
    
    print("Generated Code:")
    print(code_result)
    print("======================\n")
    
    return code_result

async def loading_animation(done):
    while not done():
        for frame in ['', '/', '-', '\\']:
            print(f"\rUpdating index... {frame}", end='', flush=True)
            await asyncio.sleep(0.1)
    print("\rIndex updated successfully.")

async def execute_code(code, file_name, query_engine):
    print("\n=== Executing Code ===")
    
    # Check if there is a local file with the given name using the llama index
    local_file_content = None
    try:
        local_file_query = f"content of file named {file_name}"
        local_file_response = query_engine.query(local_file_query)
        if local_file_response:
            local_file_content = local_file_response.response
            print(f"Found local file '{file_name}' in the index.")
            print(f"File content:\n{local_file_content}\n")
            use_local_file = input("Do you want to use the code from this local file? (y/n): ")
            if use_local_file.lower() == 'y':
                code = local_file_content
            else:
                print("Using the provided code instead of the local file.")
    except Exception as e:
        print(f"Error occurred while searching for local file: {str(e)}")
    
    with CodeInterpreter(api_key=E2B_API_KEY) as sandbox:
        # Execute the code from the previous output
        execution = sandbox.notebook.exec_cell(code)
        print(f"Execution Output:\n{execution.text}")
        
        if execution.error:
            print(f"Error: {execution.error}")
            print("Please check the error message and modify your code accordingly.")
            print("You can re-execute the updated code or provide additional instructions.")
        
        while True:
            print("\n=== Code Execution Menu ===")
            print("1. Execute code")
            print("2. Review and modify the code")
            print("3. Save the code to a new file or update an existing file")
            print("4. Continue development based on the previous output")
            print("5. Return to main menu")
            print("===========================\n")
            
            choice = input("Enter your choice (1/2/3/4/5): ")
            
            if choice == '1':
                user_input = input("Enter code to execute (or 'quit' to exit): ")
                if user_input.strip().lower() == "quit":
                    break
                
                execution = sandbox.notebook.exec_cell(user_input)
                print(f"Execution Output:\n{execution.text}")
                
                if execution.error:
                    print(f"Error: {execution.error}")
                    print("Please check the error message and modify your code accordingly.")
                    print("You can re-execute the updated code or provide additional instructions.")
            
            elif choice == '2':
                # Review and modify the code using LionAGI
                review_prompt = f"Please review the following code and remove any unnecessary markdown or descriptions:\n\n{code}\n"
                review_response = await generate_code(review_prompt, "")
                print("Code Review:")
                print(review_response)
                
                # Ask the user if they want to apply the suggested changes
                apply_changes = input("Do you want to apply the suggested changes? (y/n): ")
                if apply_changes.lower() == 'y':
                    # Apply the changes to the code
                    code = review_response
                    print("Code updated with the suggested changes.")
                else:
                    print("Code changes skipped.")
            
            elif choice == '3':
                # Save the code to a new file or update an existing file
                save_options = input("Select save option:\n1. Save to a new file\n2. Update existing file\n3. Skip\nEnter your choice (1/2/3): ")
                
                if save_options == '1':
                    new_file_path = input("Enter the new file path: ")
                    with open(new_file_path, 'w') as file:
                        # Extract only the code blocks from the generated code
                        code_blocks = extract_code_blocks(code)
                        file.write(code_blocks)
                    print(f"Code saved to new file: {new_file_path}")
                elif save_options == '2':
                    with open(file_name, 'w') as file:
                        # Extract only the code blocks from the generated code
                        code_blocks = extract_code_blocks(code)
                        file.write(code_blocks)
                    print(f"Existing file '{file_name}' updated with the code.")
                else:
                    print("Code update/save skipped.")
            
            elif choice == '4':
                # Continue development based on the previous output
                additional_request = input("Enter your additional request based on the previous output: ")
                
                # Generate new code based on the additional request and the previous code
                new_code = await generate_code(f"""
                Previous code:
                {code}
                
                Additional request:
                {additional_request}
                
                Please generate updated code based on the previous code and the additional request.
                """, "")
                
                print("Generated new code:")
                print(new_code)
                
                # Execute the new code in the code interpreter
                execution = sandbox.notebook.exec_cell(new_code)
                print(f"Execution Output:\n{execution.text}")
                
                if execution.error:
                    print(f"Error: {execution.error}")
                    print("Please check the error message and modify your code accordingly.")
                    print("You can re-execute the updated code or provide additional instructions.")
                
                # Update the code variable with the new code
                code = new_code
            
            elif choice == '5':
                # Return to the main menu
                break
            
            else:
                print("Invalid choice. Please try again.")
    
    print("======================\n")

def extract_code_blocks(code):
    # Extract code blocks from the generated code
    code_blocks = []
    lines = code.split('\n')
    inside_code_block = False
    current_block = []

    for line in lines:
        if line.startswith('```'):
            if inside_code_block:
                code_blocks.append('\n'.join(current_block))
                current_block = []
                inside_code_block = False
            else:
                inside_code_block = True
        elif inside_code_block:
            current_block.append(line)

    if current_block:
        code_blocks.append('\n'.join(current_block))

    return '\n\n'.join(code_blocks)

def display_menu():
    print("\n=== Menu ===")
    print("1. Query Code Index")
    print("2. Generate and Execute Code")
    print("3. Update Code Index")
    print("4. Install Bot Libraries")
    print("5. Quit")
    print("============\n")

async def main():
    # Check if storage already exists
    PERSIST_DIR = "../storage"
    if not os.path.exists(PERSIST_DIR):
        print("Storage directory does not exist. Creating index...")
        
        # Recursively load documents using SimpleDirectoryReader
        print("Loading documents...")
        documents = SimpleDirectoryReader("../", recursive=True, exclude_hidden=True).load_data()
        print(f"Loaded {len(documents)} documents.")

        # Create a VectorStoreIndex using the loaded documents
        print("Creating vector store index...")
        index = VectorStoreIndex.from_documents(documents)
        
        # Store the index for later
        print("Storing index...")
        index.storage_context.persist(persist_dir=PERSIST_DIR)
        print("Index stored successfully.")
    else:
        print("⚡ Loading existing index from storage...")
        print(f"⏰ Please wait a moment while the index is loaded...")
        # Create an event to signal when the index loading is done
        done_event = asyncio.Event()
        
        # Start the loading animation coroutine
        animation_task = asyncio.create_task(loading_animation(done_event.is_set))
        
        try:
            # Load the existing index
            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            index = load_index_from_storage(storage_context)
            
            # Signal that the index loading is done
            done_event.set()
            
            # Wait for the animation task to complete
            await animation_task
            
            print("Index loaded successfully.")
        except Exception as e:
            # Signal that the index loading is done in case of an error
            done_event.set()
            raise e

    # Query the index
    query_engine = index.as_query_engine()

    while True:
        display_menu()
        choice = input("Enter your choice: ")

        if choice == "1":
            user_input = input("Enter a query: ")
            print(f"\nQuerying index with: {user_input}")
            response = query_engine.query(user_input)
            print(f"Query Result:\n{response}\n")

        elif choice == "2":
            instruction = input("Enter a code instruction: ")
            file_name = input("Enter the file name: ")  # Get the file name from the user
            context = query_engine.query(instruction).response
            code = await generate_code(instruction, context)
            await execute_code(code, file_name, query_engine)  # Pass the file name and query_engine to execute_code

        elif choice == "3":
            print(f"\nBuilding Index...")
            done_event = asyncio.Event()
            animation_task = asyncio.create_task(loading_animation(done_event.is_set))

            try:
                # Recursively load documents using SimpleDirectoryReader
                documents = SimpleDirectoryReader("../", recursive=True, exclude_hidden=True).load_data()

                # Refresh the index with the updated documents
                index.refresh_ref_docs(documents)

                done_event.set()
                await animation_task

                logging.info("Index updated successfully.")
            except Exception as e:
                done_event.set()
                logging.exception("An error occurred while updating the index:")
                print(f"Error: {str(e)}")

        elif choice == "4":
            print("Installing required libraries...")
            try:
                required_libraries = ["lionagi", "e2b_code_interpreter", "llama_index"]
                missing_libraries = []

                for library in required_libraries:
                    try:
                        importlib.import_module(library)
                    except ImportError:
                        missing_libraries.append(library)

                if missing_libraries:
                    print("The following required libraries are missing:")
                    for library in missing_libraries:
                        print(f"- {library}")

                    install_choice = input("Do you want to install the missing libraries? (y/n): ")
                    if install_choice.lower() == "y":
                        for library in missing_libraries:
                            print(f"Installing {library}...")
                            try:
                                subprocess.check_call([sys.executable, "-m", "pip", "install", library])
                            except subprocess.CalledProcessError as e:
                                print(f"Error occurred while installing {library}: {str(e)}")
                                print("Please check the error message and ensure you have the necessary permissions to install packages.")
                                print("You may need to run the script with administrative privileges or use a virtual environment.")
                        print("Installation completed.")
                    else:
                        print("Please install the missing libraries manually before running the script.")
                else:
                    print("All required libraries are already installed.")

                # Prompt the user for API keys
                print("\nAPI Key Setup")
                print("-------------")

                openai_api_key = os.getenv("OPENAI_API_KEY")
                if not openai_api_key:
                    openai_api_key_choice = input("Do you want to add the OpenAI API key? (y/n): ")
                    if openai_api_key_choice.lower() == "y":
                        openai_api_key = input("Enter your OpenAI API key: ")
                        os.environ["OPENAI_API_KEY"] = openai_api_key
                    else:
                        print("Skipping OpenAI API key setup.")

                e2b_api_key = os.getenv("E2B_API_KEY")
                if not e2b_api_key:
                    e2b_api_key_choice = input("Do you want to add the E2B API key? (y/n): ")
                    if e2b_api_key_choice.lower() == "y":
                        e2b_api_key = input("Enter your E2B API key: ")
                        os.environ["E2B_API_KEY"] = e2b_api_key
                    else:
                        print("Skipping E2B API key setup.")

            except Exception as e:
                logging.exception("An error occurred during library installation or API key setup:")
                print(f"Error: {str(e)}")


        elif choice == "5":
            print("Exiting...")
            break

        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    asyncio.run(main())
