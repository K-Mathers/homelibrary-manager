export type BookStatus = 'unread' | 'reading' | 'read' | 'abandoned';

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
  current_page?: number;
}

export interface BookCreateManualRequest {
  title: string;
  page_count: number;
  raw_isbn?: string | null;
  publication_year?: number | null;
  description?: string | null;
}
