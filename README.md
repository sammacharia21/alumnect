# Alumnect - AI-Driven Aviation Mentorship Platform

Alumnect is an AI-powered aviation mentorship platform built with **Next.js (App Router)**, **Prisma ORM**, **PostgreSQL with pgvector**, and a **Sentence-BERT (SBERT)** semantic recommendation engine.

---

## 🛠 System Architecture

- **Frontend / Fullstack:** Next.js 16 (React 19, TypeScript) with Prisma ORM.
- **Database:** PostgreSQL running in Docker container (`alumnect-db`), mapped to host port `5433` (container port `5432`).
- **Vector Search Engine:** `pgvector` extension storing 384-dimensional dense embeddings with cosine distance queries (`<=>`).
- **ML & Recommendation Model:** Python `sentence-transformers/all-MiniLM-L6-v2` with domain text preprocessing protecting ICAO, FAA, B787, ATPL, and ETOPS tokens.
- **Operational Threshold:** Validated at **0.45 cosine similarity** (peak F1-score of 0.88 with 91.7% Recall and 84.6% Precision) prioritizing broad discovery with human-in-the-loop review.

---

## 🚀 Key Modules & Endpoints

### 1. Vector Search & SBERT Recommendation
- **`src/lib/vector_search.ts`**: Core vector matching utility. Connects to the fast in-memory Python microservice or falls back to the CLI bridge (`ml_engine/embed_cli.py`).
- **`GET / POST /api/matches/recommend`**: Accepts mentee query text or profile ID and returns top mentor candidates meeting the `0.45` threshold.
- **`POST /api/embeddings/generate`**: Generates 384-dimensional dense vectors and synchronizes profile embeddings in PostgreSQL.

### 2. Mentorship Request Lifecycle
- **`GET /api/requests`**: Retrieves `sentRequests` (mentee view) and `receivedRequests` (mentor inbox).
- **`POST /api/requests`**: Submits a mentorship connection request with match score and statement of purpose.
- **`PATCH /api/requests`**: Updates request status (`PENDING`, `APPROVED`, `REJECTED`).

### 3. Human-in-the-Loop Review
- **`GET /api/admin/matches`**: Lists pending mentorship pairings for administrative oversight.
- **`PATCH /api/admin/matches`**: Admin approval or rejection of AI-recommended pairings.

### 4. Interactive Dashboards
- **`/`**: Platform overview, engine specifications, and domain breakdown.
- **`/recommendations`**: Interactive recommendation engine with real-time semantic query input, prompt chips, department filtering, threshold adjustment slider, mentor cards, and request action.
- **`/admin/review`**: Side-by-side comparison of mentee background and matched mentor credentials for administrative authorization.
- **`/profile`**: Aviation profile management with immediate vector re-indexing.

---

## 💻 Quickstart & Verification Commands

### Run Vector Query Verification:
```bash
python ml_engine/verify_vector_query.py
```

### Run Re-seeding of 498 Synthetic Aviation Profiles:
```bash
npm run ml:seed
# or: python ml_engine/seed_database.py
```

### Optional Persistent Python ML Microservice (Port 8000):
```bash
npm run ml:server
# or: python ml_engine/server.py
```

### Start Next.js Development Server:
```bash
npm run dev
```

### Run Production Build:
```bash
npm run build
```

---

## 🗄️ Database Schema Summary

- **`User`**: `id`, `email`, `passwordHash`, `role` (`MENTOR`, `MENTEE`, `ADMIN`), timestamps.
- **`Profile`**: `id`, `userId`, `fullName`, `department`, `jobTitle`, `yearsExperience`, `certifications`, `rawBio`, `cleanedBio`, `embedding vector(384)`.
- **`MentorshipRequest`**: `id`, `menteeId`, `mentorId`, `similarityScore`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `notes`, timestamps.
