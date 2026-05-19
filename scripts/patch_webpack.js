#!/usr/bin/env node
/**
 * Override webpack.config.js in a plugin source folder for Superset 6.x dynamic loading.
 *
 * This script:
 *   1. Backs up the original webpack.config.js (if not already backed up)
 *   2. Copies the project's webpack.config.js into the plugin folder
 *
 * Usage:
 *     node scripts/patch_webpack.js <plugin_path>
 *
 * Arguments:
 *     plugin_path: Path to the plugin source folder (must contain package.json and src/index.ts)
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const WEBPACK_CONFIG_SOURCE = path.join(SCRIPT_DIR, 'webpack.config.js');

function patchWebpack(pluginPath) {
  const target = path.join(pluginPath, 'webpack.config.js');
  const backup = path.join(pluginPath, 'webpack.config.js.original');

  // Backup original if not already done
  if (!fs.existsSync(backup) && fs.existsSync(target)) {
    fs.copyFileSync(target, backup);
    console.log(`  Backed up original -> ${backup}`);
  }

  // Copy our webpack.config.js into the plugin folder
  fs.copyFileSync(WEBPACK_CONFIG_SOURCE, target);
  console.log(`  OK - webpack.config.js written to ${target}`);
}

function main() {
  if (process.argv.length < 3) {
    console.log(`Usage: ${process.argv[1]} <plugin_path>`);
    process.exit(1);
  }

  const pluginPath = path.resolve(process.argv[2]);

  if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
    console.log(`ERROR: ${path.join(pluginPath, 'package.json')} not found`);
    process.exit(1);
  }

  if (!fs.existsSync(path.join(pluginPath, 'src', 'index.ts'))) {
    console.log(`ERROR: ${path.join(pluginPath, 'src', 'index.ts')} not found`);
    process.exit(1);
  }

  console.log('[patch_webpack] Patching webpack.config.js for ESM + __superset__ externals...');
  patchWebpack(pluginPath);
}

module.exports = { patchWebpack };

if (require.main === module) {
  main();
}
