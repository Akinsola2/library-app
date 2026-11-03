"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Unable to load the library collection.", error);
  }, [error]);

  return (
    <main className="library-page">
      <div className="library-shell">
        <section className="error-panel" role="alert">
          <p className="eyebrow">A MOMENT, PLEASE</p>
          <h1>We couldn&apos;t load the collection.</h1>
          <p>
            The library list is temporarily unavailable. Please try again in a
            moment.
          </p>
          <button className="retry-button" onClick={retry} type="button">
            Try again
          </button>
        </section>
      </div>
    </main>
  );
}
