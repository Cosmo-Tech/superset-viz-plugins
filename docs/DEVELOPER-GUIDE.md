# Guide développeur

## Prérequis

| Outil   | Version minimale | Installation                     |
| ------- | ---------------- | -------------------------------- |
| Node.js | >= 18            | [nodejs.org](https://nodejs.org) |
| Yarn    | >= 1.22          | `npm install -g yarn`            |

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
├── plugins/                         ← Un sous-dossier = un plugin npm indépendant
│   └── hello-world/                 ← Exemple de plugin de référence
├── plugin_template/                 ← Gabarit utilisé par `yarn plugin:init`
│   ├── src/
│   │   ├── __PLUGIN_CLASS_NAME__.tsx ← Composant React (renommé à la génération)
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── images/
│   │   └── plugin/
│   ├── test/
│   │   ├── __mocks__/
│   │   └── plugin/
│   ├── types/
│   ├── package.json                 ← Contient les tokens {{PACKAGE_NAME}}, etc.
│   ├── tsconfig.json
│   ├── tsconfig.esm.json
│   ├── babel.config.js
│   └── jest.config.js
├── packages/
│   └── core/                        ← @cosmotech-viz/core — composants partagés
│       ├── src/index.ts             ← Point d'entrée (exports publics)
│       ├── tsconfig.json            ← Build CJS → dist/
│       └── tsconfig.esm.json        ← Build ESM → esm/
├── scripts/
│   ├── initPlugin.js                ← Scaffold d'un plugin depuis plugin_template/
│   ├── addDependencies.js           ← Injecte les plugins dans package.json Superset
│   ├── copyAssets.js                ← Copie les assets statiques vers dist/ et esm/
│   ├── generatePreset.js            ← Génère le fichier *Preset.ts pour Superset
│   ├── generateSetupPluginsExtra.js ← Génère setupPluginsExtra.ts
│   └── prepare_build.sh             ← Orchestre l'injection complète (CI)
├── docs/                            ← Documentation
├── babel.config.js                  ← Transpilation TS/TSX → JS (Jest)
├── jest.config.js                   ← Config Jest racine (découverte auto)
├── lerna.json                       ← Configuration Lerna v9
├── package.json                     ← Racine du monorepo (workspaces + scripts)
├── tsconfig.json                    ← Config TypeScript partagée
├── .eslintrc.json                   ← Règles ESLint (TypeScript + React + hooks)
└── .prettierrc                      ← Règles Prettier
```

---

## Commandes disponibles

Toutes les commandes s'exécutent depuis la racine du monorepo.

| Commande            | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `yarn plugin:init`  | Scaffold un nouveau plugin depuis `plugin_template/`         |
| `yarn build`        | Build production de tous les packages (CJS + ESM)            |
| `yarn build:dev`    | Watch mode — recompile à chaque modification                 |
| `yarn test`         | Lance tous les tests unitaires                               |
| `yarn test:watch`   | Tests en mode watch                                          |
| `yarn lint`         | Analyse ESLint sur tous les packages                         |
| `yarn format`       | Formate tous les fichiers avec Prettier                      |
| `yarn format:check` | Vérifie le formatage sans modifier (utilisé en CI)           |
| `yarn clean`        | Supprime les dossiers `dist/`, `esm/`, `coverage/`           |

Pour cibler un seul package :

```bash
yarn workspace @cosmotech-viz/core build
yarn workspace @cosmotech-viz/core test
```

---

## Créer un nouveau plugin

Un générateur en ligne de commande est intégré au monorepo. Il copie `plugin_template/`, remplace
les tokens, et renomme les fichiers automatiquement.

### 1. Lancer le générateur

```bash
yarn plugin:init
```

Le script pose trois questions :

```
Plugin name (kebab-case, e.g. my-chart): mon-graphique
Display name (e.g. My Chart): Mon Graphique
Description: Visualisation personnalisée de données
```

- **Plugin name** — identifiant kebab-case, devient le nom npm `@cosmotech-viz/plugin-<nom>` et
  le nom du sous-dossier dans `plugins/`.
- **Display name** — nom affiché dans l'interface Superset.
- **Description** — description courte (readme, metadata).

Le script génère `plugins/mon-graphique/` avec la structure complète :

```
plugins/mon-graphique/
├── src/
│   ├── MonGraphique.tsx       ← Composant React (renommé depuis __PLUGIN_CLASS_NAME__.tsx)
│   ├── index.ts
│   ├── types.ts
│   ├── images/thumbnail.png
│   └── plugin/
│       ├── index.ts           ← Classe MonGraphiquePlugin (extends ChartPlugin)
│       ├── buildQuery.ts
│       ├── controlPanel.ts
│       └── transformProps.ts
├── test/
│   ├── index.test.ts
│   ├── plugin/
│   │   ├── buildQuery.test.ts
│   │   └── transformProps.test.ts
│   └── __mocks__/
│       ├── superset-ui-core.js
│       ├── superset-ui-chart-controls.js
│       └── mockExportString.js
├── types/external.d.ts
├── package.json
├── tsconfig.json
├── tsconfig.esm.json
├── babel.config.js
├── jest.config.js
└── README.md
```

### 2. Installer les dépendances

```bash
yarn install
```

Yarn Workspaces détecte automatiquement le nouveau package et installe ses dépendances.

### 3. Vérifier le build, les tests et le lint

```bash
yarn workspace @cosmotech-viz/plugin-mon-graphique build
yarn workspace @cosmotech-viz/plugin-mon-graphique test
yarn workspace @cosmotech-viz/plugin-mon-graphique lint
```

Ou en une seule passe depuis la racine :

```bash
yarn build && yarn test && yarn lint
```

### 4. Implémenter le plugin

Le code généré est fonctionnel dès la sortie du générateur. Les fichiers à adapter en priorité :

| Fichier                       | Ce qu'il faut modifier                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| `src/MonGraphique.tsx`        | Remplacer le rendu `<pre>` par la visualisation réelle              |
| `src/types.ts`                | Adapter les interfaces `FormData` et `Props` aux données du plugin  |
| `src/plugin/buildQuery.ts`    | Adapter les colonnes/métriques à requêter                           |
| `src/plugin/controlPanel.ts`  | Ajouter/modifier les contrôles du panneau Superset                  |
| `src/plugin/transformProps.ts`| Adapter la transformation réponse API → props React                 |

> **Important** : utiliser `@superset-ui/core@0.20.4` et `@superset-ui/chart-controls@0.20.3`.
> Les versions `2.x` sont publiées sur npm sans artefacts de build — elles ne fonctionnent pas.

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

**Classe Plugin (`src/plugin/index.ts`)** :

```typescript
import { ChartPlugin, ChartMetadata } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail.png';

export default class MonGraphiquePlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../MonGraphique'),  // chargement dynamique
      metadata: new ChartMetadata({
        description: 'Visualisation personnalisée',
        name: 'Mon Graphique',
        thumbnail,
      }),
      transformProps,
    });
  }
}
```

> Utiliser `loadChart: () => import('../MonGraphique')` (import dynamique) plutôt que
> `loadChart: () => MonGraphique` pour le code-splitting Superset.

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
