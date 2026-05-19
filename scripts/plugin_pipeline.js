#!/usr/bin/env node
/**
 * Run the full CI pipeline on a single plugin: lint, test, build, then package.
 *
 * Usage:
 *     node scripts/plugin_pipeline.js <plugin_path> [--suffix <suffix>]
 *
 * Arguments:
 *     plugin_path: Path to the plugin source folder (e.g. plugins/hello-world)
 *
 * Options:
 *     --suffix  Optional suffix appended to the output filename (e.g. "beta" → index-beta.js)
 *
 * Example:
 *     yarn plugin:pipeline plugins/hello-world
 *     yarn plugin:pipeline plugins/hello-world --suffix beta
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { packagePlugin } = require('./package_plugin.js');

const ROOT_DIR = path.join(__dirname, '..');

function getPackageName(pluginPath) {
  const pkgJson = path.join(pluginPath, 'package.json');
  if (!fs.existsSync(pkgJson)) {
    console.log(`ERROR: ${pkgJson} not found`);
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgJson, 'utf-8'));
  return pkg.name;
}

function runLernaTasks(packageName) {
  const tasks = ['lint', 'test', 'build'];
  for (const task of tasks) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  [${task}] ${packageName}`);
    console.log('='.repeat(60));
    try {
      execSync(`yarn lerna run ${task} --scope=${packageName}`, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
      });
    } catch (e) {
      console.log(`\n  ERROR: ${task} failed for ${packageName} (exit ${e.status || 1})`);
      process.exit(e.status || 1);
    }
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
  if (!fs.existsSync(pluginPath) || !fs.statSync(pluginPath).isDirectory()) {
    console.log(`ERROR: ${pluginPath} is not a directory`);
    process.exit(1);
  }

  // 1. Lint, test, build via lerna
  const packageName = getPackageName(pluginPath);
  runLernaTasks(packageName);

  // 2. Package (patch + webpack build)
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  [package] ${packageName}`);
  console.log('='.repeat(60));
  packagePlugin(pluginPath, suffix);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ✓ Pipeline complete for ${packageName}`);
  console.log('='.repeat(60));
}

if (require.main === module) {
  main();
}
