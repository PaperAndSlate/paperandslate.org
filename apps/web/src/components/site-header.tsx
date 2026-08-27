import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { MobileNavigation } from "./mobile-navigation";
import { SearchDialog } from "./search-dialog";
import { ThemeToggle } from "./theme-toggle";
export function SiteHeader() {
  return (
    <header className="site-header" data-theme-aware="true">
      <div className="header-inner container">
        <BrandLogo />
        <nav className="site-nav" aria-label="Primary">
          <Link href="/foundation">Foundation</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/docs">Documentation</Link>
          <Link href="/governance">Governance</Link>
          <Link href="/news">News &amp; updates</Link>
          <SearchDialog />
          <ThemeToggle />
        </nav>
        <MobileNavigation />
      </div>
    </header>
  );
}
