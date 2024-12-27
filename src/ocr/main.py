from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services.ocr_service import OCRService
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
ocr_service = OCRService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8010"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ocr")
async def process_image(file: UploadFile = File(...)):
    try:
        logger.info(f"Processing image: {file.filename}")
        contents = await file.read()
        result = await ocr_service.process_image(contents)
        
        logger.info(f"Successfully processed image with {result['regions']} text regions")
        return {
            "success": True,
            "image": result["image"],
            "regions": result["regions"]
        }
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)