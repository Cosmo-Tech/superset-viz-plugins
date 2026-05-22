# Comment construire un plugin Superset

Guide pas-à-pas pour créer, développer, packager et intégrer un plugin de visualisation
dans une instance Apache Superset.

---

## Table des matières

1. [Prérequis techniques](#1--prérequis-techniques)
2. [Initialisation d'un plugin](#2--initialisation-dun-plugin)
3. [Comment mettre en place un environnement de développement ?](#3--comment-mettre-en-place-un-environnement-de-développement-)
4. [Comment packager mon plugin ?](#4--comment-packager-mon-plugin-)
5. [Comment mon plugin packagé est accessible et servi par nginx ?](#5--comment-mon-plugin-packagé-est-accessible-et-servi-par-nginx-)
6. [Comment me connecter à Superset ?](#6--comment-me-connecter-à-superset-)
7. [Comment créer une Database connection vers PostgreSQL ?](#7--comment-créer-une-database-connection-vers-postgresql-)
8. [Comment définir mon plugin dans Superset ?](#8--comment-définir-mon-plugin-dans-superset-)
9. [Comment vérifier que mon plugin est bien intégré ?](#9--comment-vérifier-que-mon-plugin-est-bien-intégré-)
10. [Développer le plugin](#10--développer-le-plugin)
11. [Comment utiliser mon plugin dans le Superset de production ?](#11--comment-utiliser-mon-plugin-dans-le-superset-de-production-)

---

## Tips & Tricks

Ce projet a été entièrement créé et documenté à l'aide de LLM (Large Language Models).
Son objectif principal est de **faciliter la création et l'intégration de plugins Superset
en s'appuyant sur des LLM** : la structure du monorepo, les scripts d'automatisation, les
templates et cette documentation sont conçus pour être exploitables par un assistant IA
afin de générer rapidement des plugins fonctionnels.

L'approche recommandée est de fournir au LLM le contexte technique du projet
(voir [section 10 — Option B](#10--développer-le-plugin)) et de lui décrire la visualisation
souhaitée. Le LLM produit alors les fichiers source du plugin, qu'il suffit de builder et
packager avec les commandes Yarn du monorepo.

Nous préconisons l'utilisation de **VS Code** avec un outil IA intégré (GitHub Copilot,
Copilot Chat, ou équivalent) pour bénéficier d'une assistance contextuelle directement dans
l'éditeur : génération de code, explication de fichiers existants, exécution de commandes
et itérations rapides sans quitter l'environnement de développement.

> **Note** : le développement manuel classique des plugins reste parfaitement possible et
> supporté (voir [section 10 — Option A](#10--développer-le-plugin)). Le recours aux LLM est
> une facilité, pas une obligation.

L'idée principale de ce repository GitHub est de servir de **bibliothèque de plugins** :
un monorepo unique qui regroupe l'ensemble des plugins de visualisation développés. Cela
permet de mutualiser la configuration, les scripts et les dépendances. Il reste bien sûr
possible de **forker** le repository pour isoler un plugin dans son propre dépôt (un repo
par plugin) si les contraintes organisationnelles ou de déploiement l'exigent.

---

## 1 — Prérequis techniques

| Outil   | Version minimale | Installation                     | Remarque                      |
| ------- | ---------------- | -------------------------------- | ----------------------------- |
| Node.js | >= 18            | [nodejs.org](https://nodejs.org) | Requis pour le monorepo       |
| Yarn    | >= 1.22          | `npm install -g yarn`            | Yarn Classic (pas Yarn Berry) |
| Docker  | Version récente  | [docker.com](https://docker.com) | Pour Superset + PostgreSQL    |

Vérifier l'environnement :

```bash
node --version           # >= 18
yarn --version           # >= 1.22
docker --version
docker compose version
```

Cloner le dépôt et installer les dépendances :

```bash
git clone git@github.com:Cosmo-Tech/cosmotech-viz-plugins.git
cd cosmotech-viz-plugins
yarn install
```

---

## 2 — Initialisation d'un plugin

Le monorepo intègre un générateur qui scaffolde un plugin complet et fonctionnel à partir
du gabarit `plugin_template/`.

### Lancer le générateur

```bash
yarn plugin:init
```

Le script pose trois questions :

```
Plugin name (kebab-case, e.g. my-chart): mon-graphique
Display name (e.g. My Chart): Mon Graphique
Description: Visualisation personnalisée pour le suivi de flux
```

### Résultat

Le plugin est créé dans `plugins/mon-graphique/` avec toute la structure nécessaire :

```
plugins/mon-graphique/
├── src/
│   ├── MonGraphique.tsx        ← Composant React (le rendu du graphique)
│   ├── index.ts                ← Export de la classe Plugin
│   ├── types.ts                ← Interfaces TypeScript
│   ├── images/thumbnail.ts     ← Thumbnail en base64 (généré)
│   └── plugin/
│       ├── index.ts            ← Classe MonGraphiquePlugin
│       ├── buildQuery.ts       ← Construction de la requête SQL
│       ├── controlPanel.ts     ← Panneau de configuration Superset
│       └── transformProps.ts   ← Transformation réponse → props React
├── test/                       ← Tests unitaires
├── package.json
└── tsconfig.json
```

### Vérifier que le plugin fonctionne

```bash
yarn install                                           # détecte le nouveau workspace
yarn workspace @cosmotech/plugin-mon-graphique build   # build
yarn workspace @cosmotech/plugin-mon-graphique test    # tests
yarn workspace @cosmotech/plugin-mon-graphique lint    # lint
```

---

## 3 — Comment mettre en place un environnement de développement ?

L'environnement de développement local est défini dans le dossier `docker/`. Il lance trois
services : Superset, PostgreSQL et un serveur nginx pour les plugins.

### Étape 1 : Construire l'image Docker Superset

L'image `cosmotech/superset-dev:6.0.0` est basée sur l'image officielle Superset avec les
dépendances Python nécessaires pré-installées (connecteur PostgreSQL, etc.).

```bash
cd docker
./docker_build.sh
```

> Cette commande n'est à exécuter qu'**une seule fois** (ou après modification du `Dockerfile`).

### Étape 2 : Démarrer les services

```bash
cd docker
docker compose up -d
```

### Services démarrés

| Service            | Container            | Port exposé | Description                          |
| ------------------ | -------------------- | ----------- | ------------------------------------ |
| **superset**       | superset_development | 8088        | Interface Superset complète          |
| **postgres**       | superset_postgres    | 5435        | Base de données PostgreSQL           |
| **plugins-server** | plugins_server       | 80          | Serveur nginx servant les bundles JS |

### Arrêter les services

```bash
docker compose down
```

> Les données PostgreSQL sont persistées dans un volume Docker `postgres-data`.
> Pour tout réinitialiser : `docker compose down -v`.

---

## 4 — Comment packager mon plugin ?

Le packaging compile le plugin en un bundle webpack autonome prêt pour le chargement
dynamique par Superset.

### Packager un seul plugin

```bash
yarn plugin:package plugins/mon-graphique
```

### Pipeline complet (lint + test + build + package)

```bash
yarn plugin:pipeline plugins/mon-graphique
```

### Packager tous les plugins

```bash
yarn plugins:package
```

### Sortie

Le bundle est généré dans :

```
plugins/versions/mon-graphique/<version>/index.js
```

Par exemple : `plugins/versions/mon-graphique/0.1.0/index.js`

---

## 5 — Comment mon plugin packagé est accessible et servi par nginx ?

Le service `plugins-server` dans le docker-compose monte le dossier `plugins/versions/` en
lecture seule dans le container nginx :

```yaml
plugins-server:
  image: nginx:alpine
  volumes:
    - ../plugins/versions:/usr/share/nginx/html:ro
    - ./nginx-plugins.conf:/etc/nginx/conf.d/default.conf:ro
  ports:
    - '80:80'
```

La configuration nginx (`docker/nginx-plugins.conf`) :

- Active le listing des fichiers (`autoindex on`)
- Force le MIME type `application/javascript` pour les fichiers `.js`
- Ajoute les headers CORS (`Access-Control-Allow-Origin: *`)

### URL d'accès aux bundles

Chaque plugin packagé est accessible via :

```
http://localhost/<nom-du-plugin>/<version>/index.js
```

Exemples :

- `http://localhost/hello-world/0.0.10/index.js`
- `http://localhost/mon-graphique/0.1.0/index.js`

> **Pas besoin de redémarrer nginx** après un nouveau packaging — le dossier est monté en
> temps réel (bind mount). Il suffit de repackager le plugin et de recharger la page Superset.

---

## 6 — Comment me connecter à Superset ?

1. S'assurer que les services Docker sont démarrés (`docker compose up -d`)
2. Ouvrir le navigateur sur **http://localhost:8088**
3. Se connecter avec les identifiants par défaut :

| Champ    | Valeur  |
| -------- | ------- |
| Username | `admin` |
| Password | `admin` |

---

## 7 — Comment créer une Database connection vers PostgreSQL ?

Le service PostgreSQL est accessible depuis Superset via le réseau Docker interne.

### Étapes dans l'interface Superset

1. Aller dans **Settings → Database Connections**
2. Cliquer sur **+ Database**
3. Choisir **PostgreSQL**
4. Remplir les champs de connexion :

| Champ    | Valeur     |
| -------- | ---------- |
| Host     | `postgres` |
| Port     | `5432`     |
| Database | `superset` |
| Username | `admin`    |
| Password | `admin`    |

Ou en SQLAlchemy URI :

```
postgresql://admin:admin@postgres:5432/superset
```

5. Cliquer sur **Test Connection** pour vérifier
6. Avant de sauvegarder, aller dans l'onglet **Advanced** → section **Security** et cocher
   **Allow file uploads to database** (nécessaire pour l'upload de CSV)
7. Sauvegarder

> **Important** : utiliser le nom de service Docker `postgres` (pas `localhost`) et le port
> interne `5432` (pas `5435`). Le port `5435` ne sert que pour accéder depuis la machine hôte
> (DBeaver, pgAdmin, etc.).

### Uploader un fichier CSV dans la base

Superset permet d'importer un fichier CSV directement dans PostgreSQL pour créer un dataset
de test.

1. Aller dans **SQL → CSV Upload** (ou **Data → Upload CSV**)
2. Sélectionner la database PostgreSQL créée précédemment
3. Remplir les champs :

| Champ      | Valeur                                      |
| ---------- | ------------------------------------------- |
| Table Name | Nom de la table à créer (ex: `mes_donnees`) |
| Schema     | `public`                                    |
| CSV File   | Sélectionner le fichier `.csv` depuis le PC |
| Delimiter  | `,` (ou `;` selon le format du fichier)     |

4. Cocher **Header Row** si la première ligne contient les noms de colonnes
5. Cliquer sur **Upload**

La table est créée dans le schema `public` de la base `superset` et devient immédiatement
utilisable comme dataset pour les charts.

> Pour vérifier l'import, aller dans **SQL → SQL Lab** et exécuter :
>
> ```sql
> SELECT * FROM public.mes_donnees LIMIT 10;
> ```

---

## 8 — Comment définir mon plugin dans Superset ?

Une fois le plugin packagé et accessible via nginx, il faut l'enregistrer dans Superset.

### Étapes dans l'interface Superset

1. Aller dans **Settings → Plugins**
2. Cliquer sur **+ Plugin**
3. Remplir les champs :

| Champ | Valeur                                               | Description                          |
| ----- | ---------------------------------------------------- | ------------------------------------ |
| Name  | `Mon Graphique`                                      | Nom affiché dans la liste des charts |
| Key   | `mon-graphique`                                      | Identifiant unique (kebab-case)      |
| URL   | `http://plugins-server/mon-graphique/0.1.0/index.js` | URL du bundle servi par nginx        |

> **Note sur l'URL** : depuis le container Superset, le serveur nginx est accessible via son
> nom de service Docker `plugins-server` (port 80). Depuis le navigateur sur la machine hôte,
> c'est `http://localhost/mon-graphique/0.1.0/index.js`.

4. Sauvegarder

### Mettre à jour après un nouveau packaging

Si la **version** du plugin a changé (dans `package.json`), l'URL change aussi.
Il faut mettre à jour l'URL dans la configuration du plugin dans Superset.

Si la version n'a pas changé, un simple rechargement de la page Superset suffit.

---

## 9 — Comment vérifier que mon plugin est bien intégré ?

### Vérifier l'enregistrement

1. Aller dans **Settings → Plugins**
2. Le plugin doit apparaître dans la liste avec son nom et sa clé

### Vérifier la disponibilité dans les charts

1. Aller dans **Charts → + Chart**
2. Dans la liste des types de visualisation, le plugin doit apparaître avec son nom
   d'affichage et son thumbnail
3. Le sélectionner et choisir un dataset

### En cas de problème

| Symptôme                             | Cause probable                                 | Solution                                                                |
| ------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------- |
| Plugin absent de la liste des charts | Plugin non enregistré dans Settings → Plugins  | Vérifier l'enregistrement (section 8)                                   |
| Erreur de chargement                 | URL incorrecte ou nginx non démarré            | Vérifier `http://localhost/<nom>/<version>/index.js`                    |
| « Failed to fetch plugin »           | Problème réseau entre containers               | Vérifier que `plugins-server` est sur le même réseau                    |
| Graphique vide                       | Pas de dataset sélectionné ou requête SQL vide | Configurer un dataset et les colonnes dans le panneau                   |
| Erreur MIME type                     | nginx ne sert pas le bon Content-Type          | Vérifier `nginx-plugins.conf` (doit servir en `application/javascript`) |

---

## 10 — Développer le plugin

Maintenant que l'environnement est en place, il y a deux approches pour implémenter la
logique de visualisation du plugin.

### Option A — Développement manuel

Se référer au guide complet [DEVELOPER-JOURNEY.md](DEVELOPER-JOURNEY.md), en particulier :

- **Section 6** — Anatomie d'un plugin (classe Plugin, buildQuery, transformProps, controlPanel, composant React)
- **Section 7** — Build et tests locaux
- **Section 10** — Cycle de développement itératif

Les fichiers principaux à modifier dans `plugins/<nom>/src/` :

| Fichier                    | Rôle                                            |
| -------------------------- | ----------------------------------------------- |
| `<Nom>.tsx`                | Composant React — le rendu visuel du graphique  |
| `types.ts`                 | Interfaces TypeScript (FormData, Props)         |
| `plugin/buildQuery.ts`     | Quelles colonnes/métriques requêter             |
| `plugin/controlPanel.ts`   | Options configurables dans le panneau Superset  |
| `plugin/transformProps.ts` | Transformation de la réponse API en props React |

### Option B — Création assistée par LLM

Un LLM (ChatGPT, Claude, Copilot…) peut générer le code du plugin à partir d'une description
fonctionnelle. Pour obtenir un résultat exploitable, fournir au LLM le contexte technique du
projet.

#### Template de prompt

```
Je travaille dans le monorepo cosmotech-viz-plugins qui développe des plugins de
visualisation pour Apache Superset 6.0.0.

Contexte technique du projet :
- @file docs/AGENT-CONTEXT.md
- @file docs/DEVELOPER-JOURNEY.md (sections 5, 6 et 7)

Plugin existant comme référence :
- @file plugins/hello-world/src/HelloWorld.tsx
- @file plugins/hello-world/src/types.ts
- @file plugins/hello-world/src/plugin/buildQuery.ts
- @file plugins/hello-world/src/plugin/controlPanel.ts
- @file plugins/hello-world/src/plugin/transformProps.ts

Mon besoin :
Je souhaite créer un plugin nommé "<nom-kebab-case>" qui affiche <description
détaillée de la visualisation souhaitée>.

Les données source contiennent les colonnes suivantes :
- <colonne_1> : <description>
- <colonne_2> : <description>
- ...

Le panneau de configuration doit permettre de :
- <option 1>
- <option 2>
- ...

Contraintes techniques :
- Utiliser @superset-ui/core@0.20.4 et @superset-ui/chart-controls@0.20.3
- Pas de styled-components ni de thème Superset (utiliser des styles inline React.CSSProperties)
- Le composant React doit accepter les props { data, height, width, ... } depuis transformProps
- buildQuery doit utiliser buildQueryContext de @superset-ui/core

Génère les fichiers suivants pour le plugin :
1. src/<NomPascalCase>.tsx — composant React
2. src/types.ts — interfaces FormData et Props
3. src/plugin/buildQuery.ts
4. src/plugin/controlPanel.ts
5. src/plugin/transformProps.ts
```

#### Conseils pour un bon résultat

- **Fournir les fichiers de référence** : inclure un plugin existant (hello-world ou
  organizational-chart) comme exemple concret pour le LLM
- **Décrire les données** : lister les colonnes SQL disponibles et leur type
- **Décrire le visuel** : être précis sur le rendu attendu (tableau, graphique, arbre, carte…)
- **Itérer** : commencer par un rendu simple, puis affiner le panneau de configuration et
  les transformations

#### Workflow après génération

1. Packager et tester dans Superset :
   ```bash
   yarn plugin:package plugins/<nom>
   ```
2. Recharger la page Superset pour voir le résultat

---

## 11 — Comment utiliser mon plugin dans le Superset de production ?

En production, le plugin n'est plus servi par un nginx local mais directement depuis le
repository GitHub via un CDN.

### Étape 1 : Commiter et pousser le code

Le code source **et** les bundles packagés doivent être versionnés dans le repository :

```bash
git add plugins/<nom>/
git commit -m "feat(<nom>): add plugin"
git push origin main
```

> **Important** : le dossier `plugins/versions/` contient les bundles webpack prêts à
> l'emploi. Ces fichiers **doivent** être commités et poussés car ils servent de source
> pour le CDN en production.

### Étape 2 : Vérifier la structure dans `plugins/versions/`

Après un `yarn plugin:package plugins/<nom>`, le bundle se trouve dans :

```
plugins/versions/<nom>/<version>/index.js
```

Par exemple : `plugins/versions/hello-world/0.0.10/index.js`

Ce fichier est celui qui sera servi en production.

### Étape 3 : Configurer l'URL du plugin dans Superset via jsDelivr

[jsDelivr](https://www.jsdelivr.com/) est un CDN gratuit qui sert directement les fichiers
d'un repository GitHub. L'URL suit le format :

```
https://cdn.jsdelivr.net/gh/<org>/<repo>@<branche>/<chemin-vers-le-fichier>
```

Pour ce monorepo, l'URL d'un plugin est :

```
https://cdn.jsdelivr.net/gh/Cosmo-Tech/cosmotech-viz-plugins@main/plugins/versions/<nom>/<version>/index.js
```

#### Exemples concrets

| Plugin      | Version | URL jsDelivr                                                                                                     |
| ----------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| hello-world | 0.0.10  | `https://cdn.jsdelivr.net/gh/Cosmo-Tech/cosmotech-viz-plugins@main/plugins/versions/hello-world/0.0.10/index.js` |
| lgs-map     | 0.1.0   | `https://cdn.jsdelivr.net/gh/Cosmo-Tech/cosmotech-viz-plugins@main/plugins/versions/lgs-map/0.1.0/index.js`      |

### Étape 4 : Enregistrer le plugin dans Superset de production

La démarche est identique à la [section 8](#8--comment-définir-mon-plugin-dans-superset-),
à l'exception de l'URL :

1. Aller dans **Settings → Plugins**
2. Cliquer sur **+ Plugin**
3. Remplir les champs :

| Champ | Valeur                                                                                                            |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| Name  | `Mon Graphique`                                                                                                   |
| Key   | `mon-graphique`                                                                                                   |
| URL   | `https://cdn.jsdelivr.net/gh/Cosmo-Tech/cosmotech-viz-plugins@main/plugins/versions/mon-graphique/0.1.0/index.js` |

4. Sauvegarder

### Mise à jour d'un plugin en production

1. Modifier le code du plugin
2. Bumper la version dans `plugins/<nom>/package.json`
3. Repackager : `yarn plugin:package plugins/<nom>`
4. Commiter et pousser :
   ```bash
   git add plugins/<nom>/ plugins/versions/<nom>/
   git commit -m "feat(<nom>): v<nouvelle-version>"
   git push origin main
   ```
5. Mettre à jour l'URL dans Superset (Settings → Plugins) avec la nouvelle version

> **Note** : jsDelivr met en cache les fichiers. Après un push, le nouveau fichier est
> généralement disponible sous quelques minutes. Pour forcer le rafraîchissement du cache,
> utiliser l'URL de purge : `https://purge.jsdelivr.net/gh/Cosmo-Tech/cosmotech-viz-plugins@main/plugins/versions/<nom>/<version>/index.js`
