import os
from lionagi import Workflow, Task
from llama_index import GPTSimpleVectorIndex, Document

# Set environment variables
os.environ["OPENAI_API_KEY"] = "your_openai_api_key"
os.environ["LIONAGI_TOKEN_LIMIT"] = "1000"
os.environ["LIONAGI_REQUEST_LIMIT"] = "1000"
os.environ["LIONAGI_INTERVAL"] = "60"

# Define the data sources 
data_sources = [
    Document("path/to/doc1.txt"), 
    Document("path/to/doc2.pdf"),
    Document("path/to/doc3.csv")
]

# Build the index
index = GPTSimpleVectorIndex(data_sources)

# Define the workflow tasks
@Task
def fetch_relevant_data(query: str):
    """
    Fetches relevant data from the index based on the provided query.
    :param query: The search query
    :return: The relevant data
    """
    return index.query(query)

@Task
def generate_ideas(data: str):
    """
    Generates creative ideas based on the provided data using OpenAI.
    :param data: The relevant data
    :return: The generated ideas
    """
    prompt = f"""
    Based on the following information:
    {data}
    Brainstorm 5 creative ideas:
    """
    return lionagi.services.openai(prompt)

@Task
def summarize_findings(ideas: str):
    """
    Summarizes the generated ideas into a concise executive summary.
    :param ideas: The generated ideas
    :return: The executive summary
    """
    prompt = f"""
    Given the following ideas:
    {ideas}
    Provide a concise executive summary:
    """
    return lionagi.services.openai(prompt)

# Instantiate the workflow
workflow = Workflow(name="Research Workflow")

# Add the tasks 
workflow.add_tasks(
    fetch_relevant_data,
    generate_ideas,
    summarize_findings
)

# Define the dependencies between tasks
workflow.add_dependencies(
    fetch_relevant_data >> generate_ideas,
    generate_ideas >> summarize_findings  
)

# Execute the workflow
result = workflow.run(query="latest advancements in AI")
print(result)
