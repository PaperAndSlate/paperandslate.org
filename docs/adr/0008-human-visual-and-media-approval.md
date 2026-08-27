# ADR 0008: Human visual and media approval remains a release gate

Status: accepted for v1 release-candidate implementation  
Date: 2026-08-27

## Decision

The production visual harness captures the approved 13-state route/theme/viewport matrix, waits for hydration and media readiness, records runtime errors, and hashes screenshots and supplied references. It does not convert a hash or pixel comparison into product approval. A product owner must approve intentional visual deviations, and a rights owner must approve each published image, icon, logo, generated asset, and font.

## Consequences

Automated evidence proves that clean production captures exist and are reproducible. It cannot prove taste, brand acceptance, accessibility in every human context, consent, licensing, or publication rights. Visual manifests therefore remain `human-review-pending` until the accountable records are returned.
