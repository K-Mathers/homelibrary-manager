import { BookOpen, MoreHorizontal, Star } from "lucide-react";
import { Book, BookStatus } from "../model/types";
import { getBookCoverUrl } from "@/shared/lib";
import styles from "./BookCard.module.scss";

export interface BookCardProps {
  book: Book;
  onClick?: () => void;
  onMoreClick?: (book: Book) => void;
}

const STATUS_CONFIG: Record<BookStatus, { label: string; className: string }> =
  {
    reading: { label: "Читаю", className: styles.statusReading },
    read: { label: "Прочитано", className: styles.statusCompleted },
    unread: { label: "В планах", className: styles.statusPlanned },
  };

export const BookCard = ({ book, onClick, onMoreClick }: BookCardProps) => {
  const statusInfo = STATUS_CONFIG[book.status] || STATUS_CONFIG.unread;

  const authorsText =
    book.authors && book.authors.length > 0
      ? book.authors.map((a) => a.full_name).join(", ")
      : "";

  const current = book.current_page || 0;
  const total = book.page_count || 1;
  const progressPercent = Math.min(100, Math.round((current / total) * 100));

  const progressLabel =
    book.id === 1 && book.current_page && book.page_count
      ? `${book.current_page}/${book.page_count} стр. · ${progressPercent}%`
      : `${progressPercent}%`;

  const coverUrl = getBookCoverUrl(book.cover_image_path);

  return (
    <article className={styles.card} onClick={onClick}>
      <div className={styles.previewContainer}>
        <button
          type="button"
          className={styles.moreButton}
          onClick={(e) => {
            e.stopPropagation();
            onMoreClick?.(book);
          }}
          aria-label="Опции книги"
        >
          <MoreHorizontal size={16} />
        </button>

        <div className={styles.bookCover}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              className={styles.coverImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.coverPlaceholder}>
              <BookOpen size={18} className={styles.placeholderIcon} />
              <div className={styles.coverInfo}>
                <span className={styles.coverTitle}>{book.title}</span>
                {authorsText && (
                  <span className={styles.coverAuthor}>{authorsText}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title} title={book.title}>
          {book.title}
        </h3>
        {authorsText && <p className={styles.author}>{authorsText}</p>}

        <div className={styles.statusRow}>
          <div className={`${styles.statusBadge} ${statusInfo.className}`}>
            <span className={styles.statusDot} />
            <span>{statusInfo.label}</span>
          </div>

          {book.status === "reading" && (
            <span className={styles.progressText}>{progressLabel}</span>
          )}

          {book.status === "read" && book.rating && (
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={11}
                  className={
                    star <= (book.rating || 5)
                      ? styles.starFilled
                      : styles.starEmpty
                  }
                />
              ))}
            </div>
          )}
        </div>

        {book.status === "reading" && (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    </article>
  );
};
