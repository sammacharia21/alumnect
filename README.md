# Alumnect

Alumnect is a Next.js + Python ML platform that matches alumni and students for mentorship using semantic embeddings.

## Tech Stack

- **Frontend/API**: Next.js (App Router), TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js
- **ML Engine**: Python (sentence-transformers, scikit-learn) for profile embedding and recommendation

## Project Structure

```
src/app/            Next.js App Router pages and API routes
src/lib/            Shared server utilities (db client, vector search)
src/types/          Shared TypeScript types
prisma/             Prisma schema and migrations
ml_engine/          Python embedding/preprocessing/evaluation scripts
data/               Sample and validation datasets
```

## Getting Started

1. Install Node dependencies:
   ```
   npm install
   ```
2. Copy the environment template and fill in values:
   ```
   cp .env.example .env
   ```
3. Set up the database:
   ```
   npx prisma migrate dev
   ```
4. Run the dev server:
   ```
   npm run dev
   ```

## ML Engine

Install Python dependencies in a virtual environment:

```
pip install -r requirements.txt
```

Scripts under `ml_engine/` handle text preprocessing, embedding generation, and recommendation evaluation metrics.
