from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

app = FastAPI()

# allow Vite (default 5173) and maybe 4173
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

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


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    return_cam: bool = Form(False),
    cam_layer: str = Form("layer4"),
    threshold: float = Form(0.5),
):
    """
    This endpoint matches your React/Vite upload page:
    - takes an image
    - takes the extra form fields your UI is sending
    - returns a 'PredictionResult'-like object
    """

    # --- 1) read the file (right now we just consume it) ---
    image_bytes = await file.read()
    # if you do real ML later, you'd convert image_bytes -> PIL -> tensor here

    # --- 2) fake inference to show the shape ---
    start = time.time()

    # pretend model output
    topk = [
        {"label": "ALL_1", "score": 0.82},
        {"label": "ALL_2", "score": 0.10},
        {"label": "ALL_3", "score": 0.05},
        {"label": "ALL_4", "score": 0.03},
    ]

    # apply threshold on the backend if you want
    filtered = [p for p in topk if p["score"] >= threshold]

    inference_ms = int((time.time() - start) * 1000)

    # --- 3) CAM placeholder ---
    cam_url = None
    if return_cam:
        # in a real setup you'd generate and serve a real Grad-CAM image
        # for now, just send a placeholder
        cam_url = "https://placehold.co/600x400/ff0000/ffffff?text=GradCAM"

    # --- 4) shape the JSON like your frontend uses ---
    result = {
        "topk": filtered if filtered else topk,  # don't send empty
        "inference_ms": inference_ms,
        "cam_url": cam_url,
        "meta": {
            "cam_layer": cam_layer,
            "threshold": threshold,
            "filename": file.filename,
        },
    }

    return JSONResponse(result)
