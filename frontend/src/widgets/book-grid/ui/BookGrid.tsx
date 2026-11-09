import { Book, BookCard } from "@/entities/book";
import { Button } from "@/shared/ui";
import { BookSkeleton } from "./BookSkeleton";
import styles from "./BookGrid.module.scss";
import { SearchX } from "lucide-react";

export interface BookGridProps {
  books: Book[];
  isLoading?: boolean;
  totalCount?: number;
  onBookClick?: (book: Book) => void;
  onResetFilters?: () => void;
}

export const BookGrid = ({
  books,
  isLoading = false,
  totalCount,
  onBookClick,
  onResetFilters,
}: BookGridProps) => {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <BookSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrapper}>
          <SearchX size={36} className={styles.emptyIcon} />
        </div>
        <h3 className={styles.emptyTitle}>Книги не найдены</h3>
        <p className={styles.emptyText}>
          По вашему запросу ничего не нашлось. Попробуйте изменить фильтры или
          строку поиска.
        </p>
        {onResetFilters && (
          <Button variant="secondary" onClick={onResetFilters}>
            Сбросить фильтры
          </Button>
        )}
      </div>
    );
  }

  const total = totalCount ?? books.length;

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => onBookClick?.(book)}
          />
        ))}
      </div>

      <div className={styles.footer}>
        <span className={styles.countText}>
          Показано {books.length} из {total} книг
        </span>
      </div>
    </div>
  );
};
