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
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.ttf', '.eot', '.woff', '.woff2',
  '.pdf', '.zip',
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
 * Reads all of stdin and returns an array of non-empty trimmed lines.
 */
async function readStdinLines() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks)
    .toString('utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);
}

/**
 * Prompts the user interactively (TTY) or reads from pre-collected stdin lines.
 */
async function prompt(question, lines, index) {
  if (lines !== null) {
    const answer = lines[index] || '';
    process.stdout.write(`${question}${answer}\n`);
    return answer;
  }
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
    process.stdout.write(question);
    rl.once('line', line => { rl.close(); resolve(line.trim()); });
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  // If stdin is a pipe, read all lines up-front so readline doesn't miss them
  const isTTY = process.stdin.isTTY;
  const lines = isTTY ? null : await readStdinLines();

  // Collect inputs
  const packageName = await prompt('Plugin name (kebab-case, e.g. my-chart): ', lines, 0);

  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(packageName)) {
    console.error(
      `\nError: "${packageName}" is not valid kebab-case.\n` +
      'Use lowercase letters, digits, and hyphens only (e.g. my-chart).\n'
    );
    process.exit(1);
  }

  const displayName = await prompt('Display name (e.g. My Chart): ', lines, 1);
  const description = await prompt('Description: ', lines, 2);

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
      'Choose a different name or remove the existing directory first.\n'
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

  console.log(`
✓ Plugin scaffolded successfully!

  Package : @cosmotech-viz/plugin-${packageName}
  Class   : ${className}Plugin
  Location: plugins/${packageName}/

Next steps:
  yarn install
  yarn workspace @cosmotech-viz/plugin-${packageName} build
  yarn workspace @cosmotech-viz/plugin-${packageName} test
`);
}

main().catch(err => {
  console.error('\nUnexpected error:', err.message);
  process.exit(1);
});
