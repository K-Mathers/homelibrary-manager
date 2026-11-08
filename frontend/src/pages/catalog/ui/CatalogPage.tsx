import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Header } from "@/widgets/header";
import { BookGrid } from "@/widgets/book-grid";
import { MOCK_BOOKS, Book } from "@/entities/book";
import { AddBookModal } from "@/features/add-book-by-isbn";
import { booksApi } from "@/shared/api";
import { Button, Input } from "@/shared/ui";
import styles from "./CatalogPage.module.scss";

type StatusFilterId = "all" | "reading" | "planned" | "read";

const STATUS_FILTERS: Array<{ id: StatusFilterId; label: string }> = [
  { id: "all", label: "Все" },
  { id: "reading", label: "Читаю" },
  { id: "planned", label: "В планах" },
  { id: "read", label: "Прочитано" },
];

export const CatalogPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [activeStatus, setActiveStatus] = useState<StatusFilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const data = await booksApi.getBooks();
      if (Array.isArray(data) && data.length > 0) {
        setBooks(data);
      }
    } catch {
      setBooks(MOCK_BOOKS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBookCreated = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      if (activeStatus === "reading" && book.status !== "reading") return false;
      if (activeStatus === "read" && book.status !== "read") return false;
      if (activeStatus === "planned" && book.status !== "unread") return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesAuthor = book.authors?.some((a) =>
          a.full_name.toLowerCase().includes(query),
        );
        return matchesTitle || matchesAuthor;
      }

      return true;
    });
  }, [books, activeStatus, searchQuery]);

  const handleResetFilters = () => {
    setActiveStatus("all");
    setSearchQuery("");
  };

  const handleBookClick = (book: Book) => {
    navigate(`/journal?bookId=${book.id}`);
  };

  return (
    <div className={styles.page}>
      <Header
        title="Каталог"
        badge={`${filteredBooks.length} книг`}
        action={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Добавить книгу
          </Button>
        }
      >
        <div className={styles.filterTabs}>
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${
                activeStatus === tab.id ? styles.activeTab : ""
              }`}
              onClick={() => setActiveStatus(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.searchWrapper}>
          <Input
            leftIcon={<Search size={15} />}
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Header>

      <BookGrid
        books={filteredBooks}
        isLoading={isLoading}
        totalCount={books.length}
        onBookClick={handleBookClick}
        onResetFilters={handleResetFilters}
      />

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleBookCreated}
      />
    </div>
  );
};
