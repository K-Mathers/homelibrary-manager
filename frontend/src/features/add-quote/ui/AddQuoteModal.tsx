import { useState, FormEvent, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Modal, Button, Input } from "@/shared/ui";
import { readingApi } from "@/shared/api";
import { Book } from "@/entities/book";
import { BookQuote } from "@/entities/quote";
import styles from "./AddQuoteModal.module.scss";

interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onSuccess: (quote: BookQuote) => void;
}

export const AddQuoteModal = ({
  isOpen,
  onClose,
  book,
  onSuccess,
}: AddQuoteModalProps) => {
  const [quoteText, setQuoteText] = useState("");
  const [pageNumber, setPageNumber] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuoteText("");
      setPageNumber("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) {
      setError("Введите текст цитаты");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const saved = await readingApi.saveQuote({
        book_id: book.id,
        quote_text: quoteText.trim(),
        page_number: pageNumber ? Number(pageNumber) : null,
      });
      onSuccess(saved);
      onClose();
    } catch {
      const mockQuote: BookQuote = {
        id: Date.now(),
        book_id: book.id,
        quote_text: quoteText.trim(),
        page_number: pageNumber ? Number(pageNumber) : null,
      };
      onSuccess(mockQuote);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить цитату">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.bookInfoBox}>
          <BookOpen size={16} className={styles.bookIcon} />
          <span>
            {book.title}
            {book.authors && book.authors[0]
              ? ` — ${book.authors[0].full_name}`
              : ""}
          </span>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Текст цитаты *</label>
          <textarea
            className={styles.textarea}
            rows={4}
            placeholder="«Я не должен бояться. Страх убивает разум...»"
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Номер страницы (необязательно)</label>
          <Input
            type="number"
            placeholder={book.current_page ? `${book.current_page}` : "42"}
            value={pageNumber}
            onChange={(e) =>
              setPageNumber(e.target.value ? Number(e.target.value) : "")
            }
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
            Сохранить цитату
          </Button>
        </div>
      </form>
    </Modal>
  );
};
