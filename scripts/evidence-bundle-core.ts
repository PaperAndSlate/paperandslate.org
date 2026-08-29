import { sourceRevisionMatchesCurrent } from "./source-state";

export function isEvidenceIdentityCurrent(options: {
  value: string;
  candidateSha: string;
  sourceSha: string | null;
  root: string;
}): boolean {
  return (
    options.value === options.candidateSha ||
    (options.candidateSha === options.sourceSha &&
      options.sourceSha !== null &&
      sourceRevisionMatchesCurrent(options.root, options.value, options.sourceSha))
  );
}
