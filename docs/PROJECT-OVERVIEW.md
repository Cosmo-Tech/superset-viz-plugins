# Vue d'ensemble du projet

## Qu'est-ce que ce projet ?

Ce dépôt est un **monorepo de plugins de visualisation custom pour Apache Superset**, un outil de Business Intelligence open source.

Il permet à des équipes qui opèrent leur propre instance Superset d'**ajouter des types de graphiques sur-mesure** non disponibles nativement dans Superset, de les versionner sous forme de packages npm, et de les embarquer automatiquement dans une image Docker prête à déployer.

---

## Architecture générale

```
cosmotech-viz-plugins/
├── plugins/                  ← Chaque sous-dossier est un plugin npm indépendant
│   ├── plugin-hello-world
├── packages/
│   └── core/                 ← Package de composants partagés entre plugins
├── scripts/                  ← Scripts de build/release vers Superset
├── docs/                     ← Documentation du projet
├── .github/workflows/        ← CI/CD GitHub Actions
├── package.json              ← Racine du monorepo
├── lerna.json                ← Configuration Lerna pour la gestion du monorepo
└── tsconfig.json             ← Configuration TypeScript partagée
```

---

## Stack technique

| Outil                           | Version               | Rôle                                                           |
| ------------------------------- | --------------------- | -------------------------------------------------------------- |
| **TypeScript**                  | 5.9.x                 | Langage principal de tous les plugins                          |
| **React 19**                    | 19.x                  | Framework UI des composants de visualisation                   |
| **recharts**                    | 2.x                   | Bibliothèque de graphiques SVG basée sur React                 |
| **@superset-ui/core**           | 0.20.4                | Types et utilitaires du SDK Superset                           |
| **@superset-ui/chart-controls** | 0.20.3                | Construction du panneau de contrôle Superset                   |
| **Lerna v9**                    | 9.x                   | Orchestration du monorepo (scripts, versions, publication npm) |
| **Babel**                       | 7.x                   | Transpilation TypeScript/TSX → JavaScript CommonJS             |
| **Jest + @testing-library**     | 29.x / 16.x           | Tests unitaires                                                |
| **ESLint + Prettier**           | 8.x / 3.x             | Lint et formatage du code                                      |

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
│  GitHub Actions — ci.yml                                        │
│  └── yarn install + yarn build + yarn lint + yarn test          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ (si branche master)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Actions — release.yml                                   │
│  ├── Build des plugins                                          │
│  ├── Publication des packages sur npm                           │
│  ├── Injection des plugins dans apache/superset                 │
│  └── Build et push d'une image Docker sur DockerHub             │
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

Chaque plugin est généré depuis un generateur [Yeoman](https://yeoman.io/) existant (https://www.npmjs.com/package/@superset-ui/generator-superset)

L'utilisateur crée un sous-dossier dans le dossier `plugins` qui accueillera son plugin.

Il faut ensuite, installer `Yeoman` et le generateur (s'ils ne sont pas déja présents):

```
npm install -g yo
npm install -g @superset-ui/generator-superset
```

Dans le dossier du plugin:

```
yo @superset-ui/superset
```

L'utilisateur est guidé ensuite tout au long de la création du plugin

---

## Connexion manuelle à une instance Superset existante

Pour utiliser ces plugins sur une instance Superset existante sans Docker :

1. Remplacer `superset/superset-frontend/webpack.config.js` par le fichier [docs/webpack.config.js](./webpack.config.js)
2. Installer les packages npm des plugins dans le frontend Superset
3. Suivre [ce tutoriel](https://preset.io/blog/2020-07-02-hello-world/) pour enregistrer les plugins dans Superset
