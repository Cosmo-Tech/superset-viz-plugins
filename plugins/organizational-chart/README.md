# @cosmotech/superset-plugin-organizational-chart

Plugin de visualisation hiérarchique pour Apache Superset.
Affiche un arbre de KPI sous forme de boîtes colorées connectées, conçu pour le suivi
de flux (bagages, colis, commandes, etc.).

## Aperçu visuel

Le composant affiche une structure arborescente avec des boîtes colorées connectées par des
lignes verticales et horizontales. Chaque boîte contient un titre et une valeur numérique.

```
                    ┌───────────────┐
                    │   Root (bleu) │
                    │     1234      │
                    └───────┬───────┘
              ┌─────────────┴─────────────┐
    ┌─────────┴─────────┐     ┌──────────┴──────────┐
    │  Excluded (gris)  │     │  Simulated (bleu)   │
    │       56          │     │       1178          │
    └───────────────────┘     └──────────┬──────────┘
                                ┌────────┴────────┐
                       ┌────────┴──┐     ┌────────┴────────┐
                       │Blocked    │     │  Processed      │
                       │(gris) 12  │     │  (bleu) 1166    │
                       └───────────┘     └────────┬────────┘
                                          ┌───────┼───────┐
                                     Arrived  Not arr.  End stock
                                     (vert)   (rouge)    (gris)
```

Couleurs disponibles : `blue`, `green`, `red`, `darkred`, `grey`.

## Structure du plugin

```
plugins/organizational-chart/
├── src/
│   ├── OrganizationalChart.tsx ← Composant React (arbre de boîtes colorées)
│   ├── index.ts                ← Export de la classe OrganizationalChartPlugin
│   ├── types.ts                ← Interfaces TreeNode, BoxConfig, FormData, Props
│   ├── images/
│   │   ├── thumbnail.png       ← Image de prévisualisation
│   │   └── thumbnail.ts        ← Thumbnail encodé en base64 (généré)
│   └── plugin/
│       ├── index.ts            ← Classe OrganizationalChartPlugin (extends ChartPlugin)
│       ├── buildQuery.ts       ← Construction de la requête SQL (une seule ligne)
│       ├── controlPanel.ts     ← Panneau de configuration (titres + colonnes par boîte)
│       └── transformProps.ts   ← Transformation réponse API → arbre de TreeNode
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

## Configuration

Le panneau de configuration est organisé en sections correspondant aux niveaux de l'arbre :

| Section                                     | Contrôles                                  |
| ------------------------------------------- | ------------------------------------------ |
| **Display**                                 | Taille de la police (slider 8–32 px)       |
| **Root**                                    | Titre + colonne SQL                        |
| **Level 1** — Excluded/Simulated            | Titre + colonne SQL pour chaque boîte      |
| **Level 2** — Blocked/Processed             | Titre + colonne SQL pour chaque boîte      |
| **Level 3** — Arrived/Not arrived/End stock | Titre + colonne SQL pour chaque boîte      |
| **Level 4** — Détails                       | Titre + colonne SQL pour chaque sous-boîte |

La requête SQL renvoie **une seule ligne** contenant toutes les colonnes nécessaires.

## Colonnes SQL par défaut

| Boîte            | Colonne par défaut    |
| ---------------- | --------------------- |
| Root             | `TotalDonneesEntree`  |
| Excluded         | `BagagesExclus`       |
| Simulated        | `TotalSimulation`     |
| Blocked          | `BagagesBloques`      |
| Processed        | `BagagesTraites`      |
| Arrived          | `ArrivesADestination` |
| Not arrived      | `NonArrives`          |
| End stock        | `FinAuStock`          |
| On time          | `ATemps`              |
| Last minute      | `DerniereMinute`      |
| Missed           | `BagagesRates`        |
| Recirculation    | `RebutRecirculation`  |
| Ultimate control | `ControleUltime`      |
| Other rejects    | `AutresRebut`         |
| Passed to stock  | `PassesAuStock`       |

## Commandes

```bash
# Build (CJS + ESM + types)
yarn workspace @cosmotech/superset-plugin-organizational-chart build

# Tests unitaires
yarn workspace @cosmotech/superset-plugin-organizational-chart test

# Lint
yarn workspace @cosmotech/superset-plugin-organizational-chart lint

# Packaging webpack (bundle autonome pour chargement dynamique)
yarn plugin:package plugins/organizational-chart

# Pipeline complet (lint + test + build + package)
yarn plugin:pipeline plugins/organizational-chart
```
