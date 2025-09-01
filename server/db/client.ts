import { Database } from "@db/sqlite";

export type Transaction<Tx> = (db: Database) => Tx;

/**
 * Open a SQLlite database connection at the given file path
 * @param path - Filesystempath to the SQlit database file
 * @returns active database connection
 */
export function openDb(path: string) {
  const db = new Database(path);
  return db;
}

/**
 * Execute a function/query inside a database connection transaction
 * Ensure that all statements are either fuly committed or rolled back if an error occurs
 * @param db Active database connection
 * @param fn function/query to execute inside the transaction
 * @returns Result of the function/query
 * @throws re-throws any error encountered during the transaction
 */
export function withTransaction<Tx>(db: Database, fn: Transaction<Tx>): Tx {
  db.exec("BEGIN");
  try {
    const out = fn(db);
    db.exec("COMMIT");
    return out;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
