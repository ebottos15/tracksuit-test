import { Database } from "@db/sqlite";
import * as path from "@std/path";
import * as insightsTable from "./tables/insights.ts";

const dbFilePath = path.resolve("tmp", "db.sqlite3");

console.log(`Opening SQLite database at ${dbFilePath}`);

await Deno.mkdir(path.dirname(dbFilePath), { recursive: true });
export const db = new Database(dbFilePath);

db.exec(insightsTable.createTable);
