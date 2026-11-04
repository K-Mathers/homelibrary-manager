import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import React from "react";
import { Routing } from "./providers/router";

export const App: React.FC = () => {
  return (
    <div className="app">
      <Sidebar />
      <Routing />
    </div>
  );
};
