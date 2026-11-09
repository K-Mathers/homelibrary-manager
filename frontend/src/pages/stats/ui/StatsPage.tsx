import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Clock,
  Files,
  Flag,
  Flame,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/widgets/header";
import { Book, MOCK_BOOKS } from "@/entities/book";
import { statsApi, booksApi, ReadingStatsSummary } from "@/shared/api";
import {
  applyBookOverrides,
  calculateGoalPace,
  calculateStreakDays,
  calculateTotalMinutes,
  calculateTotalPages,
  calculateTopGenres,
  formatReadingHours,
  formatStreakLabel,
  getReadBooksCount,
  getReadingGoal,
  getStoredSessions,
  getTodayDateLabel,
  StoredReadingSession,
} from "@/shared/lib";
import styles from "./StatsPage.module.scss";

export const StatsPage = () => {
  const [summary, setSummary] = useState<ReadingStatsSummary | null>(null);
  const [books, setBooks] = useState<Book[]>(() => applyBookOverrides(MOCK_BOOKS));
  const [sessions, setSessions] = useState<StoredReadingSession[]>(() =>
    getStoredSessions(),
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setSessions(getStoredSessions());
      setBooks((prev) => applyBookOverrides(prev));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, booksData] = await Promise.allSettled([
          statsApi.getSummary({ year: 2026 }),
          booksApi.getBooks(),
        ]);

        if (statsData.status === "fulfilled") {
          setSummary(statsData.value);
        }
        if (
          booksData.status === "fulfilled" &&
          Array.isArray(booksData.value) &&
          booksData.value.length > 0
        ) {
          setBooks(applyBookOverrides(booksData.value));
        }
      } catch {
        void 0;
      }
    };

    fetchData();
  }, []);

  const readBooksCount = useMemo(() => {
    return getReadBooksCount(books);
  }, [books]);

  const totalPagesCount = useMemo(() => {
    const pages = calculateTotalPages(sessions, summary?.total_pages_year);
    return pages.toLocaleString("ru-RU");
  }, [sessions, summary]);

  const totalTimeLabel = useMemo(() => {
    const minutes = calculateTotalMinutes(sessions);
    return formatReadingHours(minutes);
  }, [sessions]);

  const streakDaysLabel = useMemo(() => {
    const days = calculateStreakDays(sessions);
    return formatStreakLabel(days);
  }, [sessions]);

  const goal = useMemo(() => {
    const target = getReadingGoal();
    return calculateGoalPace(readBooksCount, target);
  }, [readBooksCount]);

  const genresDistribution = useMemo(() => {
    return calculateTopGenres(books);
  }, [books]);

  return (
    <div className={styles.page}>
      <Header title="Статистика чтения" />
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Книг</span>
            <BookOpen size={16} className={styles.kpiIcon} />
          </div>
          <div className={styles.kpiValue}>{readBooksCount}</div>
          <span className={styles.kpiSubtext}>Прочитано за год</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Страниц</span>
            <Files size={16} className={styles.kpiIcon} />
          </div>
          <div className={styles.kpiValue}>{totalPagesCount}</div>
          <span className={styles.kpiSubtext}>Страница за страницей</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Время</span>
            <Clock size={16} className={styles.kpiIcon} />
          </div>
          <div className={styles.kpiValue}>{totalTimeLabel}</div>
          <span className={styles.kpiSubtext}>Наедине с книгами</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Серия</span>
            <Flame size={16} className={styles.kpiIconAccent} />
          </div>
          <div className={styles.kpiValue}>{streakDaysLabel}</div>
          <span className={styles.kpiSubtext}>Чтение каждый день</span>
        </div>
      </div>

      <div className={styles.twoColGrid}>
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Цель 2026</h3>
            <Flag size={16} className={styles.kpiIconAccent} />
          </div>

          <div className={styles.goalRow}>
            <div className={styles.goalProgressNumbers}>
              <div className={styles.goalNumbersGroup}>
                <span className={styles.goalCurrent}>{goal.current}</span>
                <span className={styles.goalTarget}>/ {goal.target} книг</span>
              </div>
              <span className={styles.goalPercent}>{goal.percent}%</span>
            </div>

            <div className={styles.goalProgressBar}>
              <div
                className={styles.goalProgressFill}
                style={{ width: `${goal.percent}%` }}
              />
            </div>

            <div className={styles.goalPace}>
              <TrendingUp size={15} className={styles.paceIcon} />
              <span>{goal.paceText}</span>
            </div>
          </div>
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Топ жанров</h3>
          </div>

          <div className={styles.genresList}>
            {genresDistribution.map((genre) => (
              <div key={genre.name} className={styles.genreItem}>
                <div className={styles.genreMeta}>
                  <span className={styles.genreName}>{genre.name}</span>
                  <span className={styles.genrePercent}>{genre.percent}%</span>
                </div>
                <div className={styles.genreTrack}>
                  <div
                    className={styles.genreFill}
                    style={{
                      width: `${genre.percent}%`,
                      backgroundColor: genre.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footerPeriod}>{getTodayDateLabel()}</div>
    </div>
  );
};
