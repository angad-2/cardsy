import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let engine;

try {
  engine = require('./build/Release/engine');
} catch (err) {
  console.error('Engine not compiled. Run: npm run build-engine');
  engine = null;
}

export function add(a, b) {
  if (!engine) {
    throw new Error('Engine not loaded');
  }
  return engine.add(a, b);
}
