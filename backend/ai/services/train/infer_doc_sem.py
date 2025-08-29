import os
import sys
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# --- paths ---
HERE = os.path.dirname(__file__)
CHECKPOINTS = os.path.join(HERE, "checkpoints")

DOC_PATH = os.path.join(CHECKPOINTS, "doc_type")
SEM_PATH = os.path.join(CHECKPOINTS, "semester")

# labels (must match training labels.json)
DOC_LABELS = ["OTR", "COG", "COE", "OTHERS"]
SEM_LABELS = [0, 1, 2]  # 0 = unknown/NA

def load_head(path: str, num_labels: int):
    tok = AutoTokenizer.from_pretrained(path)
    model = AutoModelForSequenceClassification.from_pretrained(path, num_labels=num_labels)
    return tok, model

def predict(text: str):
    # load models
    doc_tok, doc_model = load_head(DOC_PATH, num_labels=len(DOC_LABELS))
    sem_tok, sem_model = load_head(SEM_PATH, num_labels=len(SEM_LABELS))

    # put models in eval mode
    doc_model.eval()
    sem_model.eval()

    # no gradient needed
    with torch.no_grad():
        # --- doc type prediction ---
        doc_inputs = doc_tok(text, return_tensors="pt", truncation=True, max_length=128)
        doc_logits = doc_model(**doc_inputs).logits
        doc_pred = int(torch.argmax(doc_logits, dim=-1))
        doc_label = DOC_LABELS[doc_pred]

        # --- semester prediction ---
        sem_inputs = sem_tok(text, return_tensors="pt", truncation=True, max_length=128)
        sem_logits = sem_model(**sem_inputs).logits
        sem_pred = int(torch.argmax(sem_logits, dim=-1))
        sem_label = SEM_LABELS[sem_pred]

    return {"doc_type": doc_label, "semester": sem_label}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python infer_doc_sem.py \"your text here\"")
        sys.exit(1)

    text = " ".join(sys.argv[1:])
    out = predict(text)
    print(out)
