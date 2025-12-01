# server/app/model/generate_sample_gradcam.py
"""
Generate 10 sample images per class from validation set with grad-cam overlays.
Saves images to client/public/samples/ for frontend display.
"""
import json
import random
import sys
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Handle imports for both module and script execution
try:
    from .gradcam import load_model, load_and_preprocess_image, make_gradcam_heatmap, overlay_heatmap
except ImportError:
    # If running as a script, add parent directory to path
    sys.path.insert(0, str(Path(__file__).parent.parent.parent))
    from app.model.gradcam import load_model, load_and_preprocess_image, make_gradcam_heatmap, overlay_heatmap

# Paths
SERVER_ROOT = Path(__file__).parents[2]  # Points to server/
PROJECT_ROOT = Path(__file__).parents[3]  # Points to project root
MODEL_PATH = Path(__file__).with_name("blood_cancer_model_v2.h5")
VAL_IMAGES_DIR = SERVER_ROOT / "data" / "images" / "val"
OUTPUT_DIR = PROJECT_ROOT / "client" / "public" / "samples"
METADATA_FILE = OUTPUT_DIR / "samples_metadata.json"

IMAGE_SIZE = (224, 224)
SAMPLES_PER_CLASS = 10


def normalize_class_name(class_name: str) -> str:
    """Normalize class names to match frontend expectations."""
    mapping = {
        "[Malignant] early Pre-B": "Malignant Early Pre-B",
        "[Malignant] Pre-B": "Malignant Pre-B",
        "[Malignant] Pro-B": "Malignant Pro-B",
        "Benign": "Benign",
    }
    return mapping.get(class_name, class_name)


def slugify(name: str) -> str:
    """Turn class name into file-system friendly slug."""
    return "".join(ch.lower() if ch.isalnum() else "_" for ch in name).strip("_")


def get_class_mapping(generator):
    """Get mapping from class indices to class names."""
    idx_to_class = {v: k for k, v in generator.class_indices.items()}
    return idx_to_class


def generate_sample_gradcam():
    """Generate 10 sample images per class with grad-cam overlays."""
    print("Starting sample grad-cam generation...")
    
    # Load model
    model = load_model()
    
    # Create data generator for validation set
    val_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
    val_generator = val_datagen.flow_from_directory(
        str(VAL_IMAGES_DIR),
        target_size=IMAGE_SIZE,
        batch_size=1,
        class_mode='categorical',
        shuffle=False,
    )
    
    # Get class mapping
    idx_to_class = get_class_mapping(val_generator)
    class_to_idx = {v: k for k, v in val_generator.class_indices.items()}
    
    print(f"Found {len(idx_to_class)} classes: {list(idx_to_class.values())}")
    
    # Get all file paths and their classes
    val_generator.reset()
    file_paths = val_generator.filepaths
    y_true = val_generator.classes
    
    # Group images by class
    class_images = {}
    for file_path, true_idx in zip(file_paths, y_true):
        class_name = idx_to_class[true_idx]
        if class_name not in class_images:
            class_images[class_name] = []
        class_images[class_name].append((file_path, true_idx))
    
    # Generate samples
    samples = []
    
    for class_name, images in class_images.items():
        print(f"\nProcessing class: {class_name}")
        
        # Sample up to SAMPLES_PER_CLASS images
        n_samples = min(SAMPLES_PER_CLASS, len(images))
        sampled_images = random.sample(images, k=n_samples)
        
        # Create output directory for this class
        class_slug = slugify(class_name)
        class_output_dir = OUTPUT_DIR / class_slug
        class_output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"  Generating {n_samples} samples...")
        
        for idx, (img_path, true_idx) in enumerate(sampled_images, start=1):
            print(f"    [{idx}/{n_samples}] {Path(img_path).name}")
            
            try:
                # Load and preprocess image
                original_img, img_array = load_and_preprocess_image(str(img_path), IMAGE_SIZE)
                
                # Get prediction
                predictions = model.predict(img_array, verbose=0)
                pred_idx = np.argmax(predictions[0])
                confidence = float(predictions[0][pred_idx])
                predicted_class = idx_to_class[pred_idx]
                
                # Generate grad-cam heatmap
                heatmap = make_gradcam_heatmap(img_array, model, pred_index=pred_idx)
                
                # Create overlay
                superimposed = overlay_heatmap(heatmap, original_img, alpha=0.45)
                
                # Save original image copy
                original_filename = f"original_{idx}.jpg"
                original_output_path = class_output_dir / original_filename
                original_img.save(original_output_path, "JPEG", quality=95)
                
                # Save grad-cam overlay
                gradcam_filename = f"gradcam_{idx}.png"
                gradcam_output_path = class_output_dir / gradcam_filename
                superimposed.save(gradcam_output_path, "PNG")
                
                # Normalize class names
                true_label_normalized = normalize_class_name(class_name)
                predicted_label_normalized = normalize_class_name(predicted_class)
                
                # Create relative paths for frontend
                thumb_path = f"/samples/{class_slug}/{original_filename}"
                cam_overlay_path = f"/samples/{class_slug}/{gradcam_filename}"
                
                # Create sample entry
                sample_id = f"val_{class_slug}_{idx:03d}"
                rel_image_path = str(Path(img_path).relative_to(PROJECT_ROOT))
                
                samples.append({
                    "id": sample_id,
                    "thumb": thumb_path,
                    "cam_overlay": cam_overlay_path,
                    "true": true_label_normalized,
                    "pred": predicted_label_normalized,
                    "prob": confidence,
                    "image_path": rel_image_path,
                })
                
            except Exception as e:
                print(f"      Error processing {img_path}: {e}")
                continue
        
        print(f"  Saved to {class_output_dir}")
    
    # Save metadata
    metadata = {
        "samples": samples,
        "total_samples": len(samples),
        "samples_per_class": SAMPLES_PER_CLASS,
    }
    
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\nCompleted! Generated {len(samples)} sample images.")
    print(f"Metadata saved to {METADATA_FILE}")
    print(f"Images saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    generate_sample_gradcam()

