"use client";

import BookCatalog from "@/app/book-catalog";
import CheckoutForm from "@/app/checkout-form";
import LibraryClock from "@/app/library-clock";
import LibrarySearchBox, { LibrarySearchProvider } from "@/app/library-search";
import LoanLists from "@/app/loan-lists";
import MemberDirectory from "@/app/member-directory";
import MemberRegistration from "@/app/member-registration";
import { motion, MotionConfig } from "framer-motion";
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
    <motion.section
      className="stats-grid"
      aria-label="Library statistics"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 1 },
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {cards.map((card) => (
        <motion.article
          className={`stat-card stat-${card.tone}`}
          key={card.label}
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="stat-label">
            <p>{card.label}</p>
            <span className="stat-icon">
              <Icon name={card.icon} />
            </span>
          </div>
          <strong>{card.value.toLocaleString("en")}</strong>
        </motion.article>
      ))}
    </motion.section>
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
    <MotionConfig reducedMotion="user">
      <LibrarySearchProvider>
      <main className="library-page">
        <div className="library-shell">
          <motion.header
            className="page-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
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
          </motion.header>

          <div className="app-layout">
            <motion.aside
              className="sidebar"
              aria-label="Library navigation"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            >
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
            </motion.aside>
            <div className="main-content">
              <motion.section
                className="intro"
                id="overview"
                aria-labelledby="page-title"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
              >
                <p className="eyebrow">YOUR LIBRARY AT A GLANCE</p>
                <h1 id="page-title">Welcome to The Reading Room</h1>
                <p className="intro-copy">
                  Keep track of your collection, loans, and community.
                </p>
              </motion.section>

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
    </MotionConfig>
  );
}
