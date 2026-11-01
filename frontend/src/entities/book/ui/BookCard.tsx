import { BookOpen, Star } from "lucide-react";
import { Book, BookStatus } from "../model/types";
import styles from "./BookCard.module.scss";

export interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

const STATUS_CONFIG: Record<
  BookStatus,
  { label: string; className: string }
> = {
  reading: { label: "Читаю", className: styles.statusReading },
  read: { label: "Прочитано", className: styles.statusCompleted },
  unread: { label: "В планах", className: styles.statusPlanned },
};

export const BookCard = ({ book, onClick }: BookCardProps) => {
  const statusInfo = STATUS_CONFIG[book.status] || STATUS_CONFIG.unread;

  const authorsText =
    book.authors && book.authors.length > 0
      ? book.authors.map((a) => a.full_name).join(", ")
      : null;

  const current = book.current_page || 0;
  const total = book.page_count || 1;
  const progressPercent = Math.min(100, Math.round((current / total) * 100));

  return (
    <article className={styles.card} onClick={onClick}>
      <div className={styles.coverWrapper}>
        {book.cover_image_path ? (
          <img
            src={book.cover_image_path}
            alt={book.title}
            className={styles.coverImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.coverPlaceholder}>
            <BookOpen size={28} className={styles.placeholderIcon} />
          </div>
        )}

        <div className={`${styles.statusBadge} ${statusInfo.className}`}>
          <span className={styles.statusDot} />
          {statusInfo.label}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.metaRow}>
          {authorsText && <span className={styles.author}>{authorsText}</span>}
          {book.publication_year && (
            <span className={styles.year}>{book.publication_year}</span>
          )}
        </div>

        <h3 className={styles.title} title={book.title}>
          {book.title}
        </h3>

        <div className={styles.footer}>
          {book.rating ? (
            <div className={styles.rating} aria-label={`Рейтинг ${book.rating} из 5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={star <= book.rating! ? styles.starFilled : styles.starEmpty}
                />
              ))}
            </div>
          ) : (
            <div className={styles.ratingEmpty}>Без оценки</div>
          )}

          {book.status === "reading" && (
            <span className={styles.progressPercent}>{progressPercent}%</span>
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
