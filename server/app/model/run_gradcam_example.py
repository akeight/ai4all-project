# server/app/model/run_gradcam_example.py
from pathlib import Path
import random
from .gradcam import (
    load_model,
    load_and_preprocess_image,
    make_gradcam_heatmap,
    overlay_heatmap,
)

ROOT = Path(__file__).parents[3]
TEST_DIR = ROOT / "data" / "images" / "test"
OUTPUT_ROOT = ROOT / "docs" / "gradcam"


def slugify(name: str) -> str:
    # turn "[Malignant] Pre-B" into something file-system friendly
    return "".join(ch.lower() if ch.isalnum() else "_" for ch in name).strip("_")


def main():
    model = load_model()

    if not TEST_DIR.exists():
        raise FileNotFoundError(f"Test directory not found: {TEST_DIR}")

    class_dirs = [d for d in TEST_DIR.iterdir() if d.is_dir()]
    if not class_dirs:
        raise FileNotFoundError(f"No class folders found under {TEST_DIR}")

    print(f"Found class folders: {[d.name for d in class_dirs]}")

    for class_dir in class_dirs:
        class_name = class_dir.name
        class_slug = slugify(class_name)

        # Collect all png/jpg images in this class folder
        image_files = list(class_dir.glob("*.png")) + list(class_dir.glob("*.jpg"))
        if not image_files:
            print(f"No images found in {class_dir}, skipping.")
            continue

        # Sample up to 10 random images
        n_samples = min(10, len(image_files))
        sampled_images = random.sample(image_files, k=n_samples)

        # Output folder per class
        out_dir = OUTPUT_ROOT / class_slug
        out_dir.mkdir(parents=True, exist_ok=True)

        print(f"\nClass '{class_name}' → generating {n_samples} Grad-CAM images...")
        for idx, img_path in enumerate(sampled_images, start=1):
            print(f"  [{class_name}] ({idx}/{n_samples}) {img_path.name}")
            original_img, img_array = load_and_preprocess_image(str(img_path))

            heatmap = make_gradcam_heatmap(img_array, model)
            superimposed = overlay_heatmap(heatmap, original_img, alpha=0.45)

            out_file = out_dir / f"{class_slug}_{idx}.png"
            superimposed.save(out_file)

        print(f"  Saved to {out_dir}")

    print(f"\nDone. Grad-CAM images are in: {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()


