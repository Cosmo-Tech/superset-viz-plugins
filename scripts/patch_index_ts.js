#!/usr/bin/env node
/**
 * Patch src/index.ts in a plugin source folder to auto-register with .configure({ key }).register().
 *
 * This script:
 *   1. Reads the plugin key from package.json
 *   2. Checks if src/index.ts is already patched
 *   3. Detects the plugin class export
 *   4. Appends auto-registration code
 *
 * Usage:
 *     node scripts/patch_index_ts.js <plugin_path>
 *
 * Arguments:
 *     plugin_path: Path to the plugin source folder (must contain package.json and src/index.ts)
 */

const fs = require('fs');
const path = require('path');

function getPluginKey(pluginPath) {
  const pkgJson = path.join(pluginPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgJson, 'utf-8'));
  return pkg.name;
}

function patchIndexTs(pluginPath, pluginKey) {
  const indexTs = path.join(pluginPath, 'src', 'index.ts');
  let content = fs.readFileSync(indexTs, 'utf-8');

  // Check if already patched
  if (content.includes('.configure(')) {
    console.log('  Already patched (configure found)');
    return;
  }

  // Try to find: export { default as PluginName } from './plugin'
  let match = content.match(/export\s*\{\s*default\s+as\s+(\w+)\s*\}/);
  if (!match) {
    // Try: export default PluginName
    match = content.match(/export\s+default\s+(\w+)/);
  }

  if (match) {
    const className = match[1];
    console.log(`  Found plugin class: ${className}`);

    const autoRegister = [
      '',
      '// --- Auto-register for Superset 6.x dynamic plugin loading ---',
      "import __PluginClass__ from './plugin';",
      'const __plugin__ = new __PluginClass__();',
      `__plugin__.configure({ key: '${pluginKey}' }).register();`,
      '',
    ].join('\n');

    content = content.trimEnd() + '\n' + autoRegister;
    fs.writeFileSync(indexTs, content, 'utf-8');
    console.log(`  OK - added .configure({ key: '${pluginKey}' }).register()`);
  } else {
    console.log('  WARNING: Could not find plugin export in src/index.ts');
    console.log(
      `  You may need to manually add: new YourPlugin().configure({ key: '${pluginKey}' }).register()`,
    );
  }
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

  const pluginKey = getPluginKey(pluginPath);
  console.log(`[patch_index_ts] Patching src/index.ts for plugin: ${pluginKey}`);
  patchIndexTs(pluginPath, pluginKey);
}

module.exports = { patchIndexTs, getPluginKey };

if (require.main === module) {
  main();
}
