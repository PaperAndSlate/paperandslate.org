import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "../components/project-card";
import { NewsletterForm } from "../components/newsletter-form";
import { newsCategories, publicProjects, publishedNews } from "@paper-and-slate/content";
import { HeroIllustration } from "../components/hero-illustration";
import {
  ArrowsClockwise,
  BookOpenText,
  GraduationCap,
  SquaresFour,
} from "@phosphor-icons/react/ssr";
import { kitConfigured } from "../lib/newsletter";
import Image from "next/image";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", title: "Paper & Slate" },
};

const principles = [
  {
    Icon: BookOpenText,
    title: "Open by default",
    description: "Specifications, decisions, and implementations are public and reusable.",
  },
  {
    Icon: SquaresFour,
    title: "Vendor neutral",
    description: "Standards serve the education ecosystem rather than a single platform.",
  },
  {
    Icon: ArrowsClockwise,
    title: "Interoperable",
    description: "Shared formats make it easier for education tools to work together.",
  },
  {
    Icon: GraduationCap,
    title: "Education first",
    description: "Practical needs of educators and institutions shape every project.",
  },
];

export default function HomePage() {
  return (
    <main id="main-content" className="homepage">
      <section className="hero container" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Open educational infrastructure</p>
          <h1 id="page-title">Common infrastructure education has been missing.</h1>
          <p className="lede">
            <span className="hero-lede-desktop">
              Paper &amp; Slate builds open standards, formats, schemas, and tools that help
              education software and schools work together—for everyone.
            </span>
            <span className="hero-lede-mobile">
              Open standards, formats, schemas, and tools for schools and education software.
            </span>
          </p>
          <div className="actions">
            <Link className="button button-dark" href="/projects">
              Explore projects
            </Link>
            <Link className="button button-light" href="/foundation/mission">
              Read our mission
            </Link>
          </div>
        </div>
        <HeroIllustration />
      </section>
      <section className="audience container" aria-label="Built with the education community">
        <span>Built with the education community</span>
        <span>Developers</span>
        <span>Educators</span>
        <span>Schools</span>
        <span>Districts</span>
        <span>Researchers</span>
        <span>Government</span>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Our projects</div>
            <h2>Open building blocks for connected education.</h2>
          </div>
          <div className="section-heading-aside">
            <p>
              Each project solves a focused interoperability problem while sharing one set of
              principles, governance, and documentation.
            </p>
            <Link href="/projects">View all projects →</Link>
          </div>
        </div>
        <div className="project-grid">
          {publicProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
      <section className="slate-panel container">
        <div className="approach-heading">
          <div className="eyebrow">Our approach</div>
          <h2>Built in the open. Guided by clear principles.</h2>
          <Link href="/foundation/principles">Explore our principles →</Link>
        </div>
        <div className="principles">
          {principles.map(({ Icon, title, description }) => (
            <div className="principle" key={title}>
              <span className="principle-mark" aria-hidden="true">
                <Icon size={20} weight="regular" />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section container news-section" aria-labelledby="news-title">
        <div className="section-heading">
          <div>
            <div className="eyebrow">News &amp; updates</div>
            <h2 id="news-title">Follow the work as it develops.</h2>
          </div>
          <Link href="/news">View all updates →</Link>
        </div>
        <div className="news-grid">
          {publishedNews.map((item) => (
            <article className="news-card" key={item.id}>
              <div className="media-slot media-news" aria-hidden="true">
                {item.image ? (
                  <Image src={item.image} alt="" fill sizes="(max-width: 639px) 100vw, 33vw" />
                ) : null}
              </div>
              <div className="news-body">
                <p className="record-meta">
                  {item.date} · {item.type} · {item.tags.join(", ") || newsCategories[0]}
                </p>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <Link href={item.canonicalUrl}>Read update →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="newsletter container" aria-labelledby="newsletter-title">
        <div className="newsletter-copy">
          <span className="newsletter-mark" aria-hidden="true">
            ✉
          </span>
          <div>
            <h2 id="newsletter-title">Stay close to the work.</h2>
            <p>Updates on standards, RFCs, releases, and foundation news.</p>
          </div>
        </div>
        <NewsletterForm enabled={kitConfigured()} />
      </section>
    </main>
  );
}
