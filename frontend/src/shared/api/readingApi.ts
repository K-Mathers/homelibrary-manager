import { apiClient } from './base';
import type { ReadingSession, ReadingSessionCreateRequest } from '@/entities/reading-session';
import type { BookQuote, BookQuoteCreateRequest } from '@/entities/quote';
import type { ReadingStatsSummary } from '@/entities/reading-goal';

export const readingApi = {
  addSession: async (data: ReadingSessionCreateRequest) => {
    const response = await apiClient.post<ReadingSession>('/reading/sessions', data);
    return response.data;
  },

  addQuote: async (data: BookQuoteCreateRequest) => {
    const response = await apiClient.post<BookQuote>('/reading/quotes', data);
    return response.data;
  },

  getStatsSummary: async (params?: { start_date?: string; end_date?: string; year?: number; month?: number }) => {
    const response = await apiClient.get<ReadingStatsSummary>('/stats/summary', { params });
    return response.data;
  },

  exportCsv: async () => {
    const response = await apiClient.get('/backup/export-csv', { responseType: 'blob' });
    return response.data;
  },
};

