# Interactive Documentation

## Launch principle

Implement interactions that substantially improve comprehension and are inexpensive to maintain. Do not delay launch to build a full standards laboratory.

## Recommended at launch

### Copyable code blocks

- visible copy control;
- accessible status announcement;
- preserved indentation;
- line highlighting;
- optional filename and language label.

### Code language tabs

Use for the same semantic example in:

- raw HTTP;
- JavaScript/TypeScript;
- Python;
- Go;
- other languages when maintained.

Tabs must preserve deep-linkable content when possible and remain readable without JavaScript.

### Schema property explorer

Valuable from launch if schemas exist. Generate searchable property pages or a navigable tree from JSON Schema.

Minimum:

- property path;
- type;
- description;
- required state;
- examples;
- version introduced;
- raw schema link.

### Download and view source controls

Downloads should have file size, format, version, license, and checksum when appropriate.

### Requirements

Render normative requirement IDs with anchors and copy controls.

### Tabs, steps, callouts, and diagrams

Provide a small approved MDX component set.

## Recommended soon after launch

### Inline validators

- document validator;
- discovery manifest validator;
- JSON Schema validator.

Prefer client-side validation for pasted non-sensitive content where possible. Explain whether input leaves the browser.

### `.well-known` checker

Accept a domain and check discovery behavior. This requires server-side fetching, SSRF protections, timeouts, DNS/IP validation, and clear privacy/security design. Do not implement casually.

### Example playground

Allow editing a sample and viewing normalized output. Keep it version-scoped.

### Data-model diagram

Generate accessible diagrams from schema relationships and provide equivalent text/table views.

## Future

- OpenAPI playground;
- authenticated API examples;
- conformance suite runner;
- format converter;
- standards mapping explorer;
- downloadable implementation bundles.

## Interaction architecture

- Use client components only around the interactive control.
- Keep page content server-rendered.
- Load heavy editors and validators dynamically.
- Provide no-JavaScript fallbacks.
- Store no pasted content unless explicitly requested.
- Add telemetry only for feature success/failure, not document content.
