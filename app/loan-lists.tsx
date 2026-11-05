"use client";

import { returnLoan } from "@/app/actions";
import type { CurrentLoan } from "@/db/queries";
import Icon from "@/app/ui-icon";
import { matchesLibrarySearch, useLibrarySearch } from "@/app/library-search";

function formatDueDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function LoanList({
  loans,
  overdue,
}: {
  loans: CurrentLoan[];
  overdue: boolean;
}) {
  const { query } = useLibrarySearch();
  const title = overdue ? "Overdue books" : "Borrowed books";
  const loanList = overdue
    ? loans.filter((loan) => loan.is_overdue)
    : loans;
  const matchingLoans = loanList.filter((loan) =>
    matchesLibrarySearch(
      query,
      loan.title,
      loan.author,
      loan.member,
      loan.borrowed_on.toISOString().slice(0, 10),
      formatDueDate(loan.borrowed_on),
      loan.due_on.toISOString().slice(0, 10),
      formatDueDate(loan.due_on),
    ),
  );

  return (
    <section
      className={`loan-panel ${overdue ? "loan-panel-overdue" : ""}`}
      aria-labelledby={overdue ? "overdue-books-title" : "borrowed-books-title"}
    >
      <div className="loan-panel-heading">
        <div className="loan-panel-title">
          <span className="loan-icon">
            <Icon name={overdue ? "alert" : "book"} />
          </span>
          <div>
            <p className="eyebrow">{overdue ? "ACTION NEEDED" : "CURRENT LOANS"}</p>
            <h2 id={overdue ? "overdue-books-title" : "borrowed-books-title"}>
              {title}
            </h2>
          </div>
        </div>
        <span className={`loan-count ${overdue ? "loan-count-overdue" : ""}`}>
          {matchingLoans.length}
        </span>
      </div>
      {matchingLoans.length ? (
        <ul className="loan-list">
          {matchingLoans.map((loan) => (
            <li className="loan-item" key={loan.id}>
              <div className="loan-book-mark" aria-hidden="true">
                <Icon name="book" />
              </div>
              <div className="loan-book-info">
                <h3>{loan.title}</h3>
                <p>{loan.author}</p>
                <p className="loan-member">Borrowed by {loan.member}</p>
              </div>
              <div className="loan-due">
                <span>{overdue ? "Was due" : "Due date"}</span>
                <time dateTime={loan.due_on.toISOString()}>
                  {formatDueDate(loan.due_on)}
                </time>
              </div>
              <p className="loan-borrowed-date">
                Borrowed {formatDueDate(loan.borrowed_on)}
              </p>
              {!overdue ? (
                <form action={returnLoan.bind(null, loan.id)} className="return-loan-form">
                  <button className="secondary-button return-loan-button" type="submit">
                    <Icon name="check" />
                    Mark returned
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="loan-empty">
          {overdue
            ? query
              ? "No overdue loans match your search."
              : "Wonderful — nothing is overdue right now."
            : query
              ? "No borrowed loans match your search."
              : "There are no books currently on loan."}
        </p>
      )}
    </section>
  );
}

export default function LoanLists({ loans }: { loans: CurrentLoan[] }) {
  return (
    <section className="loans-section" aria-label="Book loans">
      <LoanList loans={loans} overdue={false} />
      <LoanList loans={loans} overdue />
    </section>
  );
}
