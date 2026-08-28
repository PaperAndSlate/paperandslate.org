export type CycloneDxHash = {
  alg: "SHA-512";
  content: string;
};

/** Convert an npm sha512 SRI value to CycloneDX's hexadecimal hash form. */
export function integrityToCycloneDxHash(integrity: string): CycloneDxHash {
  const match = /^sha512-([A-Za-z0-9+/]+={0,2})$/.exec(integrity);
  if (!match) throw new Error(`Unsupported or malformed package integrity: ${integrity}`);

  const encoded = match[1];
  const decoded = Buffer.from(encoded, "base64");
  const canonicalBase64 = decoded.toString("base64").replace(/=+$/, "");
  if (decoded.length !== 64 || canonicalBase64 !== encoded.replace(/=+$/, ""))
    throw new Error(`Invalid SHA-512 package integrity: ${integrity}`);

  return { alg: "SHA-512", content: decoded.toString("hex") };
}
