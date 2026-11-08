import { useState, FormEvent, useEffect } from "react";
import { Modal, Button, Input } from "@/shared/ui";
import { readingApi } from "@/shared/api";
import { Book } from "@/entities/book";
import { ReadingSession } from "@/entities/reading-session";
import styles from "./RecordSessionModal.module.scss";

interface RecordSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onSuccess: (session: ReadingSession) => void;
}

export const RecordSessionModal = ({
  isOpen,
  onClose,
  book,
  onSuccess,
}: RecordSessionModalProps) => {
  const [startPage, setStartPage] = useState<number>(book.current_page || 0);
  const [endPage, setEndPage] = useState<number | "">("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">(30);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStartPage(book.current_page || 0);
      setEndPage("");
      setDurationMinutes(30);
      setNotes("");
      setError(null);
    }
  }, [isOpen, book]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (endPage === "" || endPage < startPage) {
      setError("Конечная страница должна быть не меньше начальной");
      return;
    }
    if (endPage > book.page_count) {
      setError(`В книге всего ${book.page_count} страниц`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const session = await readingApi.recordSession({
        book_id: book.id,
        start_page: startPage,
        end_page: Number(endPage),
        duration_minutes: durationMinutes ? Number(durationMinutes) : 0,
        notes: notes.trim() || null,
      });

      onSuccess(session);
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || "Не удалось сохранить сессию чтения";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const pagesDelta =
    endPage !== "" && endPage >= startPage ? Number(endPage) - startPage : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Запись чтения: ${book.title}`}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.rangeRow}>
          <div className={styles.field}>
            <label className={styles.label}>С какой страницы</label>
            <Input
              type="number"
              value={startPage}
              onChange={(e) => setStartPage(Number(e.target.value))}
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>По какую страницу *</label>
            <Input
              type="number"
              placeholder={`макс. ${book.page_count}`}
              value={endPage}
              onChange={(e) =>
                setEndPage(e.target.value ? Number(e.target.value) : "")
              }
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>

        {pagesDelta > 0 && (
          <div className={styles.deltaNotice}>
            Прочитано: <strong>{pagesDelta}</strong> стр. из {book.page_count}
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Время чтения (минут)</label>
          <Input
            type="number"
            placeholder="30"
            value={durationMinutes}
            onChange={(e) =>
              setDurationMinutes(e.target.value ? Number(e.target.value) : "")
            }
            disabled={isLoading}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Заметки к сессии</label>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Интересные мысли, выводы или впечатления..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.actions}>
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Зафиксировать чтение
          </Button>
        </div>
      </form>
    </Modal>
  );
};
