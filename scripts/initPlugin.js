#!/usr/bin/env node
/**
 * scripts/initPlugin.js
 *
 * Scaffolds a new cosmotech-viz plugin from plugin_template/.
 * Prompts for plugin name (kebab-case), display name, and description.
 *
 * Usage:
 *   yarn plugin:init
 *   echo -e "my-plugin\nMy Plugin\nA description" | node scripts/initPlugin.js
 */

'use strict';

const path = require('path');
const fs = require('fs');
const readline = require('readline');

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.ttf',
  '.eot',
  '.woff',
  '.woff2',
  '.pdf',
  '.zip',
]);

function isBinary(filePath) {
  return BINARY_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

/**
 * Recursively yields [absolutePath, relativePathFromRoot] for all files under dir.
 */
function* walkDir(dir, root) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(abs, root);
    } else {
      yield [abs, path.relative(root, abs)];
    }
  }
}

/**
 * Creates a prompt function backed by a single readline interface.
 * Works correctly with both interactive TTY and piped input:
 * - TTY: lines arrive one by one as the user types → resolved by pendingResolvers
 * - Pipe: lines may arrive before questions are asked → buffered in lineBuffer
 */
function createPrompter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: !!process.stdin.isTTY,
  });
  const lineBuffer = [];
  const pendingResolvers = [];

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (pendingResolvers.length > 0) {
      pendingResolvers.shift()(trimmed);
    } else {
      lineBuffer.push(trimmed);
    }
  });

  function ask(question) {
    process.stdout.write(question);
    if (lineBuffer.length > 0) {
      return Promise.resolve(lineBuffer.shift());
    }
    return new Promise((resolve) => pendingResolvers.push(resolve));
  }

  function close() {
    rl.close();
  }

  return { ask, close };
}

// ──────────────────────────────────────────────────────────────────────────────
// Release workflow matrix update
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Inserts `pluginName` into the `matrix.plugin` list of release.yml.
 * Looks for the marker comment to locate the matrix block, then appends
 * after the last existing `- <entry>` line.
 */
function addPluginToMatrix(pluginName, rootDir) {
  const workflowPath = path.join(rootDir, '.github', 'workflows', 'release.yml');
  if (!fs.existsSync(workflowPath)) {
    console.warn('  Warning: .github/workflows/release.yml not found — skipping matrix update.');
    return;
  }

  const content = fs.readFileSync(workflowPath, 'utf8');
  const lines = content.split('\n');

  // Locate the marker comment that sits just above the matrix list
  const markerIndex = lines.findIndex((l) =>
    l.includes('Add new plugin folder names here after running'),
  );
  if (markerIndex === -1) {
    console.warn('  Warning: matrix marker not found in release.yml — skipping matrix update.');
    return;
  }

  // Find the last consecutive `- <entry>` line after the marker
  let lastEntryIndex = -1;
  for (let i = markerIndex + 1; i < lines.length; i++) {
    if (/^\s+-\s+\S+/.test(lines[i])) {
      lastEntryIndex = i;
    } else if (lastEntryIndex !== -1) {
      break;
    }
  }

  if (lastEntryIndex === -1) {
    console.warn(
      '  Warning: no existing matrix entries found in release.yml — skipping matrix update.',
    );
    return;
  }

  // Guard: already present
  if (lines.some((l) => new RegExp(`^\\s+-\\s+${pluginName}\\s*$`).test(l))) {
    console.log(`  Info: "${pluginName}" already in release.yml matrix — skipping.`);
    return;
  }

  // Reuse the indentation of the last existing entry
  const indent = (lines[lastEntryIndex].match(/^(\s+)/) || ['', '          '])[1];
  lines.splice(lastEntryIndex + 1, 0, `${indent}- ${pluginName}`);

  fs.writeFileSync(workflowPath, lines.join('\n'), 'utf8');
  console.log(`  ✓ Added "${pluginName}" to release.yml publish matrix.`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  const { ask, close } = createPrompter();

  // Collect inputs
  const packageName = await ask('Plugin name (kebab-case, e.g. my-chart): ');

  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(packageName)) {
    console.error(
      `\nError: "${packageName}" is not valid kebab-case.\n` +
        'Use lowercase letters, digits, and hyphens only (e.g. my-chart or mychartname).\n',
    );
    close();
    process.exit(1);
  }

  const displayName = await ask('Display name (e.g. My Chart): ');
  const description = await ask('Description: ');
  close();

  const className = toPascalCase(packageName);

  const rootDir = path.resolve(__dirname, '..');
  const templateDir = path.join(rootDir, 'plugin_template');
  const targetDir = path.join(rootDir, 'plugins', packageName);

  if (!fs.existsSync(templateDir)) {
    console.error(`\nError: Template directory not found at ${templateDir}\n`);
    process.exit(1);
  }

  if (fs.existsSync(targetDir)) {
    console.error(
      `\nError: Plugin directory already exists: ${targetDir}\n` +
        'Choose a different name or remove the existing directory first.\n',
    );
    process.exit(1);
  }

  // Token replacement map (applied to file contents)
  const tokens = {
    '{{PACKAGE_NAME}}': packageName,
    '{{PLUGIN_CLASS_NAME}}': className,
    '{{PLUGIN_DISPLAY_NAME}}': displayName,
    '{{DESCRIPTION}}': description,
    // The dynamic import in plugin/index.ts references the placeholder file name
    "'../__PLUGIN_CLASS_NAME__'": `'../${className}'`,
  };

  // Process each file from the template
  let fileCount = 0;
  for (const [srcAbs, relPath] of walkDir(templateDir, templateDir)) {
    // Replace __PLUGIN_CLASS_NAME__ in the file path itself
    const destRelPath = relPath.replace(/__PLUGIN_CLASS_NAME__/g, className);
    const destAbs = path.join(targetDir, destRelPath);

    fs.mkdirSync(path.dirname(destAbs), { recursive: true });

    if (isBinary(srcAbs)) {
      fs.copyFileSync(srcAbs, destAbs);
    } else {
      let content = fs.readFileSync(srcAbs, 'utf8');
      for (const [token, value] of Object.entries(tokens)) {
        // Use a global string replacement (tokens are not regex-special except {})
        content = content.split(token).join(value);
      }
      fs.writeFileSync(destAbs, content, 'utf8');
    }
    fileCount++;
  }

  // Register the new plugin in the release workflow matrix
  addPluginToMatrix(packageName, rootDir);

  console.log(`
✓ Plugin scaffolded successfully!

  Package : @cosmotech/plugin-${packageName}
  Class   : ${className}Plugin
  Location: plugins/${packageName}/

Next steps:
  yarn install
  yarn workspace @cosmotech/plugin-${packageName} build
  yarn workspace @cosmotech/plugin-${packageName} test
`);
}

main().catch((err) => {
  console.error('\nUnexpected error:', err.message);
  process.exit(1);
});
