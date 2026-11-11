import json
import os
import re
import html
from typing import Set

class AviationTextProcessor:
    def __init__(self, acronym_file_path: str = None):
        """Loads domain-specific acronyms to protect them from normalization corruption."""
        self.protected_terms: Set[str] = set()

        default_terms = {
            "B787", "B787-8", "B787-9", "B737", "B737-800", "B777", "B777-300ER",
            "E190", "A330", "A320", "Q400",
            "ICAO", "KCAA", "FAA", "EASA", "ATPL", "CPL", "PPL",
            "ETOPS", "SMS", "FMC", "TCAS", "NDB", "VOR", "ILS"
        }

        # Resolve candidate paths
        candidate_paths = []
        if acronym_file_path:
            candidate_paths.append(acronym_file_path)
            candidate_paths.append(os.path.abspath(acronym_file_path))
        
        # Standard relative fallback
        base_dir = os.path.dirname(os.path.abspath(__file__))
        candidate_paths.append(os.path.join(base_dir, "..", "data", "protected_acronyms.json"))
        candidate_paths.append(os.path.join(os.getcwd(), "data", "protected_acronyms.json"))

        loaded = False
        for path in candidate_paths:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read().strip()
                        if content:
                            data = json.loads(content)
                            if isinstance(data, dict):
                                for category in data.values():
                                    if isinstance(category, list):
                                        self.protected_terms.update([str(item).upper() for item in category])
                                    elif isinstance(category, str):
                                        self.protected_terms.add(category.upper())
                            elif isinstance(data, list):
                                self.protected_terms.update([str(item).upper() for item in data])
                            
                            if len(self.protected_terms) > 0:
                                loaded = True
                                break
                except Exception:
                    continue

        if not loaded or len(self.protected_terms) == 0:
            print("Notice: Using built-in aviation acronym defaults.")
            self.protected_terms = default_terms
        else:
            self.protected_terms.update(default_terms)

    def clean_text(self, text: str) -> str:
        """Removes HTML markup, line breaks, and repeated whitespace."""
        if not text:
            return ""
        text = html.unescape(text)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'[\r\n\t]+', ' ', text)
        return re.sub(r'\s+', ' ', text).strip()

    def normalize(self, text: str) -> str:
        """Standardizes spacing and casing while preserving protected aviation tokens."""
        cleaned = self.clean_text(text)
        tokens = cleaned.split(" ")
        normalized_tokens = []

        for token in tokens:
            if not token:
                continue
            # Strip leading/trailing punctuation for lookup check
            core_token = re.sub(r'^[^\w]+|[^\w]+$', '', token)
            pure_upper = core_token.upper()

            if pure_upper in self.protected_terms:
                normalized = token.replace(core_token, pure_upper)
                normalized_tokens.append(normalized)
            elif "-" in core_token:
                parts = core_token.split("-")
                new_parts = []
                for p in parts:
                    if p.upper() in self.protected_terms:
                        new_parts.append(p.upper())
                    else:
                        new_parts.append(p)
                new_core = "-".join(new_parts)
                normalized = token.replace(core_token, new_core)
                normalized_tokens.append(normalized)
            else:
                pure_word = re.sub(r'[^\w]', '', token).upper()
                if pure_word in self.protected_terms:
                    normalized = re.sub(r'[\w]+', pure_word, token)
                    normalized_tokens.append(normalized)
                else:
                    normalized_tokens.append(token)

        return " ".join(normalized_tokens)

if __name__ == "__main__":
    processor = AviationTextProcessor()
    
    sample_text = "<p>First Officer aiming for <b>b787-8</b> fleet conversion under icao standards.</p>"
    result = processor.normalize(sample_text)
    
    print("Input :", sample_text)
    print("Output:", result)
    print(f"Loaded {len(processor.protected_terms)} protected terms successfully.")
