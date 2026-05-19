# Parcours développeur — Cosmotech Viz Plugins

Guide complet pour créer, développer et tester un plugin de visualisation Apache Superset.

Version Superset cible : **6.0.0**

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
11. [Conventions de commits](#11--conventions-de-commits)
12. [CI/CD](#12--cicd)
13. [Packaging des plugins pour chargement dynamique](#13--packaging-des-plugins-pour-chargement-dynamique-superset)

---

## 1 — Prérequis techniques

### Outils requis

| Outil   | Version         | Installation                                | Remarque                                |
| ------- | --------------- | ------------------------------------------- | --------------------------------------- |
| Node.js | >= 18           | [nodejs.org](https://nodejs.org)            | Requis pour le monorepo                 |
| Yarn    | >= 1.22         | `npm install -g yarn`                       | Yarn Classic (pas Yarn Berry)           |
| Docker  | Version récente | [docker.com](https://docker.com)            | Requis pour Superset + PostgreSQL local |
| nvm     | —               | [nvm-sh/nvm](https://github.com/nvm-sh/nvm) | Recommandé pour gérer les versions Node |

### Vérifier l'environnement

```bash
node --version       # >= 18
yarn --version       # >= 1.22
docker --version
docker-compose version
```

---

## 2 — Récupération des projets

### Cloner le monorepo de plugins

```bash
git clone git@github.com:Cosmo-Tech/cosmotech-viz-plugins.git
cd cosmotech-viz-plugins
yarn install
```

Yarn Workspaces installe toutes les dépendances de la racine et de chaque package en une
seule passe.

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
├── scripts/
│   ├── initPlugin.js                ← Scaffold d'un plugin depuis plugin_template/
│   ├── plugin_pipeline.js           ← Pipeline complet sur un plugin (lint+test+build+package)
│   ├── package_plugins.js           ← Orchestre le packaging webpack de tous les plugins
│   ├── package_plugin.js            ← Packaging d'un seul plugin (patch + build)
│   ├── patch_webpack.js             ← Injecte webpack.config.js pour ESM + externals
│   ├── patch_index_ts.js            ← Ajoute l'auto-registration dans index.ts
│   ├── build_plugin.js              ← Build webpack d'un plugin → versions/<name>/<v>/index.js
│   └── webpack.config.js            ← Config webpack utilisée par patch_webpack
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

| Commande                | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `yarn plugin:init`      | Scaffold un nouveau plugin depuis `plugin_template/`           |
| `yarn plugin:pipeline`  | Pipeline complet sur un plugin (lint + test + build + package) |
| `yarn plugin:package`   | Package un seul plugin (patch + build webpack)                 |
| `yarn plugins:package`  | Package tous les plugins (découverte + patch + build)          |
| `yarn plugin:thumbnail` | Régénère `thumbnail.ts` depuis `thumbnail.png` d'un plugin     |
| `yarn build`            | Build production de tous les packages (CJS + ESM)              |
| `yarn build:dev`        | Watch mode — recompile à chaque modification                   |
| `yarn test`             | Lance tous les tests unitaires                                 |
| `yarn test:watch`       | Tests en mode watch                                            |
| `yarn lint`             | Analyse ESLint sur tous les `src/` de chaque package           |
| `yarn lint:root`        | Analyse ESLint sur les fichiers racine (scripts, config)       |
| `yarn format`           | Formate tous les fichiers avec Prettier                        |
| `yarn format:check`     | Vérifie le formatage sans modifier (utilisé en CI)             |
| `yarn clean`            | Supprime les dossiers `dist/`, `esm/`, `coverage/`             |

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

Le script génère `plugins/mon-graphique/` avec la structure complète et génère
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

### Note sur le thème Superset 6.0.0

Superset 6.0.0 a migré vers un système de thème basé sur les **tokens Ant Design v5**.
L'ancien API imbriqué (`theme.gridUnit`, `theme.typography.*`, `theme.colors.grayscale.*`)
exporté par `@superset-ui/core@0.20.4` **n'existe plus au runtime**.

Pour éviter les erreurs de type `Cannot read properties of undefined`, le composant React
du plugin doit utiliser des **styles inline** (`React.CSSProperties`) plutôt que le
`styled` de `@superset-ui/core`. Cette approche est compatible avec toutes les versions
de Superset.

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
les dépendances `@superset-ui/core` dont certains types ne sont pas complets.

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

L'environnement de développement local est entièrement contenu dans le dossier `docker/` du
monorepo. Il comprend Superset, une base PostgreSQL et un serveur nginx pour servir les plugins.

### Première utilisation : construire l'image Docker

L'image `cosmotech/superset-dev:6.0.0` est basée sur l'image officielle Superset avec les
dépendances Python supplémentaires pré-installées (`psycopg2-binary`, `authlib`, `mysqlclient`).

```bash
cd docker
./docker_build.sh
```

Cette commande n'est à exécuter qu'une seule fois (ou après modification du `Dockerfile`).

### Démarrer les services

```bash
cd docker
docker-compose up -d
```

### Services disponibles

| Service         | URL                   | Description                                   |
| --------------- | --------------------- | --------------------------------------------- |
| Superset        | http://localhost:8088 | Interface Superset (login: `admin` / `admin`) |
| PostgreSQL      | localhost:5435        | Base de données (user: `admin` / `admin`)     |
| Plugins (nginx) | http://localhost      | Sert les bundles JS des plugins packagés      |

### Arrêter les services

```bash
cd docker
docker-compose down
```

> Les données PostgreSQL sont persistées dans un volume Docker nommé `postgres-data`.
> Pour réinitialiser la base : `docker-compose down -v`.

---

## 9 — Intégrer le plugin dans Superset

Une fois un plugin packagé, son bundle webpack est disponible dans
`plugins/versions/<nom du plugin>/<version>/index.js`. Le service nginx du docker-compose sert ce
dossier sur `http://localhost/<nom du plugin>/<version>/index.js`, rendant chaque bundle accessible via une URL directe.

### 9.1 — Packager le plugin

```bash
yarn plugin:pipeline plugins/mon-graphique
```

Le fichier de sortie sera par exemple :
`plugins/versions/mon-graphique/0.1.0/index.js`

### 9.2 — Enregistrer le plugin dans Superset

1. Se connecter à Superset : http://localhost:8088 (login: `admin` / `admin`)
2. Aller dans le menu **Settings → Plugins**
3. Cliquer sur **+ Plugin** et remplir les champs :

| Champ | Valeur                                          |
| ----- | ----------------------------------------------- |
| Name  | Mon Graphique                                   |
| Key   | `mon-graphique`                                 |
| URL   | `http://localhost/mon-graphique/0.1.0/index.js` |

L'URL est construite selon le pattern :

```
http://localhost/<nom-du-plugin>/<version>/index.js
```

> Les fichiers sont servis par le service **plugins-server** (nginx) défini dans le
> docker-compose, qui monte le dossier `plugins/versions/` en lecture seule et expose
> les bundles sur le port 80 avec le MIME type `application/javascript` et les headers CORS.

### 9.3 — Utiliser le plugin

Une fois enregistré, le plugin apparaît dans la liste des types de graphiques disponibles dans la section `Others/Autres`

---

## 10 — Cycle de développement

### Architecture des services Docker

Le fichier `docker/docker-compose.yaml` définit trois services qui fonctionnent ensemble :

```
┌─────────────────────────────────────────────────────────────────────────┐
│  docker-compose up                                                      │
│                                                                         │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────────────┐  │
│  │  superset        │    │  postgres         │    │  plugins-server   │  │
│  │  :8088           │───▶│  :5432 (int)      │    │  :80 (nginx)      │  │
│  │  Interface BI    │    │  Base de données  │    │  Sert les .js     │  │
│  └─────────────────┘    └──────────────────┘    └───────────────────┘  │
│         │                                              ▲                │
│         │  charge les plugins via URL                  │                │
│         └──────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
                                                         ▲
                                                         │ monte en lecture
                                                         │
                                               plugins/versions/
                                               └── mon-graphique/
                                                   └── 0.1.0/
                                                       └── index.js
```

- **superset** — Instance Superset complète (backend + frontend). Se connecte à PostgreSQL
  pour stocker sa configuration (dashboards, datasets, utilisateurs).
- **postgres** — Base de données PostgreSQL accessible depuis Superset via le réseau interne
  Docker (`postgres:5432`). Exposée sur l'hôte sur le port `5435` pour un accès externe
  (DBeaver, pgAdmin).
- **plugins-server** — Serveur nginx qui sert les bundles webpack des plugins depuis
  `plugins/versions/`. Superset charge dynamiquement les plugins via l'URL
  `http://localhost/<nom du plugin>/<version>/index.js` depuis le navigateur.

### Workflow itératif

Une fois l'environnement Docker démarré et les plugins enregistrés dans Superset (section 9),
le cycle de développement est le suivant :

1. **Modifier** le code du plugin dans `plugins/mon-graphique/src/`.

2. **Packager** le plugin pour mettre à jour le bundle servi par nginx :

   ```bash
   yarn plugin:pipeline plugins/mon-graphique
   ```

   Ou pour un cycle complet avec lint + test + build + package :

   ```bash
   yarn plugin:pipeline plugins/mon-graphique
   ```

3. **Recharger** la page dans Superset (http://localhost:8088). Le plugin est rechargé
   dynamiquement depuis le serveur nginx — pas besoin de redémarrer les containers.

4. **Tester** la visualisation sur un dataset connecté à la base PostgreSQL.

5. **Valider** avant commit :
   ```bash
   yarn build && yarn lint && yarn format:check && yarn test
   ```

> **Astuce** : le packaging (`yarn plugin:pipeline`) lance successivement yarn lint, yarn test, yarn build et yarn plugin:package. Si la commande tourne sans erreur, le plugin est mis à jour automatiquement dans l'environnement local.

---

## 11 — Conventions de commits

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

## 12 — CI/CD

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

---

## 13 — Packaging des plugins pour chargement dynamique Superset

Superset 6.x supporte le **chargement dynamique de plugins** : chaque plugin est compilé en un
bundle webpack autonome versionné qui est chargé à la volée par le frontend.

Les scripts dans `scripts/` automatisent ce processus de packaging.

### Structure de sortie

```
plugins/
└── versions/
    └── hello-world/
        └── 0.1.0/
            ├── index.js           ← sans suffixe
            └── index-beta.js      ← avec --suffix beta
```

### Pipeline de packaging

```
package_plugins.js [--suffix <suffix>]
  └── Pour chaque plugin détecté dans plugins/ :
        1. generate_thumbnail.js → Régénère thumbnail.ts si thumbnail.png a été modifié
        2. patch_webpack.js      → Injecte la config webpack (ESM, externals)
        3. patch_index_ts.js     → Ajoute l'auto-registration (.configure/.register)
        4. build_plugin.js       → npm install + webpack-cli → <plugins-dir>/versions/<name>/<version>/index[-suffix].js
```

### Commandes

```bash
# Pipeline complet sur un plugin (lint + test + build + package) :
yarn plugin:pipeline plugins/hello-world
yarn plugin:pipeline plugins/hello-world --suffix beta

# Packager TOUS les plugins d'un coup :
yarn plugins:package
# ou directement : node scripts/package_plugins.js

# Packager un seul plugin (sans lint/test/build) :
yarn plugin:package plugins/hello-world
# ou directement : node scripts/package_plugin.js plugins/hello-world

# Avec un suffixe (ex: identifiant de branche, tag de release) :
yarn plugins:package --suffix beta
yarn plugin:package plugins/hello-world --suffix beta

# Avec un dossier de plugins personnalisé :
yarn plugins:package --plugins-dir /chemin/vers/plugins

# Régénérer le thumbnail d'un plugin :
yarn plugin:thumbnail plugins/hello-world

# Scripts individuels (usage avancé) :
node scripts/generate_thumbnail.js plugins/hello-world
node scripts/patch_webpack.js plugins/hello-world
node scripts/patch_index_ts.js plugins/hello-world
node scripts/build_plugin.js plugins/hello-world
node scripts/build_plugin.js plugins/hello-world --suffix rc1
```

### Détail des scripts

| Script                  | Rôle                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `plugin_pipeline.js`    | Pipeline complet sur un plugin : lint + test + build (lerna) puis package (patch + webpack)               |
| `package_plugins.js`    | Orchestre l'ensemble : découvre les plugins et lance les 4 étapes sur chacun                              |
| `package_plugin.js`     | Package un seul plugin (thumbnail + patch_webpack + patch_index_ts + build_plugin)                        |
| `generate_thumbnail.js` | Génère `src/images/thumbnail.ts` (base64 data URL) depuis `src/images/thumbnail.png`                      |
| `patch_webpack.js`      | Copie `scripts/webpack.config.js` dans le plugin (sauvegarde l'original en `.original`)                   |
| `patch_index_ts.js`     | Ajoute `.configure({ key: '<PluginName>' }).register()` dans `src/index.ts`                               |
| `build_plugin.js`       | Installe les dépendances webpack puis lance `webpack-cli` → `versions/<name>/<version>/index[-suffix].js` |

### Comment `patch_index_ts.js` fonctionne

Le script transforme l'export par défaut du plugin en auto-registration :

```typescript
// Avant (source dans git)
export { default as HelloWorldPlugin } from './plugin';

// Après (injection par patch_index_ts.js — deploy-time uniquement)
import { default as HelloWorldPlugin } from './plugin';
new HelloWorldPlugin().configure({ key: 'hello-world' }).register();
```

> **Important** : cette modification est appliquée uniquement au moment du packaging pour
> déploiement. Le fichier `src/index.ts` dans git ne doit **jamais** contenir ce code
> d'auto-registration — il casserait les tests unitaires.

### Comment `build_plugin.js` fonctionne

1. Lit la version depuis `package.json`
2. Vérifie/ajoute un script `build-dist` dans `package.json`
3. Lance `npm install` si `node_modules/` n'existe pas
4. Installe les dépendances de build manquantes (webpack, ts-loader, babel-loader, etc.)
5. Exécute `npx webpack-cli` avec `--output-path <plugins-dir>/versions/<name>/<version>` et `--output-filename index[-suffix].js`
6. Vérifie que le fichier de sortie a été produit

### Prérequis

- Node.js >= 18 / npm (pour les builds webpack)
- Les plugins doivent avoir un `package.json` et un `src/index.ts`
