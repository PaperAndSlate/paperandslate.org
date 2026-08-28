import Link from "next/link";

const layers = [
  ["Authoritative", "The words and structure published by the issuing authority."],
  [
    "Normalized",
    "Our consistent representation of the authoritative material—such as identifiers, hierarchy, language, stage, and provenance.",
  ],
  [
    "Derived",
    "Concept classifications, crosswalks, comparisons, summaries, and machine-assisted proposals created outside the issuing authority.",
  ],
];

export function StandardsMethodology() {
  return (
    <div className="standards-methodology">
      <aside className="standards-methodology-notice" aria-label="Current Standards fixture status">
        <strong>Current fixture status</strong>
        <p>
          The current Iowa and England fixtures are synthetic, candidate-only, non-public, and
          rights-denied metadata examples. They are not official or stable publications, and they do
          not expose official wording, source bytes, full text, or downloads.
        </p>
      </aside>

      <section aria-labelledby="layers-heading">
        <p className="eyebrow">01 / Data layers</p>
        <h2 id="layers-heading">Keep source material and interpretation distinct.</h2>
        <div className="standards-methodology-layers">
          {layers.map(([title, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <p className="standards-methodology-copy">
          We use direct authoritative sources wherever possible: official agency pages, government
          publications, issuer documents, and issuer-provided data. A third-party host is not
          automatically treated as the authority.
        </p>
      </section>

      <section aria-labelledby="evidence-heading" className="standards-methodology-band">
        <p className="eyebrow">02 / Evidence and publication</p>
        <h2 id="evidence-heading">Every record needs a trail.</h2>
        <div className="standards-methodology-columns">
          <div>
            <h3>Evidence archive</h3>
            <p>
              We preserve the exact source bytes, retrieval metadata, checksums, and source
              locations used to create published records. Those source bytes are internal evidence;
              no official wording, source bytes, or full text is exposed here.
            </p>
          </div>
          <div>
            <h3>Autonomous ingestion, controlled publication</h3>
            <p>
              Automation may detect a source change, retrieve and archive it, parse and normalize
              it, validate it, compare it with the registry, and prepare a candidate. Publication
              depends on source authority, rights, quality, risk, and review policy.
            </p>
          </div>
          <div>
            <h3>Last-known-good behavior</h3>
            <p>
              If a candidate is incomplete, suspicious, rights-blocked, or structurally broken, it
              is quarantined. The previous verified release remains the last-known-good public
              release under the policy; current fixtures are not that release.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="rights-heading">
        <p className="eyebrow">03 / Rights-aware handling</p>
        <h2 id="rights-heading">Public access is source-specific.</h2>
        <p className="standards-methodology-copy">
          We review whether material can be displayed, returned through the API, included in bulk
          downloads, reused commercially, normalized or adapted, and redistributed in its original
          form. When rights are unclear, we restrict publication rather than assume permission. The
          fail-closed result may be metadata-only: useful identifiers and provenance without
          restricted wording, source bytes, full text, or downloads.
        </p>
      </section>

      <section aria-labelledby="changes-heading" className="standards-methodology-band">
        <p className="eyebrow">04 / History and review</p>
        <h2 id="changes-heading">Name what changed, and who reviewed it.</h2>
        <div className="standards-methodology-columns">
          <div>
            <h3>Change classes</h3>
            <p>
              We distinguish official wording or structural changes from presentation-only source
              changes, parser or normalization corrections, framework version releases, and rights
              changes. An issuer change is not the same as a processing correction.
            </p>
          </div>
          <div>
            <h3>Concepts and crosswalks</h3>
            <p>
              Relationships between frameworks are analytical judgments unless published by an
              issuer. We record evidence and review status: proposed, machine-suggested, reviewed,
              or issuer-published. Machine-generated suggestions are never automatically published
              as reviewed relationships.
            </p>
          </div>
          <div>
            <h3>AI boundaries</h3>
            <p>
              AI may assist with source research, ambiguous extraction, and candidate relationship
              discovery. It cannot approve rights, change official wording, or publish a release.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="corrections-heading">
        <p className="eyebrow">05 / Accountability</p>
        <h2 id="corrections-heading">Corrections and coverage stay visible.</h2>
        <div className="standards-methodology-columns">
          <div>
            <h3>Corrections</h3>
            <p>
              Corrections are version-controlled and source-linked. We do not silently edit
              generated database records.
            </p>
          </div>
          <div>
            <h3>Coverage</h3>
            <p>
              Coverage pages show what is catalogued, rights-reviewed, processing, published,
              historical, language-complete, or blocked. Coverage is not a claim that every source
              or jurisdiction is complete.
            </p>
          </div>
          <div>
            <h3>Report an issue</h3>
            <p>
              Authorities, educators, developers, and researchers can report source, text,
              hierarchy, rights, or crosswalk concerns using the stable record and release ID.
            </p>
            <Link href="/standards/sources">Review source records</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
