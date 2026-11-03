import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { getBooks } from "@/db/queries";

function BookListFallback() {
  return (
    <div className="book-list" aria-label="Loading books">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="book-card book-card-skeleton" key={index}>
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-author" />
          <div className="skeleton-line skeleton-status" />
        </div>
      ))}
    </div>
  );
}

async function BookList() {
  await connection();
  const books = await getBooks();

  if (books.length === 0) {
    return (
      <p className="empty-state">
        No books in the collection yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="book-list">
      {books.map((book) => (
        <article className="book-card" key={book.id}>
          <div className="book-details">
            <h2 className="book-title">{book.title}</h2>
            <p className="book-author">{book.author}</p>
          </div>
          {book.member !== null && book.due_on !== null ? (
            <p className="book-status on-loan">
              <span className="status-dot" aria-hidden="true" />
              <span>
                On loan to {book.member}, due{" "}
                {new Intl.DateTimeFormat("en", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(book.due_on)}
              </span>
            </p>
          ) : (
            <p className="book-status available">
              <span className="status-dot" aria-hidden="true" />
              Available
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="library-page">
      <div className="library-shell">
        <header className="page-header">
          <Link className="brand" href="/" aria-label="The Reading Room home">
            <span className="brand-mark" aria-hidden="true">
              R
            </span>
            <span>The Reading Room</span>
          </Link>
          <span className="header-note">Your neighborhood library</span>
        </header>

        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">THE COLLECTION</p>
          <h1 id="page-title">Find your next favorite.</h1>
          <p className="intro-copy">
            Browse the shelves and see what is ready to take home.
          </p>
        </section>

        <section className="catalog" aria-labelledby="catalog-title">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">BOOKS &amp; AVAILABILITY</p>
              <h2 id="catalog-title">On the shelves</h2>
            </div>
            <span className="catalog-note">Updated just for you</span>
          </div>
          <Suspense fallback={<BookListFallback />}>
            <BookList />
          </Suspense>
        </section>

        <footer className="page-footer">
          <span>Good books are meant to be shared.</span>
          <span>Take your time. Find your story.</span>
        </footer>
      </div>
    </main>
  );
}
