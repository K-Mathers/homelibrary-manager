import { CatalogPage } from "@/pages/catalog/ui/CatalogPage";
import { Routes, Route } from "react-router-dom";

export const Routing = () => {
  return (
    <Routes>
      <Route path="/catalog" element={<CatalogPage />} />
    </Routes>
  );
};
