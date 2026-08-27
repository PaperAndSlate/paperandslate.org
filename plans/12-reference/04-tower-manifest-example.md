# Tower Manifest Example

The exact manifest syntax must be generated from the live Tower plugin/controller schema during implementation. This file expresses intent and must not be treated as guaranteed controller syntax.

## Intended development resources

```yaml
project:
  name: paper-and-slate-web
  environment: development

workloads:
  - kind: web
    name: web
    runtime: nextjs
    source:
      repository: PaperAndSlate/paperandslate.org
      branch: main
    build:
      method: dockerfile
      dockerfile: infrastructure/docker/Dockerfile
    health:
      path: /health
    domain:
      enabled: true
    secrets:
      provider: infisical
      bindings:
        - GLITCHTIP_DSN
        - TYPESENSE_ADMIN_KEY
        - KIT_API_KEY
        - KIT_FORM_ID

resources:
  - kind: typesense
    name: search
    collection: paperandslate_content_dev

capabilities:
  previews:
    enabled: true
    isolatedResources:
      - typesense
    ttlHours: 120
  errorTracking:
    provider: glitchtip
    enabled: true
  syntheticMonitoring:
    enabled: true
    checks:
      - name: homepage
        url: /
      - name: docs
        url: /docs
      - name: health
        url: /health
  registry:
    sbom: true
    vulnerabilityScan: true
```

## Explicitly omitted

```text
postgres
valkey
rabbitmq
s3
qdrant
inngest
keycloak
```

Provision omitted resources only after an ADR documents the requirement.
