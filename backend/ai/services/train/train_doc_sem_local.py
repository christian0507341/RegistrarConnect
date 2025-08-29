import os, json, re
from typing import List, Dict, Union
from sklearn.metrics import accuracy_score
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset

# ---------- robust project root detection ----------
def find_project_root(start):
    """
    Walk upward from `start` until we find a directory that contains a 'backend' folder.
    Return that directory. If not found, fall back to the original heuristic.
    """
    curr = os.path.abspath(start)
    for _ in range(10):  # don't loop forever
        if os.path.isdir(os.path.join(curr, "backend")):
            return curr
        parent = os.path.dirname(curr)
        if parent == curr:
            break
        curr = parent
    # fallback to previous 4-up heuristic
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../.."))

HERE = os.path.dirname(__file__)
PROJECT_ROOT = find_project_root(HERE)
LOCAL_BASE = os.path.join(PROJECT_ROOT, "backend", "models", "distilbert-base-uncased")
DATA_DIR = os.path.join(HERE, "data")
OUT_DIR = os.path.join(HERE, "checkpoints")

# ---------- labels/policy ----------
DOC_LABELS = ["OTR", "COG", "COE", "OTHERS"]
DOC2ID = {l: i for i, l in enumerate(DOC_LABELS)}
ID2DOC = {i: l for l, i in DOC2ID.items()}
# 0 = unknown/NA, 1, 2
SEM_LABELS = [0, 1, 2]

# ---------- io helpers ----------
def load_jsonl(path: str) -> List[Dict]:
    with open(path, "r", encoding="utf-8") as f:
        return [json.loads(x) for x in f if x.strip()]

def normalize_semester(v: Union[str, int, None]) -> int:
    if v is None:
        return 0
    if isinstance(v, int):
        return 1 if v == 1 else 2 if v == 2 else 0
    s = str(v).strip().lower()
    if s in {"1", "01", "s1", "sem1", "semester1", "first", "1st"}:
        return 1
    if s in {"2", "02", "s2", "sem2", "semester2", "second", "2nd"}:
        return 2
    if s in {"", "na", "n/a", "none", "null", "unknown"}:
        return 0
    m = re.search(r"\b([12])\b", s)
    if m:
        return int(m.group(1))
    return 0

def build_dataset(rows: List[Dict]) -> Dataset:
    data = []
    for r in rows:
        doc_idx = DOC2ID.get(str(r.get("doc_type", "")).strip().upper(), DOC2ID["OTHERS"])
        sem_idx = normalize_semester(r.get("semester"))
        data.append({"text": r["text"], "doc_label": doc_idx, "sem_label": sem_idx})
    return Dataset.from_list(data)

def tokenize_for(labels_key: str, tok, batch):
    out = tok(batch["text"], truncation=True, max_length=128)
    out["labels"] = batch[labels_key]
    return out

# ---------- model loading (auto-download if missing) ----------
def ensure_local_base():
    """
    Ensure LOCAL_BASE contains a downloaded snapshot of 'distilbert-base-uncased'.
    If missing/empty, download it (requires internet once).
    """
    has_config = os.path.isfile(os.path.join(LOCAL_BASE, "config.json"))
    if not has_config:
        os.makedirs(LOCAL_BASE, exist_ok=True)
        try:
            from huggingface_hub import snapshot_download
            print(f"[setup] Downloading 'distilbert-base-uncased' to {LOCAL_BASE} ...")
            snapshot_download(
                repo_id="distilbert-base-uncased",
                local_dir=LOCAL_BASE,
                local_dir_use_symlinks=False,
            )
            print("[setup] Download complete.")
        except Exception as e:
            # If offline or blocked, we'll fall back to hub on first from_pretrained call
            print(f"[setup] Could not predownload model: {e}")

def get_tok_and_model(num_labels: int):
    from transformers import AutoConfig
    ensure_local_base()

    base_id = "distilbert-base-uncased"
    local_has_files = os.path.isfile(os.path.join(LOCAL_BASE, "config.json"))

    # Prefer local if present; otherwise allow download from hub (local_files_only=False)
    load_id = LOCAL_BASE if local_has_files else base_id
    local_only = bool(local_has_files)

    tok = AutoTokenizer.from_pretrained(
        load_id,
        cache_dir=LOCAL_BASE,           # also cache into this folder
        local_files_only=local_only
    )
    model = AutoModelForSequenceClassification.from_pretrained(
        load_id,
        num_labels=num_labels,
        cache_dir=LOCAL_BASE,
        local_files_only=local_only
    )
    return tok, model

def train_head(head: str, train_ds: Dataset, val_ds: Dataset, num_labels: int, out_subdir: str):
    tok, model = get_tok_and_model(num_labels)

    if head == "doc":
        train_tok = train_ds.map(lambda b: tokenize_for("doc_label", tok, b), batched=True, remove_columns=train_ds.column_names)
        val_tok   = val_ds.map(lambda b: tokenize_for("doc_label", tok, b), batched=True, remove_columns=val_ds.column_names)
    else:
        train_tok = train_ds.map(lambda b: tokenize_for("sem_label", tok, b), batched=True, remove_columns=train_ds.column_names)
        val_tok   = val_ds.map(lambda b: tokenize_for("sem_label", tok, b), batched=True, remove_columns=val_ds.column_names)

    args = TrainingArguments(
        output_dir=os.path.join(OUT_DIR, out_subdir),
        learning_rate=5e-5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=32,
        num_train_epochs=3,
        weight_decay=0.01,
        eval_strategy="epoch",          # new arg name (replaces evaluation_strategy)
        save_strategy="epoch",
        load_best_model_at_end=True,
        logging_steps=50,
        report_to="none",
        seed=42
    )

    import numpy as np
    def compute_metrics(eval_pred):
        # Support both tuple and EvalPrediction object
        try:
            logits, labels = eval_pred
        except Exception:
            logits, labels = eval_pred.predictions, eval_pred.label_ids
        preds = np.argmax(logits, axis=-1)
        return {"acc": accuracy_score(labels, preds)}

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_tok,
        eval_dataset=val_tok,
        compute_metrics=compute_metrics,
        tokenizer=tok
    )

    trainer.train()
    save_dir = os.path.join(OUT_DIR, out_subdir)
    trainer.save_model(save_dir)
    tok.save_pretrained(save_dir)

if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)

    train_rows = load_jsonl(os.path.join(DATA_DIR, "train.jsonl"))
    val_rows   = load_jsonl(os.path.join(DATA_DIR, "val.jsonl"))

    train_ds = build_dataset(train_rows)
    val_ds   = build_dataset(val_rows)

    # Head 1: document type
    train_head("doc", train_ds, val_ds, num_labels=len(DOC_LABELS), out_subdir="doc_type")

    # Head 2: semester (0=unknown, 1,2)
    train_head("sem", train_ds, val_ds, num_labels=len(SEM_LABELS), out_subdir="semester")

    with open(os.path.join(OUT_DIR, "labels.json"), "w", encoding="utf-8") as f:
        json.dump({"DOC_LABELS": DOC_LABELS, "SEM_LABELS": SEM_LABELS}, f, indent=2)

    print("Done. Checkpoints saved to:", OUT_DIR)
