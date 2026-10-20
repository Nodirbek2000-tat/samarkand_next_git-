/**
 * Remounts on every navigation: the new page settles in with a short CSS rise (`.page-in`, globals.css).
 * CSS, not JS: the page is visible as soon as its HTML arrives — a JS entrance kept every inner page at
 * opacity 0 until the scripts had downloaded and hydrated (seconds on a slow connection).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
