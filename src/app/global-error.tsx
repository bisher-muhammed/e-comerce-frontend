"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          backgroundColor: "#F9F8F6",
          color: "#1A1917",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 500,
              margin: 0,
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "#8A887F",
            }}
          >
            The application failed to load. Please try again.
          </p>

          {error.digest && (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                color: "#8A887F",
              }}
            >
              Reference: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              height: "2.75rem",
              padding: "0 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#F9F8F6",
              backgroundColor: "#1A1917",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
