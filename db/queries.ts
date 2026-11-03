import { sql } from "@/db";

export type Book = {
  id: number;
  title: string;
  author: string;
  member: string | null;
  due_on: Date | null;
};

export async function getBooks(): Promise<Book[]> {
  return sql<Book[]>`
    SELECT
      books.id,
      books.title,
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
