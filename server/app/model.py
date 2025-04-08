# server/app/model.py
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2, preprocess_input, decode_predictions
)
from tensorflow.keras.preprocessing import image

model = MobileNetV2(weights="imagenet")


def predict(img_array: np.ndarray):
    img_batch = np.expand_dims(img_array, axis=0)
    preprocessed = preprocess_input(img_batch)
    preds = model.predict(preprocessed)
    decoded = decode_predictions(preds, top=1)[0][0]
    return {
        "label": decoded[1],
        "confidence": float(decoded[2])
    }
