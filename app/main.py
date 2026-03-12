import os
import fitz # PyMuPDF
import zipfile
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uuid
from typing import List

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.get("/")
async def read_index():
    return FileResponse("static/index.html")

@app.post("/split")
async def split_pdf(
    file: UploadFile = File(...),
    partitions: str = Form(...) # Format: "1-5,6-10,11-"
):
    """
    Partitions: "1-5, 6-10" means two splits.
    "1-5, 6-" means one split from 1-5 and another from 6 to end.
    """
    job_id = str(uuid.uuid4())
    job_dir = os.path.join(UPLOAD_DIR, job_id)
    os.makedirs(job_dir)
    
    input_path = os.path.join(job_dir, "input.pdf")
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        doc = fitz.open(input_path)
        total_pages = doc.page_count
        
        partition_list = [p.strip() for p in partitions.split(",")]
        output_files = []
        
        for idx, part in enumerate(partition_list):
            if "-" not in part:
                # Single page split? Or invalid?
                continue
            
            start_str, end_str = part.split("-")
            start = int(start_str) - 1 if start_str else 0
            end = int(end_str) if end_str else total_pages
            
            if start < 0: start = 0
            if end > total_pages: end = total_pages
            
            if start >= end:
                continue
                
            new_doc = fitz.open()
            new_doc.insert_pdf(doc, from_page=start, to_page=end-1)
            
            out_filename = f"part_{idx+1}.pdf"
            out_path = os.path.join(job_dir, out_filename)
            new_doc.save(out_path)
            new_doc.close()
            output_files.append(out_path)
            
        doc.close()
        
        if not output_files:
            raise HTTPException(status_code=400, detail="No valid partitions created")
            
        zip_path = os.path.join(UPLOAD_DIR, f"{job_id}.zip")
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for f in output_files:
                zipf.write(f, os.path.basename(f))
                
        # Clean up job dir
        shutil.rmtree(job_dir)
        
        return JSONResponse({"zip_url": f"/download/{job_id}"})
        
    except Exception as e:
        if os.path.exists(job_dir):
            shutil.rmtree(job_dir)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{job_id}")
async def download_zip(job_id: str):
    zip_path = os.path.join(UPLOAD_DIR, f"{job_id}.zip")
    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(zip_path, media_type="application/zip", filename="split_pdfs.zip")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
