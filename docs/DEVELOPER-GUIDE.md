# Guide développeur

## Prérequis

| Outil               | Version minimale | Installation                                     |
| ------------------- | ---------------- | ------------------------------------------------ |
| Node.js             | >= 18            | [nodejs.org](https://nodejs.org)                 |
| Yarn                | >= 1.22          | `npm install -g yarn`                            |
| Yeoman              | dernière         | `npm install -g yo` (optionnel)                  |
| Générateur Superset | dernière         | `npm install -g @superset-ui/generator-superset` (optionnel) |

Vérifier l'environnement :

```bash
node --version  # >= 18
yarn --version  # >= 1.22
```

---

## Installation du monorepo

```bash
git clone <url-du-repo>
cd cosmotech-viz-plugins
yarn install
```

Yarn Workspaces installe toutes les dépendances de la racine et de chaque package en une seule passe.

---

## Structure du dépôt

```
cosmotech-viz-plugins/
├── plugins/                       ← Un sous-dossier = un plugin npm indépendant
│   └── plugin-hello-world/        ← Exemple de plugin (généré par Yeoman)
├── packages/
│   └── core/                      ← @cosmotech-viz/core — composants partagés
│       ├── src/index.ts           ← Point d'entrée (exports publics)
│       ├── tsconfig.json          ← Build CJS → dist/
│       └── tsconfig.esm.json      ← Build ESM → esm/
├── scripts/                       ← Scripts d'injection vers Superset (CI/CD)
│   ├── addDependencies.js         ← Injecte les plugins dans package.json Superset
│   ├── copyAssets.js              ← Copie les assets statiques vers dist/ et esm/
│   ├── generatePreset.js          ← Génère le fichier *Preset.ts pour Superset
│   ├── generateSetupPluginsExtra.js ← Génère setupPluginsExtra.ts
│   └── prepare_build.sh           ← Orchestre l'injection complète (utilisé en CI)
├── docs/                          ← Documentation
├── babel.config.js                ← Transpilation TS/TSX → JS (Jest)
├── jest.config.js                 ← Config Jest racine (découverte auto des suites)
├── lerna.json                     ← Configuration Lerna v9
├── package.json                   ← Racine du monorepo (workspaces + scripts)
├── tsconfig.json                  ← Config TypeScript partagée
├── .eslintrc.json                 ← Règles ESLint (TypeScript + React + hooks)
└── .prettierrc                    ← Règles Prettier
```

---

## Commandes disponibles

Toutes les commandes s'exécutent depuis la racine du monorepo.

| Commande            | Description                                        |
| ------------------- | -------------------------------------------------- |
| `yarn build`        | Build production de tous les packages (CJS + ESM)  |
| `yarn build:dev`    | Watch mode — recompile à chaque modification       |
| `yarn test`         | Lance tous les tests unitaires                     |
| `yarn test:watch`   | Tests en mode watch                                |
| `yarn lint`         | Analyse ESLint sur tous les packages               |
| `yarn format`       | Formate tous les fichiers avec Prettier            |
| `yarn format:check` | Vérifie le formatage sans modifier (utilisé en CI) |
| `yarn clean`        | Supprime les dossiers `dist/`, `esm/`, `coverage/` |

Pour cibler un seul package :

```bash
yarn workspace @cosmotech-viz/core build
yarn workspace @cosmotech-viz/core test
```

---

## Créer un nouveau plugin

### 1. Créer le dossier du plugin

```bash
mkdir plugins/plugin-mon-graphique
cd plugins/plugin-mon-graphique
```

### 2. Générer le squelette avec Yeoman

```bash
yo @superset-ui/superset
```

Répondre aux questions du générateur (nom, type de graphique, etc.).

### 3. Ajouter les champs obligatoires dans `package.json`

Les scripts de CI lisent `pluginName` pour générer le Preset Superset. Le script de build utilise
Babel pour la compilation CJS et `tsc` pour les déclarations TypeScript :

```json
{
  "name": "@cosmotech-viz/plugin-mon-graphique",
  "version": "0.1.0",
  "pluginName": "MonGraphiqueChartPlugin",
  "main": "dist/index.js",
  "module": "esm/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "babel src --extensions '.ts,.tsx' --copy-files --out-dir dist && tsc -p tsconfig.json && tsc -p tsconfig.esm.json",
    "build:dev": "tsc -p tsconfig.json --watch",
    "clean": "rm -rf dist esm coverage",
    "test": "jest --passWithNoTests",
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
    "@superset-ui/core": "^0.20.4"
  }
}
```

> **Important** : utiliser `@superset-ui/core@0.20.4` et `@superset-ui/chart-controls@0.20.3`.
> Les versions `2.x` sont publiées sur npm sans artefacts de build (pas de `lib/`, pas de `.d.ts`)
> — elles ne fonctionnent pas.

### 4. Ajouter les fichiers de configuration TypeScript et Jest

Créer `tsconfig.json` (génère uniquement les `.d.ts` dans `dist/`, Babel génère le JS) :

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

Créer `tsconfig.esm.json` (génère le JS ESM dans `esm/`) :

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

Créer `jest.config.js` avec les mocks `@superset-ui` :

```js
module.exports = {
  displayName: '@cosmotech-viz/plugin-mon-graphique',
  testEnvironment: 'jsdom',
  transform: { '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { rootMode: 'upward' }] },
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

Copier les fichiers `test/__mocks__/` depuis `plugins/hello-world/test/__mocks__/` comme point de
départ et adapter les exports mockés au besoin.

### 5. Vérifier le build

```bash
cd ../..
yarn build
yarn lint
yarn test
```

---

## Anatomie d'un plugin

Un plugin Superset expose cinq éléments obligatoires :

```
plugins/plugin-mon-graphique/src/
├── index.ts            ← Export de la classe Plugin (extends ChartPlugin)
├── buildQuery.ts       ← Traduit la config du panneau → requête SQL/API Superset
├── transformProps.ts   ← Transforme la réponse API → props React
├── controlPanel.ts     ← Définit les contrôles du panneau de configuration
└── MonGraphique.tsx    ← Composant React qui effectue le rendu
```

**Classe Plugin (`index.ts`)** :

```typescript
import { ChartPlugin } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import MonGraphique from './MonGraphique';

export default class MonGraphiqueChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => MonGraphique,
      metadata: { name: 'Mon Graphique', thumbnail: '' },
      transformProps,
    });
  }
}
```

---

## Package partagé `@cosmotech-viz/core`

`packages/core` contient les composants et utilitaires réutilisables entre plugins.

Pour utiliser `core` dans un plugin, l'ajouter en dépendance :

```json
{
  "dependencies": {
    "@cosmotech-viz/core": "*"
  }
}
```

Puis importer :

```typescript
import { MonUtilitaire } from '@cosmotech-viz/core';
```

Pour ajouter un export à `core`, modifier `packages/core/src/index.ts` puis relancer `yarn build`.

---

## Tests

Les tests utilisent **Jest** + **@testing-library/react**.

Chaque package a son propre `jest.config.js`. La commande `yarn test` racine découvre
automatiquement toutes les suites.

Les fichiers de test sont placés dans le répertoire `test/` du plugin (pas dans `src/`) :

```
plugins/mon-graphique/
└── test/
    ├── index.test.ts           ← Test d'enregistrement du plugin
    ├── plugin/
    │   ├── buildQuery.test.ts  ← Test de la fonction buildQuery
    │   └── transformProps.test.ts
    └── __mocks__/
        ├── superset-ui-core.js        ← Mock manuel de @superset-ui/core
        ├── superset-ui-chart-controls.js
        └── mockExportString.js        ← Stub pour les imports de fichiers statiques
```

> **Pourquoi des mocks manuels ?** `@superset-ui/core@0.20.4` a une longue chaîne de
> dépendances ESM-only (`d3-*`, `pretty-ms`, `rehype-sanitize`, …) que Jest ne peut pas
> transformer sans configuration complexe. Les mocks manuels évitent ce problème.

Exemple de test de composant React :

```typescript
import { render, screen } from '@testing-library/react';
import MonGraphique from '../src/MonGraphique';

test('renders without crashing', () => {
  render(<MonGraphique width={800} height={400} data={[]} />);
  expect(screen.getByRole('img')).toBeInTheDocument();
});
```

---

## Configuration TypeScript

Le `tsconfig.json` racine est la base partagée. Chaque package l'étend avec
`"extends": "../../tsconfig.json"`.

**Stratégie de build pour les plugins** (TypeScript 5.9 impose une contrainte stricte) :

| Fichier             | Rôle                                                           | Outil  |
| ------------------- | -------------------------------------------------------------- | ------ |
| `tsconfig.json`     | Génère les `.d.ts` dans `dist/` (`emitDeclarationOnly: true`)  | `tsc`  |
| `tsconfig.esm.json` | Génère le JS ESM dans `esm/` (`module: ESNext`)               | `tsc`  |
| `babel.config.js`   | Génère le JS CommonJS dans `dist/` (sans contrôle de type)     | Babel  |

> TypeScript 5.9 interdit `module: CommonJS` avec `moduleResolution: bundler`. Le root
> tsconfig utilise `moduleResolution: bundler` + `module: ESNext`. Pour éviter le conflit,
> `emitDeclarationOnly: true` fait que `tsc` ne génère que les `.d.ts`, pas de JS. Babel
> se charge de la transpilation CJS.

Options activées dans le root tsconfig : `strict`, `noUnusedLocals`, `noUnusedParameters`,
`noImplicitReturns`. Les plugins ajoutent `noImplicitAny: false` pour la compatibilité avec les
template literals Emotion.

---

## Conventions de commits

Lerna utilise `conventionalCommits: true`. Préfixes [Conventional Commits](https://www.conventionalcommits.org/) :

| Préfixe     | Usage                                   |
| ----------- | --------------------------------------- |
| `feat:`     | Nouvelle fonctionnalité                 |
| `fix:`      | Correction de bug                       |
| `chore:`    | Maintenance (deps, build…)              |
| `docs:`     | Documentation                           |
| `test:`     | Tests                                   |
| `refactor:` | Refactoring sans changement fonctionnel |

---

## CI/CD

1. **`ci.yml`** — sur chaque push : `yarn install` + `yarn build` + `yarn lint` + `yarn test`
2. **`release.yml`** — sur `master` : publication npm + injection Superset + build et push Docker

### Variables d'environnement requises en CI

| Variable                    | Rôle                                               |
| --------------------------- | -------------------------------------------------- |
| `GITHUB_WORKSPACE`          | Chemin racine du workspace GitHub Actions          |
| `PROJECT_WORKING_DIRECTORY` | Chemin relatif du monorepo dans le workspace       |
| `PRESET_NAME`               | Nom du Preset Superset à générer (ex: `CosmoTech`) |
| `PLUGINS_EXTRA_FILENAME`    | Nom du fichier `setupPluginsExtra` à générer       |

---

## Injection manuelle dans Superset (hors Docker)

1. Remplacer `superset/superset-frontend/webpack.config.js` par `docs/webpack.config.js`
2. Installer les packages npm des plugins dans le frontend Superset
3. Suivre [ce tutoriel](https://preset.io/blog/2020-07-02-hello-world/) pour enregistrer les plugins
