# Observability and Analytics

## Principles

- collect what improves reliability and documentation;
- avoid advertising surveillance;
- redact personal information;
- separate operational logs from product analytics;
- document providers publicly.

## Error tracking

Use Tower’s GlitchTip integration.

Capture:

- server exceptions;
- client application errors;
- failed route handlers;
- content loader failures;
- search provider errors;
- newsletter provider errors without email values.

Tag:

- environment;
- deployment SHA;
- route group;
- content source SHA when relevant;
- project/version for docs errors.

## Logging

Structured JSON logs for server functionality:

```json
{
  "level": "error",
  "event": "newsletter.provider_failed",
  "requestId": "...",
  "provider": "kit",
  "status": 503,
  "deployment": "..."
}
```

Never log newsletter email, full request bodies, secrets, or pasted validator content.

## Synthetic monitoring

Monitor:

- `/`;
- `/projects`;
- `/docs`;
- one core docs page;
- `/feeds/rss.xml`;
- search health/query;
- newsletter endpoint in disabled/test mode;
- production TLS and domain expiry where available.

## SLOs

Initial:

- site availability: 99.9%;
- docs availability: 99.9%;
- search availability: 99.5%, with static fallback;
- newsletter endpoint: best effort until public launch of newsletter.

## Analytics events

- `project_opened`
- `docs_opened`
- `search_opened`
- `search_completed`
- `search_zero_results`
- `search_result_selected`
- `version_changed`
- `edit_on_github_clicked`
- `rfc_discussion_clicked`
- `newsletter_submitted`
- `feed_clicked`

Properties must avoid personal data.

## Content insights

Create periodic reports for:

- high-traffic docs with stale review dates;
- common zero-result queries;
- routes with high 404 rates;
- project pages not leading to docs;
- historical versions still receiving traffic;
- outbound source/edit engagement.

## Alerts

Alert on:

- site synthetic failure;
- repeated docs ingestion failure;
- search index mismatch;
- high server-error rate;
- newsletter provider failure spike;
- expiring certificates or secrets where supported.

Do not page someone for a single failed newsletter request.
