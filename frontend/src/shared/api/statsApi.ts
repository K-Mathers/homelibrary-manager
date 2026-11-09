import { apiClient } from "./base";

export interface ReadingStatsSummary {
  total_pages: number;
  total_pages_year: number;
  goal: number;
  pages_progress: number;
}

export const statsApi = {
  getSummary: async (params?: {
    start_date?: string;
    end_date?: string;
    year?: number;
    month?: number;
  }): Promise<ReadingStatsSummary> => {
    const response = await apiClient.get<ReadingStatsSummary>(
      "/stats/summary",
      { params },
    );
    return response.data;
  },
  downloadCsv: async (): Promise<void> => {
    const response = await apiClient.get("/backup/export-csv", {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "library_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
