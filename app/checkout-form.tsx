"use client";

import { useActionState, useEffect, useState } from "react";
import { addLoan } from "@/app/actions";
import type { AvailableBook, LibraryMember } from "@/db/queries";
import Icon from "@/app/ui-icon";

export default function CheckoutForm({
  books,
  members,
}: {
  books: AvailableBook[];
  members: LibraryMember[];
}) {
  const [state, formAction, pending] = useActionState(addLoan, {
    status: "idle" as const,
    message: "",
  });
  const [dismissedSuccess, setDismissedSuccess] = useState<typeof state | null>(
    null,
  );
  const hasBooks = books.length > 0;
  const hasMembers = members.length > 0;

  useEffect(() => {
    if (state.status !== "success") return;
    const timeoutId = window.setTimeout(
      () => setDismissedSuccess(state),
      3000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [state]);

  return (
    <section className="checkout-panel" id="loans" aria-labelledby="checkout-title">
      <div className="checkout-heading">
        <span className="checkout-icon" aria-hidden="true">
          <Icon name="book" />
        </span>
        <div>
          <p className="eyebrow">CHECKOUT DESK</p>
          <h2 id="checkout-title">Record a borrowed book</h2>
          <p>
            Choose a registered member, an available book, and the loan dates.
            Set a past due date to record an overdue loan.
          </p>
        </div>
      </div>
      {hasBooks && hasMembers ? (
        <form action={formAction} className="checkout-form">
          <label>
            <span>Member</span>
            <select defaultValue="" name="member_id" required>
              <option disabled value="">
                Select a member
              </option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Available book</span>
            <select defaultValue="" name="book_id" required>
              <option disabled value="">
                Select a book
              </option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} — {book.author}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Borrowed on</span>
            <input name="borrowed_on" required type="date" />
          </label>
          <label>
            <span>Due date</span>
            <input name="due_on" required type="date" />
          </label>
          <button className="primary-button checkout-submit" disabled={pending}>
            {pending ? "Recording loan…" : "Record borrowed book"}
          </button>
          {state.message &&
          (state.status !== "success" || dismissedSuccess !== state) ? (
            <p
              aria-live="polite"
              className={`form-message ${state.status === "success" ? "form-message-success" : "form-message-error"}`}
              role={state.status === "error" ? "alert" : "status"}
            >
              {state.message}
            </p>
          ) : null}
        </form>
      ) : (
        <p className="checkout-empty">
          {!hasMembers
            ? "Register a member before recording a loan."
            : "There are no available books to borrow right now."}
        </p>
      )}
    </section>
  );
}
