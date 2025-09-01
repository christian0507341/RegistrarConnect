import os, json
from typing import Dict
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

HERE = os.path.dirname(__file__)
CKPT_DIR = os.path.join(HERE, "checkpoints")
DOC_DIR = os.path.join(CKPT_DIR, "doc_type")
SEM_DIR = os.path.join(CKPT_DIR, "semester")

with open(os.path.join(CKPT_DIR, "labels.json"), "r", encoding="utf-8") as f:
    LBL = json.load(f)
DOC_LABELS = LBL["DOC_LABELS"]      # e.g., ["OTR","COG","COE","OTHERS"]
SEM_LABELS = LBL["SEM_LABELS"]      # e.g., [0,1,2]

# Load once
_tok_doc = AutoTokenizer.from_pretrained(DOC_DIR)
_mod_doc = AutoModelForSequenceClassification.from_pretrained(DOC_DIR)
_tok_sem = AutoTokenizer.from_pretrained(SEM_DIR)
_mod_sem = AutoModelForSequenceClassification.from_pretrained(SEM_DIR)

ID2DOC = {i: l for i, l in enumerate(DOC_LABELS)}

def _softmax(x):
    ex = torch.exp(x - torch.max(x))
    return ex / ex.sum(-1, keepdim=True)

def _predict_logits(tok, mod, text: str):
    t = tok(text, return_tensors="pt", truncation=True, max_length=128)
    with torch.no_grad():
        out = mod(**t)
    return out.logits[0]

def predict(text: str) -> Dict[str, object]:
    """Return {'doc_type': <str>, 'semester': <int 0/1/2>}"""
    doc_logits = _predict_logits(_tok_doc, _mod_doc, text)
    doc_id = int(torch.argmax(doc_logits).item())
    doc_type = ID2DOC.get(doc_id, "OTHERS")

    sem_logits = _predict_logits(_tok_sem, _mod_sem, text)
    sem_id = int(torch.argmax(sem_logits).item())  # 0,1,2 as trained

    return {"doc_type": doc_type, "semester": sem_id}

if __name__ == "__main__":
    import sys
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Request my COG sem 2 sy 25/26"
    print(predict(query))
