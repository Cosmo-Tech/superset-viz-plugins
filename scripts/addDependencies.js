#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * scripts/addDependencies.js
 *
 * Adds plugin dependencies to a target package.json (e.g. superset-frontend/package.json).
 *
 * Usage:
 *   node scripts/addDependencies.js <path-to-target-package.json>
 *
 * The script scans the `plugins/` directory of this monorepo, reads each plugin's
 * package.json to extract name and version, then merges them into the target
 * package.json's `dependencies` field.
 */

'use strict';

const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const pluginsDir = path.join(rootDir, 'plugins');

// ── Validate arguments ───────────────────────────────────────────────────────

const targetPackageJsonPath = process.argv[2];

if (!targetPackageJsonPath) {
  console.error('Usage: node scripts/addDependencies.js <path-to-target-package.json>');
  process.exit(1);
}

const resolvedTarget = path.resolve(targetPackageJsonPath);

if (!fs.existsSync(resolvedTarget)) {
  console.error(`Error: Target package.json not found: ${resolvedTarget}`);
  process.exit(1);
}

// ── Collect plugin dependencies ──────────────────────────────────────────────

const pluginDeps = {};

const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const pluginPkgPath = path.join(pluginsDir, entry.name, 'package.json');
  if (!fs.existsSync(pluginPkgPath)) continue;

  const pluginPkg = JSON.parse(fs.readFileSync(pluginPkgPath, 'utf8'));
  if (!pluginPkg.name || !pluginPkg.version) {
    console.warn(`  Warning: skipping ${entry.name} — missing name or version.`);
    continue;
  }

  pluginDeps[pluginPkg.name] = `^${pluginPkg.version}`;
}

if (Object.keys(pluginDeps).length === 0) {
  console.warn('Warning: no plugins found in plugins/ directory.');
  process.exit(0);
}

console.log('Plugin dependencies to add:');
for (const [name, version] of Object.entries(pluginDeps)) {
  console.log(`  ${name}: ${version}`);
}

// ── Merge into target package.json ───────────────────────────────────────────

const targetPkg = JSON.parse(fs.readFileSync(resolvedTarget, 'utf8'));
targetPkg.dependencies = { ...targetPkg.dependencies, ...pluginDeps };

fs.writeFileSync(resolvedTarget, JSON.stringify(targetPkg, null, 2) + '\n', 'utf8');

console.log(`\n✓ Updated ${resolvedTarget}`);
console.log(JSON.stringify(targetPkg, null, 2));
