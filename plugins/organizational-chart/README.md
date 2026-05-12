# @cosmotech/plugin-organizational-chart

Plugin de visualisation hiérarchique pour Apache Superset.
Affiche un arbre de KPI sous forme de boîtes colorées connectées, conçu pour le suivi
de flux (bagages, colis, commandes, etc.).

## Aperçu

Le chart affiche une structure arborescente fixe à 5 niveaux avec 16 boîtes.
Chaque boîte est configurable :

- **Titre** — texte affiché au-dessus de la valeur (paramétrable depuis le panneau de configuration)
- **Colonne SQL** — quelle colonne de la table source fournit la valeur numérique
- **Couleur** — catégorie de couleur (bleu, vert, rouge, rouge foncé, gris)

La requête SQL renvoie **une seule ligne** contenant toutes les colonnes nécessaires.

## Structure de l'arbre

```
Root (blue)
├── Excluded (grey)
└── Simulated (blue)
    ├── Blocked (grey)
    └── Processed (blue)
        ├── Arrived (green)
        │   ├── On time (green)
        │   └── Last minute (green)
        ├── Not arrived (red)
        │   ├── Missed (darkred)
        │   ├── Recirculation (darkred)
        │   ├── Ultimate control (darkred)
        │   └── Other rejects (darkred)
        └── End stock (grey)
            └── Passed to stock (grey)
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

## Usage

```ts
import { OrganizationalChartPlugin } from '@cosmotech/plugin-organizational-chart';

const plugin = new OrganizationalChartPlugin();
plugin.configure({ key: 'organizational-chart' }).register();
```

## Development

```bash
# Build
yarn workspace @cosmotech/plugin-organizational-chart build

# Test
yarn workspace @cosmotech/plugin-organizational-chart test

# Lint
yarn workspace @cosmotech/plugin-organizational-chart lint
```

## License

Apache-2.0
