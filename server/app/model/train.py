# dataset : https://www.kaggle.com/datasets/mohammadamireshraghi/blood-cell-cancer-all-4class

import json
from sklearn.metrics import classification_report
import os
from pathlib import Path
import tensorflow as tf
from tensorflow.keras.layers import Dense, Flatten
from tensorflow.keras.models import Model
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
from glob import glob 
import matplotlib.pyplot as plt 
from sklearn.utils import class_weight

IMAGE_SIZE = [224, 224]
trainingImages = "data/images/train"
testingImages = "data/images/test"
validationImages = "data/images/val"

myResNet = ResNet50(input_shape = IMAGE_SIZE + [3], weights="imagenet", include_top = False)
print(myResNet.summary())

# freeze the whole base for initial head training
myResNet.trainable = False


Classes = glob("data/images/train/*")
print(Classes)
numOfClasses = len(Classes) 

# building the model
poolingLayer = tf.keras.layers.GlobalAveragePooling2D()(myResNet.output)
predictionLayer = Dense(numOfClasses, activation='softmax')(poolingLayer)

model = Model(inputs=myResNet.input, outputs=predictionLayer)
print(model.summary())

model.compile(loss = 'categorical_crossentropy', optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4), metrics=['accuracy'])

#data augmentation
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    shear_range=0.15,
    zoom_range=0.15,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    brightness_range=[0.9, 1.1],
    fill_mode='nearest'
) 

test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

training_set = train_datagen.flow_from_directory(trainingImages, target_size = (224, 224), batch_size = 32, class_mode = 'categorical')
test_set = test_datagen.flow_from_directory(
    testingImages,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    shuffle=False,
)

EPOCHS = 45

bestModelFile = 'server/app/model/blood_cancer_model_v2.h5'

from keras.callbacks import ModelCheckpoint, ReduceLROnPlateau, EarlyStopping

callbacks = [
    ModelCheckpoint(bestModelFile, verbose=1, save_best_only=True, monitor='val_accuracy'),
    ReduceLROnPlateau(monitor='val_accuracy', patience=10, factor=0.1, verbose=1, min_lr=1e-5),
    EarlyStopping(monitor='val_accuracy', patience=30, verbose=1),
]

y_train_labels = training_set.classes  # numeric labels from ImageDataGenerator
class_weights = class_weight.compute_class_weight('balanced', classes=np.unique(y_train_labels), y=y_train_labels)
class_weights = dict(enumerate(class_weights))

# train
r = model.fit(
   training_set, 
   validation_data = test_set, 
   epochs = EPOCHS, 
   steps_per_epoch = len(training_set),
   validation_steps = len(test_set),
   callbacks = callbacks,
   class_weight=class_weights
)

# ---------- SAVE TRAINING HISTORY FOR LATER (e.g. React/Recharts) ----------
history = r.history
num_epochs = len(history["loss"])  # handles EarlyStopping (may be < EPOCHS)

history_data = []
for i in range(num_epochs):
    history_data.append({
        "epoch": i + 1,
        "train_loss": float(history["loss"][i]),
        "val_loss": float(history["val_loss"][i]),
        "train_acc": float(history["accuracy"][i]),
        "val_acc": float(history["val_accuracy"][i]),
    })

# Save to client/public/metrics for frontend access
metrics_dir = Path(__file__).parents[3] / "client" / "public" / "metrics"
metrics_dir.mkdir(parents=True, exist_ok=True)

with open(metrics_dir / "training_history.json", "w") as f:
    json.dump(history_data, f, indent=2)

print(f"Saved training history to {metrics_dir / 'training_history.json'}")

# ---------- LOAD BEST MODEL AND SAVE VALIDATION METRICS ----------
print("Loading best model for evaluation...")
best_model = tf.keras.models.load_model(bestModelFile)

# reset generator so predictions line up with test_set.classes
test_set.reset()
y_true = test_set.classes

# predict over the whole validation set
preds = best_model.predict(test_set, steps=len(test_set))
y_pred = np.argmax(preds, axis=1)

# map indices back to class names
idx_to_class = {v: k for k, v in test_set.class_indices.items()}
target_names = [idx_to_class[i] for i in range(len(idx_to_class))]

report = classification_report(
    y_true,
    y_pred,
    target_names=target_names,
    output_dict=True,
)

summary = {
    "accuracy": float(report["accuracy"]),
    "macro_f1": float(report["macro avg"]["f1-score"]),
    "weighted_f1": float(report["weighted avg"]["f1-score"]),
}

with open(metrics_dir / "validation_report.json", "w") as f:
    json.dump(report, f, indent=2)

with open(metrics_dir / "validation_summary.json", "w") as f:
    json.dump(summary, f, indent=2)

print(f"Saved detailed report to {metrics_dir / 'validation_report.json'}")
print(f"Saved summary metrics to {metrics_dir / 'validation_summary.json'}")

# print the best validation accuracy
best_val_acc = max(r.history['val_accuracy'])
print(f"Best Validation Accuracy : {best_val_acc}")


# plot the results 
plt.plot(r.history['accuracy'], label="Training Accuracy")
plt.plot(r.history['val_accuracy'], label="Validation Accuracy")
plt.legend()
plt.show()

plt.plot(r.history['loss'], label="Training Loss")
plt.plot(r.history['val_loss'], label="Validation Loss")
plt.legend()
plt.show()