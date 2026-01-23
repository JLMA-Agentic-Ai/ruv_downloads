import os
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
)

# Configure logging
import logging
import sys

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))

# Check if storage already exists
PERSIST_DIR = "./storage"
if not os.path.exists(PERSIST_DIR):
    print("Storage directory does not exist. Creating index...")
    
    # Recursively load documents using SimpleDirectoryReader
    print("Loading documents...")
    documents = SimpleDirectoryReader("./data", recursive=True).load_data()
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
    user_input = input("Enter a query (or 'quit' to exit): ")
    if user_input.lower() == "quit":
        break
    
    print(f"Querying index with: {user_input}")
    response = query_engine.query(user_input)
    
    print("Query result:")
    print(response)