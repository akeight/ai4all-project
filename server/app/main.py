from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import json
import os
from pathlib import Path
import numpy as np
from io import BytesIO
from PIL import Image
import base64
from app.model.gradcam import load_model, make_gradcam_heatmap, overlay_heatmap
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow import keras

app = FastAPI()

# CORS configuration: Get allowed origins from environment variable
# For local dev, defaults to localhost. For production, set ALLOWED_ORIGINS env var
# Example: ALLOWED_ORIGINS="https://your-app.vercel.app,https://your-app.netlify.app"
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:80",
    "http://127.0.0.1:80",
]

# Get allowed origins from environment variable, or use defaults
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    # Split by comma and strip whitespace
    origins = [origin.strip() for origin in allowed_origins_env.split(",")]
    # Always include localhost for local development
    origins.extend(default_origins)
else:
    origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "FastAPI up"}


# Class label mapping (from model output indices to display names)
CLASS_LABELS = {
    0: "Benign",
    1: "[Malignant] Pre-B",
    2: "[Malignant] Pro-B",
    3: "[Malignant] early Pre-B",
}

# Normalized class names for frontend
NORMALIZED_LABELS = {
    "Benign": "Benign",
    "[Malignant] Pre-B": "Malignant Pre-B",
    "[Malignant] Pro-B": "Malignant Pro-B",
    "[Malignant] early Pre-B": "Malignant Early Pre-B",
}

# Load model once at startup (lazy loading)
_model_cache = None

def get_model():
    """Get or load the model (cached)."""
    global _model_cache
    if _model_cache is None:
        try:
            _model_cache = load_model()
        except Exception as e:
            print(f"Failed to load model: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Model loading failed: {str(e)}. Please check the model file exists and TensorFlow version is compatible."
            )
    return _model_cache


def preprocess_image(image: Image.Image, img_size=(224, 224)):
    """Preprocess image for model inference."""
    # Resize
    image = image.resize(img_size)
    # Convert to array
    img_array = keras.utils.img_to_array(image)
    img_array = np.expand_dims(img_array, axis=0)
    # Preprocess (ResNet50 preprocessing)
    img_array = preprocess_input(img_array)
    return img_array


def image_to_base64(image: Image.Image, format: str = "PNG") -> str:
    """Convert PIL Image to base64 string."""
    buffered = BytesIO()
    image.save(buffered, format=format)
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/{format.lower()};base64,{img_str}"


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    return_cam: bool = Form(False),
    cam_layer: str = Form("layer4"),
    threshold: float = Form(0.5),
):
    """
    Real prediction endpoint:
    - takes an image
    - runs model inference
    - optionally generates grad-cam overlay
    - returns predictions and grad-cam image
    """
    start = time.time()

    try:
        # Read and process image
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes))
        
        # Convert RGBA to RGB if needed
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Preprocess for model
        img_array = preprocess_image(image)
        
        # Load model and predict
        model = get_model()
        predictions = model.predict(img_array, verbose=0)
        
        # Get top-k predictions
        pred_indices = np.argsort(predictions[0])[::-1]  # Sort descending
        topk = []
        
        for idx in pred_indices:
            score = float(predictions[0][idx])
            class_name = CLASS_LABELS.get(idx, f"Class_{idx}")
            normalized_name = NORMALIZED_LABELS.get(class_name, class_name)
            
            topk.append({
                "label": normalized_name,
                "score": score,
            })
        
        # Apply threshold filter
        filtered = [p for p in topk if p["score"] >= threshold]
        
        inference_ms = int((time.time() - start) * 1000)
        
        # Generate Grad-CAM if requested
        cam_b64 = None
        if return_cam:
            try:
                # Get predicted class index
                pred_idx = pred_indices[0]
                
                # Generate heatmap
                heatmap = make_gradcam_heatmap(img_array, model, pred_index=pred_idx)
                
                # Create overlay
                superimposed = overlay_heatmap(heatmap, image, alpha=0.45)
                
                # Convert to base64
                cam_b64 = image_to_base64(superimposed, "PNG")
            except Exception as e:
                print(f"Error generating Grad-CAM: {e}")
                cam_b64 = None
        
        # Shape response
        result = {
            "topk": filtered if filtered else topk,  # don't send empty
            "inference_ms": inference_ms,
            "cam_url": cam_b64,  # base64 encoded image
            "cam_b64": cam_b64,  # also include for compatibility
            "meta": {
                "cam_layer": cam_layer,
                "threshold": threshold,
                "filename": file.filename,
            },
        }
        
        return JSONResponse(result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


# Path to validation predictions JSON
ROOT = Path(__file__).parents[1]
# Check paths in order: Cloud Run in-memory (/tmp), Docker mount, local dev
VALIDATION_PREDICTIONS_FILE = (
    Path("/tmp/metrics/validation_predictions.json")  # Cloud Run in-memory filesystem
    if Path("/tmp/metrics/validation_predictions.json").exists()
    else Path("/app/metrics/validation_predictions.json")  # Docker mount
    if Path("/app/metrics/validation_predictions.json").exists()
    else ROOT.parent / "client" / "public" / "metrics" / "validation_predictions.json"  # Local dev
)
SAMPLE_IMAGES_METADATA = (
    Path("/tmp/samples/samples_metadata.json")  # Cloud Run in-memory filesystem
    if Path("/tmp/samples/samples_metadata.json").exists()
    else Path("/app/samples/samples_metadata.json")  # Docker mount
    if Path("/app/samples/samples_metadata.json").exists()
    else ROOT.parent / "client" / "public" / "samples" / "samples_metadata.json"  # Local dev
)


@app.get("/api/validation-predictions")
async def get_validation_predictions():
    """
    Get all validation predictions.
    Returns the full validation_predictions.json file.
    """
    if not VALIDATION_PREDICTIONS_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="Validation predictions not found. Run generate_validation_predictions.py first."
        )
    
    try:
        with open(VALIDATION_PREDICTIONS_FILE, "r") as f:
            data = json.load(f)
        return JSONResponse(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading validation predictions: {str(e)}")


@app.get("/api/validation-predictions/{image_path:path}")
async def get_validation_prediction_by_path(image_path: str):
    """
    Get validation prediction for a specific image path.
    """
    if not VALIDATION_PREDICTIONS_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="Validation predictions not found. Run generate_validation_predictions.py first."
        )
    
    try:
        with open(VALIDATION_PREDICTIONS_FILE, "r") as f:
            data = json.load(f)
        
        # Find prediction matching the image path
        for pred in data.get("predictions", []):
            if pred.get("image_path") == image_path:
                return JSONResponse(pred)
        
        raise HTTPException(status_code=404, detail=f"Prediction not found for image: {image_path}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading validation predictions: {str(e)}")


@app.get("/api/sample-images")
async def get_sample_images():
    """
    Get sample images for the Explore page.
    Returns images in format compatible with ImageGrid component.
    """
    if not SAMPLE_IMAGES_METADATA.exists():
        raise HTTPException(
            status_code=404,
            detail="Sample images not found. Run generate_sample_gradcam.py first."
        )
    
    try:
        with open(SAMPLE_IMAGES_METADATA, "r") as f:
            data = json.load(f)
        
        # Transform to ImageGrid-compatible format: {id, thumb, true, pred, prob}
        samples = data.get("samples", [])
        formatted_samples = [
            {
                "id": sample["id"],
                "thumb": sample["thumb"],
                "true": sample["true"],
                "pred": sample["pred"],
                "prob": sample["prob"],
                "cam_overlay": sample.get("cam_overlay"),  # Include for DetailDrawer
            }
            for sample in samples
        ]
        
        return JSONResponse(formatted_samples)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading sample images: {str(e)}")
