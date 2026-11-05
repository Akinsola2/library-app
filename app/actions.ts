"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db";

type BookInput = {
  title: string;
  author: string;
  year: number | null;
};

type BookCreationState = {
  status: "idle" | "success" | "error";
  message: string;
};

type LoanActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function readBookInput(
  formData: FormData,
): { ok: true; book: BookInput } | { ok: false; error: string } {
  const title = formData.get("title");
  const author = formData.get("author");
  const rawYear = formData.get("year");

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof author !== "string" ||
    !author.trim() ||
    title.trim().length > 300 ||
    author.trim().length > 200
  ) {
    return {
      ok: false,
      error: "Enter a book title (up to 300 characters) and author (up to 200).",
    };
  }

  const yearText = typeof rawYear === "string" ? rawYear.trim() : "";
  const year = yearText === "" ? null : Number(yearText);

  if (
    year !== null &&
    (!Number.isInteger(year) || year < 1 || year > 9999)
  ) {
    return { ok: false, error: "Enter a valid publication year." };
  }

  return {
    ok: true,
    book: {
      title: title.trim(),
      author: author.trim(),
      year,
    },
  };
}

export async function addBook(
  _previousState: BookCreationState,
  formData: FormData,
): Promise<BookCreationState> {
  const result = readBookInput(formData);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }
  const { book } = result;

  await sql.begin(async (transaction) => {
    const [author] = await transaction<{ id: number }[]>`
      INSERT INTO authors (name)
      VALUES (${book.author})
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;

    await transaction`
      INSERT INTO books (title, year, author_id)
      VALUES (${book.title}, ${book.year}, ${author.id})
    `;
  });

  revalidatePath("/");
  return {
    status: "success",
    message: `“${book.title}” by ${book.author} has been added to the library.`,
  };
}

export async function updateBook(bookId: number, formData: FormData) {
  if (!Number.isSafeInteger(bookId) || bookId < 1) {
    throw new Error("Invalid book.");
  }

  const result = readBookInput(formData);
  if (!result.ok) {
    throw new Error(result.error);
  }
  const { book } = result;

  await sql.begin(async (transaction) => {
    const [author] = await transaction<{ id: number }[]>`
      INSERT INTO authors (name)
      VALUES (${book.author})
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;

    const updatedBooks = await transaction<{ id: number }[]>`
      UPDATE books
      SET title = ${book.title}, year = ${book.year}, author_id = ${author.id}
      WHERE id = ${bookId}
      RETURNING id
    `;

    if (updatedBooks.length === 0) {
      throw new Error("That book no longer exists.");
    }
  });

  revalidatePath("/");
}

export async function deleteBook(bookId: number) {
  if (!Number.isSafeInteger(bookId) || bookId < 1) {
    throw new Error("Invalid book.");
  }

  const deletedBooks = await sql<{ id: number }[]>`
    DELETE FROM books
    WHERE id = ${bookId}
    RETURNING id
  `;

  if (deletedBooks.length === 0) {
    throw new Error("That book no longer exists.");
  }

  revalidatePath("/");
}

export async function addMember(formData: FormData) {
  const name = formData.get("name");
  const rawPhone = formData.get("phone");

  if (typeof name !== "string" || !name.trim() || name.trim().length > 200) {
    throw new Error("Enter a member name of 1 to 200 characters.");
  }

  if (typeof rawPhone !== "string") {
    throw new Error("Enter a valid phone number.");
  }

  const phone = rawPhone.trim();
  if (phone.length > 40) {
    throw new Error("Phone numbers must be 40 characters or fewer.");
  }

  await sql`
    INSERT INTO members (name, phone)
    VALUES (${name.trim()}, ${phone || null})
  `;

  revalidatePath("/");
}

export async function deleteMember(memberId: number) {
  if (!Number.isSafeInteger(memberId) || memberId < 1) {
    throw new Error("Invalid member.");
  }

  const removedMembers = await sql<{ id: number }[]>`
    DELETE FROM members
    WHERE id = ${memberId}
      AND NOT EXISTS (
        SELECT 1
        FROM loans
        WHERE loans.member_id = members.id
      )
    RETURNING id
  `;

  if (removedMembers.length === 0) {
    throw new Error(
      "This membership cannot be removed because the member has loan history.",
    );
  }

  revalidatePath("/");
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export async function addLoan(
  _previousState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  const bookId = Number(formData.get("book_id"));
  const memberId = Number(formData.get("member_id"));
  const borrowedOn = formData.get("borrowed_on");
  const dueOn = formData.get("due_on");

  if (
    !Number.isSafeInteger(bookId) ||
    bookId < 1 ||
    !Number.isSafeInteger(memberId) ||
    memberId < 1
  ) {
    return { status: "error", message: "Choose a valid book and member." };
  }

  if (
    typeof borrowedOn !== "string" ||
    typeof dueOn !== "string" ||
    !isValidDate(borrowedOn) ||
    !isValidDate(dueOn)
  ) {
    return { status: "error", message: "Enter valid borrowed and due dates." };
  }

  if (dueOn < borrowedOn) {
    return {
      status: "error",
      message: "The due date cannot be earlier than the borrowed date.",
    };
  }

  const result = await sql.begin(async (transaction) => {
    const [book] = await transaction<{ id: number }[]>`
      SELECT id FROM books WHERE id = ${bookId} FOR UPDATE
    `;
    if (!book) {
      return { ok: false as const, message: "That book no longer exists." };
    }

    const [member] = await transaction<{ id: number }[]>`
      SELECT id FROM members WHERE id = ${memberId}
    `;
    if (!member) {
      return { ok: false as const, message: "That member no longer exists." };
    }

    const [activeLoan] = await transaction<{ id: number }[]>`
      SELECT id
      FROM loans
      WHERE book_id = ${bookId}
        AND returned_on IS NULL
    `;
    if (activeLoan) {
      return {
        ok: false as const,
        message: "That book is already checked out.",
      };
    }

    await transaction`
      INSERT INTO loans (book_id, member_id, borrowed_on, due_on)
      VALUES (${bookId}, ${memberId}, ${borrowedOn}, ${dueOn})
    `;

    const [loanStatus] = await transaction<{ is_overdue: boolean }[]>`
      SELECT (${dueOn}::date < CURRENT_DATE) AS is_overdue
    `;

    return { ok: true as const, isOverdue: loanStatus.is_overdue };
  });

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/");
  return {
    status: "success",
    message: result.isOverdue
      ? "Overdue loan added. It now appears in the overdue books list."
      : "Borrowed book recorded successfully.",
  };
}

export async function returnLoan(loanId: number) {
  if (!Number.isSafeInteger(loanId) || loanId < 1) {
    throw new Error("Invalid loan.");
  }

  const returnedLoans = await sql<{ id: number }[]>`
    UPDATE loans
    SET returned_on = CURRENT_DATE
    WHERE id = ${loanId}
      AND returned_on IS NULL
    RETURNING id
  `;

  if (returnedLoans.length === 0) {
    throw new Error("That active loan no longer exists.");
  }

  revalidatePath("/");
}
