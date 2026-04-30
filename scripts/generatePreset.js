#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * scripts/generatePreset.js
 *
 * Injects plugin imports and instantiations into an existing MainPreset.js file
 * (e.g. superset-frontend/src/visualizations/presets/MainPreset.js).
 *
 * Usage:
 *   node scripts/generatePreset.js <path-to-MainPreset.js>
 *
 * The script scans the `plugins/` directory of this monorepo:
 * - Reads each plugin's package.json for the `name` field
 * - Reads each plugin's src/plugin/index.ts to extract the default export class name
 * - Adds `import <ClassName> from '<package-name>';` before the MainPreset class declaration
 * - Adds `new <ClassName>().configure({ key: '<class-name-in-kebab-case>' }),` in the super() plugins array
 */

'use strict';

const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const pluginsDir = path.join(rootDir, 'plugins');

// ── Validate arguments ───────────────────────────────────────────────────────

const targetPresetPath = process.argv[2];

if (!targetPresetPath) {
  console.error('Usage: node scripts/generatePreset.js <path-to-MainPreset.js>');
  process.exit(1);
}

const resolvedTarget = path.resolve(targetPresetPath);

if (!fs.existsSync(resolvedTarget)) {
  console.error(`Error: MainPreset.js not found: ${resolvedTarget}`);
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Extracts the default export class name from a TypeScript file.
 * Looks for: export default class <ClassName>
 */
function extractDefaultClassName(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/export\s+default\s+class\s+(\w+)/);
  return match ? match[1] : null;
}

// ── Collect plugin info ──────────────────────────────────────────────────────

const plugins = [];

const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const pluginPkgPath = path.join(pluginsDir, entry.name, 'package.json');
  if (!fs.existsSync(pluginPkgPath)) continue;

  const pluginPkg = JSON.parse(fs.readFileSync(pluginPkgPath, 'utf8'));
  if (!pluginPkg.name) {
    console.warn(`  Warning: skipping ${entry.name} — missing name.`);
    continue;
  }

  const pluginIndexPath = path.join(pluginsDir, entry.name, 'src', 'plugin', 'index.ts');
  const className = extractDefaultClassName(pluginIndexPath);
  if (!className) {
    console.warn(`  Warning: skipping ${entry.name} — cannot find default export class.`);
    continue;
  }

  plugins.push({ name: pluginPkg.name, className });
}

if (plugins.length === 0) {
  console.warn('Warning: no plugins found in plugins/ directory.');
  process.exit(0);
}

console.log('Plugins to inject:');
for (const p of plugins) {
  console.log(`  ${p.className} from '${p.name}' (key: '${toKebabCase(p.className)}')`);
}

// ── Modify MainPreset.js ─────────────────────────────────────────────────────

let content = fs.readFileSync(resolvedTarget, 'utf8');

// 1. Add import lines just before `export default class`
const importLines = plugins.map((p) => `import { ${p.className} } from '${p.name}';`).join('\n');

const exportClassMatch = content.match(/^(export\s+default\s+class\s+)/m);
if (!exportClassMatch) {
  console.error('Error: could not find "export default class" in the target file.');
  process.exit(1);
}

content = content.replace(exportClassMatch[0], importLines + '\n\n' + exportClassMatch[0]);

// 2. Add plugin instantiations in the super() plugins array, before spread operators or closing bracket
const instantiationLines = plugins
  .map((p) => `        new ${p.className}().configure({ key: '${toKebabCase(p.className)}' }),`)
  .join('\n');

// Find `...experimentalPlugins` and insert before it
const spreadMatch = content.match(/^(\s*\.\.\.experimentalPlugins)/m);
if (spreadMatch) {
  content = content.replace(spreadMatch[0], instantiationLines + '\n' + spreadMatch[0]);
} else {
  // Fallback: insert before the closing `],` of the plugins array
  const closingMatch = content.match(/^(\s*\],\s*)$/m);
  if (closingMatch) {
    content = content.replace(closingMatch[0], instantiationLines + '\n' + closingMatch[0]);
  } else {
    console.error('Error: could not find insertion point for plugin instantiations.');
    process.exit(1);
  }
}

fs.writeFileSync(resolvedTarget, content, 'utf8');

console.log(`\n✓ Updated ${resolvedTarget}`);
