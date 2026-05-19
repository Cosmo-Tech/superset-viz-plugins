# @cosmotech/plugin-hello-world

Plugin de démonstration pour Apache Superset. Affiche un titre « Hello World » avec un emoji
et un tableau des données retournées par la requête SQL configurée.

## Aperçu visuel

Le composant affiche :

- Un titre **« Hello World »** centré, avec taille et graisse configurables
- Un emoji 👋🧑 (personne qui salue)
- Un **tableau HTML** présentant toutes les colonnes et lignes du dataset

```
┌──────────────────────────────────────┐
│           Hello World                │
│              👋🧑                    │
│                                      │
│  ┌──────────┬──────────┬──────────┐  │
│  │ col_a    │ col_b    │ col_c    │  │
│  ├──────────┼──────────┼──────────┤  │
│  │ valeur1  │ valeur2  │ valeur3  │  │
│  │ ...      │ ...      │ ...      │  │
│  └──────────┴──────────┴──────────┘  │
└──────────────────────────────────────┘
```

## Structure du plugin

```
plugins/hello-world/
├── src/
│   ├── HelloWorld.tsx          ← Composant React (titre + emoji + tableau)
│   ├── index.ts                ← Export de la classe HelloWorldPlugin
│   ├── types.ts                ← Interfaces FormData et Props
│   ├── images/
│   │   ├── thumbnail.png       ← Image de prévisualisation
│   │   └── thumbnail.ts        ← Thumbnail encodé en base64 (généré)
│   └── plugin/
│       ├── index.ts            ← Classe HelloWorldPlugin (extends ChartPlugin)
│       ├── buildQuery.ts       ← Construction de la requête SQL
│       ├── controlPanel.ts     ← Panneau de configuration Superset
│       └── transformProps.ts   ← Transformation réponse API → props React
├── test/
│   ├── index.test.ts           ← Test d'enregistrement du plugin
│   ├── plugin/
│   │   ├── buildQuery.test.ts
│   │   └── transformProps.test.ts
│   └── __mocks__/              ← Mocks manuels pour @superset-ui
├── package.json
├── tsconfig.json
├── tsconfig.esm.json
├── babel.config.js
└── jest.config.js
```

## Commandes

```bash
# Build (CJS + ESM + types)
yarn workspace @cosmotech/plugin-hello-world build

# Tests unitaires
yarn workspace @cosmotech/plugin-hello-world test

# Lint
yarn workspace @cosmotech/plugin-hello-world lint

# Packaging webpack (bundle autonome pour chargement dynamique)
yarn plugin:package plugins/hello-world

# Pipeline complet (lint + test + build + package)
yarn plugin:pipeline plugins/hello-world
```
