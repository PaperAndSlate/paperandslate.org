# Infrastructure Cost and Scaling

## Launch footprint

Minimal viable production infrastructure:

- one small Next.js web workload;
- Typesense search;
- DNS/CDN;
- GlitchTip;
- synthetic monitoring;
- GitHub Actions.

Most traffic is cacheable. No database, queue, or object store is required.

## Scale triggers

### Increase web resources when

- server-side route latency rises;
- build/runtime memory approaches limits;
- newsletter or future tools add meaningful server load;
- dynamic rendering becomes common.

### Split docs deployment when

- documentation builds dominate deploy time;
- docs and public site release independently at high frequency;
- separate teams own them;
- the docs artifact materially exceeds platform limits;
- docs traffic or security policy requires a separate boundary.

### Add Inngest when

- repository-triggered ingestion becomes unreliable in one CI job;
- workflows need retries, fan-out, and durable state;
- interactive tools require asynchronous processing.

### Add S3 when

- repository media becomes large;
- nontechnical upload workflow is introduced;
- downloadable artifacts are numerous;
- immutable release asset delivery needs separate storage.

### Add PostgreSQL when

- content or governance records need non-Git workflows;
- user accounts or console are implemented;
- organization claims or API keys exist;
- feedback requires durable structured storage.

## Cost discipline

- use static generation before caches;
- use one search system before adding vector search;
- avoid always-on workers without queued work;
- cap preview resource lifetime;
- clean preview search collections;
- generate optimized images;
- monitor egress and build minutes.

## Capacity test

Before launch, load-test:

- cached homepage and docs;
- uncached newsletter route with safe mock provider;
- search queries;
- production container startup;
- concurrent static asset requests.

The goal is to identify obvious limits, not simulate a commercial-scale API product that does not yet exist.
