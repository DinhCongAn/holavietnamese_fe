import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve as resolvePath } from 'node:path';

const root = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolvePath(root, 'src');

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith('@/')) return nextResolve(specifier, context);

  const target = resolvePath(sourceRoot, specifier.slice(2));
  const candidate = [target, `${target}.js`, `${target}.jsx`, `${target}.ts`, `${target}.tsx`]
    .find(path => existsSync(path));
  if (!candidate) return nextResolve(pathToFileURL(target).href, context);
  return { url: pathToFileURL(candidate).href, shortCircuit: true };
}
