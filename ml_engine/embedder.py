import sys
import os
import json
from typing import List

# Ensure imports resolve relative to ml_engine directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocessor import AviationTextProcessor

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    raise ImportError("sentence-transformers is not installed. Run: pip install sentence-transformers")

class SBERTEmbedder:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2", verbose: bool = False):
        """
        Initializes the pre-trained Sentence-BERT model and the domain preprocessor.
        The all-MiniLM-L6-v2 model generates 384-dimensional normalized vector embeddings.
        """
        if verbose:
            print(f"Loading Sentence-BERT model: {model_name}...", file=sys.stderr)
        
        import gc
        gc.collect()
        
        self.model = SentenceTransformer(model_name, device="cpu")
        self.processor = AviationTextProcessor()
        if verbose:
            print("Model loaded successfully.", file=sys.stderr)

    def embed_text(self, text: str) -> List[float]:
        """
        Cleans the input text, protects aviation terms, and converts it
        into a unit-normalized 384-dimensional float vector.
        """
        cleaned_text = self.processor.normalize(text)
        # normalize_embeddings=True ensures cosine similarity can be computed via dot product
        embedding = self.model.encode(cleaned_text, normalize_embeddings=True)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Encodes multiple text bios in a single forward pass."""
        cleaned_texts = [self.processor.normalize(t) for t in texts]
        embeddings = self.model.encode(cleaned_texts, normalize_embeddings=True)
        return embeddings.tolist()

if __name__ == "__main__":
    embedder = SBERTEmbedder()
    
    test_bio = "Senior fleet captain with 12 years of line training experience on Boeing B787 aircraft under ICAO standards."
    vector = embedder.embed_text(test_bio)
    
    print("\n--- Test Verification ---")
    print(f"Bio text: {test_bio}")
    print(f"Vector dimensions: {len(vector)} (Expected: 384)")
    print(f"First 5 coordinates: {vector[:5]}")