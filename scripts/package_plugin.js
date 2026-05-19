#!/usr/bin/env node
/**
 * Package a single plugin for Superset deployment.
 *
 * This script runs the full packaging pipeline on a single plugin:
 *   1. patch_webpack.js  — inject the webpack.config.js for ESM + externals
 *   2. patch_index_ts.js — add auto-registration (.configure/.register)
 *   3. build_plugin.js   — webpack build → <plugins-dir>/versions/<name>/<version>/index[-suffix].js
 *
 * Usage:
 *     node scripts/package_plugin.js <plugin_path> [--suffix <suffix>]
 *
 * Arguments:
 *     plugin_path: Path to the plugin source folder (must contain package.json and src/index.ts)
 *
 * Options:
 *     --suffix  Optional suffix appended to the output filename (e.g. "beta" → index-beta.js)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_DIR = __dirname;

function runStep(description, cmd, cwd) {
  console.log(`\n  [${description}] ${cmd}`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
  } catch (e) {
    console.log(`  ERROR: ${description} failed (exit ${e.status || 1})`);
    process.exit(e.status || 1);
  }
}

function packagePlugin(pluginPath, suffix = '') {
  const { generateThumbnail } = require('./generate_thumbnail');
  const patchWebpack = path.join(SCRIPT_DIR, 'patch_webpack.js');
  const patchIndexTs = path.join(SCRIPT_DIR, 'patch_index_ts.js');
  const buildPlugin = path.join(SCRIPT_DIR, 'build_plugin.js');

  // Regenerate thumbnail.ts in case thumbnail.png was modified
  generateThumbnail(pluginPath);

  // Backup src/index.ts before patching (patch is deploy-time only, must not persist)
  const indexTsPath = path.join(pluginPath, 'src', 'index.ts');
  const indexTsBackup = indexTsPath + '.bak';
  fs.copyFileSync(indexTsPath, indexTsBackup);

  runStep('patch_webpack', `node "${patchWebpack}" "${pluginPath}"`, pluginPath);
  runStep('patch_index_ts', `node "${patchIndexTs}" "${pluginPath}"`, pluginPath);

  const buildCmd = suffix
    ? `node "${buildPlugin}" "${pluginPath}" --suffix "${suffix}"`
    : `node "${buildPlugin}" "${pluginPath}"`;

  try {
    runStep('build_plugin', buildCmd, pluginPath);
  } finally {
    // Always restore src/index.ts to its original state
    fs.copyFileSync(indexTsBackup, indexTsPath);
    fs.unlinkSync(indexTsBackup);
  }
}

function parseArgs(args) {
  let suffix = '';
  let pluginPathStr = null;

  let i = 0;
  while (i < args.length) {
    if (args[i] === '--suffix') {
      if (i + 1 >= args.length) {
        console.log('ERROR: --suffix requires a value');
        process.exit(1);
      }
      suffix = args[i + 1];
      i += 2;
    } else if (pluginPathStr === null) {
      pluginPathStr = args[i];
      i += 1;
    } else {
      console.log(`ERROR: unexpected argument: ${args[i]}`);
      process.exit(1);
    }
  }

  return { pluginPathStr, suffix };
}

function main() {
  if (process.argv.length < 3) {
    console.log(`Usage: ${process.argv[1]} <plugin_path> [--suffix <suffix>]`);
    process.exit(1);
  }

  const { pluginPathStr, suffix } = parseArgs(process.argv.slice(2));

  if (!pluginPathStr) {
    console.log(`Usage: ${process.argv[1]} <plugin_path> [--suffix <suffix>]`);
    process.exit(1);
  }

  const pluginPath = path.resolve(pluginPathStr);

  if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
    console.log(`ERROR: ${path.join(pluginPath, 'package.json')} not found`);
    process.exit(1);
  }

  if (!fs.existsSync(path.join(pluginPath, 'src', 'index.ts'))) {
    console.log(`ERROR: ${path.join(pluginPath, 'src', 'index.ts')} not found`);
    process.exit(1);
  }

  console.log(`[package_plugin] Packaging plugin: ${path.basename(pluginPath)}`);
  packagePlugin(pluginPath, suffix);
  console.log(`\n  Plugin ${path.basename(pluginPath)} packaged successfully.`);
}

module.exports = { packagePlugin };

if (require.main === module) {
  main();
}
