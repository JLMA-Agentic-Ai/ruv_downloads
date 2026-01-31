# Import required libraries
import fastapi
import openai
import asyncio
import jwt
import toml
import tiktoken
import json

# Define constants
API_KEY = "your_openai_api_key"
JWT_SECRET = "your_jwt_secret_key"

# Create FastAPI app instance
app = fastapi.FastAPI()

# Define authentication dependency
async def authenticate_user(authorization: str = fastapi.Depends(fastapi.security.HTTPBearer())):
    try:
        # Extract JWT token from authorization header
        token = authorization.credentials
        
        # Verify and decode JWT token
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        
        # Return authenticated user info
        return {"user_id": payload["user_id"]}
    except:
        # Raise authentication error for invalid tokens
        raise fastapi.HTTPException(status_code=401, detail="Invalid token")

# Define function for consistent JSON output
def format_json_output(hypergraph, token_usage):
    return {
        "hypergraph": json.dumps(hypergraph),
        "token_usage": token_usage
    }

# Define hypergraph generation endpoint    
@app.post("/generate_hypergraph")
async def generate_hypergraph(request: HypergraphRequest, user: dict = fastapi.Depends(authenticate_user)):
    try:
        # Set up OpenAI API request
        openai.api_key = API_KEY
        
        # Extract text input from request
        text = request.text
        
        # Construct system message with hypergraph specifications
        system_message = f"""You are an AI assistant that generates hypergraph formatted text outputs based on the following TOML specification:

```toml
[concepts]
# Defines key concepts within the domain, detailing their name and essence.

[relationships]  
# Maps the connections between concepts, specifying the nature and context of these links.

[triplets]
# Represents relationships in a subject-predicate-object format for clearer understanding of concept interactions.

[attributes]
# Assigns attributes to concepts and relationships, such as importance and strength, to provide additional insights.

[temporal]
# Tracks the development and evolution of concepts and relationships over time.

[interpolation]  
# Applies interpolation methods to estimate the progression of concepts within specified periods.

[euclidean_graph]
# Describes spatial relationships between concepts, providing a geometric perspective on their proximity and connections.

[temporal_dynamics]
# Captures dynamic changes over time, emphasizing the evolution of concepts and their relationships.

[events]
# Logs significant occurrences that have a substantial impact on the network's structure and understanding.

[layers]
# Organizes the network into layers for a structured analysis, such as operational, taxonomic, and entity layers.

[generative_models]
# Details models that predict future states of the network based on current and historical data.

[cross_references]
# Directly links different parts of the semantic network together, ensuring a multidimensional perspective.

[quantitative_metrics]
# Introduces objective measures to evaluate relationships and model performances.

[implementation_details]
# Provides insights into the practical application of concepts through specific technologies and platforms.

[validation_and_evidence]
# Lists references and datasets supporting the network's constructs, enhancing credibility.

[visualization_tools]  
# Recommends tools for visually exploring the network's structure and relationships.

[update_mechanisms]
# Details procedures for maintaining and updating the network, ensuring its relevance over time.

[ethical_considerations]
# Highlights ethical issues and mitigation strategies related to the domain, promoting responsible use.

[use_cases]
# Demonstrates the practical application of the network through real-world scenarios and questions.

[future_extensions_guidelines]
# Offers recommendations for further developing and expanding the semantic network.

[metadata]
# Provides context about the document, such as its author, creation date, and purpose.
```

Generate a hypergraph representation for the following text, adhering to the TOML specification above:

{text}

Return the hypergraph TOML in a single line without whitespaces to minimize token usage.
"""
        
        # Count input tokens
        encoding = tiktoken.encoding_for_model("gpt-4-1106-preview")
        input_tokens = len(encoding.encode(system_message)) + len(encoding.encode(text))
        
        # Make asynchronous call to OpenAI API
        response = await asyncio.to_thread(
            openai.ChatCompletion.create,
            model="gpt-4-1106-preview",  # Use GPT-4 128k model
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": text}
            ],
            temperature=0  # Set temperature to 0 for deterministic output
        )
        
        # Extract generated hypergraph text from API response
        hypergraph_text = response["choices"][0]["message"]["content"]
        
        # Count output tokens 
        output_tokens = len(encoding.encode(hypergraph_text))
        total_tokens = input_tokens + output_tokens
        
        # Calculate token cost
        token_cost = total_tokens * 0.0015 / 1000  # $0.0015 per 1K tokens for GPT-4
        
        # Parse the generated TOML hypergraph 
        hypergraph = toml.loads(hypergraph_text)
        
        # Format output as JSON
        output = format_json_output(
            hypergraph,
            {
                "input_tokens": input_tokens,
                "output_tokens": output_tokens, 
                "total_tokens": total_tokens,
                "token_cost": f"${token_cost:.5f}"
            }
        )
        
        # Return JSON output
        return fastapi.responses.JSONResponse(content=output)
    
    except openai.error.APIError:
        # Handle OpenAI API errors
        raise fastapi.HTTPException(status_code=500, detail="OpenAI API error")

# Define request model
class HypergraphRequest(pydantic.BaseModel):
    text: str

# Run FastAPI app  
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app) 

