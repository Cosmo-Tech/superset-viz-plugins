#!/usr/bin/env node
/**
 * scripts/generate_thumbnail.js
 *
 * Generates (or regenerates) `src/images/thumbnail.ts` from `src/images/thumbnail.png`
 * for a given plugin. The generated file exports the image as a base64 data URL so the
 * thumbnail is embedded in the JS output without needing webpack image loaders.
 *
 * Usage:
 *     node scripts/generate_thumbnail.js <plugin_path>
 *     yarn plugin:thumbnail plugins/hello-world
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Generates thumbnail.ts from thumbnail.png in the given plugin directory.
 * Returns true if the file was generated, false if thumbnail.png was not found.
 */
function generateThumbnail(pluginPath) {
  const thumbnailPng = path.join(pluginPath, 'src', 'images', 'thumbnail.png');
  const thumbnailTs = path.join(pluginPath, 'src', 'images', 'thumbnail.ts');

  if (!fs.existsSync(thumbnailPng)) {
    console.log(`  Info: No thumbnail.png found at ${thumbnailPng} — skipping.`);
    return false;
  }

  const imgData = fs.readFileSync(thumbnailPng);
  const b64 = imgData.toString('base64');
  const tsContent = `const thumbnail = "data:image/png;base64,${b64}";\nexport default thumbnail;\n`;
  fs.writeFileSync(thumbnailTs, tsContent, 'utf8');
  console.log(`  ✓ Generated ${path.relative(process.cwd(), thumbnailTs)}`);
  return true;
}

function main() {
  if (process.argv.length < 3) {
    console.log(`Usage: ${process.argv[1]} <plugin_path>`);
    process.exit(1);
  }

  const pluginPath = path.resolve(process.argv[2]);

  if (!fs.existsSync(pluginPath)) {
    console.error(`ERROR: Plugin path not found: ${pluginPath}`);
    process.exit(1);
  }

  console.log(`[generate_thumbnail] Plugin: ${path.basename(pluginPath)}`);
  generateThumbnail(pluginPath);
}

module.exports = { generateThumbnail };

if (require.main === module) {
  main();
}
