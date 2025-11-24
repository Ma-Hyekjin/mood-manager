import torch
import os
import glob
import torch.nn as nn
import torch.optim as optim
import numpy as np
import librosa
from torch.utils.data import Dataset, DataLoader
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
from audiomentations import Compose, AddGaussianNoise, AddBackgroundNoise, Shift, Gain

# ======= Preprocessing ========

# Hyperparameters
SAMPLE_RATE = 16000
TARGET_LENGTH = 16000 * 2    # 2 sec (change it when needed)
BATCH_SIZE = 8
NUM_LABELS = 3               # laughter, sigh, negative
EPOCHS = 10
LR = 1e-5
DATA_ROOT = "./dataset"
SAVE_PATH = "./saved_model"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Augmentation Definition (for training)
augment = Compose([
    AddGaussianNoise(min_amplitude=0.0001, max_amplitude=0.001, p=0.3),
    Shift(min_shift=-0.1, max_shift=0.1, p=0.4),
    Gain(min_gain_in_db=-6, max_gain_in_db=6, p=0.4)
])

def crop_or_pad(y, target_length=TARGET_LENGTH):
    """
    Wav2Vec2 입력 길이를 target_length로 통일
    - 길면: Random Crop
    - 짧으면: Random Padding (Front, Back)
    """
    length = len(y)

    # Case 1 : Crop
    if length > target_length:
        start = np.random.randint(0, length - target_length)
        y = y[start:start + target_length]

    # Case 2 : Padding
    elif length < target_length:
        pad_length = target_length - length
        pad_front = np.random.randint(0, pad_length + 1)
        pad_back = pad_length - pad_front
        y = np.pad(y, (pad_front, pad_back), mode='constant')
    
    return y.astype(np.float32)

class AudioDataset(Dataset):
    def __init__(self, file_paths, labels, is_train=True):
        """
        Args:
            file_paths (list): audio file path
            labels (list): int label list
            is_train (bool): Augmentation 적용 유무 
        """
        self.file_paths = file_paths
        self.labels = labels
        self.is_train = is_train

        # Wav2Vec2 Feature Extracter (normalization)
        self.processor = Wav2Vec2FeatureExtractor.from_pretrained("facebook/wav2vec2-base")

    def __len__(self):
        return len(self.file_paths)
    
    def __getitem__(self, idx):
        file_path = self.file_paths[idx]
        label = self.labels[idx]

        # 1. Audio load, sr 통일
        y, sr = librosa.load(file_path, sr=SAMPLE_RATE)

        # 2. Augmentation when it is train
        if self.is_train:
            y = augment(samples=y, sample_rate=SAMPLE_RATE)

        # 3. Crop or Pad
        y = crop_or_pad(y)

        # 4. Transfrom into Wav2Vec2 -> pt (pytorch tensor)
        inputs = self.processor(y, sampling_rate=SAMPLE_RATE, return_tensors="pt")

        # returns model input and label (정답 라벨)
        return {
            "input_values": inputs.input_values.squeeze(0),   # (1, seq_len) -> (seq_len)
            "labels": torch.tensor(label, dtype=torch.long) 
        }
    

def load_data_by_split(root_dir, split):
    """
    args:
        root_dir : 데이터셋 최상위 폴더 경로 ("./dataset")
        split : train/val/test
    """
    class_map = {
        "laughter" : 0,
        "sigh" : 1,
        "negative" : 2
    }

    file_paths = []
    labels = []

    split_dir = os.path.join(root_dir, split)

    if not os.path.exists(split_dir):
        print(f"Warning! There is no {split_dir}!")
        return [], []
    
    for class_name, label_idx in class_map.items():
        folder_path = os.path.join(split_dir, class_name)
        wav_files = glob.glob(os.path.join(folder_path, "*.wav"))

        file_paths.extend(wav_files)
        labels.extend([label_idx] * len(wav_files))

    print(f"  -> {len(file_paths)} File load completed")
    return file_paths, labels

# ======== Model Train/Eval Funcs ==========

# model load function
def get_model(pretrained_path=None):
    if pretrained_path:
        model = Wav2Vec2ForSequenceClassification.from_pretrained(pretrained_path)
    else:
        model = Wav2Vec2ForSequenceClassification.from_pretrained(
            "facebook/wav2vec2-base",
            num_labels = NUM_LABELS
        )

        # 학습된 모델의 설정을 따름
        model.freeze_feature_extractor()  # (Optional: 초반 레이어 고정하여 학습 속도 향상)
    return model.to(device)


def train_epoch(model, loader, criterion, optimizer):
    model.train()
    total_loss = 0
    for i, batch in enumerate(loader):
        input_values = batch['input_values'].to(device)
        labels = batch['labels'].to(device)

        outputs = model(input_values)
        loss = criterion(outputs.logits, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

        if i % 10 == 0:
            print(f"   Batch {i}/{len(loader)} | Loss: {loss.item():.4f}", end='\r')
    return total_loss / len(loader)

def evaluate(model, loader):
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for batch in loader:
            input_values = batch['input_values'].to(device)
            labels = batch['labels'].to(device)

            outputs = model(input_values)
            predictions = torch.argmax(outputs.logits, dim=-1)

            correct += (predictions == labels).sum().item()
            total += labels.size(0)
    return (correct / total) * 100 if total > 0 else 0

# =========== Main Controller ==========
def run_training():
    # 1. Data load
    train_files, train_labels = load_data_by_split(DATA_ROOT, "train")
    val_files, val_labels = load_data_by_split(DATA_ROOT, "val")

    if len(train_files) == 0:
        print("There is no data for training")
        return
    
    # 2. Create datasets
    train_ds = AudioDataset(train_files, train_labels, is_train=True)
    val_ds = AudioDataset(val_files, val_labels, is_train=False)    # No aug at val

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False)

    # 3. Model setup
    model = get_model()

    # Weights to resolve class unbalance problem
    weights = torch.tensor([5.0, 5.0, 1.0]).to(device)
    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = optim.AdamW(model.parameters(), lr=LR)

    # 4. Start Training
    print("Start Training...")
    best_acc = 0

    for epoch in range(EPOCHS):
        train_loss = train_epoch(model, train_loader, criterion, optimizer)
        val_acc = evaluate(model, val_loader)

        print(f"Epoch {epoch+1}/{EPOCHS} | Train Loss: {train_loss:.4f} | Val Acc: {val_acc:2f}%")

        if val_acc > best_acc:
            best_acc = val_acc
            print(f"Best Performance - Model saved at {SAVE_PATH}")
            model.save_pretrained(SAVE_PATH)


def run_evaluation():
    test_files, test_labels = load_data_by_split(DATA_ROOT, "test")

    if len(test_files) == 0:
        print("No test data at (dataset/test)")
        return
    if not os.path.exists(SAVE_PATH):
        print("No existing model. Start training.")
        return
    
    print("Model Test Set")
    model = get_model(pretrained_path=SAVE_PATH)

    test_ds = AudioDataset(test_files, test_labels, is_train=False)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False)

    acc = evaluate(model, test_loader)
    print(f"Final Accuracy: {acc:2f}%")

if __name__ == "__main__":
    run_training()
    #run_evaluation()
