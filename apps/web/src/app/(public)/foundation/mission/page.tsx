import { PageHeader } from "../../../../components/page-primitives";
export default function Mission() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader
        eyebrow="Foundation / Mission"
        title="Make educational systems easier to connect, understand, and improve."
      >
        Our mission is to develop open, neutral, and durable infrastructure for education.
      </PageHeader>
      <article className="prose">
        <h2>The problem</h2>
        <p>
          Education software often has to exchange the same kinds of information in different ways.
          Paper & Slate is planned to make those connections easier to reason about.
        </p>
        <h2>Who benefits</h2>
        <p>
          Developers, educators, schools, districts, researchers, and public institutions can
          benefit from clearer shared building blocks.
        </p>
        <h2>What we build</h2>
        <p>
          We focus on standards, formats, schemas, and tools. Future hosted services may support
          this work, but they are not part of this release.
        </p>
        <h2>What we refuse to become</h2>
        <p>
          We do not aim to be a vendor lock-in layer, a closed data broker, or a substitute for the
          people and institutions doing education work.
        </p>
        <h2>Success</h2>
        <p>
          Success means useful public artifacts that are understandable, reusable, and improved
          through open participation.
        </p>
      </article>
    </main>
  );
}
