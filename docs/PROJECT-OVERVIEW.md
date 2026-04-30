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
├── packages/
│   └── core/                 ← Package de composants partagés entre plugins
├── scripts/                  ← Scripts de build/release vers Superset
│   ├── initPlugin.js         ← Génère un nouveau plugin depuis plugin_template/
│   ├── addDependencies.js    ← Injecte les plugins dans le package.json cible
│   ├── copyAssets.js
│   ├── generatePreset.js     ← Injecte les imports/instanciations dans MainPreset.js
│   ├── generateSetupPluginsExtra.js
│   └── prepare_build.sh
├── docs/                     ← Documentation du projet
├── .github/
│   └── workflows/
│       ├── ci.yml            ← Build + Lint + Format check + Test (tout push/PR)
│       └── release.yml       ← npm publish (matrix) + Docker push (push sur main)
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
└──────────────────────────┬──────────────────────────────────────┘
                           │ (si branche main)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Actions — release.yml                                   │
│  Job 1 (publish) — matrice parallèle par plugin :                │
│  ├── Build du plugin                                              │
│  ├── Vérification si la version existe déjà sur npm               │
│  ├── Détermination du dist-tag (latest, beta, alpha…)            │
│  └── Publication npm (`npm publish --tag <dist-tag>`)             │
│  Job 2 (release) — après publish :                               │
│  ├── Injection des plugins dans apache/superset                  │
│  └── Build et push d'une image Docker sur GHCR                    │
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

Le script `scripts/prepare_build.sh` injecte automatiquement ces plugins dans le code source de Superset avant le build Docker.

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

## Connexion manuelle à une instance Superset existante

Pour utiliser ces plugins sur une instance Superset existante sans Docker :

1. Remplacer `superset/superset-frontend/webpack.config.js` par le fichier [docs/webpack.config.js](./webpack.config.js)
2. Installer les packages npm des plugins dans le frontend Superset
3. Suivre [ce tutoriel](https://preset.io/blog/2020-07-02-hello-world/) pour enregistrer les plugins dans Superset
