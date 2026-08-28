import fs from "node:fs";
import path from "node:path";

export type LicensePolicyInput = {
  rootFiles: Record<string, string | undefined>;
  packages: Array<{ path: string; name?: unknown; private?: unknown; license?: unknown }>;
};

export function validateLicensePolicy(input: LicensePolicyInput) {
  const errors: string[] = [];
  const codeLicense = input.rootFiles["LICENSE"] ?? "";
  const docsLicense = input.rootFiles["LICENSE-DOCS.md"] ?? "";
  const notice = input.rootFiles["NOTICE"] ?? "";
  const trademarks = input.rootFiles["TRADEMARKS.md"] ?? "";

  if (!codeLicense.includes("Apache License") || !codeLicense.includes("Version 2.0"))
    errors.push("LICENSE must identify Apache License 2.0");
  if (!docsLicense.includes("CC BY 4.0")) errors.push("LICENSE-DOCS.md must identify CC BY 4.0");
  if (!notice.includes("Paper & Slate")) errors.push("NOTICE must identify Paper & Slate");
  if (!trademarks.includes("reserved"))
    errors.push("TRADEMARKS.md must preserve reserved-mark wording");

  for (const pkg of input.packages) {
    if (pkg.private !== true)
      errors.push(`${pkg.path} must remain private until publication is authorized`);
    if (pkg.license !== "Apache-2.0") errors.push(`${pkg.path} must declare license Apache-2.0`);
  }
  return errors;
}

function main() {
  const root = process.cwd();
  const read = (file: string) => {
    const absolute = path.join(root, file);
    return fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : undefined;
  };
  const packagesRoot = path.join(root, "packages");
  const packages = fs
    .readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const relative = `packages/${entry.name}/package.json`;
      const file = path.join(root, relative);
      if (!fs.existsSync(file)) return { path: relative };
      return { path: relative, ...JSON.parse(fs.readFileSync(file, "utf8")) };
    });
  const errors = validateLicensePolicy({
    rootFiles: {
      LICENSE: read("LICENSE"),
      "LICENSE-DOCS.md": read("LICENSE-DOCS.md"),
      NOTICE: read("NOTICE"),
      "TRADEMARKS.md": read("TRADEMARKS.md"),
    },
    packages,
  });
  if (errors.length > 0) throw new Error(`License policy failed:\n- ${errors.join("\n- ")}`);
  console.log(`License and notice policy passed for ${packages.length} private packages.`);
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/license-check.ts")) main();
