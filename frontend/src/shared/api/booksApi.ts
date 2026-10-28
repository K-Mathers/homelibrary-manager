import { apiClient } from './base';
import type { Book, BookCreateManualRequest } from '@/entities/book';

export const booksApi = {
  getCatalog: async (params?: { query?: string; status?: string; author_id?: number; genre_id?: number }) => {
    const response = await apiClient.get<Book[]>('/books', { params });
    return response.data;
  },

  addByIsbn: async (isbn: string) => {
    const response = await apiClient.post<Book>(`/books/isbn/${encodeURIComponent(isbn)}`);
    return response.data;
  },

  addManual: async (data: BookCreateManualRequest) => {
    const response = await apiClient.post<Book>('/books/manual', data);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Book>(`/books/${id}`);
    return response.data;
  },
};

