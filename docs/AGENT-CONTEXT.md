# Agent context — superset-viz-plugins

## Repository overview

Lerna v9 monorepo of custom Apache Superset visualization plugins. Each plugin is an independent
npm package (TypeScript + React 19) published under the `@cosmotech/` scope.

- **Runtime**: Node >= 18, Yarn 1.22 (classic workspaces)
- **Package manager**: yarn — `workspaces: ["plugins/*"]`
- **Lerna versioning**: `independent` (each package has its own semver)
- **Language**: TypeScript 5.1.6 (installed from `~5.1.6`), React 19, recharts 2.x
- **Superset SDK**: `@superset-ui/core@0.20.4`, `@superset-ui/chart-controls@0.20.3`
- **CRITICAL**: `@superset-ui` versions `2.x` are broken on npm (published without build artifacts — no `lib/`, no `.d.ts`). Always use `0.20.x`.

---

## Repository structure

```
superset-viz-plugins/
├── plugins/                          ← One subfolder = one independent plugin npm package
│   └── <plugin-name>/
│       ├── package.json              ← Must include "pluginName" field (used by CI scripts)
│       ├── tsconfig.json             ← extends ../../tsconfig.json, emitDeclarationOnly: true
│       ├── tsconfig.esm.json         ← extends ../../tsconfig.json, outDir: esm, module: ESNext
│       ├── babel.config.js           ← Mirrors root babel.config.js (preset-env CJS)
│       ├── jest.config.js            ← Local Jest config with @superset-ui mocks
│       ├── src/
│       │   ├── index.ts              ← Re-exports the Plugin class from plugin/
│       │   ├── types.ts              ← FormData and Props interfaces
│       │   ├── <ClassName>.tsx       ← React component (the chart renderer)
│       │   ├── images/
│       │   └── plugin/
│       │       ├── index.ts          ← Class extending ChartPlugin (loadChart dynamic import)
│       │       ├── buildQuery.ts     ← buildQuery function
│       │       ├── transformProps.ts ← transformProps function
│       │       └── controlPanel.ts   ← controlPanel object
│       ├── test/
│       │   ├── index.test.ts         ← Plugin registration test
│       │   ├── plugin/               ← Tests for buildQuery, transformProps
│       │   └── __mocks__/
│       │       ├── superset-ui-core.js        ← Manual mock for @superset-ui/core
│       │       ├── superset-ui-chart-controls.js ← Manual mock for @superset-ui/chart-controls
│       │       └── mockExportString.js        ← Static asset stub
│       └── types/
│           └── external.d.ts         ← Ambient declarations for untyped imports
├── plugin_template/                  ← Source of truth for `yarn plugin:init`
│   ├── src/
│   │   ├── __PLUGIN_CLASS_NAME__.tsx  ← Renamed to <ClassName>.tsx at generation time
│   │   ├── index.ts                  ← Token: {{PLUGIN_CLASS_NAME}}
│   │   ├── types.ts                  ← Tokens: {{PLUGIN_CLASS_NAME}}
│   │   ├── images/
│   │   │   ├── thumbnail.png         ← Source image
│   │   │   └── thumbnail.ts          ← Base64 data URL (generated from PNG)
│   │   └── plugin/
│   ├── test/                         ← Same structure as plugins/<name>/test/
│   ├── types/external.d.ts
│   ├── package.json                  ← Tokens: {{PACKAGE_NAME}}, {{PLUGIN_CLASS_NAME}}, {{DESCRIPTION}}
│   ├── tsconfig.json                 ← Identical to plugin tsconfig pattern
│   ├── tsconfig.esm.json
│   ├── babel.config.js
│   ├── jest.config.js                ← Token: {{PACKAGE_NAME}}
│   ├── .gitignore
│   └── README.md                     ← Tokens: {{PACKAGE_NAME}}, {{PLUGIN_CLASS_NAME}}, {{DESCRIPTION}}
├── scripts/
│   ├── initPlugin.js                ← `yarn plugin:init` — scaffolds from plugin_template/
│   ├── plugin_pipeline.js           ← Full pipeline on one plugin (lint+test+build+package)
│   ├── package_plugins.js           ← Orchestrates webpack packaging for all plugins
│   ├── package_plugin.js            ← Packages a single plugin (patch + build)
│   ├── generate_thumbnail.js        ← Generates thumbnail.ts from thumbnail.png (base64 data URL)
│   ├── patch_webpack.js             ← Injects webpack.config.js for ESM + externals
│   ├── patch_index_ts.js            ← Adds auto-registration to src/index.ts
│   ├── build_plugin.js              ← Webpack build for a single plugin → versions/<name>/<v>/index.js
│   └── webpack.config.js            ← Webpack config template copied into plugins by patch_webpack
├── .github/
│   └── workflows/
│       └── ci.yml                    ← Build + Lint + Format check + Test on every push/PR
├── docs/
│   ├── PROJECT-OVERVIEW.md          ← High-level project overview (French)
│   ├── DEVELOPER-JOURNEY.md         ← Developer onboarding guide (French)
│   ├── USER-GUIDE.md                ← End-user guide (French)
│   └── AGENT-CONTEXT.md             ← This file
├── babel.config.js                   ← Babel: preset-env (node current) + preset-react + preset-typescript
├── jest.config.js                    ← Root Jest: projects glob on plugins/*
├── lerna.json                        ← Lerna v9, independent, npmClient: yarn, conventionalCommits
├── package.json                      ← Root: private, workspaces, scripts, all devDependencies
├── tsconfig.json                     ← Shared: target ES2020, jsx react-jsx, strict, esModuleInterop
├── .eslintrc.json                    ← @typescript-eslint + eslint-plugin-react + react-hooks
└── .prettierrc                       ← singleQuote, trailingComma all, printWidth 100, semi
```

---

## Available scripts (root)

| Script                  | Command                              | Purpose                                               |
| ----------------------- | ------------------------------------ | ----------------------------------------------------- |
| `yarn plugin:init`      | `node scripts/initPlugin.js`         | Scaffold a new plugin from `plugin_template/`         |
| `yarn plugin:pipeline`  | `node scripts/plugin_pipeline.js`    | Full pipeline on one plugin (lint+test+build+package) |
| `yarn plugin:package`   | `node scripts/package_plugin.js`     | Package a single plugin (patch + webpack build)       |
| `yarn plugins:package`  | `node scripts/package_plugins.js`    | Package all plugins (discover + patch + build)        |
| `yarn plugin:thumbnail` | `node scripts/generate_thumbnail.js` | Regenerate `thumbnail.ts` from `thumbnail.png`        |
| `yarn build`            | `lerna run build`                    | Production build (CJS + ESM) for all packages         |
| `yarn build:dev`        | `lerna run build:dev`                | Watch mode via `tsc --watch`                          |
| `yarn test`             | `lerna run test`                     | Jest across all packages                              |
| `yarn test:watch`       | `lerna run test:watch`               | Jest watch mode                                       |
| `yarn lint`             | `lerna run lint`                     | ESLint on all `src/` directories                      |
| `yarn lint:root`        | `eslint . --ext .ts,.tsx,.js`        | ESLint on root-level files (scripts, config)          |
| `yarn format`           | `prettier --write`                   | Auto-format all `.ts/.tsx/.js/.json/.md` files        |
| `yarn format:check`     | `prettier --check`                   | CI formatting check (fails if unformatted)            |
| `yarn clean`            | `lerna run clean`                    | Delete `dist/`, `esm/`, `coverage/` in all packages   |

---

## Plugin scaffolding — `yarn plugin:init`

`scripts/initPlugin.js` scaffolds a new plugin by copying `plugin_template/` and replacing tokens.

### Invocation

```bash
yarn plugin:init
# or non-interactively:
printf 'my-chart\nMy Chart\nA description\n' | yarn plugin:init
```

### Token map

| Token                     | Value                        | Example         |
| ------------------------- | ---------------------------- | --------------- |
| `{{PACKAGE_NAME}}`        | kebab-case plugin name       | `my-chart`      |
| `{{PLUGIN_CLASS_NAME}}`   | PascalCase derived from name | `MyChart`       |
| `{{PLUGIN_DISPLAY_NAME}}` | Human-readable name          | `My Chart`      |
| `{{DESCRIPTION}}`         | Short description            | `A description` |

Tokens are replaced in **all text files**. The placeholder filename `__PLUGIN_CLASS_NAME__.tsx`
is also renamed to `<ClassName>.tsx`.

### What the script generates

- Full `src/` tree: component, types, index, plugin/{index,buildQuery,controlPanel,transformProps}
- Full `test/` tree with 3 suites and 3 `__mocks__/` files
- All config files: `package.json`, `tsconfig.json`, `tsconfig.esm.json`, `babel.config.js`, `jest.config.js`, `.gitignore`, `README.md`
- Thumbnail: `src/images/thumbnail.png` (binary copy) + `src/images/thumbnail.ts` (base64 data URL generated from PNG)

### After scaffolding

```bash
yarn install   # picks up the new workspace
yarn workspace @cosmotech/superset-plugin-<name> build
yarn workspace @cosmotech/superset-plugin-<name> test
```

### `scripts/initPlugin.js` — implementation notes

- Uses a **producer-consumer readline** (`createPrompter()`): a single `readline.Interface` is
  created for the entire session. Incoming `'line'` events go into `lineBuffer` (piped mode) or
  resolve a pending promise (TTY mode). This is necessary because recreating `readline` after each
  `rl.close()` causes stdin data loss on non-TTY streams (fish shell, yarn spawned processes…).
- Plugin name validation regex: `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` — accepts single-word names
  (`toto`) as well as hyphenated names (`my-chart`).
- Token replacement uses `content.split(token).join(value)` (not regex) — safe against special
  characters in the description.
- Binary files (`png`, `jpg`, `gif`, etc.) are copied byte-for-byte with `fs.copyFileSync`.
- After scaffolding, calls `generate_thumbnail.js` to produce `thumbnail.ts` from `thumbnail.png`
  (base64 data URL) so the thumbnail is embedded in the JS output and works without webpack image loaders.

---

## Plugin packaging for dynamic loading

Superset 6.x supports **dynamic plugin loading**: each plugin is compiled to a standalone webpack
bundle that is loaded at runtime by the frontend without rebuilding Superset.

Output structure:

```
<plugins-dir>/versions/<plugin-name>/<version>/index[-suffix].js
```

Six scripts in `scripts/` automate this workflow:

### `scripts/package_plugins.js` — orchestrator

Discovers all plugins in `plugins/` (directories containing both `package.json` and `src/index.ts`)
and runs the full packaging pipeline on each.

```bash
node scripts/package_plugins.js                    # default: plugins/
node scripts/package_plugins.js --suffix beta       # versioned with suffix
node scripts/package_plugins.js --plugins-dir /path/to/plugins
```

### `scripts/plugin_pipeline.js <plugin_path> [--suffix <suffix>]`

Full CI pipeline on a single plugin: lint, test, build (via lerna --scope), then package (patch + webpack).

```bash
node scripts/plugin_pipeline.js plugins/hello-world
node scripts/plugin_pipeline.js plugins/hello-world --suffix beta
# Or via yarn:
yarn plugin:pipeline plugins/hello-world
yarn plugin:pipeline plugins/hello-world --suffix beta
```

Steps:

1. Reads `package.json` to derive the lerna scope (`@cosmotech/superset-plugin-<name>`)
2. `lerna run lint --scope=<name>`
3. `lerna run test --scope=<name>`
4. `lerna run build --scope=<name>`
5. `packagePlugin(pluginPath, suffix)` — patch_webpack + patch_index_ts + build_plugin

### `scripts/package_plugin.js <plugin_path> [--suffix <suffix>]`

Packages a single plugin (runs the full pipeline: patch_webpack + patch_index_ts + build_plugin).

```bash
node scripts/package_plugin.js plugins/hello-world
node scripts/package_plugin.js plugins/hello-world --suffix beta
```

Pipeline per plugin:

1. `generate_thumbnail.js <plugin_path>` — regenerate thumbnail.ts if thumbnail.png changed
2. `patch_webpack.js <plugin_path>`
3. `patch_index_ts.js <plugin_path>`
4. `build_plugin.js <plugin_path> [--suffix <suffix>]`

### `scripts/generate_thumbnail.js <plugin_path>`

Generates (or regenerates) `src/images/thumbnail.ts` from `src/images/thumbnail.png` for a given
plugin. The generated file exports the image as a base64 data URL so the thumbnail is embedded in
the JS output without needing webpack image loaders.

```bash
node scripts/generate_thumbnail.js plugins/hello-world
# Or via yarn:
yarn plugin:thumbnail plugins/hello-world
```

Called automatically by `package_plugin.js` (before patching/building) and `initPlugin.js` (after
scaffolding). Can also be run standalone after modifying a plugin's `thumbnail.png`.

### `scripts/patch_webpack.js <plugin_path>`

Copies `scripts/webpack.config.js` into the plugin folder. If a `webpack.config.js` already exists,
it is backed up to `webpack.config.js.original`.

The injected config:

- Output: ESM library (`module` type) — output path/filename overridden by `build_plugin.js`
- Externals: `react`, `react-dom`, `@superset-ui/core`, `@superset-ui/chart-controls`
- Loaders: `ts-loader`, `babel-loader`, `css-loader`, `style-loader`
- Entry: `./src/index.ts`

### `scripts/patch_index_ts.js <plugin_path>`

Transforms the plugin's `src/index.ts` to add auto-registration for dynamic loading:

```typescript
// Before (source in git — plain re-export)
export { default as HelloWorldPlugin } from './plugin';

// After (modified by patch_index_ts.js — deploy-time only)
import { default as HelloWorldPlugin } from './plugin';
new HelloWorldPlugin().configure({ key: 'hello-world' }).register();
```

Detection logic:

- Finds `export { default as <PluginName> }` or `export { <PluginName> }` patterns
- Derives the plugin key from the directory name (kebab-case)
- Replaces the export with an import + instantiation + configure + register

> **CRITICAL**: This modification must NEVER be committed to git. It is applied at deploy-time
> only. The auto-registration code breaks unit tests (mocks expect the export pattern, not
> side-effects at import time).

### `scripts/build_plugin.js <plugin_path> [--suffix <suffix>]`

Full webpack build for a single plugin:

1. Reads the plugin version from `package.json`
2. Ensures `package.json` contains a `build-dist` script (adds `webpack-cli --mode production` if missing)
3. Runs `npm install` if `node_modules/` does not exist
4. Installs missing build dependencies:
   - webpack, webpack-cli, terser-webpack-plugin
   - ts-loader, babel-loader, @babel/core, @babel/preset-env, @babel/preset-react, @babel/preset-typescript
   - css-loader, style-loader
5. Runs `npx webpack-cli` with `--output-path <plugins-dir>/versions/<name>/<version>` and `--output-filename index[-suffix].js`
6. Verifies the output file was produced (fails with exit code 1 otherwise)

```bash
node scripts/build_plugin.js plugins/hello-world                # → plugins/versions/hello-world/0.1.0/index.js
node scripts/build_plugin.js plugins/hello-world --suffix beta   # → plugins/versions/hello-world/0.1.0/index-beta.js
```

### Important notes

- All scripts require **Node.js >= 18**
- `package_plugins.js` exits with code 1 if any plugin fails to build
- The webpack config uses `externals` to avoid bundling React and Superset core — they are
  provided by the host Superset application at runtime
- Output is `<plugins-dir>/versions/<plugin-name>/<version>/index[-suffix].js` (single bundle, production-minified)

---

## Plugin package conventions

### `package.json` required fields

```json
{
  "name": "@cosmotech/superset-plugin-<name>",
  "version": "0.1.0",
  "pluginName": "<PascalCase>ChartPlugin",
  "main": "dist/index.js",
  "module": "esm/index.js",
  "types": "dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "babel src --extensions '.ts,.tsx' --copy-files --out-dir dist && tsc -p tsconfig.json && tsc -p tsconfig.esm.json && cp -r src/images esm/images",
    "build:dev": "tsc -p tsconfig.json --watch",
    "clean": "rm -rf dist esm coverage",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "peerDependencies": {
    "@superset-ui/chart-controls": "^0.20.3",
    "@superset-ui/core": "^0.20.4",
    "react": "^19.2.5",
    "react-dom": "^19.2.5"
  },
  "devDependencies": {
    "@superset-ui/chart-controls": "^0.20.3",
    "@superset-ui/core": "^0.20.4",
    "@types/jest": "^29.5.12",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3"
  }
}
```

> **Build strategy — why three steps?**  
> TypeScript 5.1 enforces strict coupling between `module` and `moduleResolution`. The root
> tsconfig uses `moduleResolution: "bundler"` + `module: "ESNext"`. Generating CommonJS JS with
> `tsc` from this config is invalid. Therefore:
>
> - **Babel** compiles `src/` → `dist/` (CommonJS JS files, no type checking)
> - **`tsc -p tsconfig.json`** runs with `emitDeclarationOnly: true` — generates only `.d.ts` files in `dist/` (no JS)
> - **`tsc -p tsconfig.esm.json`** generates ESM JS in `esm/` (valid because module=ESNext matches moduleResolution=bundler)

The `pluginName` field in package.json is no longer used by `scripts/generatePreset.js`.
`generatePreset.js` now extracts the default export class name directly from `src/plugin/index.ts`.

### `tsconfig.json` (declarations only — `.d.ts` in `dist/`)

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "emitDeclarationOnly": true,
    "noImplicitAny": false,
    "types": ["jest"]
  },
  "include": ["src/**/*", "types/**/*"],
  "exclude": ["node_modules", "dist", "esm", "**/*.test.ts", "**/*.test.tsx"]
}
```

> `emitDeclarationOnly: true` is mandatory — it bypasses the `module: CommonJS` + `moduleResolution: bundler` conflict in TS 5.1.  
> `noImplicitAny: false` is needed for emotion styled-component template literals in TS 5.x.

### `tsconfig.esm.json` (ESM build — JS in `esm/`)

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "esm",
    "module": "ESNext",
    "noImplicitAny": false,
    "declaration": false,
    "declarationMap": false
  },
  "include": ["src/**/*", "types/**/*"],
  "exclude": ["node_modules", "dist", "esm", "**/*.test.ts", "**/*.test.tsx"]
}
```

### `jest.config.js`

```js
module.exports = {
  displayName: '@cosmotech/superset-plugin-<name>',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { rootMode: 'upward' }],
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^@superset-ui/core$': '<rootDir>/test/__mocks__/superset-ui-core.js',
    '^@superset-ui/chart-controls$': '<rootDir>/test/__mocks__/superset-ui-chart-controls.js',
    '\\.(gif|ttf|eot|png|jpg|svg)$': '<rootDir>/test/__mocks__/mockExportString.js',
  },
  testMatch: ['<rootDir>/test/**/*.test.{ts,tsx}'],
  passWithNoTests: true,
};
```

> **Why mock `@superset-ui`?** — `@superset-ui/core@0.20.4` ships ESM syntax in its `lib/*.js`
> files AND has a deep chain of ESM-only transitive dependencies (`d3-*`, `pretty-ms`, `parse-ms`,
> `rehype-sanitize`, `hast-util-sanitize`, …). Transforming all of them in Jest is impractical.
> Manual mocks in `test/__mocks__/` provide the minimal implementations needed by plugin tests.

### `test/__mocks__/superset-ui-core.js` (minimum viable mock)

```js
const supersetTheme = { colors: { primary: { base: '#20A7C9' } }, gridUnit: 4, borderRadius: 4 };
const t = (str) => str;
class ChartProps {
  constructor(props = {}) {
    Object.assign(this, { formData: {}, queriesData: [], width: 800, height: 600, ...props });
  }
}
class ChartMetadata {
  constructor(p = {}) {
    Object.assign(this, p);
  }
}
class ChartPlugin {
  constructor(p = {}) {
    Object.assign(this, p);
  }
  register() {
    return this;
  }
}
const buildQueryContext = (formData, buildQuery) => {
  const base = {
    time_range: 'No filter',
    filters: [],
    extras: {},
    metrics: [],
    columns: [],
    groupby: [],
    row_limit: 10000,
  };
  return {
    datasource: { id: '1', type: 'table' },
    force: false,
    queries: buildQuery ? buildQuery(base) : [base],
    result_format: 'json',
    result_type: 'full',
  };
};
const validateNonEmpty = (v) => (v == null || v === '' ? 'cannot be empty' : undefined);
module.exports = {
  t,
  supersetTheme,
  ChartProps,
  ChartMetadata,
  ChartPlugin,
  buildQueryContext,
  validateNonEmpty,
};
```

---

## Plugin source code patterns

### `src/index.ts`

```typescript
export { default as MyChartPlugin } from './plugin';
```

### `src/plugin/index.ts`

```typescript
import { ChartPlugin, ChartMetadata } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail';

export default class MyChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../MyChart'), // dynamic import for code-splitting
      metadata: new ChartMetadata({
        description: 'My chart description',
        name: 'My Chart',
        thumbnail,
      }),
      transformProps,
    });
  }
}
```

> **Thumbnail**: The thumbnail is encoded as a base64 data URL in `src/images/thumbnail.ts`.
> Import it as `import thumbnail from '../images/thumbnail'` (no `.png` extension).
> This avoids webpack loader issues when Superset loads the plugin from `node_modules`.
> `yarn plugin:init` automatically generates `thumbnail.ts` from `thumbnail.png`.

````

### `src/buildQuery.ts`

```typescript
import { buildQueryContext, QueryFormData } from '@superset-ui/core';

export default function buildQuery(formData: QueryFormData) {
  const { series } = formData;
  return buildQueryContext(formData, (baseQueryObject) => [
    { ...baseQueryObject, columns: series ? [series] : [] },
  ]);
}
````

> Use `series` → `columns` pattern (not `cols` → `groupby`). The test expects `query.columns`.

### `src/transformProps.ts`

```typescript
import { ChartProps } from '@superset-ui/core';

export default function transformProps(chartProps: ChartProps) {
  const { width, height, queriesData } = chartProps;
  const data = queriesData[0]?.data ?? [];
  return { width, height, data };
}
```

### `src/controlPanel.ts`

```typescript
import { ControlPanelConfig } from '@superset-ui/chart-controls';

const controlPanel: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: 'Query',
      expanded: true,
      controlSetRows: [['metrics'], ['groupby']],
    },
  ],
};

export default controlPanel;
```

---

## Key constraints and known issues

### @superset-ui package versions (CRITICAL)

- `@superset-ui/core@2.1.0` and `@superset-ui/chart-controls@2.1.0` are **broken on npm** — published without build artifacts (no `lib/`, no `.d.ts`). They will cause `Cannot find module` errors immediately.
- **Always use `@superset-ui/core@0.20.4` and `@superset-ui/chart-controls@0.20.3`**.
- `@superset-ui/core@0.20.4` has several undeclared dependencies. The root `package.json` adds them explicitly: `json-bigint`, `tinycolor2`, `react-loadable`, `memoize-one`.
- `@superset-ui/core@0.20.4` ships ESM syntax in its `lib/*.js` files (the `main` field), despite being in `lib/` (conventionally CJS). This breaks Jest without transformation.

### TypeScript 5.1 module resolution (CRITICAL)

- TS 5.1 enforces strict coupling: `moduleResolution: "bundler"` requires `module: "ESNext"` or `"preserve"`. Using `module: "CommonJS"` with `moduleResolution: "bundler"` is a compilation error.
- Root `tsconfig.json` uses `module: "ESNext"` + `moduleResolution: "bundler"` (valid pair).
- Plugins use `emitDeclarationOnly: true` in their `tsconfig.json` to avoid the CommonJS/bundler conflict — tsc only emits `.d.ts`, not JS. Babel handles JS output.
- `@typescript-eslint@5.62.0` supports TypeScript `<5.2.0`. This is why TypeScript is pinned to `~5.1.6`.
- ESLint is version 7.x (`^7.17.0`). `@typescript-eslint` is version 5.x (`^5.62.0`), the last version compatible with ESLint 7.

### Jest and ESM dependencies

- `transformIgnorePatterns: ['/node_modules/']` ignores ALL node_modules (default behavior).
- `@superset-ui/core` and `@superset-ui/chart-controls` are mocked via `moduleNameMapper` to avoid their ESM dependency chain entirely.
- The leading `/` in `/node_modules/` is essential — without it, the regex can fail to match nested `node_modules` paths (e.g. `d3-scale/node_modules/d3-time-format`).
- If you add a new dependency that is ESM-only, either mock it or add it to the transform whitelist (see `transformIgnorePatterns` in Jest docs).

### Lerna v9

- `lerna.json` must NOT contain `"useWorkspaces": true` — this key was removed in Lerna v9 and throws a runtime error.
- Yarn workspaces are declared in root `package.json` `"workspaces"` field; Lerna reads `"packages"` in `lerna.json` for its own discovery.

### General

- `declarationMap: false` must be explicit in `tsconfig.esm.json` because the root tsconfig enables it, and it conflicts with `declaration: false`.
- Jest transforms use `rootMode: "upward"` so each package's Jest can locate the root `babel.config.js`.
- `scripts/` JS files are excluded from ESLint (`"ignorePatterns": ["scripts/"]`) and from TypeScript compilation.
- Static assets (images, SVG, CSS) must be copied via `scripts/copyAssets.js` — tsc does not copy non-TS files.
- Do NOT add `eslint-disable-next-line import/prefer-default-export` in source files — `eslint-plugin-import` is not installed.
- Babel `--copy-files` flag in the build script copies non-TS files (images, JSON) into `dist/`.
- The build script includes `cp -r src/images esm/images` to copy images to the ESM output (tsc does not copy non-TS files).
- **Superset 6.0.0 theme**: The old nested theme API (`theme.gridUnit`, `theme.typography.*`, `theme.colors.*`) from `@superset-ui/core@0.20.4` no longer exists at runtime. Superset 6.0.0 uses flat Ant Design v5 tokens (e.g. `theme.fontFamily`, `theme.fontSize`, `theme.padding`, `theme.colorText`). Plugins should avoid `styled` from `@superset-ui/core` and use inline React styles instead to remain compatible across Superset versions.
- `.prettierignore` excludes `plugin_template/src`, `plugin_template/test`, and `plugin_template/types` — these directories contain `{{TOKEN}}` placeholders that are not valid TypeScript/TSX syntax and cannot be parsed by Prettier. Config files in `plugin_template/` root (`package.json`, `jest.config.js`, `README.md`) are still checked.

---

## CI/CD

### `.github/workflows/ci.yml` — runs on every push and PR

```
trigger: push (all branches) + pull_request
runner: ubuntu-latest, Node 22

steps:
  1. actions/checkout@v4
  2. actions/setup-node@v4  (node-version: 22, cache: yarn)
  3. yarn install --frozen-lockfile
  4. yarn build             ← lerna run build (CJS + ESM)
  5. yarn lint              ← lerna run lint (ESLint)
  6. yarn format:check      ← prettier --check
  7. yarn test              ← lerna run test (Jest)
```

---

## Validation checklist after any change

Run in order from the repo root:

```bash
yarn build          # must succeed with 0 errors
yarn lint           # must succeed with 0 errors
yarn test           # must succeed
yarn format:check   # must succeed (or run `yarn format` first to fix)
```
