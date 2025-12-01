// src/api/predict.ts
import type { PredictionResult } from "@/mocks/api";

// Use environment variable if set, otherwise use relative URL (works with nginx proxy)
// For local dev: set VITE_API_URL=http://localhost:8000 in .env.local
// For Docker: use relative URLs (nginx proxies to backend)
// Fallback to localhost:8000 for local development if no env var is set
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");

export interface PredictOptions {
  return_cam: boolean;
  cam_layer: string;
  threshold: number;
}

export async function predictImage(
  file: File,
  options: PredictOptions
): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("return_cam", String(options.return_cam));
  formData.append("cam_layer", options.cam_layer);
  formData.append("threshold", String(options.threshold));

  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = "Prediction failed";
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = `Prediction failed: ${res.status} ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  
  // Transform backend response to match frontend PredictionResult interface
  return {
    topk: data.topk.map((item: { label: string; score: number }) => ({
      label: item.label,
      prob: item.score,
    })),
    cam_b64: data.cam_url || data.cam_b64 || "",
    inference_ms: data.inference_ms || 0,
  };
}

/**
 * Fetch sample images for the Explore page.
 */
export async function fetchSampleImages(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/sample-images`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch sample images: ${res.statusText}`);
  }
  
  return res.json();
}