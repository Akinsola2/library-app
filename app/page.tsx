import { Suspense } from "react";
import { connection } from "next/server";
import {
  getAvailableBooks,
  getBooks,
  getCurrentLoans,
  getDashboardStats,
  getMembers,
} from "@/db/queries";
import LibraryWorkspace from "@/app/library-workspace";

function DashboardFallback() {
  return (
    <main className="library-page">
      <div className="library-shell">
        <header className="page-header">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true">
              R
            </span>
            <span>The Reading Room</span>
          </span>
        </header>
        <div className="dashboard-loading" aria-label="Loading library dashboard">
          <div className="stats-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="stat-card stat-card-skeleton" key={index}>
                <div className="skeleton-line skeleton-author" />
                <div className="skeleton-line skeleton-title" />
              </div>
            ))}
          </div>
          <div className="book-list">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="book-card book-card-skeleton" key={index}>
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-author" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

async function LibraryDashboard() {
  await connection();
  const [books, availableBooks, stats, loans, members] = await Promise.all([
    getBooks(),
    getAvailableBooks(),
    getDashboardStats(),
    getCurrentLoans(),
    getMembers(),
  ]);

  return (
    <LibraryWorkspace
      books={books}
      availableBooks={availableBooks}
      stats={stats}
      loans={loans}
      members={members}
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <LibraryDashboard />
    </Suspense>
  );
}
