import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { assertSafeAsset } from "./safety";
export function collectAssets(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  const assets: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${file}`);
      if (entry.isDirectory()) walk(file);
      else if (/\.(svg|html|js|ts)$/i.test(file))
        throw new Error(`Unsupported source asset: ${file}`);
      else if (/\.(png|jpe?g|gif|webp|avif)$/i.test(file)) {
        assertSafeAsset(file);
        assets.push(path.relative(root, file).replace(/\\/g, "/"));
      }
    }
  };
  walk(root);
  return assets.sort();
}
export function copyAssets(
  root: string,
  outputRoot: string,
): { path: string; source: string; contentHash: string }[] {
  const files = collectAssets(root);
  return files.map((relative) => {
    const source = path.join(root, relative);
    const destination = path.join(outputRoot, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    return {
      path: relative,
      source: root.replace(/\\/g, "/"),
      contentHash: crypto.createHash("sha256").update(fs.readFileSync(source)).digest("hex"),
    };
  });
}
