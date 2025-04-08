# server/app/utils.py
from PIL import Image
import numpy as np
from io import BytesIO


def read_imagefile(file) -> Image.Image:
    image = Image.open(BytesIO(file)).convert("RGB")
    return image


def resize_image(image: Image.Image) -> np.ndarray:
    image = image.resize((224, 224))  # for MobileNetV2
    return np.array(image)
