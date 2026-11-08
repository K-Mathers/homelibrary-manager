import { Routes, Route, Navigate } from "react-router-dom";
import { CatalogPage } from "@/pages/catalog";
import { ReadingJournalPage } from "@/pages/reading-journal";

export const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/journal" element={<ReadingJournalPage />} />
    </Routes>
  );
};
