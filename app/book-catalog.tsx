"use client";

import {
  useActionState,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { addBook, deleteBook, updateBook } from "@/app/actions";
import type { Book } from "@/db/queries";
import { matchesLibrarySearch, useLibrarySearch } from "@/app/library-search";

function BookFields({ book }: { book?: Book }) {
  return (
    <div className="book-fields">
      <label>
        <span>Title</span>
        <input
          autoComplete="off"
          defaultValue={book?.title ?? ""}
          maxLength={300}
          name="title"
          placeholder="e.g. Things Fall Apart"
          required
        />
      </label>
      <label>
        <span>Author</span>
        <input
          autoComplete="off"
          defaultValue={book?.author ?? ""}
          maxLength={200}
          name="author"
          placeholder="e.g. Chinua Achebe"
          required
        />
      </label>
      <label>
        <span>Publication year</span>
        <input
          defaultValue={book?.year ?? ""}
          max={9999}
          min={1}
          name="year"
          placeholder="Optional"
          type="number"
        />
      </label>
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  const [isEditing, setIsEditing] = useState(false);

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (
      !window.confirm(
        `Are you sure you want to delete "${book.title}" by ${book.author}? Its loan history will also be deleted.`,
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <article className={isEditing ? "book-card book-card-editing" : "book-card"}>
      {isEditing ? (
        <form action={updateBook.bind(null, book.id)} className="edit-book-form">
          <BookFields book={book} />
          <div className="book-actions">
            <button className="primary-button" type="submit">
              Save changes
            </button>
            <button
              className="secondary-button"
              onClick={() => setIsEditing(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="book-details">
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">
              {book.author}
              {book.year !== null ? ` · ${book.year}` : ""}
            </p>
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
          </div>
          <div className="book-actions">
            <button
              className="secondary-button"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              Edit
            </button>
            <form action={deleteBook.bind(null, book.id)} onSubmit={confirmDelete}>
              <button className="delete-button" type="submit">
                Delete
              </button>
            </form>
          </div>
        </>
      )}
    </article>
  );
}

export default function BookCatalog({ books }: { books: Book[] }) {
  const { query } = useLibrarySearch();
  const [bookState, addBookAction, isAddingBook] = useActionState(addBook, {
    status: "idle" as const,
    message: "",
  });
  const [dismissedSuccess, setDismissedSuccess] = useState<
    typeof bookState | null
  >(null);
  const matchingBooks = books.filter((book) =>
    matchesLibrarySearch(
      query,
      book.title,
      book.author,
      book.year?.toString() ?? "",
    ),
  );

  useEffect(() => {
    if (bookState.status !== "success") return;
    const timeoutId = window.setTimeout(
      () => setDismissedSuccess(bookState),
      3000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [bookState]);

  return (
    <>
      <section className="management-panel" aria-labelledby="add-book-title">
        <div className="management-heading">
          <p className="eyebrow">COLLECTION MANAGEMENT</p>
          <h3 id="add-book-title">Add a book</h3>
          <p>Enter the book details below to add it to the collection.</p>
        </div>
        <form action={addBookAction} className="add-book-form">
          <BookFields />
          <button className="primary-button" disabled={isAddingBook} type="submit">
            {isAddingBook ? "Adding book…" : "Add book"}
          </button>
          {bookState.message &&
          (bookState.status !== "success" ||
            dismissedSuccess !== bookState) ? (
            <p
              aria-live="polite"
              className={`form-message ${bookState.status === "success" ? "form-message-success" : "form-message-error"}`}
              role={bookState.status === "error" ? "alert" : "status"}
            >
              {bookState.message}
            </p>
          ) : null}
        </form>
      </section>

      {matchingBooks.length === 0 ? (
        <p className="empty-state">
          {books.length === 0
            ? "No books in the collection yet. Add one using the form above."
            : "No books match your search."}
        </p>
      ) : (
        <div className="book-list">
          {matchingBooks.map((book) => (
            <BookCard book={book} key={book.id} />
          ))}
        </div>
      )}
    </>
  );
}
