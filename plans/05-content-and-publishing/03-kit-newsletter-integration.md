# Kit Newsletter Integration

## Scope

Implement the website form and server integration now, but keep it disabled or hidden until Kit credentials and a form ID are configured.

## Architecture

```text
Browser form
    ↓ same-origin POST
/api/newsletter
    ↓ server-side validation and abuse controls
Kit API or configured Kit form
```

Never call Kit directly from the browser with a private API key.

## Environment variables

```text
KIT_ENABLED=false
KIT_API_KEY=
KIT_FORM_ID=
KIT_TAG_ID=
KIT_SOURCE_FIELD=paperandslate.org
NEWSLETTER_DOUBLE_OPT_IN=true
```

The exact fields should be confirmed against the current Kit account and API version during implementation.

## Request body

```ts
interface NewsletterSignupRequest {
  email: string
  firstName?: string
  sourcePage: string
  consent: true
  honeypot?: string
}
```

## Validation

- normalize and validate email;
- reject missing explicit consent;
- reject honeypot submissions;
- limit body size;
- rate-limit by privacy-preserving IP hash or edge provider control;
- do not reveal whether an email is already subscribed;
- record no email in application logs.

## Responses

Success:

> Check your inbox to confirm your subscription.

Disabled:

> Email updates are not open yet. You can follow releases through RSS or GitHub.

Rate limit:

> Too many attempts. Try again later.

Provider failure:

> We could not submit the request. Nothing was saved by Paper & Slate. Try again later or use the RSS feed.

## Privacy

The form must link to the Privacy page and explain that email data is sent to Kit for subscription management.

## Tags and segmentation

Start with one general updates form. Do not ask users to choose multiple project segments before a newsletter cadence exists.

Later tags may include:

- Developer
- Educator
- Governance
- Project-specific updates

## Testing

- disabled state;
- success;
- invalid email;
- missing consent;
- provider timeout;
- duplicate signup;
- rate limiting;
- no secrets in client bundle;
- logs contain no email address.

## Deployment

Store Kit credentials in Infisical and bind them to the Tower web workload. Preview deployments should use disabled mode or a separate test form.
