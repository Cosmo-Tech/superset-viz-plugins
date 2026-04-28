# cosmotech-viz-plugins

Monorepo de plugins de visualisation personnalisés pour [Apache Superset](https://superset.apache.org/).
Chaque plugin est un package npm indépendant (TypeScript + React 19) publié sous le scope `@cosmotech-viz/`.

> Documentation complète dans le dossier [`docs/`](docs/) :
> [Vue d'ensemble](docs/PROJECT-OVERVIEW.md) · [Guide développeur](docs/DEVELOPER-GUIDE.md) · [Guide utilisateur](docs/USER-GUIDE.md) · [Contexte agent IA](docs/AGENT-CONTEXT.md)

---

## But du projet

Permettre à des équipes opérant leur propre instance Superset d'**ajouter des types de graphiques
sur-mesure**, non disponibles nativement, en les développant, versionnant et publiant sous la forme
de packages npm standard. Les plugins sont ensuite injectés automatiquement dans une image Docker
Superset prête à déployer via le pipeline CI/CD.

---

## Prérequis

| Outil   | Version minimale | Installation                     |
| ------- | ---------------- | -------------------------------- |
| Node.js | >= 18            | [nodejs.org](https://nodejs.org) |
| Yarn    | >= 1.22          | `npm install -g yarn`            |

```bash
node --version   # doit afficher v18.x ou supérieur
yarn --version   # doit afficher 1.22.x ou supérieur
```

---

## Stack technique

| Outil                           | Version | Rôle                                           |
| ------------------------------- | ------- | ---------------------------------------------- |
| **TypeScript**                  | 5.9.x   | Langage principal                              |
| **React**                       | 19.x    | Framework UI des composants de visualisation   |
| **recharts**                    | 2.x     | Bibliothèque de graphiques SVG basée sur React |
| **@superset-ui/core**           | 0.20.4  | Types et utilitaires du SDK Superset           |
| **@superset-ui/chart-controls** | 0.20.3  | Construction du panneau de contrôle Superset   |
| **Lerna v9**                    | 9.x     | Orchestration du monorepo                      |
| **Babel**                       | 7.x     | Transpilation TypeScript/TSX → JavaScript      |
| **Jest + @testing-library**     | 29.x    | Tests unitaires                                |
| **ESLint + Prettier**           | 8.x/3.x | Lint et formatage du code                      |

---

## Installation

```bash
git clone <url-du-repo>
cd cosmotech-viz-plugins
yarn install
```

Yarn Workspaces installe toutes les dépendances de la racine et de chaque package en une seule passe.

---

## Commandes de base

Toutes les commandes s'exécutent depuis la **racine du monorepo**.

| Commande            | Description                                        |
| ------------------- | -------------------------------------------------- |
| `yarn build`        | Build production de tous les packages (CJS + ESM)  |
| `yarn build:dev`    | Watch mode — recompile à chaque modification       |
| `yarn test`         | Lance tous les tests unitaires                     |
| `yarn test:watch`   | Tests en mode watch                                |
| `yarn lint`         | Analyse ESLint sur tous les packages               |
| `yarn format`       | Formate tous les fichiers avec Prettier            |
| `yarn format:check` | Vérifie le formatage sans modifier (CI)            |
| `yarn clean`        | Supprime les dossiers `dist/`, `esm/`, `coverage/` |

---

## How-to

### Lancer le build du projet complet

```bash
yarn build
```

Compile tous les packages dans `plugins/` et `packages/` en séquence via Lerna.
Chaque plugin produit :

- `dist/` — JavaScript CommonJS + déclarations TypeScript (`.d.ts`)
- `esm/` — JavaScript ES Modules

### Lancer le build d'un seul plugin

```bash
yarn workspace @cosmotech-viz/plugin-hello-world build
```

Remplacer `@cosmotech-viz/plugin-hello-world` par le `name` déclaré dans le `package.json` du plugin cible.

Pour recompiler automatiquement à chaque modification (watch mode) :

```bash
yarn workspace @cosmotech-viz/plugin-hello-world build:dev
```

### Lancer les tests du projet complet

```bash
yarn test
```

Lance Jest sur tous les packages découverts dans `plugins/` et `packages/`. Le rapport de couverture
est généré dans `coverage/`.

### Lancer les tests d'un seul plugin

```bash
yarn workspace @cosmotech-viz/plugin-hello-world test
```

Pour lancer en mode watch (relance automatiquement les tests impactés par une modification) :

```bash
yarn workspace @cosmotech-viz/plugin-hello-world test:watch
```

### Lancer le linter sur le projet complet

```bash
yarn lint
```

Exécute ESLint sur les dossiers `src/` de tous les packages.

### Lancer le linter sur un seul plugin

```bash
yarn workspace @cosmotech-viz/plugin-hello-world lint
```

Pour corriger automatiquement les erreurs réparables :

```bash
yarn workspace @cosmotech-viz/plugin-hello-world eslint src --ext .ts,.tsx --fix
```

---

## Structure du dépôt

```
cosmotech-viz-plugins/
├── plugins/                  ← Un sous-dossier = un plugin npm indépendant
│   └── hello-world/          ← @cosmotech-viz/plugin-hello-world (exemple)
├── packages/
│   └── core/                 ← @cosmotech-viz/core (composants partagés)
├── scripts/                  ← Scripts d'injection Superset (CI/CD)
├── docs/                     ← Documentation complète
├── babel.config.js
├── jest.config.js
├── lerna.json
├── package.json
└── tsconfig.json
```

---

## Documentation détaillée

| Document                                             | Audience     | Contenu                                                     |
| ---------------------------------------------------- | ------------ | ----------------------------------------------------------- |
| [docs/PROJECT-OVERVIEW.md](docs/PROJECT-OVERVIEW.md) | Tous         | Architecture, stack, flux CI/CD                             |
| [docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md)   | Développeurs | Onboarding, créer un plugin, conventions, TypeScript, tests |
| [docs/USER-GUIDE.md](docs/USER-GUIDE.md)             | Utilisateurs | Déploiement Docker, intégration Superset, utilisation UI    |
| [docs/AGENT-CONTEXT.md](docs/AGENT-CONTEXT.md)       | Agents IA    | Contraintes techniques, templates de code, problèmes connus |
