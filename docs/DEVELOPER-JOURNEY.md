# Parcours développeur — Cosmotech Viz Plugins

Guide complet pour créer, développer et tester un plugin de visualisation Apache Superset,
du clone initial jusqu'au déploiement CI/CD.

Version Superset cible : **6.0.0**

> **Règle fondamentale :** la version du Docker backend et la version du frontend Superset
> cloné doivent être **identiques**. Ne jamais utiliser `latest`.

---

## Table des matières

1. [Prérequis techniques](#1--prérequis-techniques)
2. [Récupération des projets](#2--récupération-des-projets)
3. [Structure du monorepo](#3--structure-du-monorepo)
4. [Commandes disponibles](#4--commandes-disponibles)
5. [Créer un nouveau plugin](#5--créer-un-nouveau-plugin)
6. [Anatomie d'un plugin](#6--anatomie-dun-plugin)
7. [Build et tests locaux](#7--build-et-tests-locaux)
8. [Démarrer Superset en local (Docker)](#8--démarrer-superset-en-local-docker)
9. [Intégrer le plugin dans Superset](#9--intégrer-le-plugin-dans-superset)
10. [Cycle de développement](#10--cycle-de-développement)
11. [Package partagé `@cosmotech/core`](#11--package-partagé-cosmotechcore)
12. [Conventions de commits](#12--conventions-de-commits)
13. [CI/CD](#13--cicd)

---

## 1 — Prérequis techniques

### Outils requis

| Outil   | Version          | Installation                                | Remarque                                 |
| ------- | ---------------- | ------------------------------------------- | ---------------------------------------- |
| Node.js | >= 18 (monorepo) | [nodejs.org](https://nodejs.org)            | v20.19.5 obligatoire pour Superset 6.0.0 |
| Yarn    | >= 1.22          | `npm install -g yarn`                       | Yarn Classic (pas Yarn Berry)            |
| Docker  | Version récente  | [docker.com](https://docker.com)            | Requis pour le backend Superset          |
| nvm     | —                | [nvm-sh/nvm](https://github.com/nvm-sh/nvm) | Recommandé pour gérer les versions Node  |

### Vérifier l'environnement

```bash
node --version       # >= 18
yarn --version       # >= 1.22
docker --version
docker compose version
```

### Node 20 pour Superset

Superset 6.0.0 impose Node **v20.19.5** et npm **10.8.4** pour le frontend. Utiliser `nvm`
pour basculer entre les versions :

```bash
nvm install v20.19.5
nvm use v20.19.5
node --version   # v20.19.5
npm --version    # 10.8.4
```

> Le monorepo lui-même fonctionne avec Node >= 18. La contrainte v20 ne s'applique
> qu'au build du frontend Superset (étapes 8–9).

---

## 2 — Récupération des projets

Créer un dossier de travail qui contiendra les deux dépôts côte à côte :

```bash
mkdir dev_plugin_superset
cd dev_plugin_superset
```

### Cloner le monorepo de plugins

```bash
git clone git@github.com:Cosmo-Tech/cosmotech-viz-plugins.git
cd cosmotech-viz-plugins
yarn install
cd ..
```

Yarn Workspaces installe toutes les dépendances de la racine et de chaque package en une
seule passe.

### Cloner Superset 6.0.0

```bash
git clone --branch 6.0.0 --depth 1 https://github.com/apache/superset.git
```

L'arborescence obtenue :

```
dev_plugin_superset/
├── cosmotech-viz-plugins/   ← monorepo de plugins
└── superset/                ← frontend + backend Superset
```

---

## 3 — Structure du monorepo

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
│   └── core/                        ← @cosmotech/core — composants partagés
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

## 4 — Commandes disponibles

Toutes les commandes s'exécutent depuis la racine du monorepo.

| Commande            | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `yarn plugin:init`  | Scaffold un nouveau plugin depuis `plugin_template/`     |
| `yarn build`        | Build production de tous les packages (CJS + ESM)        |
| `yarn build:dev`    | Watch mode — recompile à chaque modification             |
| `yarn test`         | Lance tous les tests unitaires                           |
| `yarn test:watch`   | Tests en mode watch                                      |
| `yarn lint`         | Analyse ESLint sur tous les `src/` de chaque package     |
| `yarn lint:root`    | Analyse ESLint sur les fichiers racine (scripts, config) |
| `yarn format`       | Formate tous les fichiers avec Prettier                  |
| `yarn format:check` | Vérifie le formatage sans modifier (utilisé en CI)       |
| `yarn clean`        | Supprime les dossiers `dist/`, `esm/`, `coverage/`       |

Pour cibler un seul package :

```bash
yarn workspace @cosmotech/plugin-mon-graphique build
yarn workspace @cosmotech/plugin-mon-graphique test
```

---

## 5 — Créer un nouveau plugin

Un générateur en ligne de commande est intégré au monorepo. Il copie `plugin_template/`,
remplace les tokens et renomme les fichiers automatiquement.

### Lancer le générateur

```bash
yarn plugin:init
```

Le script pose trois questions :

```
Plugin name (kebab-case, e.g. my-chart): mon-graphique
Display name (e.g. My Chart): Mon Graphique
Description: Visualisation personnalisée de données
```

- **Plugin name** — identifiant kebab-case, devient le nom npm `@cosmotech/plugin-<nom>`
  et le nom du sous-dossier dans `plugins/`.
- **Display name** — nom affiché dans l'interface Superset.
- **Description** — description courte (readme, metadata).

Le script génère `plugins/mon-graphique/` avec la structure complète, ajoute
automatiquement le plugin à la matrice de publication dans `release.yml`, et génère
le fichier `thumbnail.ts` (encodage base64 du PNG) :

```
plugins/mon-graphique/
├── src/
│   ├── MonGraphique.tsx       ← Composant React (renommé depuis __PLUGIN_CLASS_NAME__.tsx)
│   ├── index.ts
│   ├── types.ts
│   ├── images/thumbnail.png
│   ├── images/thumbnail.ts   ← Thumbnail encodé en base64 (généré automatiquement)
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

### Installer les dépendances du nouveau plugin

```bash
yarn install
```

Yarn Workspaces détecte automatiquement le nouveau package et installe ses dépendances.

### Fichiers à adapter

Le code généré est fonctionnel dès la sortie du générateur. Les fichiers à modifier
en priorité pour implémenter la visualisation :

| Fichier                        | Ce qu'il faut modifier                                             |
| ------------------------------ | ------------------------------------------------------------------ |
| `src/MonGraphique.tsx`         | Remplacer le rendu `<pre>` par la visualisation réelle             |
| `src/types.ts`                 | Adapter les interfaces `FormData` et `Props` aux données du plugin |
| `src/plugin/buildQuery.ts`     | Adapter les colonnes/métriques à requêter                          |
| `src/plugin/controlPanel.ts`   | Ajouter/modifier les contrôles du panneau Superset                 |
| `src/plugin/transformProps.ts` | Adapter la transformation réponse API → props React                |

> **Important** : utiliser `@superset-ui/core@0.20.4` et `@superset-ui/chart-controls@0.20.3`.
> Les versions `2.x` sont publiées sur npm sans artefacts de build — elles ne fonctionnent pas.

---

## 6 — Anatomie d'un plugin

Un plugin Superset expose cinq éléments obligatoires :

```
plugins/mon-graphique/src/
├── index.ts            ← Export de la classe Plugin (extends ChartPlugin)
├── plugin/
│   ├── index.ts        ← Classe MonGraphiquePlugin
│   ├── buildQuery.ts   ← Traduit la config du panneau → requête SQL/API Superset
│   ├── transformProps.ts  ← Transforme la réponse API → props React
│   └── controlPanel.ts ← Définit les contrôles du panneau de configuration
└── MonGraphique.tsx    ← Composant React qui effectue le rendu
```

### Classe Plugin (`src/plugin/index.ts`)

```typescript
import { ChartPlugin, ChartMetadata } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail';

export default class MonGraphiquePlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../MonGraphique'), // chargement dynamique
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

## 7 — Build et tests locaux

### Vérifier le build

```bash
# Un seul plugin
yarn workspace @cosmotech/plugin-mon-graphique build

# Tous les packages
yarn build
```

### Stratégie de build (TypeScript 5.1)

TypeScript 5.1 interdit `module: CommonJS` avec `moduleResolution: bundler`. Le build
de chaque plugin utilise donc trois étapes complémentaires :

| Étape               | Outil | Rôle                                                          |
| ------------------- | ----- | ------------------------------------------------------------- |
| `tsconfig.json`     | `tsc` | Génère les `.d.ts` dans `dist/` (`emitDeclarationOnly: true`) |
| `tsconfig.esm.json` | `tsc` | Génère le JS ESM dans `esm/` (`module: ESNext`)               |
| `babel.config.js`   | Babel | Génère le JS CommonJS dans `dist/` (sans contrôle de type)    |

Le root tsconfig utilise `moduleResolution: bundler` + `module: ESNext`. Pour éviter le
conflit, `emitDeclarationOnly: true` fait que `tsc` ne génère que les `.d.ts`, pas de JS.
Babel se charge de la transpilation CJS.

Options TypeScript activées : `strict`, `noUnusedLocals`, `noUnusedParameters`,
`noImplicitReturns`. Les plugins ajoutent `noImplicitAny: false` pour la compatibilité avec
les template literals Emotion.

### Lancer les tests

Les tests utilisent **Jest** + **@testing-library/react**. Chaque package a son propre
`jest.config.js`. La commande `yarn test` racine découvre automatiquement toutes les suites.

```bash
# Un seul plugin
yarn workspace @cosmotech/plugin-mon-graphique test

# Tous les packages
yarn test
```

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

### Lancer le lint et le formatage

```bash
yarn lint
yarn format:check
```

### Vérification complète avant commit

```bash
yarn build && yarn lint && yarn format:check && yarn test
```

---

## 8 — Démarrer Superset en local (Docker)

Le backend Superset tourne dans un container Docker. Le frontend sera lancé séparément
en mode développement (étape 9).

### Créer `docker-compose.simple.yml`

Dans le dossier `dev_plugin_superset/superset`, créer le fichier :

```yaml
services:
  superset:
    image: apache/superset:6.0.0
    container_name: superset_dev
    ports:
      - '8088:8088'
    environment:
      - SUPERSET_SECRET_KEY=change-this-in-production
      - SUPERSET_ENV=production
      - PYTHONPATH=/app/pythonpath
    volumes:
      - ./superset_config.py:/app/pythonpath/superset_config.py:ro
      - ./ma-base.db:/app/ma-base.db:ro
      - superset_home:/app/superset_home
    command: >
      bash -c "
      superset db upgrade &&
      superset fab create-admin --username admin --firstname Admin --lastname User --email admin@admin.com --password admin 2>/dev/null || true &&
      superset init &&
      superset run -h 0.0.0.0 -p 8088 --with-threads --reload --debugger
      "
    restart: unless-stopped

volumes:
  superset_home:
```

### Créer `superset_config.py`

Dans le même dossier `dev_plugin_superset/superset` :

```python
PREVENT_UNSAFE_DB_CONNECTIONS = False

# Désactiver la compression HTTP côté backend.
# Le proxy webpack (processHTML) n'a pas à décompresser les réponses
# → évite le contenu binaire illisible sur Windows.
COMPRESS_REGISTER = False
COMPRESS_ENABLED = False

# Cookies de session accessibles depuis le dev server (localhost:9000)
SESSION_COOKIE_SAMESITE = None
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_HTTPONLY = False

WTF_CSRF_ENABLED = False

# Désactiver CSP pour le développement local
TALISMAN_ENABLED = False
TALISMAN_CONFIG = {
    "content_security_policy": False,
    "force_https": False,
    "force_https_permanent": False,
}
```

> ⚠️ **Ne pas ajouter `ENABLE_CORS = True`** — ce paramètre tente d'importer `flask_cors`
> qui n'est pas disponible dans l'image Docker et fait crasher le container.
> CORS n'est pas nécessaire : tout passe par le proxy webpack
> (`browser → localhost:9000 → proxy → Flask`), Flask ne reçoit jamais de requêtes cross-origin.

### Lancer le backend

```bash
cd dev_plugin_superset/superset
docker compose -f docker-compose.simple.yml up -d
docker logs -f superset_dev   # attendre "Running on http://0.0.0.0:8088"
```

---

## 9 — Intégrer le plugin dans Superset

> **Prérequis :** basculer sur Node v20 (`nvm use v20.19.5`) pour le frontend Superset.

### 9.1 — Ajouter le plugin comme dépendance locale

Dans `dev_plugin_superset/superset/superset-frontend/package.json`, ajouter dans
`dependencies` une référence `file:` vers le plugin :

```json
{
  "dependencies": {
    "@cosmotech/plugin-mon-graphique": "file:../../cosmotech-viz-plugins/plugins/mon-graphique"
  }
}
```

Puis installer :

```bash
cd dev_plugin_superset/superset/superset-frontend
npm install
```

### 9.2 — Enregistrer le plugin dans MainPreset.js

Fichier :
`superset/superset-frontend/src/visualizations/presets/MainPreset.js`

Ajouter l'import avec les autres imports :

```javascript
import { MonGraphiquePlugin } from '@cosmotech/plugin-mon-graphique';
```

Ajouter dans le tableau `configure` :

```javascript
new MonGraphiquePlugin().configure({ key: 'mon-graphique' }),
```

### 9.3 — Démarrer le dev-server frontend

```bash
cd dev_plugin_superset/superset/superset-frontend
npm run dev-server
```

### Accès

| URL                   | Usage                                  |
| --------------------- | -------------------------------------- |
| http://localhost:9000 | Frontend dev (avec hot-reload webpack) |
| http://127.0.0.1:8088 | Backend direct (API Flask)             |

Login : `admin` / `admin`

---

## 10 — Cycle de développement

Une fois l'environnement en place, le workflow itératif est le suivant :

1. **Modifier** le code du plugin dans `cosmotech-viz-plugins/plugins/mon-graphique/src/`.
2. **Rebuilder** le plugin :
   ```bash
   cd cosmotech-viz-plugins
   yarn workspace @cosmotech/plugin-mon-graphique build
   ```
3. **Réinstaller** dans Superset pour que le lien `file:` prenne en compte les changements :
   ```bash
   cd ../superset/superset-frontend
   npm install
   ```
4. **Recharger** le dev-server (redémarrer `npm run dev-server` ou attendre le hot-reload).
5. **Tester** dans le navigateur sur http://localhost:9000.
6. **Valider** avant commit :
   ```bash
   cd cosmotech-viz-plugins
   yarn build && yarn lint && yarn format:check && yarn test
   ```

---

## 11 — Package partagé `@cosmotech/core`

`packages/core` contient les composants et utilitaires réutilisables entre plugins.

Pour utiliser `core` dans un plugin, l'ajouter en dépendance :

```json
{
  "dependencies": {
    "@cosmotech/core": "*"
  }
}
```

Puis importer :

```typescript
import { MonUtilitaire } from '@cosmotech/core';
```

Pour ajouter un export à `core`, modifier `packages/core/src/index.ts` puis relancer
`yarn build`.

---

## 12 — Conventions de commits

Lerna utilise `conventionalCommits: true`.
Préfixes [Conventional Commits](https://www.conventionalcommits.org/) :

| Préfixe     | Usage                                   |
| ----------- | --------------------------------------- |
| `feat:`     | Nouvelle fonctionnalité                 |
| `fix:`      | Correction de bug                       |
| `chore:`    | Maintenance (deps, build…)              |
| `docs:`     | Documentation                           |
| `test:`     | Tests                                   |
| `refactor:` | Refactoring sans changement fonctionnel |

---

## 13 — CI/CD

### Workflow de CI — `.github/workflows/ci.yml`

Déclenché automatiquement sur **tout push** et toute **pull request**.

```
trigger : push (toutes branches) + pull_request
runner  : ubuntu-latest, Node.js 22

étapes :
  1. Checkout du code
  2. Setup Node.js 22 (avec cache Yarn)
  3. yarn install --frozen-lockfile
  4. yarn build        ← build CJS + ESM de tous les packages
  5. yarn lint         ← ESLint sur tous les src/
  6. yarn format:check ← vérification Prettier (fail si non formaté)
  7. yarn test         ← Jest sur tous les packages
```

> `yarn format:check` exclut `plugin_template/src`, `plugin_template/test` et
> `plugin_template/types` via `.prettierignore` — ces répertoires contiennent des tokens
> `{{...}}` qui ne sont pas du TypeScript valide.

### Workflow de release — `.github/workflows/release.yml`

Déclenché automatiquement sur **push sur la branche main**.

```
trigger : push sur main
runner  : ubuntu-latest, Node.js 20

Job 1 — publish (matrice parallèle par plugin) :
  1. Checkout du code
  2. Setup Node.js 20 (avec cache Yarn + registry npm)
  3. yarn install --frozen-lockfile
  4. yarn workspace @cosmotech/plugin-<name> build
  5. Vérification si la version existe déjà sur npm
  6. Détermination du dist-tag (latest, beta, alpha…)
  7. npm publish --access public --tag <dist-tag>

Job 2 — release (après publish) :
  1. Checkout monorepo + checkout apache/superset
  2. yarn install --frozen-lockfile
  3. Injection des plugins dans Superset (prepare_build.sh)
  4. Build et push de l'image Docker sur GHCR
```

La matrice `plugin:` dans `release.yml` est mise à jour automatiquement par
`yarn plugin:init`. Chaque nouveau plugin ajouté est publié en parallèle avec
`fail-fast: false`.

### Variables d'environnement CI

| Variable                    | Rôle                                               |
| --------------------------- | -------------------------------------------------- |
| `GITHUB_WORKSPACE`          | Chemin racine du workspace GitHub Actions          |
| `PROJECT_WORKING_DIRECTORY` | Chemin relatif du monorepo dans le workspace       |
| `PRESET_NAME`               | Nom du Preset Superset à générer (ex: `CosmoTech`) |
| `PLUGINS_EXTRA_FILENAME`    | Nom du fichier `setupPluginsExtra` à générer       |
