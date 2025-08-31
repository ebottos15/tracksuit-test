import { useState } from "react";
import type { Insight } from "../../schemas/insight.ts";
import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps & {
  onCreated?(insight: Insight): void;
};

export const AddInsight = ({onCreated, onClose, ...props }: AddInsightProps) => {
  const [brand, setBrand] = useState<number>(BRANDS[0]?.id ?? 1);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addInsight: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // createdAt is set server-side (ISO string). We just send brand + text.
        body: JSON.stringify({ brand, text: trimmed }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || `Create failed (${res.status})`);
        return;
        }
      const created: Insight = await res.json(); // { id, brand, createdAt, text }
      onCreated?.(created);

      // reset + close
      setText("");
      setBrand(BRANDS[0]?.id ?? 1);
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal  onClose={onClose} {...props}>
      <h1 className={styles.heading}>Add a new insight</h1>
      <form className={styles.form} onSubmit={addInsight}>
        <label className={styles.field}>
          <select className={styles["field-input"]}>
            {BRANDS.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          Insight
          <textarea
            className={styles["field-input"]}
            rows={5}
            placeholder="Something insightful..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <Button 
          className={styles.submit} 
          type="submit" 
          label={submitting ? "Saving…" : "Add insight"}
          disabled={submitting || !text.trim()}
        />
      </form>
    </Modal>
  );
};
