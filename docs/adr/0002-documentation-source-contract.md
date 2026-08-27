# ADR 0002: Local documentation source contract

- Status: accepted for local implementation
- Date: 2026-08-26

Central Markdown, checked-in fixtures, and the sibling `../standards` workspace are ingested at build time. Future Git-mode sources require explicit approval and a real resolved 40-character SHA; local and fixture records use SHA-256 content hashes and never pretend those hashes are Git commits. Imported Markdown is escaped and validated for unsafe markup, traversal, assets, symlinks, duplicate headings, broken anchors, and route collisions. Routes include project and version, and raw Markdown is available through a static route.

No arbitrary MDX, runtime network fetches, database, authentication, queue, object storage, or provider activation is part of this contract.
