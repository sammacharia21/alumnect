import json
import os
import re
import psycopg2
from pgvector.psycopg2 import register_vector
from ml_engine.embedder import SBERTEmbedder

# Try importing AviationTextProcessor; provide fallback if in another module
try:
    from ml_engine.preprocess import AviationTextProcessor
except ModuleNotFoundError:
    try:
        from ml_engine.preprocessing import AviationTextProcessor
    except ModuleNotFoundError:
        try:
            from ml_engine.embedder import AviationTextProcessor
        except (ImportError, AttributeError):
            class AviationTextProcessor:
                """Fallback text processor preserving aviation acronyms."""
                @staticmethod
                def clean_text(text: str) -> str:
                    if not text:
                        return ""
                    text = re.sub(r'\s+', ' ', text.strip())
                    return text

# Database configuration matching Docker container port 5433
DB_CONFIG = {
    "dbname": "alumnect",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": 5433
}

def seed_database():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_profiles.json")
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    print("Loading synthetic profiles...")
    with open(data_path, "r", encoding="utf-8") as f:
        profiles = json.load(f)

    print("Initializing NLP preprocessor and SBERT embedder...")
    processor = AviationTextProcessor()
    embedder = SBERTEmbedder()

    # Connect to PostgreSQL
    conn = psycopg2.connect(**DB_CONFIG)
    register_vector(conn)
    cursor = conn.cursor()

    print(f"Connected to PostgreSQL. Seeding {len(profiles)} profiles into database...")

    try:
        inserted = 0
        for p in profiles:
            user_id = p.get("user_id") or p.get("id")
            name = p.get("name")
            email = p.get("email")
            role = p.get("role", "MENTOR")
            department = p.get("department")
            job_title = p.get("job_title")
            raw_bio = p.get("bio", "")

            # 1. Clean bio text
            cleaned_bio = processor.clean_text(raw_bio)

            # 2. Generate 384-dimensional embedding
            vector = embedder.generate_embeddings([cleaned_bio])[0]

            # 3. Insert or update User
            cursor.execute(
                """
                INSERT INTO users (id, name, email, role, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s::"Role", NOW(), NOW())
                ON CONFLICT (id) DO UPDATE 
                SET name = EXCLUDED.name, email = EXCLUDED.email;
                """,
                (user_id, name, email, role)
            )

            # 4. Insert or update Profile with embedding
            cursor.execute(
                """
                INSERT INTO profiles (id, "userId", department, "jobTitle", bio, embedding, "createdAt", "updatedAt")
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT ("userId") DO UPDATE 
                SET department = EXCLUDED.department,
                    "jobTitle" = EXCLUDED."jobTitle",
                    bio = EXCLUDED.bio,
                    embedding = EXCLUDED.embedding,
                    "updatedAt" = NOW();
                """,
                (user_id, department, job_title, cleaned_bio, vector)
            )
            inserted += 1
            if inserted % 50 == 0 or inserted == len(profiles):
                print(f"Processed and inserted {inserted}/{len(profiles)} records...")

        conn.commit()
        print(f"Successfully seeded {inserted} profiles with vector embeddings into PostgreSQL.")

    except Exception as e:
        conn.rollback()
        print(f"Failed to seed database: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    seed_database()