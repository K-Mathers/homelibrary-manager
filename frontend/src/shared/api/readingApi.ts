import { apiClient } from "./base";
import {
  ReadingSession,
  ReadingSessionCreateRequest,
} from "@/entities/reading-session";
import { BookQuote, BookQuoteCreateRequest } from "@/entities/quote";

export const readingApi = {
  recordSession: async (
    data: ReadingSessionCreateRequest,
  ): Promise<ReadingSession> => {
    const response = await apiClient.post<ReadingSession>(
      "/reading/sessions",
      data,
    );
    return response.data;
  },
  saveQuote: async (data: BookQuoteCreateRequest): Promise<BookQuote> => {
    const response = await apiClient.post<BookQuote>("/reading/quotes", data);
    return response.data;
  },
};
