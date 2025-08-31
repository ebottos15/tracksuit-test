import type { Database } from "@db/sqlite";
import {
  deleteInsightById,
  type Row,
  selectInsightById,
} from "../tables/insights.ts";

export default function deleteInsight(
  { db, id }: { db: Database; id: number },
): Row | null {
  const existing = selectInsightById(db, id);
  if (!existing) {
    return null;
  }
  if (!deleteInsightById(db, id)) {
    return null;
  }
  return existing;
}
