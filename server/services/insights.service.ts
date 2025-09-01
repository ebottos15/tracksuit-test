import type { Database } from "@db/sqlite";
import { withTransaction } from "../db/client.ts";
import type { InsightsRepository } from "../repositories/insights.repo.ts";
import type { InsightInsert, InsightRow } from "../types/insights.types.ts";
import { NotFoundError } from "../utils/errors.ts";

/**
 * Application service for "insights" use-cases.
 */
export class InsightsService {
  constructor(private repo: InsightsRepository, private db: Database) {}

  /**
   * List all insights (newest-first if the SQL is ordered that way).
   *
   * @returns Array of persisted insights.
   */
  listAll(): InsightRow[] {
    return this.repo.selectAll(this.db);
  }

  /**
   * Get a single insight by id.
   *
   * @param id - Insight identifier.
   * @returns The matching insight.
   * @throws Error if no record exists for the given id.
   */
  getById(id: number): InsightRow {
    const row = this.repo.selectById(this.db, id);
    if (!row) throw new NotFoundError("Insight not found");
    return row;
  }

  /**
   * Create a new insight.
   *
   * @param input - Fields required to insert a new insight.
   * @returns The full created row, including the auto-generated id.
   */
  create(input: Omit<InsightInsert, "createdAt">): InsightRow {
    return withTransaction(this.db, (conn) => {
      const withTimestamp: InsightInsert = {
        ...input,
        createdAt: new Date().toISOString(),
      };
      return this.repo.insert(conn, withTimestamp);
    });
  }

  /**
   * Delete an existing insight by id.
   *
   * @param id - Insight identifier to delete.
   * @returns The deleted insight row.
   * @throws Error if the record does not exist.
   */
  delete(id: number): InsightRow {
    return withTransaction(this.db, (conn) => {
      const existing = this.repo.selectById(conn, id);
      if (!existing) {
        throw new NotFoundError("Insight not found");
      }
      this.repo.deleteById(conn, id);
      return existing;
    });
  }
}
