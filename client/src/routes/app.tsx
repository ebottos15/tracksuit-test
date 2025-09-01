import { useEffect, useState } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import styles from "./app.module.css";
import type { Insight } from "../schemas/insight.ts";

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    (async() => {
      const res = await fetch(`/api/insights`);
      const data = await res.json();
      setInsights(data);
    })();
  }, []);

  // append newly created insight to the top of the list
  const handleCreated = (created: Insight) => {
    setInsights(prev => [created, ...prev]);
  };

  // remove from UI after successful delete
  const handleDeleted = (id: number) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <main className={styles.main}>
      <Header onCreated={handleCreated} />
      <Insights 
        className={styles.insights} 
        insights={insights}
        onDeleted={handleDeleted} 
      />
    </main>
  );
};
