# @cosmotech/superset-plugin-cargo

Plugin de dÃ©monstration pour Apache Superset. Affiche un titre Â« Cargo Â» avec un emoji
et un tableau des donnÃ©es retournÃ©es par la requÃªte SQL configurÃ©e.

## AperÃ§u visuel

Le composant affiche :

- Un titre **Â« Cargo Â»** centrÃ©, avec taille et graisse configurables
- Un emoji ðŸ‘‹ðŸ§‘ (personne qui salue)
- Un **tableau HTML** prÃ©sentant toutes les colonnes et lignes du dataset

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚           Cargo                â”‚
â”‚              ðŸ‘‹ðŸ§‘                    â”‚
â”‚                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ col_a    â”‚ col_b    â”‚ col_c    â”‚  â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”‚
â”‚  â”‚ valeur1  â”‚ valeur2  â”‚ valeur3  â”‚  â”‚
â”‚  â”‚ ...      â”‚ ...      â”‚ ...      â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Structure du plugin

```
plugins/cargo/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ Cargo.tsx          â† Composant React (titre + emoji + tableau)
â”‚   â”œâ”€â”€ index.ts                â† Export de la classe CargoPlugin
â”‚   â”œâ”€â”€ types.ts                â† Interfaces FormData et Props
â”‚   â”œâ”€â”€ images/
â”‚       â”œâ”€â”€ index.ts            â† Classe CargoPlugin (extends ChartPlugin)
â”‚       â”œâ”€â”€ buildQuery.ts       â† Construction de la requÃªte SQL
â”‚       â”œâ”€â”€ controlPanel.ts     â† Panneau de configuration Superset
â”‚       â””â”€â”€ transformProps.ts   â† Transformation rÃ©ponse API â†’ props React
â”œâ”€â”€ test/
â”‚   â”œâ”€â”€ index.test.ts           â† Test d'enregistrement du plugin
â”‚   â”œâ”€â”€ plugin/
â”‚   â”‚   â”œâ”€â”€ buildQuery.test.ts
â”‚   â”‚   â””â”€â”€ transformProps.test.ts
â”‚   â””â”€â”€ __mocks__/              â† Mocks manuels pour @superset-ui
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ tsconfig.esm.json
â”œâ”€â”€ babel.config.js
â””â”€â”€ jest.config.js
```

## Commandes

```bash
# Build (CJS + ESM + types)
yarn workspace @cosmotech/superset-plugin-cargo build

# Tests unitaires
yarn workspace @cosmotech/superset-plugin-cargo test

# Lint
yarn workspace @cosmotech/superset-plugin-cargo lint

# Packaging webpack (bundle autonome pour chargement dynamique)
yarn plugin:package plugins/cargo

# Pipeline complet (lint + test + build + package)
yarn plugin:pipeline plugins/cargo
```
