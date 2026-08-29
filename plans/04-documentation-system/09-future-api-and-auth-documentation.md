# Future API and Authentication Documentation

## Why reserve the structure now

A future hosted API and authentication system will have different documentation needs from open standards. Reserving a Developer Platform section prevents those concerns from being mixed into normative specifications.

## Ownership

Until a dedicated platform repository exists, high-level architecture notes may live in central foundation docs. When implementation starts, detailed platform docs should move beside the platform source or its own monorepo.

## Future navigation

```text
Developer Platform
├── Overview
├── Quick start
├── Authentication
│   ├── API keys
│   ├── OAuth
│   ├── Scopes
│   └── Security
├── Environments
├── Rate limits
├── Errors and request IDs
├── APIs
│   ├── Organizations
│   ├── Schools
│   ├── Standards
│   ├── Courses
│   └── Discovery
├── Webhooks
├── SDKs
├── Changelog
├── Deprecations
└── Status
```

## OpenAPI readiness

The docs application should reserve dependencies and component architecture for Fumadocs OpenAPI integration, which can generate endpoint information, request/response schemas, code examples, and an interactive playground.

Do not create placeholder endpoint reference pages before an API contract exists.

## Separation from standards

A hosted API implementation may expose Paper & Slate standards, but:

- the API is not the standard;
- API authentication is not required to implement the standard;
- hosted limits do not become normative standard limits;
- API response extensions are documented separately;
- API versions and project specification versions remain distinct.

## Visibility

Use one of:

- hidden from production navigation;
- a public “Planned developer platform” overview with no invented details;
- preview visibility for internal/reviewer deployments.

The recommended launch state is hidden, with only an architecture note in the roadmap.

## Non-production control-plane boundary

The successor Developer Control Plane plan is internal planning material, not a promise that these documentation routes, an authenticated console, or an API are available. Any future reference must distinguish Web human identity/control-plane ownership from Data Platform machine verification and must publish no credential scheme or endpoint reference before a reviewed contract and implementation exist.
