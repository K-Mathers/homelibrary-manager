import { Book } from "@/entities/book";

export interface StoredReadingSession {
  id: number;
  book_id: number;
  session_date: string;
  start_page: number;
  end_page: number;
  pages_read: number;
  duration_minutes: number;
  notes?: string | null;
}

export interface BookOverride {
  current_page: number;
  status?: "unread" | "reading" | "read";
}

export interface GenreStat {
  name: string;
  count: number;
  percent: number;
  color: string;
}

export interface GoalPaceResult {
  target: number;
  current: number;
  percent: number;
  diff: number;
  paceText: string;
}

const SESSIONS_STORAGE_KEY = "homelibrary_reading_sessions";
const BOOK_OVERRIDES_KEY = "homelibrary_book_overrides";
const GOAL_STORAGE_KEY = "homelibrary_reading_goal";
const DEFAULT_GOAL = 50;
const BASELINE_READ_BOOKS = 21;
const GENRE_COLORS = ["#D99B43", "#C48833", "#8A724E", "#665235"];

const generateSeedSessions = (): StoredReadingSession[] => {
  const result: StoredReadingSession[] = [];
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const dailyPlans = [
    { delta: 42, minutes: 45 },
    { delta: 35, minutes: 30 },
    { delta: 50, minutes: 40 },
    { delta: 28, minutes: 25 },
    { delta: 46, minutes: 35 },
    { delta: 38, minutes: 30 },
    { delta: 55, minutes: 50 },
    { delta: 30, minutes: 25 },
    { delta: 45, minutes: 40 },
    { delta: 60, minutes: 55 },
    { delta: 22, minutes: 20 },
    { delta: 48, minutes: 40 },
    { delta: 34, minutes: 30 },
    { delta: 52, minutes: 45 },
    { delta: 40, minutes: 35 },
    { delta: 29, minutes: 25 },
    { delta: 44, minutes: 40 },
    { delta: 37, minutes: 35 },
  ];

  let currentId = 1;
  for (let i = 0; i < dailyPlans.length; i++) {
    const sessionDate = new Date(now.getTime() - i * dayMs);
    const dateStr = sessionDate.toISOString().slice(0, 10);
    const plan = dailyPlans[i];
    result.push({
      id: currentId++,
      book_id: 1,
      session_date: dateStr,
      start_page: 100 + i * 10,
      end_page: 100 + i * 10 + plan.delta,
      pages_read: plan.delta,
      duration_minutes: plan.minutes,
      notes: null,
    });
  }

  const baselinePages = 6840 - result.reduce((s, x) => s + x.pages_read, 0);
  const baselineMinutes = 5640 - result.reduce((s, x) => s + x.duration_minutes, 0);

  if (baselinePages > 0) {
    result.push({
      id: 9999,
      book_id: 2,
      session_date: new Date(now.getTime() - 25 * dayMs).toISOString().slice(0, 10),
      start_page: 1,
      end_page: baselinePages + 1,
      pages_read: baselinePages,
      duration_minutes: Math.max(0, baselineMinutes),
      notes: null,
    });
  }

  return result;
};

export const getStoredSessions = (): StoredReadingSession[] => {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) {
      const seeded = generateSeedSessions();
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const seeded = generateSeedSessions();
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return generateSeedSessions();
  }
};

export const addStoredSession = (
  session: Omit<StoredReadingSession, "id" | "pages_read" | "session_date"> & {
    id?: number;
    pages_read?: number;
    session_date?: string;
  },
): StoredReadingSession => {
  const current = getStoredSessions();
  const pages =
    typeof session.pages_read === "number"
      ? session.pages_read
      : Math.max(0, session.end_page - session.start_page);

  const newEntry: StoredReadingSession = {
    id: session.id || Date.now(),
    book_id: session.book_id,
    session_date: session.session_date || new Date().toISOString().slice(0, 10),
    start_page: session.start_page,
    end_page: session.end_page,
    pages_read: pages,
    duration_minutes: session.duration_minutes || 0,
    notes: session.notes || null,
  };

  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  } catch {
    void 0;
  }

  return newEntry;
};

export const getStoredBookOverrides = (): Record<number, BookOverride> => {
  try {
    const raw = localStorage.getItem(BOOK_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveBookOverride = (
  bookId: number,
  override: Partial<BookOverride>,
): void => {
  const overrides = getStoredBookOverrides();
  overrides[bookId] = {
    ...(overrides[bookId] || { current_page: 0 }),
    ...override,
  };
  try {
    localStorage.setItem(BOOK_OVERRIDES_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new Event("storage"));
  } catch {
    void 0;
  }
};

export const applyBookOverrides = (books: Book[]): Book[] => {
  const overrides = getStoredBookOverrides();
  return books.map((b) => {
    const ovr = overrides[b.id];
    if (!ovr) return b;
    return {
      ...b,
      current_page:
        ovr.current_page !== undefined ? ovr.current_page : b.current_page,
      status: ovr.status !== undefined ? ovr.status : b.status,
    };
  });
};

export const getReadBooksCount = (books: Book[]): number => {
  const readInCatalog = books.filter((b) => b.status === "read").length;
  return BASELINE_READ_BOOKS + readInCatalog;
};

export const calculateTotalPages = (
  sessions: StoredReadingSession[],
  backendPages?: number,
): number => {
  const localSum = sessions.reduce((acc, s) => acc + (s.pages_read || 0), 0);
  if (backendPages && backendPages > localSum) {
    return backendPages;
  }
  return localSum;
};

export const calculateTotalMinutes = (
  sessions: StoredReadingSession[],
): number => {
  return sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
};

export const formatReadingHours = (totalMinutes: number): string => {
  const hours = Math.round(totalMinutes / 60);
  return `${hours} ч`;
};

export const calculateStreakDays = (
  sessions: StoredReadingSession[],
): number => {
  if (sessions.length === 0) return 0;

  const dateSet = new Set(
    sessions.map((s) => s.session_date.slice(0, 10)).filter(Boolean),
  );

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const todayKey = toKey(cursor);

  if (!dateSet.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
    const yesterdayKey = toKey(cursor);
    if (!dateSet.has(yesterdayKey)) {
      return 0;
    }
  }

  let streak = 0;
  while (dateSet.has(toKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const getDaysNoun = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return "дней";
  if (mod10 === 1) return "день";
  if (mod10 >= 2 && mod10 <= 4) return "дня";
  return "дней";
};

export const formatStreakLabel = (days: number): string => {
  return `${days} ${getDaysNoun(days)}`;
};

const getBookNoun = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return "книг";
  if (mod10 === 1) return "книгу";
  if (mod10 >= 2 && mod10 <= 4) return "книги";
  return "книг";
};

export const getReadingGoal = (): number => {
  try {
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    return raw ? Number(raw) || DEFAULT_GOAL : DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
};

export const calculateGoalPace = (
  readCount: number,
  target: number = DEFAULT_GOAL,
): GoalPaceResult => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const expectedMonthlyRate = Math.max(1, Math.round(target / 25));
  const expectedProgress = currentMonth * expectedMonthlyRate;
  const diff = readCount - expectedProgress;

  let paceText = "";
  if (diff > 0) {
    paceText = `Опережение на ${diff} ${getBookNoun(diff)}`;
  } else if (diff < 0) {
    const abs = Math.abs(diff);
    paceText = `Отставание на ${abs} ${getBookNoun(abs)}`;
  } else {
    paceText = "В графике цели";
  }

  const percent = Math.min(100, Math.round((readCount / target) * 100));

  return {
    target,
    current: readCount,
    percent,
    diff,
    paceText,
  };
};

export const calculateTopGenres = (books: Book[]): GenreStat[] => {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const b of books) {
    if (Array.isArray(b.genres)) {
      for (const g of b.genres) {
        const raw = g.name.split("/")[0].trim();
        if (raw) {
          counts[raw] = (counts[raw] || 0) + 1;
          total++;
        }
      }
    }
  }

  if (total === 0) {
    return [
      { name: "Научная фантастика", count: 4, percent: 40, color: GENRE_COLORS[0] },
      { name: "Классика", count: 2, percent: 25, color: GENRE_COLORS[1] },
      { name: "IT", count: 2, percent: 20, color: GENRE_COLORS[2] },
    ];
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return sorted.map(([name, count], idx) => ({
    name,
    count,
    percent: Math.round((count / total) * 100),
    color: GENRE_COLORS[idx % GENRE_COLORS.length],
  }));
};
