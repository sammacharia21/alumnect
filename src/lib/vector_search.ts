import { spawn } from "child_process";
import path from "path";
import prisma from "./db";
import type { MentorMatch } from "@/types";

export const DEFAULT_OPERATIONAL_THRESHOLD = 0.45;
export const DEFAULT_MATCH_LIMIT = 10;

/**
 * Generates a 384-dimensional dense SBERT embedding for input text.
 * Checks for the live Python microservice first, then gracefully falls back
 * to the direct child_process CLI bridge.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Text cannot be empty for embedding generation.");
  }

  const mlServerUrl = process.env.ML_ENGINE_URL || "http://127.0.0.1:8000";

  // 1. Try fast in-memory HTTP microservice
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${mlServerUrl}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.embedding) && data.embedding.length === 384) {
        return data.embedding;
      }
    }
  } catch {
    // Microservice unavailable; fallback to Python CLI bridge below
  }

  // 2. Fallback to child_process Python CLI bridge
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(process.cwd(), "ml_engine", "embed_cli.py");
    const pythonProcess = spawn("python", ["-u", scriptPath, "--stdin"]);

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`Python embed bridge exited with code ${code}: ${stderrData || stdoutData}`)
        );
      }

      try {
        const parsed = JSON.parse(stdoutData.trim());
        if (parsed.embedding && Array.isArray(parsed.embedding)) {
          resolve(parsed.embedding);
        } else {
          reject(new Error(parsed.error || "Invalid response format from Python embedder"));
        }
      } catch (err) {
        reject(new Error(`Failed to parse Python embedder output: ${err instanceof Error ? err.message : String(err)}`));
      }
    });

    pythonProcess.on("error", (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });

    // Write input text to stdin and close stream
    pythonProcess.stdin.write(trimmed);
    pythonProcess.stdin.end();
  });
}

export interface VectorSearchOptions {
  threshold?: number;
  limit?: number;
  department?: string;
  excludeUserId?: string;
}

/**
 * Executes a cosine similarity search against PostgreSQL with pgvector.
 * Matches on the condition: 1 - (embedding <=> query_vector) >= threshold.
 */
export async function searchMentorsByVector(
  embedding: number[],
  options?: VectorSearchOptions
): Promise<MentorMatch[]> {
  const threshold = options?.threshold ?? DEFAULT_OPERATIONAL_THRESHOLD;
  const limit = options?.limit ?? DEFAULT_MATCH_LIMIT;
  const department = options?.department?.trim();
  const excludeUserId = options?.excludeUserId;

  const vectorString = `[${embedding.join(",")}]`;

  // Construct raw query with pgvector cosine distance operator (<=>)
  // 1 - (embedding <=> query) computes cosine similarity
  let query = `
    SELECT 
      p.id,
      p."userId",
      p."fullName",
      p.department,
      p."jobTitle",
      p."yearsExperience",
      p.certifications,
      p."rawBio",
      (1 - (p.embedding <=> $1::vector)) AS similarity
    FROM profiles p
    JOIN users u ON u.id = p."userId"
    WHERE u.role = 'MENTOR'
      AND p.embedding IS NOT NULL
      AND (1 - (p.embedding <=> $1::vector)) >= $2
  `;

  const params: unknown[] = [vectorString, threshold];
  let paramIndex = 3;

  if (department && department !== "ALL") {
    query += ` AND p.department = $${paramIndex}`;
    params.push(department);
    paramIndex++;
  }

  if (excludeUserId) {
    query += ` AND p."userId" != $${paramIndex}`;
    params.push(excludeUserId);
    paramIndex++;
  }

  query += ` ORDER BY similarity DESC LIMIT $${paramIndex};`;
  params.push(limit);

  interface RawRow {
    id: string;
    userId: string;
    fullName: string;
    department: string;
    jobTitle: string;
    yearsExperience: number;
    certifications: string;
    rawBio: string;
    similarity: number | string;
  }

  const rows = await prisma.$queryRawUnsafe<RawRow[]>(query, ...params);

  return rows.map((r) => {
    const similarity = typeof r.similarity === "number" ? r.similarity : parseFloat(r.similarity);
    return {
      id: r.id,
      userId: r.userId,
      fullName: r.fullName,
      department: r.department,
      jobTitle: r.jobTitle,
      yearsExperience: r.yearsExperience,
      certifications: r.certifications || "",
      rawBio: r.rawBio,
      similarity: Number(similarity.toFixed(4)),
      compatibilityPercentage: Math.min(100, Math.max(0, Math.round(similarity * 100))),
    };
  });
}

/**
 * End-to-end recommendation function taking a query string or profile bio.
 */
export async function recommendMentorsForText(
  text: string,
  options?: VectorSearchOptions
): Promise<MentorMatch[]> {
  const vector = await generateEmbedding(text);
  return searchMentorsByVector(vector, options);
}

