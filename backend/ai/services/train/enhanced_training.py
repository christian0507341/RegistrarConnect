#!/usr/bin/env python3
"""
Enhanced AI Training Script for RegistrarConnect
This script improves the AI model with better training data, parameters, and techniques.
"""

import os, sys, json
from typing import Dict, List, Union
from datasets import Dataset
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    TrainingArguments, Trainer, AutoConfig
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import numpy as np
import torch
from torch.utils.data import DataLoader
import random

# Add project root to path
def find_project_root(start):
    """Find the project root directory."""
    current = os.path.abspath(start)
    while current != os.path.dirname(current):
        if os.path.exists(os.path.join(current, "manage.py")):
            return current
        current = os.path.dirname(current)
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../.."))

HERE = os.path.dirname(__file__)
PROJECT_ROOT = find_project_root(HERE)
LOCAL_BASE = os.path.join(PROJECT_ROOT, "backend", "ai", "models", "distilbert-base-uncased")
DATA_DIR = os.path.join(HERE, "data")
OUT_DIR = os.path.join(HERE, "checkpoints")
ENHANCED_DATA = os.path.join(HERE, "enhanced_training_data.jsonl")

# Enhanced labels and configuration
DOC_LABELS = ["OTR", "COG", "COE", "OTHERS"]
DOC2ID = {l: i for i, l in enumerate(DOC_LABELS)}
ID2DOC = {i: l for l, i in DOC2ID.items()}
SEM_LABELS = [0, 1, 2]  # 0 = unknown/NA, 1 = first sem, 2 = second sem

# Data augmentation functions
def augment_text(text: str) -> List[str]:
    """Generate variations of the input text for data augmentation."""
    variations = [text]
    
    # Add common variations
    if "certificate" in text.lower():
        variations.append(text.replace("certificate", "cert"))
        variations.append(text.replace("certificate", "certification"))
    
    if "transcript" in text.lower():
        variations.append(text.replace("transcript", "TOR"))
        variations.append(text.replace("transcript", "OTR"))
    
    if "enrollment" in text.lower():
        variations.append(text.replace("enrollment", "enrolment"))
        variations.append(text.replace("enrollment", "enrol"))
    
    # Add typos and abbreviations
    if "semester" in text.lower():
        variations.append(text.replace("semester", "sem"))
        variations.append(text.replace("semester", "sems"))
    
    if "school year" in text.lower():
        variations.append(text.replace("school year", "sy"))
        variations.append(text.replace("school year", "s.y."))
    
    return variations

def load_jsonl(path: str) -> List[Dict]:
    """Load JSONL data with error handling."""
    data = []
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if line:
                    try:
                        data.append(json.loads(line))
                    except json.JSONDecodeError as e:
                        print(f"Warning: Skipping invalid JSON on line {line_num}: {e}")
                        continue
    except FileNotFoundError:
        print(f"Warning: File {path} not found")
    return data

def normalize_semester(v: Union[str, int, None]) -> int:
    """Normalize semester values to consistent format."""
    if v is None or v == "NA" or v == "":
        return 0
    if isinstance(v, str):
        v = v.strip()
        if v.lower() in ["na", "n/a", "none", ""]:
            return 0
        try:
            v = int(v)
        except ValueError:
            return 0
    return int(v) if v in [0, 1, 2] else 0

def build_dataset(rows: List[Dict]) -> Dataset:
    """Build dataset with data augmentation."""
    processed_data = []
    
    for row in rows:
        # Original data
        processed_data.append({
            "text": row["text"],
            "doc_label": DOC2ID[row["doc_type"]],
            "sem_label": normalize_semester(row["semester"])
        })
        
        # Limited augmentation to prevent memory issues
        if len(processed_data) < 500:  # Reduced limit
            variations = augment_text(row["text"])
            # Only add 1-2 variations to keep dataset manageable
            for variation in variations[1:3]:  # Skip original, limit to 2 variations
                processed_data.append({
                    "text": variation,
                    "doc_label": DOC2ID[row["doc_type"]],
                    "sem_label": normalize_semester(row["semester"])
                })
    
    return Dataset.from_list(processed_data)

def tokenize_for(task: str, tokenizer, batch):
    """Enhanced tokenization with better parameters."""
    texts = batch["text"]
    
    # Enhanced tokenization parameters
    tokenized = tokenizer(
        texts,
        truncation=True,
        padding=True,
        max_length=256,  # Increased from 128
        return_tensors="pt"
    )
    
    if task == "doc_label":
        tokenized["labels"] = batch["doc_label"]
    else:
        tokenized["labels"] = batch["sem_label"]
    
    return tokenized

def get_enhanced_model_and_tokenizer(num_labels: int):
    """Get model and tokenizer with enhanced configuration."""
    base_id = "distilbert-base-uncased"
    local_has_files = os.path.isfile(os.path.join(LOCAL_BASE, "config.json"))
    
    load_id = LOCAL_BASE if local_has_files else base_id
    local_only = bool(local_has_files)
    
    # Enhanced tokenizer configuration
    tokenizer = AutoTokenizer.from_pretrained(
        load_id,
        cache_dir=LOCAL_BASE,
        local_files_only=local_only,
        use_fast=True,  # Use fast tokenizer
        model_max_length=512
    )
    
    # Enhanced model configuration
    config = AutoConfig.from_pretrained(
        load_id,
        num_labels=num_labels,
        cache_dir=LOCAL_BASE,
        local_files_only=local_only
    )
    
    # Add custom configuration
    config.hidden_dropout_prob = 0.1
    config.attention_probs_dropout_prob = 0.1
    
    model = AutoModelForSequenceClassification.from_pretrained(
        load_id,
        config=config,
        cache_dir=LOCAL_BASE,
        local_files_only=local_only
    )
    
    return tokenizer, model

def train_enhanced_model(head: str, train_ds: Dataset, val_ds: Dataset, num_labels: int, out_subdir: str):
    """Enhanced training with better parameters and techniques."""
    print(f"Starting enhanced training for {head}...")
    
    tokenizer, model = get_enhanced_model_and_tokenizer(num_labels)
    
    if len(train_ds) == 0 or len(val_ds) == 0:
        raise ValueError("Training or validation dataset is empty.")
    
    # Enhanced tokenization
    if head == "doc":
        train_tok = train_ds.map(
            lambda b: tokenize_for("doc_label", tokenizer, b), 
            batched=True, 
            remove_columns=train_ds.column_names
        )
        val_tok = val_ds.map(
            lambda b: tokenize_for("doc_label", tokenizer, b), 
            batched=True, 
            remove_columns=val_ds.column_names
        )
    else:
        train_tok = train_ds.map(
            lambda b: tokenize_for("sem_label", tokenizer, b), 
            batched=True, 
            remove_columns=train_ds.column_names
        )
        val_tok = val_ds.map(
            lambda b: tokenize_for("sem_label", tokenizer, b), 
            batched=True, 
            remove_columns=val_ds.column_names
        )
    
    # Simplified training arguments for better compatibility
    training_args = TrainingArguments(
        output_dir=os.path.join(OUT_DIR, out_subdir),
        learning_rate=5e-5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=32,
        num_train_epochs=3,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        logging_steps=50,
        report_to="none",
        seed=42,
        save_total_limit=2,
    )
    
    # Enhanced metrics computation
    def compute_metrics(eval_pred):
        predictions, labels = eval_pred
        predictions = np.argmax(predictions, axis=1)
        
        precision, recall, f1, _ = precision_recall_fscore_support(
            labels, predictions, average='weighted'
        )
        accuracy = accuracy_score(labels, predictions)
        
        return {
            'accuracy': accuracy,
            'f1': f1,
            'precision': precision,
            'recall': recall
        }
    
    # Enhanced trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_tok,
        eval_dataset=val_tok,
        compute_metrics=compute_metrics,
        tokenizer=tokenizer,
    )
    
    # Train the model
    print(f"Training {head} model...")
    trainer.train()
    
    # Save the model
    save_dir = os.path.join(OUT_DIR, out_subdir)
    trainer.save_model(save_dir)
    tokenizer.save_pretrained(save_dir)
    
    # Evaluate the model
    eval_results = trainer.evaluate()
    print(f"{head} model evaluation results:")
    for key, value in eval_results.items():
        print(f"  {key}: {value:.4f}")
    
    return trainer

def main():
    """Main training function with enhanced features."""
    print("Starting Enhanced AI Training")
    print("=" * 50)
    
    # Create output directory
    os.makedirs(OUT_DIR, exist_ok=True)
    
    # Load enhanced training data
    print("Loading enhanced training data...")
    train_rows = load_jsonl(ENHANCED_DATA)
    val_rows = load_jsonl(os.path.join(DATA_DIR, "val.jsonl"))
    
    if not train_rows:
        print("ERROR: No training data found!")
        return
    
    print(f"Training samples: {len(train_rows)}")
    print(f"Validation samples: {len(val_rows)}")
    
    # Build datasets with augmentation
    print("Building datasets with data augmentation...")
    train_ds = build_dataset(train_rows)
    val_ds = build_dataset(val_rows)
    
    print(f"Augmented training samples: {len(train_ds)}")
    print(f"Augmented validation samples: {len(val_ds)}")
    
    # Train document type classifier
    print("\nTraining Document Type Classifier...")
    train_enhanced_model(
        "doc", train_ds, val_ds, 
        num_labels=len(DOC_LABELS), 
        out_subdir="doc_type"
    )
    
    # Train semester classifier
    print("\nTraining Semester Classifier...")
    train_enhanced_model(
        "sem", train_ds, val_ds, 
        num_labels=len(SEM_LABELS), 
        out_subdir="semester"
    )
    
    # Save labels configuration
    labels_config = {
        "DOC_LABELS": DOC_LABELS,
        "SEM_LABELS": SEM_LABELS,
        "DOC2ID": DOC2ID,
        "ID2DOC": ID2DOC
    }
    
    with open(os.path.join(OUT_DIR, "labels.json"), "w", encoding="utf-8") as f:
        json.dump(labels_config, f, indent=2)
    
    print("\nEnhanced training completed!")
    print(f"Models saved to: {OUT_DIR}")
    print(f"Document types: {DOC_LABELS}")
    print(f"Semester labels: {SEM_LABELS}")

if __name__ == "__main__":
    main()
