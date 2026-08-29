import { PageHeader } from "../../../../components/page-primitives";
import { publicPeople } from "@paper-and-slate/content";
export default function People() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Foundation / People" title="People and maintainers">
        This page intentionally names no people until approved public profiles and project scopes
        exist.
      </PageHeader>
      <div className="card-grid">
        {publicPeople.map((person) => (
          <article className="info-card" key={person.id}>
            <p className="record-meta">
              {person.status} · {person.role}
            </p>
            <h2>{person.name}</h2>
            <p>{person.summary}</p>
          </article>
        ))}
      </div>
      <article className="prose">
        <h2>Future roles</h2>
        <p>
          As work develops, this page will distinguish stewards, project maintainers, contributors,
          and advisors. A role will be listed only with a person’s consent and a clear scope.
        </p>
        <h2>Become a maintainer</h2>
        <p>
          Maintainer pathways are planned alongside project governance. For now, technical questions
          can use the project documentation and future community channels.
        </p>
      </article>
    </main>
  );
}
