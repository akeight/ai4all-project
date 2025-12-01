<!-- d438fb98-5a35-4f32-97e6-4fcf15c26b3e c10d5ee9-8fa2-4392-83da-37e84c66cc89 -->
# Blood Cancer ML Project Enhancement Plan

## Overview

This plan implements per-image validation predictions, frontend integration, sample image gallery with grad-cam overlays, a working demo upload feature, and Docker deployment setup.

## Implementation Steps

### 1. Add Per-Image Validation Predictions to Metrics

**Backend Script: `server/app/model/generate_validation_predictions.py`**

- Load trained model from `blood_cancer_model_v2.h5`
- Iterate through all validation images in `data/images/val/`
- For each image:
  - Get model prediction (class + confidence)
  - Extract true label from directory structure
  - Store: `{image_path, true_label, predicted_label, confidence, is_correct}`
- Save to `metrics/validation_predictions.json` with structure:
  ```json
  {
    "predictions": [
      {
        "image_path": "relative/path/to/image.jpg",
        "true_label": "Benign",
        "predicted_label": "Benign", 
        "confidence": 0.978,
        "is_correct": true
      }
    ],
    "summary": { "total": 372, "correct": 364, ... }
  }
  ```


**Files to modify:**

- Create: `server/app/model/generate_validation_predictions.py`
- Update: `server/requirements.txt` (ensure tensorflow, numpy, pillow are listed)

### 2. Sync Validation Predictions to Frontend

**Backend API Endpoint: `server/app/main.py`**

- Add `/api/validation-predictions` GET endpoint
- Read and return `metrics/validation_predictions.json`
- Add `/api/validation-predictions/{image_path}` for individual image data

**Frontend Data Layer: `client/src/data/validationPredictions.ts`**

- Create TypeScript types matching the JSON structure
- Add function to fetch validation predictions from API
- Export typed data for use in components

**Files to modify:**

- Update: `server/app/main.py` (add endpoints)
- Create: `client/src/data/validationPredictions.ts`
- Update: `client/src/api/predict.ts` (add validation predictions fetch)

### 3. Add 10 Sample Images Per Class with Grad-CAM Overlays

**Backend Script: `server/app/model/generate_sample_gradcam.py`**

- Extend/modify `run_gradcam_example.py` logic
- Select 10 images per class from validation set (`data/images/val/`)
- Generate grad-cam overlays for each (using existing `gradcam.py` functions)
- Save both original images and grad-cam overlays to `public/samples/` directory structure:
  ```
  public/samples/
    Benign/
      original_1.jpg, gradcam_1.png
      ...
    [Malignant] Pre-B/
      ...
  ```


**Frontend Component Updates:**

- Update `client/src/pages/Interpret.tsx` or create new `SampleGallery.tsx`
- Display 10 images per class in grid layout
- Show grad-cam overlay with opacity slider (reuse existing slider component)
- Load images from `/samples/` directory

**Files to modify:**

- Create: `server/app/model/generate_sample_gradcam.py`
- Update: `client/src/pages/Interpret.tsx` or create `client/src/components/SampleGallery.tsx`
- Update: `client/vite.config.ts` (ensure public assets are served)

### 4. Implement Working Demo Upload Feature

**Backend: `server/app/main.py`**

- Update `/predict` endpoint to:
  - Load actual model (`blood_cancer_model_v2.h5`)
  - Preprocess uploaded image (match training preprocessing)
  - Run inference to get predictions (top-k with confidence scores)
  - Generate grad-cam overlay if `return_cam=true`
  - Return base64-encoded grad-cam image
  - Map class indices to readable labels (Benign, [Malignant] Pre-B, etc.)

**Frontend: `client/src/pages/Demo.tsx`**

- Update `handlePredict` to call real API instead of `mockAPI`
- Update `client/src/api/predict.ts` to implement actual fetch to `/predict`
- Ensure file upload uses FormData correctly
- Display predictions and grad-cam overlay with opacity slider

**Files to modify:**

- Update: `server/app/main.py` (implement real model inference)
- Update: `client/src/api/predict.ts` (implement real API call)
- Update: `client/src/pages/Demo.tsx` (use real API)
- Update: `server/requirements.txt` (ensure all ML dependencies)

### 5. Docker Deployment Setup

**Backend Dockerfile: `server/Dockerfile`**

- Base: `python:3.11-slim`
- Install system dependencies (if needed for image processing)
- Copy `requirements.txt` and install Python dependencies
- Copy model file (`blood_cancer_model_v2.h5`)
- Copy application code
- Expose port 8000
- CMD: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

**Frontend Dockerfile: `client/Dockerfile`**

- Base: `node:18-alpine`
- Build stage: install dependencies, build with Vite
- Production stage: serve with nginx or similar
- Copy built assets
- Expose port 80 (or 4173 for preview)

**Docker Compose: `docker-compose.yml` (root)**

- Define `backend` service (FastAPI)
- Define `frontend` service (React/Vite)
- Set up networking between services
- Configure environment variables
- Mount volumes for development (optional)

**Files to create:**

- `server/Dockerfile`
- `client/Dockerfile`
- `docker-compose.yml` (root)
- `.dockerignore` files for both client and server

**Files to update:**

- `server/requirements.txt` (ensure complete dependency list)
- `client/package.json` (verify build scripts)
- Add deployment documentation to `README.md`

## Dependencies and Considerations

- Model file size: `blood_cancer_model_v2.h5` needs to be included in Docker image
- Image preprocessing: Must match training pipeline (ResNet50 preprocess_input)
- Class label mapping: Ensure consistent mapping between model output and display labels
- CORS: Already configured in FastAPI, verify for production
- Environment variables: API URL configuration for frontend
- Build optimization: Consider multi-stage Docker builds to reduce image size

## Testing Checklist

- [ ] Validation predictions script generates correct JSON
- [ ] API endpoints return validation predictions correctly
- [ ] Frontend displays validation prediction data
- [ ] Sample images with grad-cam display correctly
- [ ] Opacity slider works for grad-cam overlays
- [ ] Demo upload makes real predictions
- [ ] Grad-cam generation works for uploaded images
- [ ] Docker containers build successfully
- [ ] Docker compose starts both services
- [ ] Frontend can communicate with backend in Docker

### To-dos

- [ ] Create generate_validation_predictions.py script to generate per-image predictions for all validation images
- [ ] Add /api/validation-predictions endpoints to FastAPI main.py
- [ ] Create validationPredictions.ts data layer and integrate with frontend components
- [ ] Create generate_sample_gradcam.py to generate 10 sample images per class with grad-cam overlays
- [ ] Create/update frontend component to display sample images with grad-cam overlay and opacity slider
- [ ] Implement real model inference in /predict endpoint with grad-cam generation
- [ ] Update Demo.tsx and predict.ts to use real API instead of mocks
- [ ] Create Dockerfile for FastAPI backend with model and dependencies
- [ ] Create Dockerfile for React/Vite frontend with production build
- [ ] Create docker-compose.yml to orchestrate both services with networking