# Foundation Principles

These principles should appear publicly, guide project review, and be referenced by RFCs and decision records.

## 1. Open by default

Specifications, schemas, source code, issue discussions, RFCs, decisions, and release history should be public unless a narrow security or privacy reason requires temporary confidentiality.

Implications:

- no private standard available only to partners;
- no paid access tier for normative materials;
- no hidden compatibility tests that determine public conformance;
- security reports may remain confidential until coordinated disclosure.

## 2. Education first

Standards exist to support educational work, not to optimize a technology stack in isolation.

Implications:

- use real school, educator, learner, institution, and public-data scenarios;
- include domain practitioners in review;
- reject technically elegant models that impose unrealistic educational workflows;
- explain educational consequences of technical decisions.

## 3. Implementation neutral

Specifications define meaning, behavior, and interoperability without mandating a vendor, cloud, language, framework, or database.

Implications:

- reference implementations are examples, not exclusive implementations;
- normative requirements must not depend on a Paper & Slate-hosted service;
- self-hosting and offline use should remain possible where the standard permits.

## 4. Vendor neutral

No company, including a company operated by the founder, should receive privileged technical rights through the standard.

Implications:

- governance conflicts are disclosed;
- extension namespaces cannot impersonate the core namespace;
- project decisions cannot quietly optimize for one commercial product.

## 5. Interoperable and composable

Projects should solve focused problems and compose through explicit identifiers, links, schemas, and shared conventions.

Implications:

- avoid one giant “education object” schema;
- define stable boundaries and extension points;
- support partial implementation where safe;
- document cross-project dependencies.

## 6. Human-readable where practical

People should be able to inspect important public artifacts without proprietary tools.

Implications:

- prefer Markdown, JSON, YAML, and documented binary formats;
- preserve readable examples;
- do not sacrifice correctness merely to remain hand-editable;
- generated artifacts must point back to source representations.

## 7. Privacy respecting

The existence of a field does not imply it should be publicly published.

Implications:

- public discovery defaults to intentionally published information;
- personal and sensitive properties are excluded from public defaults;
- examples use fictional identities;
- documentation distinguishes public, internal, sensitive, and prohibited data;
- data minimization is part of schema design.

## 8. Provenance preserving

Data should retain where it came from, when it was retrieved, who asserted it, and how it was transformed.

Implications:

- identifiers do not erase source identifiers;
- mappings can coexist with original values;
- authoritative and inferred values are distinguishable;
- aggregation tools record transformation history.

## 9. Extensible without fragmentation

Implementers need local and domain-specific extensions, but the common core must remain meaningful.

Implications:

- extensions use registered or URI-like namespaces;
- unknown extensions can be preserved safely;
- extensions cannot redefine normative core semantics;
- widely adopted extensions may progress through an RFC into core.

## 10. Durable and evolvable

Education systems change slowly and retain information for long periods.

Implications:

- semantic versioning alone is insufficient; migration guidance is required;
- stable versions remain archived and addressable;
- deprecation periods are explicit;
- identifiers and citations should survive website redesigns.

## 11. Evidence driven

Major changes should be justified by use cases, implementations, research, tests, and public review.

Implications:

- RFCs include alternatives and compatibility impact;
- “because it is cleaner” is not sufficient evidence;
- experimental implementations are encouraged before stability.

## 12. Accessible

Open infrastructure is not open if its documentation or tools exclude people.

Implications:

- public interfaces target WCAG 2.2 AA;
- specifications use understandable structure and defined terminology;
- diagrams include text alternatives;
- color is never the only status signal.
