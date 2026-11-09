import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, ChevronDown, History, Plus, Quote } from "lucide-react";
import { Book, MOCK_BOOKS } from "@/entities/book";
import { BookQuote } from "@/entities/quote";
import { ReadingSession } from "@/entities/reading-session";
import { RecordSessionModal } from "@/features/record-reading-session";
import { AddQuoteModal } from "@/features/add-quote";
import { booksApi, readingApi } from "@/shared/api";
import { Button } from "@/shared/ui";
import {
  formatCurrentDate,
  formatShortDate,
  getBookCoverUrl,
  addStoredSession,
  saveBookOverride,
  applyBookOverrides,
} from "@/shared/lib";
import styles from "./ReadingJournalPage.module.scss";

interface DisplaySession {
  id: number;
  book_id: number;
  date_label: string;
  sub_label: string;
  delta_pages: number;
  is_accent?: boolean;
}

const INITIAL_SESSIONS: DisplaySession[] = [
  {
    id: 1,
    book_id: 1,
    date_label: "Сегодня",
    sub_label: "45 мин",
    delta_pages: 42,
    is_accent: true,
  },
  {
    id: 2,
    book_id: 1,
    date_label: formatShortDate(Date.now() - 4 * 24 * 60 * 60 * 1000),
    sub_label: "Дюна",
    delta_pages: 35,
    is_accent: false,
  },
];

const INITIAL_QUOTES: BookQuote[] = [
  {
    id: 1,
    book_id: 1,
    quote_text: "«Я не должен бояться...»",
    page_number: 48,
  },
  {
    id: 2,
    book_id: 1,
    quote_text:
      "«Тайна жизни не в том, чтобы решать проблемы, а в том, чтобы жить с ними.»",
    page_number: 185,
  },
];

export const ReadingJournalPage = () => {
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get("bookId");

  const [books, setBooks] = useState<Book[]>(() => applyBookOverrides(MOCK_BOOKS));
  const [selectedBookId, setSelectedBookId] = useState<number>(() => {
    if (bookIdParam) return Number(bookIdParam);
    const reading = MOCK_BOOKS.find((b) => b.status === "reading");
    return reading ? reading.id : MOCK_BOOKS[0].id;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const [sessions, setSessions] = useState<DisplaySession[]>(INITIAL_SESSIONS);
  const [quotes, setQuotes] = useState<BookQuote[]>(INITIAL_QUOTES);

  const currentBook =
    books.find((b) => b.id === selectedBookId) || books[0] || MOCK_BOOKS[0];

  const [quickPage, setQuickPage] = useState<number | "">(
    currentBook.current_page || 0,
  );

  useEffect(() => {
    setQuickPage(currentBook.current_page || 0);
  }, [currentBook.id, currentBook.current_page]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const remoteBooks = await booksApi.getBooks();
        if (Array.isArray(remoteBooks) && remoteBooks.length > 0) {
          setBooks(applyBookOverrides(remoteBooks));
        }
      } catch {
        setBooks(applyBookOverrides(MOCK_BOOKS));
      }
    };
    loadBooks();
  }, []);

  useEffect(() => {
    if (bookIdParam) {
      setSelectedBookId(Number(bookIdParam));
    }
  }, [bookIdParam]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = currentBook.current_page || 0;
  const total = currentBook.page_count || 1;
  const progressPercent = Math.min(100, Math.round((current / total) * 100));

  const authorName = currentBook.authors?.[0]?.full_name || "Неизвестный автор";
  const genreName = currentBook.genres?.[0]?.name || "Научная фантастика";

  const getShortAuthor = (full: string) => {
    const parts = full.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}. ${parts[1]}`;
    }
    return full;
  };

  const handleSessionRecorded = (session: ReadingSession) => {
    const updatedPage = session.end_page;
    const delta = updatedPage - (currentBook.current_page || 0);
    const isFinished = updatedPage >= (currentBook.page_count || 1);

    saveBookOverride(session.book_id, {
      current_page: updatedPage,
      status: isFinished ? "read" : undefined,
    });

    if (delta > 0) {
      addStoredSession({
        book_id: session.book_id,
        start_page: session.start_page,
        end_page: session.end_page,
        duration_minutes: session.duration_minutes || 0,
        notes: session.notes,
      });
    }

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === session.book_id) {
          return {
            ...b,
            current_page: updatedPage,
            status: isFinished ? "read" : b.status,
          };
        }
        return b;
      }),
    );

    if (delta > 0) {
      const newDisplaySession: DisplaySession = {
        id: Date.now(),
        book_id: session.book_id,
        date_label: "Сегодня",
        sub_label: session.duration_minutes
          ? `${session.duration_minutes} мин`
          : currentBook.title,
        delta_pages: delta,
        is_accent: true,
      };
      setSessions((prev) => [newDisplaySession, ...prev]);
    }
  };

  const handleQuickPageUpdate = async () => {
    if (quickPage === "" || quickPage === currentBook.current_page) return;
    const newPageNum = Math.min(
      currentBook.page_count || 1,
      Math.max(0, Number(quickPage)),
    );
    const delta = newPageNum - (currentBook.current_page || 0);
    const isFinished = newPageNum >= (currentBook.page_count || 1);

    saveBookOverride(currentBook.id, {
      current_page: newPageNum,
      status: isFinished ? "read" : undefined,
    });

    if (delta > 0) {
      addStoredSession({
        book_id: currentBook.id,
        start_page: currentBook.current_page || 0,
        end_page: newPageNum,
        duration_minutes: 15,
      });
    }

    try {
      if (delta > 0) {
        await readingApi.recordSession({
          book_id: currentBook.id,
          start_page: currentBook.current_page || 0,
          end_page: newPageNum,
          duration_minutes: 15,
        });
      }
    } catch {
      void 0;
    }

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === currentBook.id) {
          return {
            ...b,
            current_page: newPageNum,
            status: isFinished ? "read" : b.status,
          };
        }
        return b;
      }),
    );

    if (delta > 0) {
      setSessions((prev) => [
        {
          id: Date.now(),
          book_id: currentBook.id,
          date_label: "Сегодня",
          sub_label: `${delta} стр.`,
          delta_pages: delta,
          is_accent: true,
        },
        ...prev,
      ]);
    }
  };

  const handleQuoteSaved = (quote: BookQuote) => {
    setQuotes((prev) => [quote, ...prev]);
  };

  const currentBookQuotes = quotes.filter((q) => q.book_id === currentBook.id);
  const activeQuote = currentBookQuotes[0] || quotes[0];

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Читательский дневник</h1>
        <span className={styles.dateLabel}>{formatCurrentDate()}</span>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.dropdownWrapper} ref={dropdownRef}>
          <button
            type="button"
            className={styles.bookDropdownBtn}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <BookOpen size={16} className={styles.bookDropdownIcon} />
            <span>
              {currentBook.title} — {getShortAuthor(authorName)}
            </span>
            <ChevronDown
              size={14}
              className={`${styles.dropdownChevron} ${
                isDropdownOpen ? styles.rotated : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              {books.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`${styles.dropdownItem} ${
                    b.id === currentBook.id ? styles.activeDropdownItem : ""
                  }`}
                  onClick={() => {
                    setSelectedBookId(b.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <span>{b.title}</span>
                  {b.status === "reading" && <span>•</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            icon={<Plus size={14} />}
            onClick={() => setIsQuoteModalOpen(true)}
          >
            Цитата
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => setIsSessionModalOpen(true)}
          >
            Записать сессию
          </Button>
        </div>
      </div>

      <div className={styles.focusCard}>
        <div className={styles.coverSide}>
          <div className={styles.bookThumb}>
            {getBookCoverUrl(currentBook.cover_image_path) ? (
              <img
                src={getBookCoverUrl(currentBook.cover_image_path)}
                alt={currentBook.title}
              />
            ) : (
              <div className={styles.placeholderCover}>
                <BookOpen size={22} className={styles.placeholderIcon} />
                <span className={styles.placeholderTitle}>
                  {currentBook.title}
                </span>
                <span className={styles.placeholderAuthor}>
                  {authorName.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.detailsSide}>
          <div className={styles.topDetails}>
            <div className={styles.titleRow}>
              <h2 className={styles.bookTitle}>{currentBook.title}</h2>
              <div className={styles.statusPill}>
                <span className={styles.statusDot} />
                <span>
                  {currentBook.status === "reading"
                    ? "Читаю"
                    : currentBook.status === "read"
                      ? "Прочитано"
                      : "В планах"}
                </span>
              </div>
            </div>
            <p className={styles.subtitle}>
              {authorName} · {genreName}
            </p>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.numbersRow}>
              <div className={styles.pagesGroup}>
                <span className={styles.pagesCurrent}>{current}</span>
                <span className={styles.pagesTotal}>/ {total} стр.</span>
              </div>
              <span className={styles.percentLabel}>{progressPercent}%</span>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className={styles.quickUpdateRow}>
            <span className={styles.quickUpdateLabel}>Текущая страница</span>
            <input
              type="number"
              className={styles.quickPageInput}
              value={quickPage}
              onChange={(e) =>
                setQuickPage(e.target.value ? Number(e.target.value) : "")
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleQuickPageUpdate();
              }}
            />
            <button
              type="button"
              className={styles.quickUpdateBtn}
              onClick={handleQuickPageUpdate}
            >
              Обновить
            </button>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.cardPanel}>
          <div>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Сессии чтения</h3>
              <History size={16} className={styles.panelIcon} />
            </div>

            <div className={styles.sessionsList}>
              {sessions.map((item) => (
                <div key={item.id} className={styles.sessionItem}>
                  <div className={styles.sessionLeft}>
                    <div
                      className={`${styles.sessionBadge} ${
                        item.is_accent ? styles.badgeAccent : styles.badgeMuted
                      }`}
                    >
                      <BookOpen size={16} />
                    </div>
                    <div className={styles.sessionMeta}>
                      <span className={styles.sessionDate}>
                        {item.date_label}
                      </span>
                      <span className={styles.sessionSub}>
                        {item.sub_label}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`${styles.sessionDelta} ${
                      !item.is_accent ? styles.deltaMuted : ""
                    }`}
                  >
                    +{item.delta_pages} стр.
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className={styles.panelFooterNote}>
            Маленькие шаги складываются в большие истории.
          </p>
        </div>

        <div className={styles.cardPanel}>
          <div>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Цитаты</h3>
              <Quote size={18} className={styles.quoteHeaderIcon} />
            </div>

            {activeQuote && (
              <div className={styles.quoteBlock}>
                <blockquote className={styles.quoteText}>
                  {activeQuote.quote_text}
                </blockquote>
                <div className={styles.quoteMetaRow}>
                  {activeQuote.page_number && (
                    <span className={styles.quotePageTag}>
                      стр. {activeQuote.page_number}
                    </span>
                  )}
                  <span className={styles.quoteAuthorBook}>
                    {authorName} · {currentBook.title}
                  </span>
                </div>
              </div>
            )}
          </div>

          <p className={styles.panelFooterNote}>
            Слова, к которым хочется вернуться.
          </p>
        </div>
      </div>

      <RecordSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        book={currentBook}
        onSuccess={handleSessionRecorded}
      />

      <AddQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        book={currentBook}
        onSuccess={handleQuoteSaved}
      />
    </div>
  );
};

export const BookDetailPage = ReadingJournalPage;
