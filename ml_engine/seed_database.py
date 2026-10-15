import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
from pgvector.psycopg2 import register_vector
from ml_engine.embedder import SBERTEmbedder

DB_CONFIG = {
    "dbname": "alumnect",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": 5433
}

DUMMY_PASSWORD_HASH = "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890dummyhashforseeding"

def seed_database():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_profiles.json")
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    print("Loading synthetic profiles...")
    with open(data_path, "r", encoding="utf-8") as f:
        profiles = json.load(f)

    print("Initializing SBERT embedder...")
    embedder = SBERTEmbedder()

    raw_bios = [p.get("raw_bio") or p.get("rawBio") or p.get("bio") or "Aviation Professional" for p in profiles]
    print(f"Computing embeddings in batch for {len(raw_bios)} profiles...")
    embeddings = embedder.embed_batch(raw_bios)

    conn = psycopg2.connect(**DB_CONFIG)
    register_vector(conn)
    cursor = conn.cursor()

    print(f"Connected to PostgreSQL. Seeding {len(profiles)} profiles into database...")

    try:
        inserted = 0
        for p, vector in zip(profiles, embeddings):
            user_id = str(p.get("user_id") or p.get("id"))
            
            raw_email = p.get("email")
            if not raw_email:
                raw_name = p.get("full_name") or p.get("fullName") or p.get("name") or "user"
                name_slug = raw_name.lower().replace(" ", ".").replace("..", ".")
                email = f"{name_slug}.{user_id[:8]}@alumnect.dev"
            else:
                email = raw_email

            role = str(p.get("role", "MENTOR")).upper()
            if role not in ["MENTOR", "MENTEE", "ADMIN"]:
                role = "MENTOR"

            full_name = p.get("full_name") or p.get("fullName") or p.get("name") or "Aviation Professional"
            department = p.get("department") or "Aviation"
            job_title = p.get("job_title") or p.get("jobTitle") or "Specialist"
            years_experience = int(p.get("years_experience") or p.get("yearsExperience") or 0)
            
            certifications = p.get("certifications", "")
            if isinstance(certifications, list):
                certifications = ", ".join(certifications)
            elif not certifications:
                certifications = ""

            raw_bio = p.get("raw_bio") or p.get("rawBio") or p.get("bio") or ""
            cleaned_bio = p.get("cleaned_bio") or p.get("cleanedBio") or embedder.processor.normalize(raw_bio)

            if hasattr(vector, 'tolist'):
                vector = vector.tolist()

            # Insert User
            cursor.execute(
                """
                INSERT INTO users (id, email, "passwordHash", role, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s::"Role", NOW(), NOW())
                ON CONFLICT (id) DO UPDATE 
                SET email = EXCLUDED.email, role = EXCLUDED.role;
                """,
                (user_id, email, DUMMY_PASSWORD_HASH, role)
            )

            # Insert Profile
            cursor.execute(
                """
                INSERT INTO profiles (
                    id, "userId", "fullName", department, "jobTitle", 
                    "yearsExperience", certifications, "rawBio", "cleanedBio", 
                    embedding, "createdAt", "updatedAt"
                )
                VALUES (
                    gen_random_uuid()::text, %s, %s, %s, %s, 
                    %s, %s, %s, %s, 
                    %s, NOW(), NOW()
                )
                ON CONFLICT ("userId") DO UPDATE 
                SET "fullName" = EXCLUDED."fullName",
                    department = EXCLUDED.department,
                    "jobTitle" = EXCLUDED."jobTitle",
                    "yearsExperience" = EXCLUDED."yearsExperience",
                    certifications = EXCLUDED.certifications,
                    "rawBio" = EXCLUDED."rawBio",
                    "cleanedBio" = EXCLUDED."cleanedBio",
                    embedding = EXCLUDED.embedding,
                    "updatedAt" = NOW();
                """,
                (
                    user_id, full_name, department, job_title,
                    years_experience, certifications, raw_bio, cleaned_bio,
                    vector
                )
            )
            inserted += 1
            if inserted % 100 == 0 or inserted == len(profiles):
                print(f"Inserted {inserted}/{len(profiles)} profiles...")

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