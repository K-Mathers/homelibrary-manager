export interface ReadingSession {
  id: number;
  book_id: number;
  session_date: string;
  start_page: number;
  end_page: number;
  pages_read: number;
  duration_minutes: number;
  notes?: string | null;
}

export interface ReadingSessionCreateRequest {
  book_id: number;
  start_page: number;
  end_page: number;
  session_date?: string;
  duration_minutes?: number;
  notes?: string | null;
}

