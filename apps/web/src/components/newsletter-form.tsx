"use client";

import { useState } from "react";

export function NewsletterForm({ enabled = false }: { enabled?: boolean }) {
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled) return;
    setState("submitting");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.idempotencyKey =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Signup failed");
      setState("success");
      setMessage(result.message ?? "You are subscribed. Thank you.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Signup failed. Please try again.");
    }
  }

  return (
    <form className="newsletter-form" onSubmit={submit} aria-describedby="newsletter-status">
      <label htmlFor="newsletter-email">Email address</label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        maxLength={254}
        autoComplete="email"
        disabled={!enabled || state === "submitting"}
      />
      <label>
        <input
          name="consent"
          type="checkbox"
          required
          disabled={!enabled || state === "submitting"}
        />{" "}
        I agree to receive Paper &amp; Slate updates.
      </label>
      <p className="muted">
        {enabled ? (
          <>
            We use your email only for these updates. See our <a href="/privacy">privacy notice</a>.
          </>
        ) : (
          <>
            Newsletter signup is not configured in this environment. The form will become available
            when the Kit staging integration is activated.
          </>
        )}
      </p>
      <input
        className="honeypot"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <button
        className="button button-dark"
        type="submit"
        disabled={!enabled || state === "submitting"}
      >
        {state === "submitting" ? "Subscribing…" : "Subscribe"}
      </button>
      <p
        id="newsletter-status"
        className={state === "error" ? "form-error" : "form-status"}
        role={state === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {message}
      </p>
    </form>
  );
}
