import fs from "node:fs";
import path from "node:path";

function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}

function assertContainedEntry(file: string, root: string, label: string): fs.Stats {
  const entry = fs.lstatSync(file);
  if (entry.isSymbolicLink()) throw new Error(`Refusing symlink in ${label}: ${file}`);
  const realRoot = fs.realpathSync(root);
  const realFile = fs.realpathSync(file);
  if (!isWithin(realRoot, realFile)) throw new Error(`Path escapes ${label}: ${file}`);
  if (!entry.isDirectory() && !entry.isFile())
    throw new Error(`Unsupported filesystem entry in ${label}: ${file}`);
  return entry;
}

export function copyEvidenceTree(
  source: string,
  destination: string,
  repositoryRoot: string,
  bundleRoot: string,
): void {
  const repository = fs.realpathSync(repositoryRoot);
  const bundle = path.resolve(bundleRoot);
  const visit = (from: string, to: string) => {
    const entry = assertContainedEntry(from, repository, "evidence source");
    const resolvedDestination = path.resolve(to);
    if (!isWithin(bundle, resolvedDestination))
      throw new Error(`Refusing to write evidence outside ${bundleRoot}: ${to}`);
    if (entry.isDirectory()) {
      fs.mkdirSync(resolvedDestination, { recursive: true });
      for (const child of fs.readdirSync(from))
        visit(path.join(from, child), path.join(resolvedDestination, child));
      return;
    }
    fs.mkdirSync(path.dirname(resolvedDestination), { recursive: true });
    fs.copyFileSync(from, resolvedDestination);
  };
  visit(source, destination);
}

export function assertSafeEvidenceTreeEntry(file: string, bundleRoot: string): fs.Stats {
  return assertContainedEntry(file, bundleRoot, "evidence bundle");
}
