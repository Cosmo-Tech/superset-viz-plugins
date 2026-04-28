# Agent context — cosmotech-viz-plugins

## Repository overview

Lerna v9 monorepo of custom Apache Superset visualization plugins. Each plugin is an independent
npm package (TypeScript + React 19) published under the `@cosmotech-viz/` scope.

- **Runtime**: Node >= 18, Yarn 1.22 (classic workspaces)
- **Package manager**: yarn — `workspaces: ["plugins/*", "packages/*"]`
- **Lerna versioning**: `independent` (each package has its own semver)
- **Language**: TypeScript 5.9.3 (installed from `^5.4.5`), React 19, recharts 2.x
- **Superset SDK**: `@superset-ui/core@0.20.4`, `@superset-ui/chart-controls@0.20.3`
- **CRITICAL**: `@superset-ui` versions `2.x` are broken on npm (published without build artifacts — no `lib/`, no `.d.ts`). Always use `0.20.x`.

---

## Repository structure

```
cosmotech-viz-plugins/
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
│   │   ├── images/thumbnail.png
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
├── packages/
│   └── core/                         ← @cosmotech-viz/core (shared utilities)
│       ├── package.json
│       ├── tsconfig.json             ← CommonJS build → dist/
│       ├── tsconfig.esm.json         ← ESM build → esm/
│       ├── jest.config.js
│       └── src/index.ts              ← All public exports
├── scripts/
│   ├── initPlugin.js             ← `yarn plugin:init` — scaffolds from plugin_template/
│   ├── addDependencies.js            ← Injects plugins into Superset frontend package.json
│   ├── copyAssets.js                 ← Copies static assets (png/svg/css…) to dist/ and esm/
│   ├── generatePreset.js             ← Generates <PRESET_NAME>Preset.ts from all plugins
│   ├── generateSetupPluginsExtra.js  ← Generates setupPluginsExtra.ts
│   └── prepare_build.sh             ← Orchestrates full Superset injection (CI only)
├── docs/
│   ├── PROJECT-OVERVIEW.md          ← High-level project overview (French)
│   ├── DEVELOPER-GUIDE.md           ← Developer onboarding guide (French)
│   ├── USER-GUIDE.md                ← End-user guide (French)
│   ├── AGENT-CONTEXT.md             ← This file
│   └── webpack.config.js            ← Patched Superset webpack config for manual integration
├── babel.config.js                   ← Babel: preset-env (node current) + preset-react + preset-typescript
├── jest.config.js                    ← Root Jest: projects glob on plugins/* and packages/*
├── lerna.json                        ← Lerna v9, independent, npmClient: yarn, conventionalCommits
├── package.json                      ← Root: private, workspaces, scripts, all devDependencies
├── tsconfig.json                     ← Shared: target ES2020, jsx react-jsx, strict, esModuleInterop
├── .eslintrc.json                    ← @typescript-eslint + eslint-plugin-react + react-hooks
└── .prettierrc                       ← singleQuote, trailingComma all, printWidth 100, semi
```

---

## Available scripts (root)

| Script              | Command                      | Purpose                                             |
| ------------------- | ---------------------------- | --------------------------------------------------- |
| `yarn plugin:init`  | `node scripts/initPlugin.js` | Scaffold a new plugin from `plugin_template/`       |
| `yarn build`        | `lerna run build`            | Production build (CJS + ESM) for all packages       |
| `yarn build:dev`    | `lerna run build:dev`        | Watch mode via `tsc --watch`                        |
| `yarn test`         | `lerna run test`             | Jest across all packages                            |
| `yarn test:watch`   | `lerna run test:watch`       | Jest watch mode                                     |
| `yarn lint`         | `lerna run lint`             | ESLint on all `src/` directories                    |
| `yarn format`       | `prettier --write`           | Auto-format all `.ts/.tsx/.js/.json/.md` files      |
| `yarn format:check` | `prettier --check`           | CI formatting check (fails if unformatted)          |
| `yarn clean`        | `lerna run clean`            | Delete `dist/`, `esm/`, `coverage/` in all packages |

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
- Thumbnail: `src/images/thumbnail.png` (binary copy)

### After scaffolding

```bash
yarn install   # picks up the new workspace
yarn workspace @cosmotech-viz/plugin-<name> build
yarn workspace @cosmotech-viz/plugin-<name> test
```

---

## Plugin package conventions

### `package.json` required fields

```json
{
  "name": "@cosmotech-viz/plugin-<name>",
  "version": "0.1.0",
  "pluginName": "<PascalCase>ChartPlugin",
  "main": "dist/index.js",
  "module": "esm/index.js",
  "types": "dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "babel src --extensions '.ts,.tsx' --copy-files --out-dir dist && tsc -p tsconfig.json && tsc -p tsconfig.esm.json",
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
> TypeScript 5.9 enforces strict coupling between `module` and `moduleResolution`. The root
> tsconfig uses `moduleResolution: "bundler"` + `module: "ESNext"`. Generating CommonJS JS with
> `tsc` from this config is invalid. Therefore:
>
> - **Babel** compiles `src/` → `dist/` (CommonJS JS files, no type checking)
> - **`tsc -p tsconfig.json`** runs with `emitDeclarationOnly: true` — generates only `.d.ts` files in `dist/` (no JS)
> - **`tsc -p tsconfig.esm.json`** generates ESM JS in `esm/` (valid because module=ESNext matches moduleResolution=bundler)

The `pluginName` field is read by `scripts/generatePreset.js` to generate the Superset Preset
file.

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

> `emitDeclarationOnly: true` is mandatory — it bypasses the `module: CommonJS` + `moduleResolution: bundler` conflict in TS 5.9.  
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
  displayName: '@cosmotech-viz/plugin-<name>',
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
import thumbnail from '../images/thumbnail.png';

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

### `src/buildQuery.ts`

```typescript
import { buildQueryContext, QueryFormData } from '@superset-ui/core';

export default function buildQuery(formData: QueryFormData) {
  const { series } = formData;
  return buildQueryContext(formData, (baseQueryObject) => [
    { ...baseQueryObject, columns: series ? [series] : [] },
  ]);
}
```

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

### TypeScript 5.9 module resolution (CRITICAL)

- TS 5.9 enforces strict coupling: `moduleResolution: "bundler"` requires `module: "ESNext"` or `"preserve"`. Using `module: "CommonJS"` with `moduleResolution: "bundler"` is a compilation error.
- Root `tsconfig.json` uses `module: "ESNext"` + `moduleResolution: "bundler"` (valid pair).
- Plugins use `emitDeclarationOnly: true` in their `tsconfig.json` to avoid the CommonJS/bundler conflict — tsc only emits `.d.ts`, not JS. Babel handles JS output.
- `packages/core` can use `module: "CommonJS"` override because its `src/index.ts` has no actual imports (only `export {}`), which avoids the conflict check.

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

---

## CI/CD environment variables

Used by `scripts/prepare_build.sh` and the GitHub Actions release workflow:

| Variable                    | Description                                                    |
| --------------------------- | -------------------------------------------------------------- |
| `GITHUB_WORKSPACE`          | Absolute path to the GitHub Actions workspace root             |
| `PROJECT_WORKING_DIRECTORY` | Relative path of this monorepo inside the workspace            |
| `PRESET_NAME`               | Name of the generated Superset Preset class (e.g. `CosmoTech`) |
| `PLUGINS_EXTRA_FILENAME`    | Output filename for `setupPluginsExtra.ts`                     |

---

## Adding shared code to `packages/core`

1. Add the implementation in `packages/core/src/`
2. Export it from `packages/core/src/index.ts`
3. Run `yarn build` to compile
4. In the consuming plugin's `package.json`, add `"@cosmotech-viz/core": "*"` as a dependency
5. Import: `import { MyUtil } from '@cosmotech-viz/core'`

---

## Validation checklist after any change

Run in order from the repo root:

```bash
yarn build          # must succeed with 0 errors
yarn lint           # must succeed with 0 errors
yarn test           # must succeed
yarn format:check   # must succeed (or run `yarn format` first to fix)
```
