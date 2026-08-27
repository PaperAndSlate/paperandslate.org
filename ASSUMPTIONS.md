# V1 release-candidate assumptions

This file records decisions made where the plan pack leaves a technical choice open. It is part of the release-candidate traceability record and should be updated when an owner decision changes one of these assumptions.

- Paper & Slate is described publicly as an open education initiative of Glasscow LLC. It is not described as a separately incorporated nonprofit, charity, foundation, educational institution, accreditation body, standards authority, or government entity.
- Forgejo is the canonical development remote for this goal. GitHub repository creation and publication are intentionally deferred.
- The target is a staging release candidate such as `v1.0.0-rc.1`, never final `v1.0.0` approval.
- Source-controlled Markdown/MDX remains the documentation source of truth. S3/MinIO, when used, stores generated evidence or release artifacts only.
- Postgres is not provisioned for v1 closure: the public site has no durable relational feature that requires it. Newsletter delivery/consent metadata remains provider-bound and minimized unless a later approved requirement establishes a durable audit store.
- Keycloak, authentication, Foundation API, user accounts, live standards data, queues, workers, Qdrant, Inngest, AI Gateway keys, and Stripe listeners are post-v1 or unused by the current public site and are not provisioned.
- Typesense is the preferred staging search provider, with a fully functional static index as the mandatory degraded-mode fallback. Valkey is used only where distributed newsletter abuse controls and short-lived provider state require it.
- Staging provider secrets are referenced by name through Infisical/Tower and are never committed, printed, or copied into evidence.
- Human visual, legal, factual, media-rights, screen-reader, real-device, and final-promotion decisions remain pending for the next phase even when automated checks pass.
