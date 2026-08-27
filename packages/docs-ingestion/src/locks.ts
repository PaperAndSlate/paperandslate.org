import type { DocsSource, DocsVersion, Provenance } from "./types";
import { sha256 } from "./normalize";
export function lockFor(
  source: DocsSource,
  version: DocsVersion,
  files: { relativePath: string; raw: string }[],
): Provenance {
  const entries = files
    .map((file) => ({ path: file.relativePath, contentHash: sha256(file.raw) }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const contentHash = sha256(entries.map((file) => `${file.path}\0${file.contentHash}`).join("\n"));
  const git = source.kind === "git";
  return {
    sourceId: source.id,
    project: source.project,
    path: source.root,
    ref: version.ref,
    resolvedSha: git ? version.gitSha : undefined,
    contentHash,
    hashAlgorithm: "sha256",
    sourceKind: source.kind,
    sourceMode: source.kind,
    editable: !git,
    lockType: git ? "git-sha" : "content-hash",
    deterministicId: sha256(`${source.id}\0${version.id}\0${git ? version.gitSha : contentHash}`),
    files: entries,
    recordedAt: "build-time",
  };
}
