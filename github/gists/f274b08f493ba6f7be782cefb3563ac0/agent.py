import os
import asyncio
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
    
    coder = Session(system_prompt)
    code_result = await coder.chat(f"{instruction}\n\nContext: {context}")
    
    print("Generated Code:")
    print(code_result)
    print("======================\n")
    
    return code_result

async def execute_code(code):
    print("\n=== Executing Code ===")
    with CodeInterpreter(api_key=E2B_API_KEY) as sandbox:
        sandbox.notebook.exec_cell(code)
        
        while True:
            execution = sandbox.notebook.exec_cell(input("Enter code to execute (or 'quit' to exit): "))
            if execution.text.strip().lower() == "quit":
                break
            print(f"Execution Output:\n{execution.text}")
    
    print("======================\n")

def display_menu():
    print("\n=== Menu ===")
    print("1. Query index")
    print("2. Generate and execute code")
    print("3. Update index")
    print("4. Quit")
    print("============\n")

def loading_animation(done):
    for frame in cycle(['', '/', '-', '\\']):
        if done:
            break
        print(f"\rUpdating index... {frame}", end='', flush=True)
        sleep(0.1)
    print("\rIndex updated successfully.")

async def main():
    # Check if storage already exists
    PERSIST_DIR = "./storage"
    if not os.path.exists(PERSIST_DIR):
        print("Storage directory does not exist. Creating index...")
        
        # Recursively load documents using SimpleDirectoryReader
        print("Loading documents...")
        documents = SimpleDirectoryReader("./", recursive=True, exclude_hidden=True).load_data()
        print(f"Loaded {len(documents)} documents.")

        # Create a VectorStoreIndex using the loaded documents
        print("Creating vector store index...")
        index = VectorStoreIndex.from_documents(documents)
        
        # Store the index for later
        print("Storing index...")
        index.storage_context.persist(persist_dir=PERSIST_DIR)
        print("Index stored successfully.")
    else:
        print("Loading existing index from storage...")
        # Load the existing index
        storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
        index = load_index_from_storage(storage_context)
        print("Index loaded successfully.")

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
            context = query_engine.query(instruction).response
            code = await generate_code(instruction, context)
            await execute_code(code)

        elif choice == "3":
            done = False
            animation_thread = Thread(target=loading_animation, args=(lambda: done,))
            animation_thread.start()

            # Recursively load documents using SimpleDirectoryReader
            documents = SimpleDirectoryReader("./", recursive=True, exclude_hidden=True).load_data()

            # Refresh the index with the updated documents
            index.refresh(documents)

            done = True
            animation_thread.join()

        elif choice == "4":
            print("Exiting...")
            break

        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    asyncio.run(main())
