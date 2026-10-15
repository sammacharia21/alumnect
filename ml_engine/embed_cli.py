import argparse
import json
import os
import sys

# Add repository root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_engine.embedder import SBERTEmbedder

def main():
    parser = argparse.ArgumentParser(description="Alumnect SBERT Embedding CLI Bridge")
    parser.add_argument("--text", type=str, help="Single input text to embed")
    parser.add_argument("--json", type=str, help="JSON list of texts to embed in batch")
    parser.add_argument("--stdin", action="store_true", help="Read input text from standard input")

    args = parser.parse_args()

    embedder = SBERTEmbedder()

    if args.stdin:
        input_text = sys.stdin.read().strip()
        vector = embedder.embed_text(input_text)
        print(json.dumps({"embedding": vector}))
        return

    if args.json:
        texts = json.loads(args.json)
        vectors = embedder.embed_batch(texts)
        print(json.dumps({"embeddings": vectors}))
        return

    if args.text:
        vector = embedder.embed_text(args.text)
        print(json.dumps({"embedding": vector}))
        return

    print(json.dumps({"error": "No input text provided"}), file=sys.stderr)
    sys.exit(1)

if __name__ == "__main__":
    main()

