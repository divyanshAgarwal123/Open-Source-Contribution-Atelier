import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdvancedSearch } from "../hooks/useAdvancedSearch";
import { useLessonSearch } from "../hooks/useLessonSearch";

export function NotFoundPage() {
  const { pathname } = useLocation();
  const suggestions = useMemo(() => {
    const terms = pathname
      .split("/")
      .filter(Boolean)
      .flatMap((part) => {
        let decoded = part;
        try {
          decoded = decodeURIComponent(part);
        } catch {
          /* Keep the original path segment. */
        }
        const words = decoded
          .split(/[-_\s]+/)
          .filter((word) => word.length > 1 && /^[\p{L}\p{N}]+$/u.test(word));
        return [words.join(" "), ...words];
      })
      .filter(
        (term) =>
          term &&
          !["lessons", "docs", "documentation", "page"].includes(
            term.toLowerCase(),
          ),
      );
    return [...new Set(terms)].slice(0, 5);
  }, [pathname]);
  const initialQuery = suggestions[0] || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchedQuery, setSearchedQuery] = useState(initialQuery);
  const { results, loading, error, search, clearSearch } = useAdvancedSearch();
  const { search: searchLessons, loading: lessonsLoading } = useLessonSearch();
  const lessonResults = useMemo(
    () => searchLessons(searchedQuery).slice(0, 5),
    [searchLessons, searchedQuery],
  );
  const otherResults = results
    .filter(
      (result) =>
        !lessonResults.some(
          (lesson) => lesson.title.toLowerCase() === result.title.toLowerCase(),
        ),
    )
    .slice(0, 5 - lessonResults.length);

  useEffect(() => {
    setQuery(initialQuery);
    setSearchedQuery(initialQuery);
    clearSearch();
  }, [initialQuery, clearSearch]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = query.trim();
    setSearchedQuery(nextQuery);
    void search(nextQuery);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <span className="font-black text-xs bg-accent text-black px-4 py-2 rounded-full border-2 border-black rotate-[-2deg] inline-block shadow-sm">
            ROUTE MISSING
          </span>
        </div>

        <div className="bg-white rounded-[2rem] border-4 border-black shadow-card-lg p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-surface-high opacity-40 border-4 border-black"></div>
          <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-primary-container opacity-60 border-4 border-black"></div>

          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
              Error 404
            </p>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mt-3">
              This corridor doesn&apos;t exist.
            </h1>
            <p className="mt-4 text-muted text-lg">
              The page you requested isn&apos;t in the atelier. Let&apos;s get
              you back to the home base.
            </p>

            <form onSubmit={submitSearch} role="search" className="mt-8">
              <label
                htmlFor="missing-page-search"
                className="block text-sm font-bold mb-2"
              >
                Search lessons and resources
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="missing-page-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try a topic or lesson name"
                  className="min-w-0 flex-1 rounded-xl border-2 border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="rounded-xl border-2 border-black bg-accent px-5 py-3 font-bold text-black shadow-card-sm"
                >
                  Search
                </button>
              </div>
            </form>

            {suggestions.length > 0 && (
              <div className="mt-4" aria-label="Suggested searches">
                <p className="text-sm font-semibold text-muted">
                  Based on this URL:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestions.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        setSearchedQuery(term);
                        void search(term);
                      }}
                      className="rounded-full border border-black px-3 py-1 text-sm font-medium hover:bg-surface-high"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div aria-live="polite" className="mt-5">
              {(loading || lessonsLoading) && <p>Searching…</p>}
              {error && (
                <p role="alert">
                  More search results are unavailable right now. Please try
                  again.
                </p>
              )}
              {!lessonsLoading &&
                searchedQuery &&
                (lessonResults.length + otherResults.length > 0 ? (
                  <div>
                    <p className="text-sm font-semibold">
                      Results for “{searchedQuery}”
                    </p>
                    <ul className="mt-2 space-y-2">
                      {lessonResults.map((lesson) => (
                        <li
                          key={lesson.slug}
                          className="rounded-xl border border-black/20 bg-surface-high/40 p-3"
                        >
                          <Link
                            to={`/lessons/${lesson.slug}`}
                            className="font-bold underline underline-offset-4"
                          >
                            {lesson.title}
                          </Link>
                          {lesson.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted">
                              {lesson.description}
                            </p>
                          )}
                        </li>
                      ))}
                      {otherResults.map((result) => (
                        <li
                          key={result.id}
                          className="rounded-xl border border-black/20 bg-surface-high/40 p-3"
                        >
                          <p className="font-bold">{result.title}</p>
                          {result.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted">
                              {result.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : !loading && !error ? (
                  <p className="text-sm text-muted">
                    No matches found. Try another topic.
                  </p>
                ) : null)}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-2xl border-4 border-black bg-primary px-6 py-4 font-black text-black text-lg shadow-card hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-card-sm transition-all uppercase tracking-wide"
              >
                Back to Home
              </Link>
              <Link
                to="/learning-path"
                className="font-bold underline underline-offset-4"
              >
                Browse lessons
              </Link>
              <Link
                to="/documentation"
                className="font-bold underline underline-offset-4"
              >
                Browse docs
              </Link>
              <div className="text-sm font-semibold text-muted">
                Tip: check your URL spelling.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
