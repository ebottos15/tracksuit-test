// client/src/components/insights/insights.tsx
import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { cx } from "../../lib/cx.ts";
import styles from "./insights.module.css";
import type { Insight } from "../../schemas/insight.ts";
import { Modal } from "../modal/modal.tsx";
import { Button } from "../button/button.tsx";
import { BRANDS } from "../../lib/consts.ts";


type InsightsProps = {
  insights: Insight[];
  className?: string;
  onDeleted?(id: number): void;
};

const brandName = (id: number) =>
  BRANDS.find(b => b.id === id)?.name ?? `Brand ${id}`;

export const Insights = ({ insights, className, onDeleted }: InsightsProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open confirmation dialog for a specific insight
  const requestDelete = (id: number) => {
    setError(null);
    setPendingId(id);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (submitting) return; 
    setConfirmOpen(false);
    setPendingId(null);
    setError(null);
  };

  // Call DELETE /api/insights/:id
  const confirmDelete = async () => {
    if (pendingId == null) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/insights/${pendingId}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Delete failed (${res.status})`);
      }
      onDeleted?.(pendingId);
      closeConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cx(className)}>
      <h1 className={styles.heading}>Insights</h1>

      {/* Confirm Delete Modal */}
      <Modal open={confirmOpen} onClose={closeConfirm}>
        <h2 className={styles.heading}>Delete insight?</h2>
        <p>Are you sure you want to delete this insight? This action cannot be undone.</p>
        {error && <p className={styles.error}>{error}</p>}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
          <Button
            label={submitting ? "Deleting…" : "Delete"}
            onClick={confirmDelete}
            disabled={submitting}
          />
          <Button
            theme="secondary"
            label="Cancel"
            onClick={closeConfirm}
            disabled={submitting}
          />
        </div>
      </Modal>

      <div className={styles.list}>
        {insights.length > 0 ? (
          insights.map(({ id, brand, createdAt, text }) => (
            <div key={id} className={styles.insight}>
              <div className={styles["insight-meta"]}>
                  <span>{brandName(brand)}</span>
                  <div className={styles["insight-meta-details"]}>
                    <span> {new Date(createdAt).toLocaleString()}</span>
                    <Trash2Icon
                      className={styles["insight-delete"]}
                      onClick={() => requestDelete(id)}  
                      role="button"
                      aria-label="Delete insight"
                      tabIndex={0}
                    />
                  </div>
                </div>
              <p className={styles["insight-content"]}>{text}</p>
            </div>
          ))
        ) : (
          <p>We have no insight!</p>
        )}
      </div>
    </div>
  );
};
