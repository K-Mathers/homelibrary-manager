export type BookStatus = "unread" | "reading" | "read"

export interface Book {
  id: number;
  title: string;
  isbn?: string | null;
  page_count: number;
  publication_year?: number | null;
  description?: string | null;
  cover_image_path?: string | null;
  rating?: number | null;
  status: BookStatus;
  created_at?: string;
  authors?: Array<{ id: number; full_name: string }>;
  genres?: Array<{ id: number; name: string }>;
  current_page?: number;
}

export interface BookCreateManualRequest {
  title: string;
  page_count: number;
  raw_isbn?: string | null;
  publication_year?: number | null;
  description?: string | null;
}

export type CreateBookDto = BookCreateManualRequest;

