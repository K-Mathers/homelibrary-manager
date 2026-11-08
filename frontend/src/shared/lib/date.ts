const MONTH_NAMES_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const SHORT_MONTH_NAMES_RU = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

export interface FormattedDateParts {
  day: number;
  month: number;
  monthName: string;
  monthShort: string;
  year: number;
  formatted: string;
}

export function parseDateParts(
  dateInput: number | string | Date = Date.now(),
): FormattedDateParts {
  const d = typeof dateInput === "object" ? dateInput : new Date(dateInput);
  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();
  const monthName = MONTH_NAMES_RU[monthIdx] || "";
  const monthShort = SHORT_MONTH_NAMES_RU[monthIdx] || "";

  return {
    day,
    month: monthIdx + 1,
    monthName,
    monthShort,
    year,
    formatted: `${day} ${monthName} ${year}`,
  };
}

export function formatCurrentDate(
  dateInput: number | string | Date = Date.now(),
): string {
  const parts = parseDateParts(dateInput);
  return `${parts.day} ${parts.monthName} ${parts.year}`;
}

export function formatShortDate(
  dateInput: number | string | Date = Date.now(),
): string {
  const parts = parseDateParts(dateInput);
  return `${parts.day} ${parts.monthShort}`;
}

export function getTodayDateLabel(): string {
  return formatCurrentDate(Date.now());
}
