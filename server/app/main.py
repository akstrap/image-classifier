# server/app/main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from .model import predict
from .utils import read_imagefile, resize_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict")
async def predict_api(file: UploadFile = File(...)):
    image_data = await file.read()
    image = read_imagefile(image_data)
    resized = resize_image(image)
    result = predict(resized)
    return result
