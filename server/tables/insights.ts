// server/tables/insights.ts
import type { Database } from "@db/sqlite";

export const createTable = `
  CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY ASC NOT NULL,
    brand INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    text TEXT NOT NULL
  )
`;

export type Row = {
  id: number;
  brand: number;
  createdAt: string;
  text: string;
};

export type Insert = {
  brand: number;
  createdAt: string;
  text: string;
};

export function insertInsight(db: Database, item: Insert): Row {
  const stmt = db.prepare(
    "INSERT INTO insights (brand, createdAt, text) VALUES (?, ?, ?)",
  );
  try {
    stmt.run(item.brand, item.createdAt, item.text);
  } finally {
    stmt.finalize();
  }
  return { id: Number(db.lastInsertRowId), ...item };
}

export function selectInsightById(db: Database, id: number): Row | null {
  const stmt = db.prepare(
    "SELECT id, brand, createdAt, text FROM insights WHERE id = ?",
  );
  try {
    const rows = stmt.all(id) as Array<{
      id: number;
      brand: number;
      createdAt: string;
      text: string;
    }>;
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    return {
      id: row.id,
      brand: row.brand,
      createdAt: row.createdAt,
      text: row.text,
    };
  } finally {
    stmt.finalize();
  }
}

export function deleteInsightById(db: Database, id: number): number {
  const stmt = db.prepare("DELETE FROM insights WHERE id = ?");
  try {
    const result = stmt.run(id);
    return result;
  } finally {
    stmt.finalize();
  }
}
