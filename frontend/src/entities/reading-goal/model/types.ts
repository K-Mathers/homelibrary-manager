export interface ReadingGoal {
  id?: number;
  year: number;
  target_books?: number;
  current_books?: number;
  target_pages?: number;
  current_pages?: number;
}

export interface ReadingStatsSummary {
  total_pages: number;
  total_pages_year: number;
  goal: number;
  pages_progress: number;
}

