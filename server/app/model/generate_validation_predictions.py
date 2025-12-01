# server/app/model/generate_validation_predictions.py
"""
Generate per-image validation predictions for all validation set images.
Run this script after training to create validation_predictions.json.
"""
import json
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Paths
SERVER_ROOT = Path(__file__).parents[2]  # Points to server/
PROJECT_ROOT = Path(__file__).parents[3]  # Points to project root
MODEL_PATH = Path(__file__).with_name("blood_cancer_model_v2.h5")
VAL_IMAGES_DIR = SERVER_ROOT / "data" / "images" / "val"
OUTPUT_FILE = PROJECT_ROOT / "client" / "public" / "metrics" / "validation_predictions.json"

IMAGE_SIZE = (224, 224)


def load_model():
    """Load the trained model."""
    print(f"Loading model from {MODEL_PATH}")
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    return keras.models.load_model(MODEL_PATH, compile=False)


def get_class_mapping(generator):
    """Get mapping from class indices to class names."""
    idx_to_class = {v: k for k, v in generator.class_indices.items()}
    return idx_to_class


def normalize_class_name(class_name: str) -> str:
    """Normalize class names to match frontend expectations."""
    # Map training class names to display names
    mapping = {
        "[Malignant] early Pre-B": "Malignant Early Pre-B",
        "[Malignant] Pre-B": "Malignant Pre-B",
        "[Malignant] Pro-B": "Malignant Pro-B",
        "Benign": "Benign",
    }
    return mapping.get(class_name, class_name)


def generate_validation_predictions():
    """Generate predictions for all validation images."""
    print("Starting validation predictions generation...")
    
    # Load model
    model = load_model()
    
    # Create data generator for validation set
    val_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
    val_generator = val_datagen.flow_from_directory(
        str(VAL_IMAGES_DIR),
        target_size=IMAGE_SIZE,
        batch_size=32,
        class_mode='categorical',
        shuffle=False,  # Important: don't shuffle so we can match predictions to files
    )
    
    # Get class mapping
    idx_to_class = get_class_mapping(val_generator)
    num_classes = len(idx_to_class)
    
    print(f"Found {num_classes} classes: {list(idx_to_class.values())}")
    print(f"Total validation images: {val_generator.samples}")
    
    # Reset generator to ensure consistent ordering
    val_generator.reset()
    
    # Get true labels
    y_true = val_generator.classes
    
    # Get all file paths in order
    file_paths = val_generator.filepaths
    
    # Predict on all validation images
    print("Running predictions...")
    predictions = model.predict(val_generator, steps=len(val_generator), verbose=1)
    
    # Process predictions
    results = []
    correct_count = 0
    total_count = len(file_paths)
    
    for i, (file_path, true_idx) in enumerate(zip(file_paths, y_true)):
        # Get prediction
        pred_probs = predictions[i]
        pred_idx = np.argmax(pred_probs)
        confidence = float(pred_probs[pred_idx])
        
        # Get class names
        true_label = idx_to_class[true_idx]
        predicted_label = idx_to_class[pred_idx]
        
        # Normalize class names
        true_label_normalized = normalize_class_name(true_label)
        predicted_label_normalized = normalize_class_name(predicted_label)
        
        # Check if correct (convert numpy bool to Python bool)
        is_correct = bool(true_idx == pred_idx)
        if is_correct:
            correct_count += 1
        
        # Create relative path from project root
        rel_path = str(Path(file_path).relative_to(PROJECT_ROOT))
        
        results.append({
            "image_path": rel_path,
            "true_label": true_label_normalized,
            "predicted_label": predicted_label_normalized,
            "confidence": confidence,
            "is_correct": is_correct,
        })
    
    # Create summary
    summary = {
        "total": total_count,
        "correct": correct_count,
        "incorrect": total_count - correct_count,
        "accuracy": float(correct_count / total_count) if total_count > 0 else 0.0,
    }
    
    # Create output structure
    output = {
        "predictions": results,
        "summary": summary,
    }
    
    # Save to JSON
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nCompleted! Generated predictions for {total_count} images.")
    print(f"Accuracy: {summary['accuracy']:.4f} ({correct_count}/{total_count})")
    print(f"Saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_validation_predictions()

