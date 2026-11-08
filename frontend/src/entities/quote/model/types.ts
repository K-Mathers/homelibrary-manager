export interface BookQuote {
  id?: number;
  book_id: number;
  quote_text: string;
  page_number?: number | null;
}

export interface BookQuoteCreateRequest {
  book_id: number;
  quote_text: string;
  page_number?: number | null;
}
