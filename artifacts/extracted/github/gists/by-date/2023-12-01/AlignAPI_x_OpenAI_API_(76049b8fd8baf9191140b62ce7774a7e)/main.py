#              - AlignAPI test
#     /\__/\   - main.py
#    ( o.o  )  - v0.0.1
#      >^<     - by @rUv

# Import the necessary modules and libraries
import os
import requests
from fastapi import FastAPI, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Union, Dict
from urllib.parse import unquote
import mimetypes
from fastapi.responses import FileResponse
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from fastapi.encoders import jsonable_encoder
 
# FastAPI app initialization
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Customizing OpenAPI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="OpenAi API GPT",
        version="0.0.1",
        description="API endpoints for OpenAi API GPT application",
        routes=app.routes,
    )
    openapi_schema["servers"] = [{
        "url": "https://alignapi.ruvnet.repl.co",
        "description": "Development server"
    }]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# OpenAI API base URL
OPENAI_API_BASE_URL = "https://api.openai.com/v1"

# Model for a message within a completion request
class Message(BaseModel):
    role: Literal['system', 'assistant', 'user', 'function']
    content: str

# Model for a completion request
class CompletionRequest(BaseModel):
    model: str = "gpt-3.5-turbo"
    temperature: float = 1.0
    max_tokens: int = 1000
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    messages: List[Message]
    n: int = 1
    stream: bool = False

# Function to call OpenAI API
def call_openai_api(endpoint: str, data: dict):
    openai_api_key = os.getenv("OPENAI_API_KEY")  # Retrieve API key from environment variable
    headers = {
        "Authorization": f"Bearer {openai_api_key}",
        "Content-Type": "application/json"
    }
    url = f"{OPENAI_API_BASE_URL}/{endpoint}"
    response = requests.post(url, headers=headers, json=data)

    try:
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as http_err:
        return {"error": str(http_err), "status_code": response.status_code}
    except requests.exceptions.JSONDecodeError:
        return {"response_text": response.text, "status_code": response.status_code}

# Endpoint for creating completions
@app.post("/proxy_openai_api/completions/", tags=["Chat"])
async def proxy_openai_api_completions(completion_request: CompletionRequest):
    return call_openai_api("chat/completions", completion_request.dict())

# Define the model for the AlignAPI request
class AlignAPIResponse(BaseModel):
    child_exploitation: int
    child_safety: int
    drugs_content: int
    hate_content: int
    sexual_content: int
    violent_content: int
    weapons_content: int

def get_alignapi_key():
    return os.getenv("ALIGNAPI_KEY")

@app.get("/align", response_model=AlignAPIResponse)
async def test_text_alignment(test_text: str = Query(...), alignapi_key: str = Depends(get_alignapi_key)):
    headers = {"access_token": alignapi_key}
    response = requests.get(
        f"https://api.alignapi.com/align/{test_text}", 
        headers=headers
    )

    try:
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as http_err:
        raise HTTPException(status_code=response.status_code, detail=str(http_err))
    except requests.exceptions.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Response is not in JSON format")

# Conditional Completion
@app.post("/conditional_completion/", tags=["Conditional Completion"])
async def conditional_completion(request_data: CompletionRequest, threshold: int = 1):
    align_api_key = get_alignapi_key()
    test_text = request_data.messages[0].content  # Assuming the text to analyze is in the first message
    align_api_response = await test_text_alignment(test_text, align_api_key)

    # Check if any content sensitivity rating exceeds the threshold
    for key, value in align_api_response.items():
        if value > threshold:
            return {"error": f"Content sensitivity too high for {key}.", "status_code": 403}

    # Proceed with the completion request if all ratings are below the threshold
    return call_openai_api("chat/completions", request_data.dict())

# Main function to run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
