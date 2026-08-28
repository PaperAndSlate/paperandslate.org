export type EvidenceSourceKind = "configured" | "evidence";

export function assertExactSourceRevision({
  currentRevision,
  candidateRevision,
  context,
  kind,
}: {
  currentRevision: string | null | undefined;
  candidateRevision: string | null | undefined;
  context: string;
  kind: EvidenceSourceKind;
}) {
  if (!currentRevision)
    throw new Error(`${context} requires a readable current Git source revision`);
  if (candidateRevision !== currentRevision) {
    if (kind === "configured")
      throw new Error(
        `${context} GIT_SHA does not match the checked-out source: expected ${currentRevision}, got ${candidateRevision ?? "missing"}`,
      );
    throw new Error(
      `${context} evidence identity does not match the current source: expected ${currentRevision}, got ${candidateRevision ?? "missing"}`,
    );
  }
}
