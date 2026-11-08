import { Book, BookCreateManualRequest } from "@/entities/book";
import { apiClient } from "./base";

export const booksApi = {
  addBookByIsbn: async (isbn: string) => {
    const res = await apiClient.post<Book>(`/books/isbn/${isbn}`);
    return res.data;
  },
  addBookManual: async (bookData: BookCreateManualRequest) => {
    const res = await apiClient.post<Book>("books/manual", bookData);
    return res.data;
  },
  getBooks: async (params?: { query?: string; status?: string }) => {
    const res = await apiClient.get<Book[]>("/books", { params });
    return res.data;
  },
  getBookById: async (id: number) => {
    const res = await apiClient.get<Book>(`books/${id}`);
    return res.data;
  },
};
