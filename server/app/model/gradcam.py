# server/app/model/gradcam.py
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow import keras
import matplotlib.cm as cm
from tensorflow.keras.applications.resnet50 import preprocess_input

ROOT = Path(__file__).parents[3]
MODEL_PATH = Path(__file__).with_name("blood_cancer_model_v2.h5")
LAST_CONV_LAYER_NAME = "conv5_block3_out" 


def load_model():
    print(f"Loading model from {MODEL_PATH}")
    import tensorflow as tf
    import inspect
    
    # Handle TensorFlow version compatibility
    # The model was saved with an older format that uses 'batch_shape' in InputLayer
    # TensorFlow 2.16+ requires safe_mode=False to load such models
    try:
        # Check if safe_mode parameter exists (TensorFlow 2.16+)
        sig = inspect.signature(keras.models.load_model)
        if 'safe_mode' in sig.parameters:
            # TensorFlow 2.16+ - disable safe mode to load older models
            print("Using safe_mode=False for TensorFlow 2.16+ compatibility")
            return keras.models.load_model(str(MODEL_PATH), compile=False, safe_mode=False)
        else:
            # Older TensorFlow versions - try standard load
            print("Using standard load_model for older TensorFlow version")
            return keras.models.load_model(str(MODEL_PATH), compile=False)
    except Exception as e:
        print(f"Error loading model with standard method: {e}")
        # Try with tf.keras directly as fallback
        try:
            print("Trying tf.keras.models.load_model as fallback")
            return tf.keras.models.load_model(str(MODEL_PATH), compile=False)
        except Exception as e2:
            print(f"All loading methods failed: {e2}")
            raise RuntimeError(f"Failed to load model: {e2}. The model may have been saved with an incompatible TensorFlow version.") from e2

def load_and_preprocess_image(img_path: str, img_size=(224, 224)):
    """
    Load an image from disk and preprocess it for the model.
    Adjust img_size / preprocess_input to match your training pipeline.
    """
    img = keras.utils.load_img(img_path, target_size=img_size)
    img_array = keras.utils.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)  # or img_array / 255.0 if that's what you used
    return img, img_array


def make_gradcam_heatmap(
    img_array: np.ndarray,
    model: keras.Model,
    last_conv_layer_name: str = LAST_CONV_LAYER_NAME,
    pred_index: int | None = None,
) -> np.ndarray:

    """
    Build a Grad-CAM heatmap for a single image batch (shape (1, H, W, 3)).
    """
    # Model that returns last conv layer output and predictions
    last_conv_layer = model.get_layer(LAST_CONV_LAYER_NAME)
    grad_model = keras.models.Model(
        inputs=model.inputs,
        outputs=[last_conv_layer.output, model.output],
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(predictions[0])
        class_channel = predictions[:, pred_index]

    # Gradient of the target class wrt last conv layer
    grads = tape.gradient(class_channel, conv_outputs)

    # Global average pooling over H, W
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]  # (H, W, C)
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # ReLU and normalize to [0, 1]
    heatmap = tf.maximum(heatmap, 0)
    max_val = tf.reduce_max(heatmap)
    if max_val > 0:
        heatmap /= max_val

    return heatmap.numpy()


# gradcam.py
def overlay_heatmap(heatmap, image, alpha: float = 0.4):
    heatmap_uint8 = np.uint8(255 * heatmap)
    colormap = cm.get_cmap("jet")
    colormap_colors = colormap(np.arange(256))[:, :3]
    colored_heatmap = colormap_colors[heatmap_uint8]

    colored_heatmap = keras.utils.array_to_img(colored_heatmap)
    colored_heatmap = colored_heatmap.resize(image.size)
    colored_heatmap = keras.utils.img_to_array(colored_heatmap)

    image_array = keras.utils.img_to_array(image)
    superimposed = colored_heatmap * alpha + image_array

    # just return the PIL image
    return keras.utils.array_to_img(superimposed)

