# dataset : https://www.kaggle.com/datasets/mohammadamireshraghi/blood-cell-cancer-all-4class

import tensorflow as tf
from tensorflow.keras.layers import Dense, Flatten
from tensorflow.keras.models import Model
from tensorflow.keras.applications.resnet50 import ResNet50 
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

# freeze the weights 
myResNet.trainable = True
for layer in myResNet.layers[:-10]:
    layer.trainable = False


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
    rescale = 1./255,
    shear_range = 0.2, 
    zoom_range = 0.2, 
    rotation_range = 20, 
    width_shift_range = 0.2,
    height_shift_range = 0.2,
    horizontal_flip = True,
    vertical_flip=True,
    brightness_range=[0.8, 1.2]
) 

test_datagen = ImageDataGenerator(rescale = 1./255)

training_set = train_datagen.flow_from_directory(trainingImages, target_size = (224, 224), batch_size = 32, class_mode = 'categorical')
test_set = test_datagen.flow_from_directory(testingImages,  target_size = (224, 224), batch_size = 32, class_mode = 'categorical')

EPOCHS = 50

bestModelFile = 'blood_cancer_model.h5'

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