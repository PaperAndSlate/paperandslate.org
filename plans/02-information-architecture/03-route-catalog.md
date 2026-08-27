# Route Catalog and Template Mapping

| Route | Template | Content source | Render mode |
|---|---|---|---|
| `/` | Homepage | Structured TypeScript/MDX | Static with revalidation |
| `/foundation` | Editorial index | MDX + cards | Static |
| `/foundation/mission` | Editorial prose | MDX | Static |
| `/foundation/principles` | Principle grid + prose | MDX/data | Static |
| `/foundation/people` | People/roles | Validated data + MDX | Static |
| `/foundation/funding` | Disclosure page | MDX | Static |
| `/foundation/roadmap` | Roadmap | Structured YAML/TS | Static |
| `/foundation/reports` | Report archive | MDX collection | Static |
| `/foundation/reports/[year]` | Report | MDX | Static |
| `/foundation/contact` | Contact options | MDX | Static |
| `/projects` | Project registry | Project manifests | Static |
| `/projects/[slug]` | Project detail | Project manifest + MDX | Static |
| `/projects/[slug]/releases` | Release list | Imported changelog | Static |
| `/docs` | Docs portal | Local docs manifest | Static |
| `/docs/**` | Docs page | Local/imported MDX | Static where possible |
| `/governance` | Governance index | Governance registry | Static |
| `/governance/charter` | Governance prose | Rendered Git Markdown | Static |
| `/governance/model` | Governance model | Rendered Git Markdown | Static |
| `/governance/rfcs` | RFC registry | RFC frontmatter | Static |
| `/governance/rfcs/[number]` | RFC detail | Markdown | Static |
| `/governance/decisions/[id]` | ADR/decision | Markdown | Static |
| `/news` | News index | MDX collection | Static/revalidated |
| `/news/[slug]` | News article | MDX | Static |
| `/search` | Search fallback page | Search provider | Dynamic shell |
| `/api/newsletter` | Kit proxy | Server route | Dynamic |
| `/feeds/rss.xml` | RSS | News collection | Static route |
| `/feeds/atom.xml` | Atom | News collection | Static route |
| `/feeds/feed.json` | JSON Feed | News collection | Static route |
| `/llms.txt` | AI index | Docs loader | Static route |
| `/llms-full.txt` | AI corpus | Docs loader | Static route |
| `/docs/**.md` | Raw Markdown view | Docs loader | Static route |
| `/sitemap.xml` | Sitemap | All registries | Generated |
| `/robots.txt` | Robots | Config | Generated |

## Next.js route groups

```text
apps/web/src/app/
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── foundation/
│   ├── projects/
│   ├── governance/
│   └── news/
├── (docs)/
│   ├── docs/
│   │   ├── layout.tsx
│   │   └── [[...slug]]/page.tsx
│   └── docs-theme-provider.tsx
├── api/
│   └── newsletter/route.ts
├── feeds/
├── llms.txt/route.ts
├── llms-full.txt/route.ts
├── sitemap.ts
├── robots.ts
├── icon.tsx
├── opengraph-image.tsx
├── not-found.tsx
├── error.tsx
└── global-error.tsx
```

## Canonical route rules

- Project landing page: `/projects/file-system`
- Default docs: `/docs/file-system`
- Draft docs: `/docs/file-system/next`
- Historical docs: `/docs/file-system/v/1.0`
- RFC: `/governance/rfcs/0002-core-document-format`
- Decision: `/governance/decisions/2026-004-adopt-project-lifecycle`

Stable default docs may omit the version in the canonical URL. Historical versions always include it.

## Redirect policy

Maintain permanent redirects for:

- renamed project slugs;
- superseded documentation paths;
- old RFC title slugs;
- a future docs subdomain move;
- `/blog` to `/news` if an earlier route ever ships.

Redirect data should live in a versioned registry and have automated collision tests.
