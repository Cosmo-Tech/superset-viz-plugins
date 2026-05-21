# cosmotech-viz-plugins

Monorepo de plugins de visualisation personnalisés pour [Apache Superset](https://superset.apache.org/).

Superset 6.x supporte le **chargement dynamique de plugins** : chaque plugin est compilé en un
bundle webpack autonome versionné, servi par un serveur HTTP et chargé à la volée par le frontend
Superset sans nécessiter de rebuild.

> Documentation complète dans le dossier [`docs/`](docs/) :
> [Vue d'ensemble](docs/PROJECT-OVERVIEW.md) · [Parcours développeur](docs/DEVELOPER-JOURNEY.md) · [Contexte agent IA](docs/AGENT-CONTEXT.md)

---

## Prérequis

| Outil   | Version minimale | Installation                     |
| ------- | ---------------- | -------------------------------- |
| Node.js | >= 18            | [nodejs.org](https://nodejs.org) |
| Yarn    | >= 1.22          | `npm install -g yarn`            |
| Docker  | Version récente  | [docker.com](https://docker.com) |

---

## Installation

```bash
git clone git@github.com:Cosmo-Tech/cosmotech-viz-plugins.git
cd cosmotech-viz-plugins
yarn install
```

---

## Commandes principales

| Commande                | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `yarn plugin:init`      | Scaffold un nouveau plugin depuis `plugin_template/`           |
| `yarn plugin:pipeline`  | Pipeline complet sur un plugin (lint + test + build + package) |
| `yarn plugin:package`   | Package un seul plugin (thumbnail + patch + webpack build)     |
| `yarn plugins:package`  | Package tous les plugins                                       |
| `yarn plugin:thumbnail` | Régénère `thumbnail.ts` depuis `thumbnail.png` d'un plugin     |
| `yarn build`            | Build production de tous les packages (CJS + ESM)              |
| `yarn test`             | Lance tous les tests unitaires                                 |
| `yarn lint`             | Analyse ESLint sur tous les packages                           |
| `yarn format`           | Formate tous les fichiers avec Prettier                        |
| `yarn format:check`     | Vérifie le formatage (CI)                                      |
| `yarn clean`            | Supprime `dist/`, `esm/`, `coverage/`                          |

Pour cibler un seul plugin :

```bash
yarn workspace @cosmotech/plugin-<nom> build
yarn workspace @cosmotech/plugin-<nom> test
yarn workspace @cosmotech/plugin-<nom> lint
```

---

## Créer un nouveau plugin

```bash
yarn plugin:init
```

Le générateur pose trois questions (nom kebab-case, nom d'affichage, description) et scaffolde
un plugin complet et fonctionnel dans `plugins/<nom>/`.

---

## Packaging et déploiement local

Les plugins sont compilés en bundles webpack autonomes pour le chargement dynamique Superset :

```bash
# Un seul plugin
yarn plugin:package plugins/hello-world

# Tous les plugins
yarn plugins:package
```

Sortie : `plugins/versions/<nom>/<version>/index.js`

### Environnement Docker local

```bash
cd docker
./docker_build.sh              # première fois uniquement
docker compose up -d
```

Services démarrés :

| Service         | URL                   | Description                     |
| --------------- | --------------------- | ------------------------------- |
| Superset        | http://localhost:8088 | Interface BI (admin / admin)    |
| PostgreSQL      | localhost:5435        | Base de données                 |
| Plugins (nginx) | http://localhost      | Sert les bundles JS des plugins |

Une fois packagé, un plugin est accessible via `http://localhost/<nom>/<version>/index.js`
et peut être enregistré dans Superset via le menu **Settings → Plugins**.

---

## Structure du dépôt

```
cosmotech-viz-plugins/
├── plugins/                  ← Un sous-dossier = un plugin npm indépendant
│   ├── hello-world/          ← Plugin de démonstration
│   └── organizational-chart/ ← Plugin d'arbre hiérarchique de KPI
├── plugin_template/          ← Gabarit utilisé par `yarn plugin:init`
├── scripts/                  ← Scripts de build et packaging
│   ├── initPlugin.js         ← Génération d'un nouveau plugin
│   ├── plugin_pipeline.js    ← Pipeline complet (lint+test+build+package)
│   ├── package_plugin.js     ← Packaging d'un seul plugin
│   ├── package_plugins.js    ← Packaging de tous les plugins
│   ├── generate_thumbnail.js ← Génère thumbnail.ts depuis thumbnail.png
│   ├── patch_webpack.js      ← Injecte la config webpack ESM
│   ├── patch_index_ts.js     ← Auto-registration pour chargement dynamique
│   ├── build_plugin.js       ← Build webpack d'un plugin
│   └── webpack.config.js     ← Config webpack template
├── docker/                   ← Environnement de développement Docker
│   ├── docker-compose.yaml   ← Superset + PostgreSQL + nginx
│   ├── Dockerfile            ← Image Superset custom avec dépendances Python
│   ├── docker_build.sh       ← Script de build de l'image
│   ├── nginx-plugins.conf    ← Config nginx pour servir les plugins
│   └── superset_config.py    ← Configuration Python de Superset
├── docs/                     ← Documentation complète
├── .github/workflows/ci.yml  ← CI : build + lint + format + test
├── lerna.json                ← Lerna v9, independent versioning
├── package.json              ← Workspaces + scripts racine
└── tsconfig.json             ← Configuration TypeScript partagée
```

---

## Stack technique

| Outil                           | Version | Rôle                                           |
| ------------------------------- | ------- | ---------------------------------------------- |
| **TypeScript**                  | 5.1.x   | Langage principal                              |
| **React**                       | 19.x    | Framework UI des composants                    |
| **@superset-ui/core**           | 0.20.4  | SDK Superset (types + utilitaires)             |
| **@superset-ui/chart-controls** | 0.20.3  | Panneau de contrôle Superset                   |
| **Lerna v9**                    | 9.x     | Orchestration monorepo                         |
| **Webpack 5**                   | 5.x     | Bundling des plugins pour chargement dynamique |
| **Babel**                       | 7.x     | Transpilation TypeScript/TSX → JavaScript      |
| **Jest**                        | 29.x    | Tests unitaires                                |
| **ESLint + Prettier**           | —       | Lint et formatage                              |

---

## Documentation

| Document                                                       | Contenu                                          |
| -------------------------------------------------------------- | ------------------------------------------------ |
| [docs/PROJECT-OVERVIEW.md](docs/PROJECT-OVERVIEW.md)           | Architecture, stack, flux CI/CD                  |
| [docs/DEVELOPER-JOURNEY.md](docs/DEVELOPER-JOURNEY.md)         | Onboarding complet, créer un plugin, conventions |
| [docs/AGENT-CONTEXT.md](docs/AGENT-CONTEXT.md)                 | Contraintes techniques, détail des scripts       |
| [docs/HOW-TO-BUILD-A-PLUGIN.md](docs/HOW-TO-BUILD-A-PLUGIN.md) | Tutoriel de création de plugin Superset          |

---

## CI/CD

Le workflow `.github/workflows/ci.yml` s'exécute sur tout push et toute PR :

1. `yarn install --frozen-lockfile`
2. `yarn build`
3. `yarn lint`
4. `yarn format:check`
5. `yarn test`

---

## Licence

Apache-2.0
