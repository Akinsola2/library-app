import { sql } from "@/db";

export type Book = {
  id: number;
  title: string;
  author: string;
  year: number | null;
  member: string | null;
  due_on: Date | null;
};

export type DashboardStats = {
  available_books: number;
  borrowed_books: number;
  overdue_books: number;
  total_members: number;
};

export type CurrentLoan = {
  id: number;
  title: string;
  author: string;
  member: string;
  borrowed_on: Date;
  due_on: Date;
  is_overdue: boolean;
};

export type AvailableBook = {
  id: number;
  title: string;
  author: string;
};

export type LibraryMember = {
  id: number;
  name: string;
  phone: string | null;
  has_loan_history: boolean;
};

export async function getBooks(): Promise<Book[]> {
  return sql<Book[]>`
    SELECT
      books.id,
      books.title,
      books.year,
      authors.name AS author,
      members.name AS member,
      loans.due_on
    FROM books
    INNER JOIN authors ON authors.id = books.author_id
    LEFT JOIN loans
      ON loans.book_id = books.id
      AND loans.returned_on IS NULL
    LEFT JOIN members ON members.id = loans.member_id
    ORDER BY books.title, books.id
  `;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [stats] = await sql<DashboardStats[]>`
    SELECT
      (
        SELECT COUNT(*)::integer
        FROM books
        WHERE NOT EXISTS (
          SELECT 1
          FROM loans
          WHERE loans.book_id = books.id
            AND loans.returned_on IS NULL
        )
      ) AS available_books,
      (
        SELECT COUNT(*)::integer
        FROM loans
        WHERE returned_on IS NULL
      ) AS borrowed_books,
      (
        SELECT COUNT(*)::integer
        FROM loans
        WHERE returned_on IS NULL
          AND due_on < CURRENT_DATE
      ) AS overdue_books,
      (SELECT COUNT(*)::integer FROM members) AS total_members
  `;

  return stats;
}

export async function getCurrentLoans(): Promise<CurrentLoan[]> {
  return sql<CurrentLoan[]>`
    SELECT
      loans.id,
      books.title,
      authors.name AS author,
      members.name AS member,
      loans.borrowed_on,
      loans.due_on,
      (loans.due_on < CURRENT_DATE) AS is_overdue
    FROM loans
    INNER JOIN books ON books.id = loans.book_id
    INNER JOIN authors ON authors.id = books.author_id
    INNER JOIN members ON members.id = loans.member_id
    WHERE loans.returned_on IS NULL
    ORDER BY loans.due_on, books.title
  `;
}

export async function getAvailableBooks(): Promise<AvailableBook[]> {
  return sql<AvailableBook[]>`
    SELECT books.id, books.title, authors.name AS author
    FROM books
    INNER JOIN authors ON authors.id = books.author_id
    WHERE NOT EXISTS (
      SELECT 1
      FROM loans
      WHERE loans.book_id = books.id
        AND loans.returned_on IS NULL
    )
    ORDER BY books.title, books.id
  `;
}

export async function getMembers(): Promise<LibraryMember[]> {
  return sql<LibraryMember[]>`
    SELECT
      members.id,
      members.name,
      members.phone,
      EXISTS (
        SELECT 1
        FROM loans
        WHERE loans.member_id = members.id
      ) AS has_loan_history
    FROM members
    ORDER BY members.name, members.id
  `;
}
