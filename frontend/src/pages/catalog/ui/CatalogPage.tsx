import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Header } from "@/widgets/header";
import { BookGrid } from "@/widgets/book-grid";
import { MOCK_BOOKS, Book } from "@/entities/book";
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
  const [books] = useState<Book[]>(MOCK_BOOKS);
  const [activeStatus, setActiveStatus] = useState<StatusFilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className={styles.page}>
      <Header
        title="Каталог"
        badge={`${filteredBooks.length} книг`}
        action={
          <Button variant="primary" icon={<Plus size={16} />}>
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
        totalCount={books.length}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};
