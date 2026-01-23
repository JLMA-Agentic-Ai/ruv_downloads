#          ____ ___       
#  _______|    |   ___  __
#  \_  __ |    |   \  \/ /
#   |  | \|    |  / \   / 
#   |__|  |______/   \_/  
#                         
#  Transcribe Ai. 
import os, shutil, logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from llama_index.core import DocumentSummaryIndex, SimpleDirectoryReader
from fastapi.responses import JSONResponse, RedirectResponse

app = FastAPI(title="Transcribe Ai")
logging.basicConfig(level=logging.INFO)

@app.get("/")
async def redirect_to_docs():
    return RedirectResponse(url="/docs")

os.makedirs("./data", exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = f"./data/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        docs = SimpleDirectoryReader("./data").load_data()
        summaries = [{"doc_id": doc.doc_id, "summary": DocumentSummaryIndex.from_documents(docs).get_document_summary(doc.doc_id)} for doc in docs]
        os.remove(file_path)
        return JSONResponse(content={"file_name": file.filename, "document_count": len(docs), "summaries": summaries})
    except Exception as e:
        logging.error(f"Error processing file upload: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)