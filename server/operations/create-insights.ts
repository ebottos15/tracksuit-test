import type { Database } from "@db/sqlite";
import { type Insert, insertInsight, type Row } from "../tables/insights.ts";

export default function createInsight(
  { db, item }: { db: Database; item: Insert },
): Row {
  return insertInsight(db, item);
}
