#!/usr/bin/env node
/**
 * Build a Superset plugin using webpack.
 *
 * This script:
 *   1. Ensures build-dist script exists in package.json
 *   2. Runs npm install (if node_modules missing or key deps absent)
 *   3. Runs webpack build via webpack-cli
 *   4. Outputs versioned bundle to <plugins-dir>/versions/<plugin-name>/<version>/index[-suffix].js
 *   5. Reports bundle size
 *
 * Usage:
 *     node scripts/build_plugin.js <plugin_path> [--suffix <suffix>]
 *
 * Arguments:
 *     plugin_path: Path to the plugin source folder (must contain package.json and webpack.config.js)
 *
 * Options:
 *     --suffix  Optional suffix appended to the output filename (e.g. "beta" → index-beta.js)
 *               If omitted, produces index.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REQUIRED_DEPS = {
  webpack: '^5',
  'webpack-cli': '^5',
  'terser-webpack-plugin': '^5',
  'ts-loader': '^9',
  'babel-loader': '^9',
  '@babel/core': '^7',
  '@babel/preset-env': '^7',
  '@babel/preset-react': '^7',
  '@babel/preset-typescript': '^7',
  'css-loader': '^6',
  'style-loader': '^3',
};

function run(cmd, cwd) {
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
  } catch (e) {
    process.exit(e.status || 1);
  }
}

function buildPlugin(pluginPath, suffix = '') {
  const pkgPath = path.join(pluginPath, 'package.json');
  const nodeModules = path.join(pluginPath, 'node_modules');

  // Read package.json and extract version
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const version = pkg.version || '0.0.0';
  const pluginName = path.basename(pluginPath);
  const pluginsDir = path.dirname(pluginPath);
  const outputFilename = suffix ? `index-${suffix}.js` : 'index.js';
  const outputDir = path.join(pluginsDir, 'versions', pluginName, version);

  fs.mkdirSync(outputDir, { recursive: true });

  // Ensure build-dist script exists in package.json
  if (!pkg.scripts) pkg.scripts = {};
  const webpackCmd = 'webpack-cli --config webpack.config.js';
  if (!pkg.scripts['build-dist'] || pkg.scripts['build-dist'] === 'webpack') {
    pkg.scripts['build-dist'] = webpackCmd;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    console.log('  Updated build-dist script in package.json');
  }

  // Check if npm install is needed
  let needInstall = !fs.existsSync(nodeModules);
  if (!needInstall) {
    for (const dep of Object.keys(REQUIRED_DEPS)) {
      if (!fs.existsSync(path.join(nodeModules, dep))) {
        needInstall = true;
        break;
      }
    }
  }

  if (needInstall) {
    console.log('  npm install...');
    run('npm install --legacy-peer-deps', pluginPath);
  }

  // Install required build deps that are still missing
  const missingDeps = Object.entries(REQUIRED_DEPS)
    .filter(([dep]) => !fs.existsSync(path.join(nodeModules, dep)))
    .map(([dep, ver]) => `${dep}@${ver}`);

  if (missingDeps.length > 0) {
    console.log(`  Installing build dependencies: ${missingDeps.join(', ')}...`);
    run(`npm install --save-dev --legacy-peer-deps ${missingDeps.join(' ')}`, pluginPath);
  }

  // Run webpack build with output overrides
  const relOutput = `versions/${pluginName}/${version}/${outputFilename}`;
  console.log(`  webpack build → ${relOutput}...`);
  run(
    `npx webpack-cli --config webpack.config.js --output-path "${outputDir}" --output-filename "${outputFilename}"`,
    pluginPath,
  );

  // Verify output
  const bundlePath = path.join(outputDir, outputFilename);
  if (!fs.existsSync(bundlePath)) {
    console.log(`ERROR: ${relOutput} not found after build`);
    process.exit(1);
  }

  const sizeKb = fs.statSync(bundlePath).size / 1024;
  console.log(`  OK - ${relOutput} (${sizeKb.toFixed(1)} KB)`);
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

  if (!fs.existsSync(path.join(pluginPath, 'webpack.config.js'))) {
    console.log(`ERROR: ${path.join(pluginPath, 'webpack.config.js')} not found`);
    process.exit(1);
  }

  console.log(`[build_plugin] Building plugin in ${pluginPath}...`);
  buildPlugin(pluginPath, suffix);
}

module.exports = { buildPlugin };

if (require.main === module) {
  main();
}
