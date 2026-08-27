# Project Registry and Project Pages

## Project registry purpose

The project registry is the authoritative public catalog of Paper & Slate work. It must represent unfinished work honestly and provide machine-readable metadata.

## `/projects`

### Header

- Title
- Explanation of independent project versioning
- Link to lifecycle definitions
- Search and filters

### Filters

- Project type
- Maturity
- Active / archived
- Tag
- Optional dependency filter later

Filter state should be reflected in the URL.

### Views

Offer one strong default grid and an optional compact list. Do not build a view toggle unless the list genuinely improves scanning.

### Project card

Required:

- name;
- concise purpose;
- image or illustration;
- type;
- maturity;
- version;
- last meaningful update;
- primary link.

Optional:

- maintainer avatars;
- dependency count;
- implementation count when evidence exists.

### Status legend

Provide a small “What statuses mean” disclosure linked to the full lifecycle policy.

## `/projects/[slug]`

### Project hero

- project type;
- maturity;
- current version;
- name;
- one-sentence definition;
- longer purpose;
- primary action: Read documentation;
- secondary action: View source;
- project image.

### Section navigation

Recommended tabs or anchored navigation:

- Overview
- Documentation
- Specification
- Examples
- Schema
- Tools
- Releases

Only display links that exist.

### Overview content

Required:

1. Problem addressed
2. Scope
3. Non-goals
4. Core concepts
5. Example
6. Current implementation state
7. Compatibility and dependencies
8. Security/privacy considerations
9. Current work and RFCs
10. Maintainers and license

### Metadata rail

- Status
- Version
- Repository
- Docs source
- Maintainers
- Licenses
- Updated date
- RFCs
- Dependencies
- Package names if applicable

### Planned project state

A planned project page may publish:

- problem statement;
- intended scope;
- relationship to other projects;
- open research questions;
- roadmap status;
- contribution request.

It must not publish fake version numbers or empty schema links.

### Archived project state

Archived pages remain available and include:

- archive date;
- reason;
- replacement or migration path;
- last version;
- immutable source links.

## Machine-readable project registry

Expose a static endpoint such as:

```text
/projects.json
```

It may include public project metadata but should not become a premature API contract. Document its stability separately.

## Social and preview metadata

Generate project-specific Open Graph images using:

- project name;
- maturity badge;
- short purpose;
- Paper & Slate mark;
- optional project motif.

Do not use different brand colors per project unless a formal sub-brand system is adopted.
