import { useState, FormEvent } from "react";
import { Modal, Button, Input } from "@/shared/ui";
import { booksApi } from "@/shared/api";
import { Book } from "@/entities/book";
import styles from "./AddBookModal.module.scss";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBook: Book) => void;
}

export const AddBookModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddBookModalProps) => {
  const [mode, setMode] = useState<"isbn" | "manual">("isbn");
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [pageCount, setPageCount] = useState<number | "">("");
  const [pubYear, setPubYear] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setIsbn("");
    setTitle("");
    setPageCount("");
    setPubYear("");
    setDescription("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let createdBook: Book;

      if (mode === "isbn") {
        if (!isbn.trim()) {
          setError("Введите ISBN книги");
          setIsLoading(false);
          return;
        }
        createdBook = await booksApi.addBookByIsbn(isbn.trim());
      } else {
        if (!title.trim() || !pageCount) {
          setError("Укажите название и количество страниц");
          setIsLoading(false);
          return;
        }
        createdBook = await booksApi.addBookManual({
          title: title.trim(),
          page_count: Number(pageCount),
          publication_year: pubYear ? Number(pubYear) : null,
          description: description.trim() || null,
        });
      }

      onSuccess(createdBook);
      handleClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        "Ошибка при добавлении книги. Проверьте данные.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Добавить книгу">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${mode === "isbn" ? styles.activeTab : ""}`}
            onClick={() => {
              setMode("isbn");
              setError(null);
            }}
          >
            Поиск по ISBN
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${mode === "manual" ? styles.activeTab : ""}`}
            onClick={() => {
              setMode("manual");
              setError(null);
            }}
          >
            Вручную
          </button>
        </div>

        {mode === "isbn" ? (
          <div className={styles.tabContent}>
            <p className={styles.hint}>
              Введите 10 или 13 цифр штрихкода. Сервис автоматически загрузит
              название, обложку и автора.
            </p>
            <div className={styles.field}>
              <label className={styles.label}>ISBN книги *</label>
              <Input
                placeholder="Например: 9780441172719"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        ) : (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label className={styles.label}>Название книги *</label>
              <Input
                placeholder="Дюна"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Страниц *</label>
                <Input
                  type="number"
                  placeholder="688"
                  value={pageCount}
                  onChange={(e) =>
                    setPageCount(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={isLoading}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Год издания</label>
                <Input
                  type="number"
                  placeholder="1965"
                  value={pubYear}
                  onChange={(e) =>
                    setPubYear(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Описание книги</label>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="Краткая аннотация..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.actions}>
          <Button
            variant="secondary"
            type="button"
            onClick={handleClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {mode === "isbn" ? "Найти и добавить" : "Сохранить"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
