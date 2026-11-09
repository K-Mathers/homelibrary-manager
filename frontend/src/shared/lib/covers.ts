export function getBookCoverUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `http://127.0.0.1:8000/${cleanPath}`;
}
