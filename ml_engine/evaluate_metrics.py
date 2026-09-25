import json
import os
import sys
import numpy as np
from typing import List, Dict

# Ensure local imports resolve
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from embedder import SBERTEmbedder

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Computes cosine similarity between two unit-normalized vectors."""
    a = np.array(vec_a)
    b = np.array(vec_b)
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(dot_product / (norm_a * norm_b))

def run_evaluation(threshold: float = 0.55):
    """
    Evaluates SBERT matching against data/validation_ground_truth.json.
    Computes Precision, Recall, and F1-score based on a cosine similarity threshold.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    gt_path = os.path.join(base_dir, "..", "data", "validation_ground_truth.json")

    if not os.path.exists(gt_path):
        print(f"Error: Validation ground truth file not found at {gt_path}")
        return

    with open(gt_path, "r", encoding="utf-8") as f:
        ground_truth: List[Dict] = json.load(f)

    embedder = SBERTEmbedder()

    true_positives = 0
    false_positives = 0
    false_negatives = 0
    true_negatives = 0

    print("\n--- Running Evaluation Benchmark ---")

    for entry in ground_truth:
        test_id = entry.get("test_id", "UNKNOWN")
        category = entry.get("category", "General")
        mentee_text = entry.get("mentee_bio", "")
        mentor_text = entry.get("mentor_bio", "")
        expected = entry.get("expected_compatible", True)

        vec_mentee = embedder.embed_text(mentee_text)
        vec_mentor = embedder.embed_text(mentor_text)

        score = cosine_similarity(vec_mentee, vec_mentor)
        predicted = score >= threshold

        status = "CORRECT" if predicted == expected else "MISMATCH"
        print(f"[{test_id}] {category} -> Similarity: {score:.4f} | Predicted: {predicted} | Expected: {expected} ({status})")

        if predicted and expected:
            true_positives += 1
        elif predicted and not expected:
            false_positives += 1
        elif not predicted and expected:
            false_negatives += 1
        else:
            true_negatives += 1

    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0.0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    print("\n================ BENCHMARK RESULTS ================")
    print(f"Evaluated Pairs : {len(ground_truth)}")
    print(f"Similarity Cutoff: {threshold}")
    print(f"Precision       : {precision:.4f} ({precision * 100:.1f}%)")
    print(f"Recall          : {recall:.4f} ({recall * 100:.1f}%)")
    print(f"F1-Score        : {f1:.4f} ({f1 * 100:.1f}%)")
    print("===================================================")

if __name__ == "__main__":
    run_evaluation(threshold=0.55)