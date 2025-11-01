// src/api/predict.ts
export async function predictImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
  
    const res = await fetch(import.meta.env.VITE_API_URL + "/predict", {
      method: "POST",
      body: formData,
    });
  
    if (!res.ok) {
      throw new Error("Prediction failed");
    }
  
    return res.json();
  }
  