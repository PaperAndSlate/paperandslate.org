export type SecureRequestOptions = {
  requestProtocol?: string | null;
  nodeEnv?: string | null;
  deploymentEnv?: string | null;
  siteUrl?: string | null;
};

export function isSecureRequest({
  requestProtocol,
  nodeEnv,
  deploymentEnv,
  siteUrl,
}: SecureRequestOptions) {
  if (requestProtocol?.toLowerCase() === "https:") return true;
  if (nodeEnv !== "production") return false;
  if (!["staging", "production"].includes(deploymentEnv ?? "")) return false;

  try {
    return new URL(siteUrl ?? "").protocol === "https:";
  } catch {
    return false;
  }
}
