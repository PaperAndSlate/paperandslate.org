import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { publicProjects } from "@paper-and-slate/content";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid container">
        <div>
          <BrandLogo />
          <p>
            Open educational infrastructure
            <br />
            for everyone.
          </p>
        </div>
        <div>
          <p className="footer-title">Foundation</p>
          <ul>
            <li>
              <Link href="/foundation">About</Link>
            </li>
            <li>
              <Link href="/foundation/mission">Mission</Link>
            </li>
            <li>
              <Link href="/foundation/principles">Principles</Link>
            </li>
            <li>
              <Link href="/foundation/contact">Contact</Link>
            </li>
            <li>
              <Link href="/foundation/people">People</Link>
            </li>
            <li>
              <Link href="/foundation/funding">Funding</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="footer-title">Projects</p>
          <ul>
            <li>
              <Link href="/projects">Projects</Link>
            </li>
            {publicProjects.slice(0, 4).map((project) => (
              <li key={project.slug}>
                <Link href={`/projects/${project.slug}`}>{project.shortName ?? project.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="footer-title">Resources</p>
          <ul>
            <li>
              <Link href="/docs">Documentation</Link>
            </li>
            <li>
              <Link href="/news">News</Link>
            </li>
            <li>
              <Link href="/foundation/roadmap">Roadmap</Link>
            </li>
            <li>
              <Link href="/projects/tools-and-libraries/releases">Releases</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="footer-title">Community</p>
          <ul>
            <li>
              <Link href="/governance/rfcs">RFCs</Link>
            </li>
            <li>
              <Link href="/governance/maintainers">Maintainers</Link>
            </li>
            <li>
              <Link href="/code-of-conduct">Code of Conduct</Link>
            </li>
            <li>
              <Link href="/foundation/contact">Contact</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>© 2026 Paper &amp; Slate. Open by default.</span>
        <span>
          <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> ·{" "}
          <Link href="/trademarks">Trademark</Link> ·{" "}
          <Link href="/accessibility">Accessibility</Link>
        </span>
      </div>
    </footer>
  );
}
