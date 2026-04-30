# Guide utilisateur

## Qu'est-ce que ce projet ?

Ce dépôt contient des **plugins de visualisation personnalisés pour Apache Superset**. Il permet
d'enrichir votre instance Superset avec des types de graphiques sur-mesure, non disponibles
nativement.

Les plugins sont développés en TypeScript + React 19 et s'intègrent dans Superset via son
mécanisme standard de plugins de visualisation.

---

## Plugins disponibles

Les plugins sont publiés sur npm sous le scope `@cosmotech/`. Chaque plugin dans le dossier
`plugins/` correspond à un package npm indépendant.

| Plugin                                   | Package npm                     | Description                                                          |
| ---------------------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| **Hello World** (`plugins/hello-world/`) | `@cosmotech/plugin-hello-world` | Plugin démonstratif — point de départ pour créer de nouveaux plugins |

> D'autres plugins seront ajoutés dans ce tableau au fur et à mesure des publications.

---

## Déploiement via Docker (recommandé)

La méthode recommandée est de déployer l'image Docker préconfigurée, qui intègre Superset avec
les plugins déjà installés et enregistrés. L'image est automatiquement construite et publiée sur
le GitHub Container Registry (GHCR) à chaque release.

```bash
docker pull ghcr.io/cosmo-tech/cosmotech-superset:latest
docker run -p 8088:8088 ghcr.io/cosmo-tech/cosmotech-superset:latest
```

Superset est ensuite accessible sur `http://localhost:8088`.

---

## Connexion à une instance Superset existante

Si vous opérez déjà votre propre instance Superset et souhaitez y ajouter les plugins sans
reconstruire l'image Docker :

### Étape 1 — Remplacer le webpack.config.js de Superset

Copier le fichier `docs/webpack.config.js` à la place de
`superset/superset-frontend/webpack.config.js` dans votre installation Superset. Ce fichier est
préconfiguré pour charger les plugins externes.

### Étape 2 — Installer les packages npm des plugins

Dans le dossier `superset/superset-frontend/` de votre Superset :

```bash
npm install @cosmotech/plugin-mon-graphique
```

Répéter pour chaque plugin souhaité.

### Étape 3 — Enregistrer les plugins dans Superset

Suivre [ce tutoriel officiel](https://preset.io/blog/2020-07-02-hello-world/) pour enregistrer
les plugins dans le registre Superset.

---

## Utilisation dans l'interface Superset

Une fois les plugins installés et Superset redémarré :

1. Créer ou ouvrir un **dashboard** dans Superset
2. Cliquer sur **"+ Chart"** pour ajouter un graphique
3. Dans la liste des types de visualisation, les plugins apparaissent avec leur nom personnalisé
4. Configurer le graphique via le panneau de contrôle (options définies par chaque plugin)
5. Connecter le graphique à une source de données Superset (dataset)

---

## Signaler un problème ou demander un nouveau plugin

Ouvrir une issue sur le dépôt GitHub avec :

- La description du graphique souhaité
- Un exemple de données d'entrée (format JSON si possible)
- Un mockup ou une capture d'écran du rendu attendu

> Pour les développeurs : un nouveau plugin peut être scaffoldé en quelques secondes avec
> `yarn plugin:init` depuis la racine du monorepo (voir [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md)).
