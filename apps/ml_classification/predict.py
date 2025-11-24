import torch
import librosa
import numpy as np
import torch.nn.functional as F
import os
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor

# ======== Settings =========
MODEL_PATH = "./saved_model"
SAMPLE_RATE = 16000
device = torch.device("cpu")

# LabelMap
LABELMAP = {
    0: "Laughter",
    1: "Sigh",
    2: "Negative"
}

# ========= Model Load ========
class AudioClassifier:
    def __init__(self, model_path):
        print(f"Loading model from {model_path}")
        self.model = Wav2Vec2ForSequenceClassification.from_pretrained(model_path)
        self.processor = Wav2Vec2FeatureExtractor.from_pretrained("facebook/wav2vec2-base")
        self.model.eval()

    def predict(self, file_path):
        # 1. Audio Load & Resampling
        try:
            y, sr = librosa.load(file_path, sr=SAMPLE_RATE)
        except Exception as e:
            return f"Error occured {e}"
        
        # 2. Preprocessing
        inputs = self.processor(y, sampling_rate=SAMPLE_RATE, return_tensors="pt")
        input_values = inputs.input_values.to(device)

        # 3. Model prediction
        with torch.no_grad():
            outputs = self.model(input_values)
            logits = outputs.logits

            # 4. Prob Calculation
            probs = F.softmax(logits, dim=-1)

            pred_idx = torch.argmax(probs, dim=-1).item()
            confidence = probs[0][pred_idx].item() * 100

        return {
            "label": LABELMAP[pred_idx],
            "confidence": f"{confidence:.2f}%",
            "all_probs": {LABELMAP[i]: f"{probs[0][i].item()*100:.2f}%" for i in range(3)}
        }
    
# ========= Model Execute =========
if __name__ == "__main__":
    classifier = AudioClassifier(MODEL_PATH)

    file_dir = "./"           # dir of file to classify

    if os.path.exists(file_dir):
        result = classifier.predict(file_dir)

        print("\n" + "="*30)
        print(f"file: {os.path.basename(file_dir)}")
        print(f"result: {result['label']}")
        print(f"confidence: {result['confidence']}")
        print("-"*30)
        print("Detail Prob")
        for k, v in result['all_probs'].items():
            print(f" -{k}:{v}")
        print("="*30 + "\n")
    else:
        print(f"Cannot find files")
