# Block Master Kit

Prototype web d'un logiciel d'edition d'assets 3D.

## Stack

- Vite pour lancer vite l'app dans le navigateur
- React + TSX pour structurer l'interface
- TypeScript pour eviter les erreurs de structure
- Three.js pour le rendu 3D WebGL
- Lucide React pour les icones
- LocalStorage pour sauvegarder une petite bibliotheque de projets et les miniatures

Analogie : le navigateur est l'atelier, Three.js est la table de dessin 3D,
et React est le tableau de controle qui organise les menus, panneaux et boutons.

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvre :

```txt
http://localhost:5173/
```

## Verifier que tout fonctionne

```bash
npm run build
```

Dans l'app :

- l'ecran de demarrage affiche la bibliotheque des projets
- chaque projet peut afficher une miniature apres sauvegarde
- `Fichier` contient `Retour aux projets` et `Sauvegarder`
- `Fichier > Exporter GLB` exporte la scene en objet 3D `.glb`
- outil de forme dans la fenetre 3D : clic court ajoute la forme active, appui long ouvre le choix `Cube` / `Sphere`
- clic sur un objet pour le selectionner
- barre d'outils dans la fenetre 3D : selection, deplacement XYZ, scale XYZ
- fleches / `PageUp` / `PageDown` deplacent l'objet selectionne
- `Sauvegarder` sauvegarde dans le navigateur et actualise la miniature
- `W` active le deplacement
- `R` active le scale
- `V` revient en selection
- `Delete` / `Backspace` supprime l'objet selectionne

## Pieges frequents

- La sauvegarde actuelle est locale au navigateur via LocalStorage.
- Si tu changes de navigateur, tu ne verras pas les memes projets.
- Le warning Vite sur la taille du bundle est normal au debut : Three.js pese plus lourd qu'une app web classique.
- Pour de grosses scenes plus tard, il faudra ajouter instancing, chargement progressif et formats 3D comme glTF/GLB.
