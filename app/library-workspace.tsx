"use client";

import { useEffect, useRef, useState } from "react";
import BookCatalog from "@/app/book-catalog";
import CheckoutForm from "@/app/checkout-form";
import LibraryClock from "@/app/library-clock";
import LibrarySearchBox, { LibrarySearchProvider } from "@/app/library-search";
import LoanLists from "@/app/loan-lists";
import MemberDirectory from "@/app/member-directory";
import MemberRegistration from "@/app/member-registration";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import type {
  AvailableBook,
  Book,
  CurrentLoan,
  DashboardStats as DashboardStatsData,
  LibraryMember,
} from "@/db/queries";
import Icon from "@/app/ui-icon";
import Link from "next/link";

export type LibrarySection = "overview" | "loans" | "books" | "members";

const navigationItems: {
  id: LibrarySection;
  href: string;
  label: string;
}[] = [
  { id: "overview", href: "/", label: "Overview" },
  { id: "loans", href: "/loans", label: "Borrow & return" },
  { id: "books", href: "/books", label: "Books" },
  { id: "members", href: "/members", label: "Members" },
];

function NavigationLinks({
  section,
  onNavigate,
}: {
  section: LibrarySection;
  onNavigate?: () => void;
}) {
  return (
    <>
      {navigationItems.map((item, index) => (
        <Link
          aria-current={section === item.id ? "page" : undefined}
          className={`sidebar-link${section === item.id ? " active" : ""}`}
          href={item.href}
          key={item.id}
          onClick={onNavigate}
        >
          <span aria-hidden="true">{`0${index + 1}`}</span>
          {item.label}
        </Link>
      ))}
    </>
  );
}

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
  section,
}: {
  books: Book[];
  availableBooks: AvailableBook[];
  stats: DashboardStatsData;
  loans: CurrentLoan[];
  members: LibraryMember[];
  section: LibrarySection;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      menuButton?.focus();
    };
  }, [isMobileMenuOpen]);

  const pageTitle =
    section === "overview"
      ? "Welcome to The Reading Room"
      : section === "loans"
        ? "Borrow & return"
        : section === "books"
          ? "Book collection"
          : "Library members";

  const introCopy =
    section === "overview"
      ? "Keep track of your collection, loans, and community."
      : section === "loans"
        ? "Record checkouts and keep track of borrowed and overdue books."
        : section === "books"
          ? "Browse, add, and manage the books in your collection."
          : "Register members and manage your library community.";

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
              <button
                aria-controls="mobile-navigation"
                aria-expanded={isMobileMenuOpen}
                aria-label="Open navigation menu"
                className="mobile-menu-button"
                onClick={() => setIsMobileMenuOpen(true)}
                ref={menuButtonRef}
                type="button"
              >
                <Icon name="menu" />
              </button>
              <div className="header-right">
                <LibrarySearchBox books={books} loans={loans} members={members} />
                <LibraryClock />
              </div>
            </motion.header>

            <AnimatePresence>
              {isMobileMenuOpen ? (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="mobile-drawer-backdrop"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <motion.aside
                    animate={{ x: 0 }}
                    aria-label="Mobile library navigation"
                    aria-modal="true"
                    className="mobile-drawer"
                    exit={{ x: "-100%" }}
                    initial={{ x: "-100%" }}
                    id="mobile-navigation"
                    onClick={(event) => event.stopPropagation()}
                    role="dialog"
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    <div className="mobile-drawer-heading">
                      <span className="sidebar-label">LIBRARY MENU</span>
                      <button
                        aria-label="Close navigation menu"
                        className="mobile-drawer-close"
                        onClick={() => setIsMobileMenuOpen(false)}
                        ref={closeButtonRef}
                        type="button"
                      >
                        <Icon name="close" />
                      </button>
                    </div>
                    <nav className="sidebar-nav">
                      <NavigationLinks
                        section={section}
                        onNavigate={() => setIsMobileMenuOpen(false)}
                      />
                    </nav>
                    <div className="sidebar-note">
                      <span className="sidebar-note-mark" aria-hidden="true">
                        +
                      </span>
                      <p>Every great story starts with a reader.</p>
                    </div>
                  </motion.aside>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="app-layout">
              <motion.aside
                className="sidebar desktop-sidebar"
                aria-label="Library navigation"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              >
                <p className="sidebar-label">LIBRARY</p>
                <nav className="sidebar-nav">
                  <NavigationLinks section={section} />
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
                  id={section === "overview" ? "overview" : undefined}
                  aria-labelledby="page-title"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
                >
                  <p className="eyebrow">
                    {section === "overview"
                      ? "YOUR LIBRARY AT A GLANCE"
                      : "THE READING ROOM"}
                  </p>
                  <h1 id="page-title">{pageTitle}</h1>
                  <p className="intro-copy">{introCopy}</p>
                </motion.section>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    initial={{ opacity: 0, y: 8 }}
                    key={section}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    {section === "overview" ? (
                      <>
                        <DashboardStats stats={stats} />
                        <LoanLists loans={loans} />
                      </>
                    ) : null}
                    {section === "loans" ? (
                      <>
                        <CheckoutForm
                          books={availableBooks}
                          members={members}
                        />
                        <LoanLists loans={loans} />
                      </>
                    ) : null}
                    {section === "books" ? (
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
                          <span className="catalog-note">
                            Updated just for you
                          </span>
                        </div>
                        <BookCatalog books={books} />
                      </section>
                    ) : null}
                    {section === "members" ? (
                      <>
                        <MemberRegistration />
                        <MemberDirectory members={members} />
                      </>
                    ) : null}
                  </motion.div>
                </AnimatePresence>

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
