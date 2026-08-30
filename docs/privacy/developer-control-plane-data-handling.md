# Developer Control Plane data handling

## Boundary

DCP-1A is a disabled-by-default, fixture-only repository kernel. It has no public route, live identity provider, provider account, database connection, analytics integration, or Data Platform transport. Test identities and key material must be synthetic and caller supplied.

## Data classes

| Class                                                        | Permitted storage                                                                             | Prohibited destinations                                                 | Retention                                              |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| Better Auth user, account, session, organization, membership | Future Web-owned `auth` schema only                                                           | Data projection, audit payloads, metrics, client logs                   | Provider/session policy; not activated in DCP-1A       |
| Project and key metadata                                     | Web-owned `control` schema                                                                    | Public UI, analytics, unrelated projects                                | While active plus approved deletion/incident holds     |
| Plaintext key, session token, authorization header           | Nowhere; fixture value may exist transiently in one command result                            | Database, audit, outbox, metrics, errors, logs, evidence                | One-time response lifetime only                        |
| Audit metadata                                               | Append-only `control` records with opaque actor/org/project/key IDs and redacted reason codes | Secret or request-body fields                                           | 400 days unless legal/incident hold                    |
| Outbox metadata                                              | Transactional `control` record; no verifier or plaintext in DCP-1A                            | Browser, analytics, logs                                                | Acknowledged 30 days; failed 90 days; pending retained |
| Idempotency metadata                                         | Command ID, operation, result identity/status only                                            | Replayed plaintext result                                               | 30 days unless active recovery                         |
| Metrics                                                      | Allowlisted counter/age/state dimensions only                                                 | Opaque IDs, user identifiers, route values, key/session/header material | Future platform policy; no sink in DCP-1A              |

## Handling rules

- Exact organization and project ownership is checked before every read or mutation.
- List operations return redacted metadata only. A duplicate create/rotate request never replays plaintext.
- Errors serialize stable codes and redacted context only.
- Lifecycle command and correlation IDs must be UUIDv7 and reason codes must be allowlisted before repository/provider access. Rejected values never reach persisted metadata, idempotency, audit, outbox, metrics, errors, or serialization.
- Projection ages and policy versions accept only finite, safe, non-negative integers. Invalid numeric input fails closed rather than being normalized or recorded.
- Purge eligibility is deterministic and refuses legal holds, incidents, pending delivery, and failed delivery before its longer retention window.
- Data Platform receives no human identity. DCP-1A has no wire mapping and makes no claim that its internal outbox is Data-compatible.
- Future database, telemetry, provider, browser, and Data activation each require a privacy/security review against their actual configuration and retention controls.

## Auth schema parity

The generate-only migration check derives the Better Auth 1.7.2 auth-table surface from its installed `getAuthTables` function. It validates the `auth` schema's physical model/field names, PostgreSQL types, requiredness, defaults, indexes, foreign keys, custom UUIDv7 text-ID strategy, and organization role mapping. Better Auth account/session fields remain confined to the future Web-owned auth schema; they are not control-plane key metadata and never enter Data projection, audit payloads, metrics, or client logs.
