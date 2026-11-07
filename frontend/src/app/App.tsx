import React from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { Routing } from "./providers/router";
import styles from "./App.module.scss";

export const App: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Routing />
      </main>
    </div>
  );
};
