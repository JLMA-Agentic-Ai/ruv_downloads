# File Summarization API

This FastAPI application provides an API endpoint for uploading files and generating summaries using LlamaIndex. It supports a wide variety of file types including documents, images, audio, and video files.

## Features

- File upload endpoint
- Automatic file type detection
- Document summarization using LlamaIndex
- Support for multiple file types (PDF, Word, PowerPoint, images, audio, video, etc.)
- JSON response with file information and summaries

## Requirements

- Python 3.7+
- FastAPI
- LlamaIndex
- uvicorn

## Configure Keys
``` export OPENAI_API_KEY="your_key" ```

## Run
``` python main.py ```

### Additional 
For Audio transcription ``` pip install git+https://github.com/openai/whisper.git ```