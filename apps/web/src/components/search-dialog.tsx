"use client";

import { MagnifyingGlass, ArrowUp, ArrowDown, ArrowElbowDownLeft, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SearchResponse, SearchResult } from "@paper-and-slate/search";

const typeLabels: Record<string, string> = {
  project: "Projects",
  documentation: "Documentation",
  governance: "Governance",
  rfc: "RFCs",
  decision: "Decisions",
  policy: "Policies",
  news: "News",
  report: "Reports",
};

function grouped(results: SearchResult[]) {
  return results.reduce<Record<string, SearchResult[]>>((groups, result) => {
    (groups[result.type] ??= []).push(result);
    return groups;
  }, {});
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const results = response?.results ?? [];
  const groups = useMemo(() => grouped(results), [results]);

  const dialog = open ? (
    <div
      className="search-dialog"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        ref={dialogRef}
        className="search-dialog-inner"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        aria-describedby="search-help"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Find the work</p>
            <h2 id="search-title">Search Paper &amp; Slate</h2>
          </div>
          <button
            className="dialog-close"
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close search"
          >
            <X aria-hidden size={20} />
          </button>
        </div>
        <form
          action="/search"
          onSubmit={(event) => {
            if (!q.trim()) event.preventDefault();
          }}
        >
          <label className="sr-only" htmlFor="global-search">
            Search projects, docs, governance, and news
          </label>
          <div className="search-input-wrap">
            <MagnifyingGlass aria-hidden size={19} />
            <input
              ref={inputRef}
              id="global-search"
              name="q"
              value={q}
              onChange={(event) => setQ(event.target.value.slice(0, 120))}
              placeholder="Search projects, docs, governance…"
              maxLength={120}
              autoComplete="off"
            />
          </div>
          <button className="button button-dark" type="submit">
            Search <ArrowElbowDownLeft aria-hidden size={16} />
          </button>
        </form>
        <p id="search-help" className="muted">
          {loading
            ? "Searching…"
            : response
              ? `${response.total} result${response.total === 1 ? "" : "s"} · ${response.provider}${response.degraded ? " · fallback" : ""}`
              : "Type to search. Use ↑ and ↓ to move through results."}
        </p>
        {q.trim() ? (
          <Link className="search-all-results" href={`/search?q=${encodeURIComponent(q.trim())}`}>
            View results →
          </Link>
        ) : null}
        {q.trim() && !loading && response && results.length === 0 ? (
          <div className="search-empty">
            <strong>No matching records</strong>
            <span>Try a project name, RFC number, or broader phrase.</span>
          </div>
        ) : null}
        {Object.entries(groups).map(([type, items]) => (
          <section key={type} className="search-group" aria-labelledby={`search-group-${type}`}>
            <h3 id={`search-group-${type}`}>{typeLabels[type] ?? type}</h3>
            <ul role="listbox" aria-label={typeLabels[type] ?? type}>
              {items.map((result) => {
                const index = results.indexOf(result);
                return (
                  <li key={result.id} role="option" aria-selected={index === activeIndex}>
                    <Link
                      href={result.route}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <span>
                        <strong>{result.title}</strong>
                        <small>{result.snippet}</small>
                      </span>
                      <ArrowElbowDownLeft aria-hidden size={15} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <div className="search-keys" aria-hidden="true">
          <span>
            <ArrowUp size={13} />
            <ArrowDown size={13} /> Navigate
          </span>
          <span>
            <ArrowElbowDownLeft size={13} /> Open
          </span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  ) : null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) triggerRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key === "ArrowDown" && results.length > 0) {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % results.length);
      }
      if (event.key === "ArrowUp" && results.length > 0) {
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + results.length) % results.length);
      }
      if (event.key === "Enter" && results[activeIndex]) {
        event.preventDefault();
        window.location.assign(results[activeIndex].route);
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          "button, input, a[href], select",
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, results, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const trimmed = q.trim();
    if (!trimmed) {
      setResponse(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        if (!result.ok) throw new Error("Search is unavailable");
        setResponse((await result.json()) as SearchResponse);
        setActiveIndex(0);
      } catch (error) {
        if ((error as Error).name !== "AbortError")
          setResponse({
            query: trimmed,
            results: [],
            total: 0,
            facets: { type: {}, source: {} },
            provider: "error",
            truncated: false,
            degraded: true,
          });
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, open]);

  return (
    <>
      <button
        ref={triggerRef}
        className="search-trigger"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <MagnifyingGlass aria-hidden size={17} /> <span>Search</span>{" "}
        <kbd aria-hidden="true">⌘/Ctrl K</kbd>
      </button>
      {dialog && typeof document !== "undefined" ? createPortal(dialog, document.body) : null}
    </>
  );
}
