"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Book, CurrentLoan, LibraryMember } from "@/db/queries";
import Icon from "@/app/ui-icon";

const LibrarySearchContext = createContext<{
  query: string;
  setQuery: (query: string) => void;
} | null>(null);

export function LibrarySearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");

  return (
    <LibrarySearchContext.Provider value={{ query, setQuery }}>
      {children}
    </LibrarySearchContext.Provider>
  );
}

export function useLibrarySearch() {
  const context = useContext(LibrarySearchContext);
  if (!context) {
    throw new Error("Library search components must be inside the search provider.");
  }
  return context;
}

export function matchesLibrarySearch(query: string, ...values: string[]) {
  const searchTerm = query.trim().toLocaleLowerCase();
  return (
    searchTerm === "" ||
    values.some((value) => value.toLocaleLowerCase().includes(searchTerm))
  );
}

function formatSearchDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function LibrarySearchBox({
  books,
  loans,
  members,
}: {
  books: Book[];
  loans: CurrentLoan[];
  members: LibraryMember[];
}) {
  const { query, setQuery } = useLibrarySearch();
  const searchInput = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const term = query.trim();
  const matchingResults = term
    ? [
        ...books
          .filter((book) =>
            matchesLibrarySearch(
              term,
              book.title,
              book.author,
              book.year?.toString() ?? "",
            ),
          )
          .map((book) => ({
            key: `book-${book.id}`,
            title: book.title,
            detail: `${book.author}${book.year ? ` · ${book.year}` : ""}`,
            section: "Books",
            href: "/books#books",
          })),
        ...loans
          .filter((loan) =>
            matchesLibrarySearch(
              term,
              loan.title,
              loan.author,
              loan.member,
              loan.borrowed_on.toISOString().slice(0, 10),
              formatSearchDate(loan.borrowed_on),
              loan.due_on.toISOString().slice(0, 10),
              formatSearchDate(loan.due_on),
            ),
          )
          .map((loan) => ({
            key: `loan-${loan.id}`,
            title: loan.title,
            detail: `${loan.member} · due ${formatSearchDate(loan.due_on)}`,
            section: loan.is_overdue ? "Overdue" : "Borrowed",
            href: loan.is_overdue
              ? "/loans#overdue-books-title"
              : "/loans#borrowed-books-title",
          })),
        ...members
          .filter((member) =>
            matchesLibrarySearch(term, member.name, member.phone ?? ""),
          )
          .map((member) => ({
            key: `member-${member.id}`,
            title: member.name,
            detail: member.phone || "Library member",
            section: "Members",
            href: "/members#member-directory",
          })),
      ]
    : [];
  const results = matchingResults.slice(0, 8);

  return (
    <div className="header-search-wrap">
      <div className="header-search">
        <button
          aria-label="Focus search"
          className="header-search-button"
          onClick={() => searchInput.current?.focus()}
          type="button"
        >
          <Icon className="header-search-icon" name="search" />
        </button>
        <label className="visually-hidden" htmlFor="library-search-input">
          Search books, authors, members, or dates
        </label>
        <input
          autoComplete="off"
          id="library-search-input"
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              searchInput.current?.blur();
            }
          }}
          placeholder="Search books, authors, dates…"
          ref={searchInput}
          type="search"
          value={query}
        />
        {query ? (
          <button
            aria-label="Clear search"
            className="header-search-clear"
            onClick={() => {
              setQuery("");
              setIsOpen(true);
              searchInput.current?.focus();
            }}
            type="button"
          >
            Clear
          </button>
        ) : (
          <kbd aria-hidden="true">⌕</kbd>
        )}
      </div>
      {isOpen && term ? (
        <div
          className="search-results"
          role="region"
          aria-label="Search results"
          aria-live="polite"
        >
          <p className="search-results-heading">
            {results.length
              ? `${results.length}${matchingResults.length > results.length ? "+" : ""} matching results`
              : "No matching results"}
          </p>
          {results.length ? (
            <ul className="search-results-list">
              {results.map((result) => (
                <li key={result.key}>
                  <a
                    className="search-result"
                    href={result.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="search-result-icon">
                      <Icon name="search" />
                    </span>
                    <span className="search-result-copy">
                      <strong>{result.title}</strong>
                      <span>{result.detail}</span>
                    </span>
                    <span className="search-result-section">
                      {result.section}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
