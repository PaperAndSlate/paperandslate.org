# Post-v1 platform integration boundary

Status: intentionally deferred from the v1 closure task  
Date: 2026-08-27

The current task closes the public content/documentation shell and its release-readiness evidence. It does not start authentication, a user database, an ORM, an application API, school/platform integrations, identity federation, LMS interoperability, payments, or other transactional platform work.

## Deferred work

- Authentication, sessions, account recovery, roles, invitations, and authorization.
- API design, versioning, rate limits, client credentials, webhooks, and data contracts.
- Database schema, migrations, backups, retention, tenant isolation, and data export/deletion.
- School, district, LMS, SIS, roster, standards, or identity-provider integrations.
- Provider-specific production integrations beyond the explicitly bounded search/newsletter/observability/cache release gates.
- Product analytics, experimentation, feature flags, queues, messaging, and background jobs.

## Why it is deferred

These capabilities change the threat model, legal/privacy scope, data-processing inventory, operational SLOs, and approval surface. They require an approved product decision, data model, security review, provider choice, credential ownership, test data policy, migration/rollback plan, and production authority. Implementing them while closing this static/open-content release would create unreviewed platform behavior and unsupported public claims.

## Required future plan before implementation

1. Appoint product, security, privacy/legal, data, and operations owners.
2. Define personas, authorization boundaries, tenancy model, data classification, retention, export/deletion, and abuse controls.
3. Select providers and regions; complete DPA/subprocessor review and document credential/rotation ownership.
4. Write API and persistence contracts with migration, backup, restore, compatibility, and rollback plans.
5. Threat-model the system and obtain security/privacy review before coding.
6. Add isolated fixtures, contract tests, integration tests, browser flows, monitoring, incident response, and staging rollback evidence.
7. Update the public claims, privacy/terms pages, data inventory, SBOM, release identity, and production approval packet.

## What Codex can do later

After an explicit future implementation request and the approvals above, Codex can draft contracts, implement bounded changes, generate migrations, write tests, configure authorized staging providers, run redacted acceptance checks, and attach evidence to a separately identified release. Nothing in this file authorizes those mutations now.
