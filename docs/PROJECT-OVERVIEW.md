# Vue d'ensemble du projet

## Qu'est-ce que ce projet ?

Ce dépôt est un **monorepo de plugins de visualisation custom pour Apache Superset**, un outil de Business Intelligence open source.

Il permet à des équipes qui opèrent leur propre instance Superset d'**ajouter des types de graphiques sur-mesure** non disponibles nativement dans Superset, de les versionner sous forme de packages npm, et de les embarquer automatiquement dans une image Docker prête à déployer.

---

## Architecture générale

```
cosmotech-viz-plugins/
├── plugins/                  ← Chaque sous-dossier est un plugin npm indépendant
│   └── hello-world/
├── plugin_template/          ← Gabarit de plugin (utilisé par `yarn plugin:init`)
├── scripts/                  ← Scripts de build/packaging
│   ├── initPlugin.js         ← Génère un nouveau plugin depuis plugin_template/
│   ├── plugin_pipeline.js    ← Pipeline complet sur un plugin (lint+test+build+package)
│   ├── package_plugins.js    ← Packaging webpack de tous les plugins
│   ├── package_plugin.js     ← Packaging d'un seul plugin (patch + build)
│   ├── generate_thumbnail.js ← Génère thumbnail.ts depuis thumbnail.png (base64 data URL)
│   ├── patch_webpack.js      ← Injecte webpack.config.js ESM + externals
│   ├── patch_index_ts.js     ← Auto-registration (.configure/.register)
│   ├── build_plugin.js       ← Build webpack d'un plugin → versions/<name>/<v>/index.js
│   └── webpack.config.js     ← Config webpack utilisée par patch_webpack
├── docs/                     ← Documentation du projet
├── .github/
│   └── workflows/
│       └── ci.yml            ← Build + Lint + Format check + Test (tout push/PR)
├── package.json              ← Racine du monorepo
├── lerna.json                ← Configuration Lerna pour la gestion du monorepo
└── tsconfig.json             ← Configuration TypeScript partagée
```

---

## Stack technique

| Outil                           | Version     | Rôle                                                           |
| ------------------------------- | ----------- | -------------------------------------------------------------- |
| **TypeScript**                  | 5.1.x       | Langage principal de tous les plugins                          |
| **React 19**                    | 19.x        | Framework UI des composants de visualisation                   |
| **recharts**                    | 2.x         | Bibliothèque de graphiques SVG basée sur React                 |
| **@superset-ui/core**           | 0.20.4      | Types et utilitaires du SDK Superset                           |
| **@superset-ui/chart-controls** | 0.20.3      | Construction du panneau de contrôle Superset                   |
| **Lerna v9**                    | 9.x         | Orchestration du monorepo (scripts, versions, publication npm) |
| **Babel**                       | 7.x         | Transpilation TypeScript/TSX → JavaScript CommonJS             |
| **Jest + @testing-library**     | 29.x / 16.x | Tests unitaires                                                |
| **ESLint + Prettier**           | 7.x / 3.x   | Lint et formatage du code                                      |

---

## Fonctionnement global — de la source à la production

```
┌─────────────────────────────────────────────────────────────────┐
│  Développeur                                                    │
│  └── crée/modifie un plugin dans plugins/*                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ git push
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Actions — ci.yml (tout push / toute PR)                 │
│  └── yarn install + yarn build + yarn lint                      │
│      + yarn format:check + yarn test                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Comment un plugin s'intègre dans Superset

Chaque plugin expose :

1. **Une classe Plugin** (`extends ChartPlugin`) qui enregistre le type de graphique dans le registre Superset
2. **Un `buildQuery`** qui traduit la configuration du panneau de contrôle en requête SQL/API Superset
3. **Un `transformProps`** qui transforme la réponse API en props passées au composant React
4. **Un panneau de contrôle** (`controlPanel`) qui définit les options configurables par l'utilisateur dans l'interface Superset
5. **Un composant React** qui effectue le rendu du graphique

---

## Comment initialiser un plugin

Un générateur intégré au monorepo scaffolde automatiquement un nouveau plugin depuis le gabarit
`plugin_template/`. Aucune dépendance extérieure n'est nécessaire.

```bash
yarn plugin:init
```

Le script pose trois questions :

```
Plugin name (kebab-case, e.g. my-chart): mon-graphique
Display name (e.g. My Chart): Mon Graphique
Description: Visualisation personnalisée de données
```

Le générateur crée `plugins/mon-graphique/` avec la structure complète (sources, tests, config),
les tokens `{{PACKAGE_NAME}}`, `{{PLUGIN_CLASS_NAME}}`, `{{PLUGIN_DISPLAY_NAME}}`, `{{DESCRIPTION}}`
remplacés dans tous les fichiers. Il suffit ensuite de :

```bash
yarn install
yarn workspace @cosmotech/plugin-mon-graphique build
```

---

## Packaging des plugins pour chargement dynamique

Superset 6.x permet le chargement dynamique de plugins : chaque plugin est compilé en bundle
webpack autonome chargé à la volée par le frontend.

Des scripts dans `scripts/` automatisent ce processus :

| Script               | Usage                                                                              |
| -------------------- | ---------------------------------------------------------------------------------- |
| `plugin_pipeline.js` | Pipeline complet sur un plugin : lint + test + build (lerna) puis package          |
| `package_plugins.js` | Orchestre l'ensemble — découvre et package tous les plugins                        |
| `package_plugin.js`  | Package un seul plugin (pipeline complet : patch + build)                          |
| `patch_webpack.js`   | Injecte une config webpack ESM avec externals dans un plugin                       |
| `patch_index_ts.js`  | Ajoute le code d'auto-registration (`.configure().register()`) dans `src/index.ts` |
| `build_plugin.js`    | Installe les dépendances webpack et compile un plugin versionné                    |

Sortie : `<plugins-dir>/versions/<plugin-name>/<version>/index[-suffix].js`

```bash
# Pipeline complet sur un plugin (lint + test + build + package) :
yarn plugin:pipeline plugins/hello-world
yarn plugin:pipeline plugins/hello-world --suffix beta

# Packager tous les plugins :
yarn plugins:package
# ou directement : node scripts/package_plugins.js

# Packager un seul plugin (sans lint/test/build) :
yarn plugin:package plugins/hello-world
# ou directement : node scripts/package_plugin.js plugins/hello-world

# Avec un suffixe :
yarn plugins:package --suffix beta
yarn plugin:package plugins/hello-world --suffix rc1

# Script individuel (build seul) :
node scripts/build_plugin.js plugins/hello-world
node scripts/build_plugin.js plugins/hello-world --suffix rc1
```

> **Note** : `patch_index_ts.js` modifie `src/index.ts` uniquement pour le déploiement —
> le code source dans git ne contient jamais l'auto-registration.

---

## Connexion manuelle à une instance Superset existante

Pour utiliser ces plugins sur une instance Superset existante sans Docker :

1. Remplacer `superset/superset-frontend/webpack.config.js` par le fichier [docs/webpack.config.js](./webpack.config.js)
2. Installer les packages npm des plugins dans le frontend Superset
3. Suivre [ce tutoriel](https://preset.io/blog/2020-07-02-hello-world/) pour enregistrer les plugins dans Superset
