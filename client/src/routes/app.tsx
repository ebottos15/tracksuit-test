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

  return (
    <main className={styles.main}>
      <Header />
      <Insights className={styles.insights} insights={insights} />
    </main>
  );
};
