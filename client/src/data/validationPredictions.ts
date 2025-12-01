// client/src/data/validationPredictions.ts

export interface ValidationPrediction {
  image_path: string;
  true_label: string;
  predicted_label: string;
  confidence: number;
  is_correct: boolean;
}

export interface ValidationPredictionsSummary {
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface ValidationPredictionsData {
  predictions: ValidationPrediction[];
  summary: ValidationPredictionsSummary;
}

// Use environment variable if set, otherwise use relative URL (works with nginx proxy)
// Fallback to localhost:8000 for local development if no env var is set
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");

/**
 * Fetch all validation predictions from the API.
 */
export async function fetchValidationPredictions(): Promise<ValidationPredictionsData> {
  const response = await fetch(`${API_URL}/api/validation-predictions`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch validation predictions: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch validation prediction for a specific image path.
 */
export async function fetchValidationPredictionByPath(
  imagePath: string
): Promise<ValidationPrediction> {
  // URL encode the path to handle special characters
  const encodedPath = encodeURIComponent(imagePath);
  const response = await fetch(`${API_URL}/api/validation-predictions/${encodedPath}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch validation prediction: ${response.statusText}`);
  }
  
  return response.json();
}

