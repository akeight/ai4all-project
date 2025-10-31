import torch
from torchvision import models, transforms, datasets
from torch.utils.data import DataLoader, random_split
from torch import nn, optim

# resize images
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# load full data
full_dataset = datasets.ImageFolder('data/images', transform=transform)
