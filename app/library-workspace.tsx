"use client";

import BookCatalog from "@/app/book-catalog";
import CheckoutForm from "@/app/checkout-form";
import LibraryClock from "@/app/library-clock";
import LibrarySearchBox, { LibrarySearchProvider } from "@/app/library-search";
import LoanLists from "@/app/loan-lists";
import MemberDirectory from "@/app/member-directory";
import MemberRegistration from "@/app/member-registration";
import type {
  AvailableBook,
  Book,
  CurrentLoan,
  DashboardStats as DashboardStatsData,
  LibraryMember,
} from "@/db/queries";
import Icon from "@/app/ui-icon";
import Link from "next/link";

function DashboardStats({ stats }: { stats: DashboardStatsData }) {
  const cards = [
    {
      label: "Available books",
      value: stats.available_books,
      tone: "green",
      icon: "book" as const,
    },
    {
      label: "Borrowed books",
      value: stats.borrowed_books,
      tone: "gold",
      icon: "book" as const,
    },
    {
      label: "Overdue returns",
      value: stats.overdue_books,
      tone: "red",
      icon: "alert" as const,
    },
    {
      label: "Library members",
      value: stats.total_members,
      tone: "blue",
      icon: "users" as const,
    },
  ];

  return (
    <section className="stats-grid" aria-label="Library statistics">
      {cards.map((card) => (
        <article className={`stat-card stat-${card.tone}`} key={card.label}>
          <div className="stat-label">
            <p>{card.label}</p>
            <span className="stat-icon">
              <Icon name={card.icon} />
            </span>
          </div>
          <strong>{card.value.toLocaleString("en")}</strong>
        </article>
      ))}
    </section>
  );
}

export default function LibraryWorkspace({
  books,
  availableBooks,
  stats,
  loans,
  members,
}: {
  books: Book[];
  availableBooks: AvailableBook[];
  stats: DashboardStatsData;
  loans: CurrentLoan[];
  members: LibraryMember[];
}) {
  return (
    <LibrarySearchProvider>
      <main className="library-page">
        <div className="library-shell">
          <header className="page-header">
            <Link className="brand" href="/" aria-label="The Reading Room home">
              <span className="brand-mark" aria-hidden="true">
                R
              </span>
              <span>The Reading Room</span>
            </Link>
            <div className="header-right">
              <LibrarySearchBox books={books} loans={loans} members={members} />
              <LibraryClock />
            </div>
          </header>

          <div className="app-layout">
            <aside className="sidebar" aria-label="Library navigation">
              <p className="sidebar-label">LIBRARY</p>
              <nav className="sidebar-nav">
                <a className="sidebar-link active" href="#overview">
                  <span aria-hidden="true">01</span>
                  Overview
                </a>
                <a className="sidebar-link" href="#loans">
                  <span aria-hidden="true">02</span>
                  Borrow &amp; return
                </a>
                <a className="sidebar-link" href="#books">
                  <span aria-hidden="true">03</span>
                  Books
                </a>
                <a className="sidebar-link" href="#members">
                  <span aria-hidden="true">04</span>
                  Members
                </a>
              </nav>
              <div className="sidebar-note">
                <span className="sidebar-note-mark" aria-hidden="true">
                  +
                </span>
                <p>Every great story starts with a reader.</p>
              </div>
            </aside>
            <div className="main-content">
              <section
                className="intro"
                id="overview"
                aria-labelledby="page-title"
              >
                <p className="eyebrow">YOUR LIBRARY AT A GLANCE</p>
                <h1 id="page-title">Welcome to The Reading Room</h1>
                <p className="intro-copy">
                  Keep track of your collection, loans, and community.
                </p>
              </section>

              <DashboardStats stats={stats} />
              <CheckoutForm books={availableBooks} members={members} />
              <LoanLists loans={loans} />
              <MemberRegistration />
              <MemberDirectory members={members} />

              <section
                className="catalog"
                id="books"
                aria-labelledby="catalog-title"
              >
                <div className="catalog-heading">
                  <div>
                    <p className="eyebrow">BOOKS &amp; AVAILABILITY</p>
                    <h2 id="catalog-title">On the shelves</h2>
                  </div>
                  <span className="catalog-note">Updated just for you</span>
                </div>
                <BookCatalog books={books} />
              </section>

              <footer className="page-footer">
                <span>Good books are meant to be shared.</span>
                <span>Take your time. Find your story.</span>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </LibrarySearchProvider>
  );
}
