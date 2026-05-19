#!/usr/bin/env node
/**
 * Package all plugins for Superset deployment.
 *
 * This script discovers all plugin folders under plugins/ and runs the following
 * steps on each one, in order:
 *   1. patch_webpack.js  — inject the webpack.config.js for ESM + externals
 *   2. patch_index_ts.js — add auto-registration (.configure/.register)
 *   3. build_plugin.js   — webpack build → <plugins-dir>/versions/<name>/<version>/index[-suffix].js
 *
 * Usage:
 *     node scripts/package_plugins.js [--plugins-dir <path>] [--suffix <suffix>]
 *
 * Options:
 *     --plugins-dir  Path to the plugins directory (default: ../plugins relative to this script)
 *     --suffix       Optional suffix for the output filename (e.g. "beta" → index-beta.js)
 */

const fs = require('fs');
const path = require('path');
const { packagePlugin } = require('./package_plugin.js');

const SCRIPT_DIR = __dirname;
const DEFAULT_PLUGINS_DIR = path.join(SCRIPT_DIR, '..', 'plugins');

// Folders inside plugins/ that are not actual plugins
const IGNORE_DIRS = new Set(['node_modules', '__pycache__', '.git', 'versions']);

function discoverPlugins(pluginsDir) {
  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  const plugins = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || IGNORE_DIRS.has(entry.name)) continue;

    const childPath = path.join(pluginsDir, entry.name);
    if (
      fs.existsSync(path.join(childPath, 'package.json')) &&
      fs.existsSync(path.join(childPath, 'src', 'index.ts'))
    ) {
      plugins.push(childPath);
    }
  }

  return plugins;
}

function main() {
  let pluginsDir = path.resolve(DEFAULT_PLUGINS_DIR);
  let suffix = '';

  const args = process.argv.slice(2);

  const pluginsDirIdx = args.indexOf('--plugins-dir');
  if (pluginsDirIdx !== -1) {
    if (pluginsDirIdx + 1 >= args.length) {
      console.log('ERROR: --plugins-dir requires a path argument');
      process.exit(1);
    }
    pluginsDir = path.resolve(args[pluginsDirIdx + 1]);
  }

  const suffixIdx = args.indexOf('--suffix');
  if (suffixIdx !== -1) {
    if (suffixIdx + 1 >= args.length) {
      console.log('ERROR: --suffix requires a value');
      process.exit(1);
    }
    suffix = args[suffixIdx + 1];
  }

  if (!fs.existsSync(pluginsDir) || !fs.statSync(pluginsDir).isDirectory()) {
    console.log(`ERROR: plugins directory not found: ${pluginsDir}`);
    process.exit(1);
  }

  const plugins = discoverPlugins(pluginsDir);
  if (plugins.length === 0) {
    console.log(`No plugins found in ${pluginsDir}`);
    process.exit(1);
  }

  console.log(`[package_plugins] Found ${plugins.length} plugin(s) in ${pluginsDir}:`);
  for (const p of plugins) {
    console.log(`  - ${path.basename(p)}`);
  }
  if (suffix) {
    console.log(`  suffix: ${suffix}`);
  }

  for (const pluginPath of plugins) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Packaging: ${path.basename(pluginPath)}`);
    console.log('='.repeat(60));
    packagePlugin(pluginPath, suffix);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`All ${plugins.length} plugin(s) packaged successfully.`);
  console.log('='.repeat(60));
}

if (require.main === module) {
  main();
}
