import type { Database } from "@db/sqlite";
import { loadSql } from "../utils/sql.ts";
import type { InsightInsert, InsightRow } from "../types/insights.types.ts";

/**
 * Repository for accessing the "insights" table
 */
export class InsightsRepository {
  private selectByIdSql = "";
  private insertSql = "";
  private deleteByIdSql = "";
  private selectAllSql = "";

  /**
   * Load queries in memory from .sql files
   */
  async init() {
    this.selectByIdSql = await loadSql("db/queries/insights/selectById.sql");
    this.insertSql = await loadSql("db/queries/insights/insert.sql");
    this.deleteByIdSql = await loadSql("db/queries/insights/deleteById.sql");
    this.selectAllSql = await loadSql("db/queries/insights/selectAll.sql");
  }

  /** Return all insights in the database. */
  selectAll(db: Database): InsightRow[] {
    const stmt = db.prepare(this.selectAllSql);
    try {
      const rows = stmt.all() as InsightRow[];
      return rows;
    } finally {
      stmt.finalize();
    }
  }

  /** Find a single insight by its id, or null if not found. */
  selectById(db: Database, id: number): InsightRow | null {
    const stmt = db.prepare(this.selectByIdSql);
    try {
      const row = stmt.get(id) as InsightRow | undefined;
      return row ?? null;
    } finally {
      stmt.finalize();
    }
  }

  /** Insert a new insight and return the generated row id. */
  insert(db: Database, item: InsightInsert): InsightRow {
    const stmt = db.prepare(this.insertSql);
    try {
      stmt.run(item.brand, item.createdAt, item.text);
      const id = Number(db.lastInsertRowId);
      return { id, ...item };
    } finally {
      stmt.finalize();
    }
  }

  /** Delete an insight by id. Assumes existence was checked before calling. */
  deleteById(db: Database, id: number): void {
    const stmt = db.prepare(this.deleteByIdSql);
    try {
      stmt.run(id);
    } finally {
      stmt.finalize();
    }
  }
}
