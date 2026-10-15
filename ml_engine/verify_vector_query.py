import os
import sys

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
from ml_engine.embedder import SBERTEmbedder

DB_CONFIG = {
    "dbname": "alumnect",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": 5433
}

def verify_vector_search():
    print("Initializing SBERT Embedder...")
    embedder = SBERTEmbedder()

    sample_queries = [
        "Looking for an experienced Boeing B787 captain for flight operations and ICAO safety mentorship",
        "Aircraft maintenance engineer specialized in avionics, TCAS, and radar systems troubleshooting",
        "Air traffic controller or flight dispatcher with KCAA / FAA regulatory knowledge"
    ]

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    try:
        for q in sample_queries:
            print(f"\n==================================================")
            print(f"Query: \"{q}\"")
            print(f"==================================================")
            
            query_vector = embedder.embed_text(q)
            vector_str = "[" + ",".join(f"{x:.6f}" for x in query_vector) + "]"

            sql = """
                SELECT 
                    id, 
                    "fullName", 
                    department, 
                    "jobTitle", 
                    "yearsExperience",
                    certifications,
                    1 - (embedding <=> %s::vector) AS similarity
                FROM profiles
                WHERE 1 - (embedding <=> %s::vector) >= 0.45
                ORDER BY similarity DESC
                LIMIT 5;
            """
            cur.execute(sql, (vector_str, vector_str))
            matches = cur.fetchall()

            print(f"Matches found (threshold >= 0.45): {len(matches)}")
            for idx, m in enumerate(matches, 1):
                pid, name, dept, title, exp, certs, sim = m
                print(f" {idx}. [{sim*100:.1f}% Match] {name} - {title} ({dept}) | {exp} yrs exp | Certs: {certs}")

    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    verify_vector_search()
