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

export function countCompletedVerificationTasks(receipt: {
  tasks?: readonly string[];
  completed?: readonly string[];
}): number {
  if (receipt.tasks) {
    const completed = new Set(receipt.completed ?? []);
    return receipt.tasks.filter((task) => completed.has(task)).length;
  }
  return receipt.completed?.length ?? 0;
}
