"use client";

import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) triggerRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && closeRef.current) {
        const panel = closeRef.current.closest("[role=dialog]");
        const focusable =
          panel?.querySelectorAll<HTMLElement>("button, a[href], select, input") ?? [];
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
  }, [open]);

  return (
    <div className="mobile-menu">
      <button
        ref={triggerRef}
        className="menu-button"
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-navigation-panel"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X aria-hidden size={24} /> : <List aria-hidden size={24} />}
      </button>
      {open && (
        <div className="mobile-nav-backdrop" onMouseDown={() => setOpen(false)}>
          <nav
            id="mobile-navigation-panel"
            className="mobile-nav"
            aria-label="Mobile navigation"
            aria-labelledby="mobile-navigation-title"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mobile-nav-heading">
              <span className="eyebrow" id="mobile-navigation-title">
                Navigate
              </span>
              <button
                ref={closeRef}
                type="button"
                className="dialog-close"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <Link href="/foundation" onClick={() => setOpen(false)}>
              Foundation
            </Link>
            <Link href="/projects" onClick={() => setOpen(false)}>
              Projects
            </Link>
            <Link href="/docs" onClick={() => setOpen(false)}>
              Documentation
            </Link>
            <Link href="/governance" onClick={() => setOpen(false)}>
              Governance
            </Link>
            <Link href="/news" onClick={() => setOpen(false)}>
              News &amp; updates
            </Link>
            <Link href="/search" onClick={() => setOpen(false)}>
              Search
            </Link>
            <Link href="/governance/contributing" onClick={() => setOpen(false)}>
              Get involved
            </Link>
            <div className="mobile-nav-utility" aria-labelledby="mobile-navigation-utility-title">
              <span className="eyebrow" id="mobile-navigation-utility-title">
                Trust &amp; legal
              </span>
              <div className="mobile-nav-utility-links">
                <Link href="/privacy" onClick={() => setOpen(false)}>
                  Privacy
                </Link>
                <Link href="/terms" onClick={() => setOpen(false)}>
                  Terms
                </Link>
                <Link href="/accessibility" onClick={() => setOpen(false)}>
                  Accessibility
                </Link>
                <Link href="/security" onClick={() => setOpen(false)}>
                  Security
                </Link>
                <Link href="/trademarks" onClick={() => setOpen(false)}>
                  Trademark policy
                </Link>
                <Link href="/licenses" onClick={() => setOpen(false)}>
                  License overview
                </Link>
                <Link href="/code-of-conduct" onClick={() => setOpen(false)}>
                  Code of Conduct
                </Link>
                <Link href="/foundation/contact" onClick={() => setOpen(false)}>
                  Contact options
                </Link>
              </div>
            </div>
            <ThemeToggle />
          </nav>
        </div>
      )}
    </div>
  );
}
