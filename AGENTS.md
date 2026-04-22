# AGENTS.md

Guide opérationnel pour tout agent (humain ou IA) qui reprend ce projet. À lire **avant** de coder. Sinon tu vas recasser ce qu'on a déjà cassé puis réparé.

---

## 1. Architecture

**Trois fichiers plats, zéro build step :**

- `index.html` — structure HTML du landing (hero, sections, contact, footer)
- `styles.css` — toutes les règles CSS, variables `:root` en tête
- `script.js` — IIFE `'use strict'`, tout le comportement (loader, curseur, canvas, reveal, horizontal scroll, formulaire)
- `mentions.html` — page légale, partage `styles.css` + `script.js`

Contraintes conservées :
- Aucune dépendance JS (vanilla uniquement)
- Aucune dépendance CSS (pas de Tailwind, pas de reset imposé)
- Pas de build step, pas de node_modules, pas de CI/CD requis
- Seules ressources externes : Google Fonts (Bodoni Moda, Inter Tight, JetBrains Mono)

**Historique :** le projet a commencé en mono-fichier (`atelier-v2.html`). Il a été éclaté en trois fichiers pour faciliter la maintenance (CSS et JS grossissent avec le temps). Le choix a été fait en avril 2026 après validation explicite — **ne pas revenir au mono-fichier**. Si tu éclates davantage (partials HTML, bundler, framework), fais-le dans une branche à part et lis la section 7 avant.

---

## 2. Conventions de code

### HTML
- Attributs en double-quotes
- Éléments sémantiques (section, nav, footer) plutôt que div partout
- Les placeholders à remplir sont balisés `[[ ... ]]` — un `grep -rn "\[\[" *.html` liste tout ce qui est à personnaliser
- Les classes `reveal*` sont pilotées par JS via IntersectionObserver, pas par CSS seul
- **Le `<nav>` et le `<footer>` sont dupliqués** entre `index.html` et `mentions.html` — assumé pour éviter un build step. Quand tu modifies l'un, synchronise l'autre à la main.

### CSS
- Variables dans `:root` pour **toutes** les couleurs et les polices — pas de hex en dur dans les règles
- Unités : `rem` pour les tailles de texte et paddings, `vw`/`vh` pour les titres responsive via `clamp()`
- Pas de `!important` sauf contournement documenté (actuellement seulement `transform: none !important` sur le track horizontal en mobile, pour écraser un transform inline posé par le JS)
- Media queries en `max-width` (approche desktop-first cohérente avec le design)

### JavaScript
- IIFE en `'use strict'` englobant tout
- `var` plutôt que `let`/`const` pour la compatibilité navigateur sans transpilation
- Toutes les querySelector sont protégées par des tests de nullité (`if (el) ...`)
- `requestAnimationFrame` pour toutes les animations frame-based
- Listeners scroll/resize en `{ passive: true }` quand pas besoin de `preventDefault`
- Commentaires en français — c'est un projet français, on reste cohérents

---

## 3. Pièges connus (historique des bugs résolus)

**Relis avant d'éditer.** Ce ne sont pas des suggestions, ce sont des cicatrices.

### Canvas — zone noire qui mange les sections
**Bug :** un canvas en `position: fixed` avec un `fillRect` semi-transparent noir à chaque frame finit par opacifier totalement, et passe par-dessus les sections qui n'ont pas de stacking context propre.
**Solution :** `ctx.clearRect()` à chaque frame, pas de `fillRect` de "trail". **Ne jamais réintroduire un voile résiduel** — même pour un effet motion blur.

### Canvas — IndexSizeError sur createRadialGradient
**Bug :** quand `p.life` arrive à 0, `alpha = 0`, donc `size = 0`, donc `createRadialGradient(..., r2=0)` throw. Une seule particule morte fait planter tout le rendu.
**Solution :** `Math.max(0.4, ...)` sur size, `Math.max(1, ...)` sur haloRadius, `try/catch` autour du gradient. **Ne jamais retirer ces gardes.**

### Scroll horizontal — transform résiduel en mobile
**Bug :** le JS applique `translate3d` inline sur `.horizontal-track` en desktop. Si l'utilisateur redimensionne la fenêtre en dessous de 900px, le transform reste et décale les cartes hors-écran.
**Solution :** `transform: none !important` dans la media query `max-width: 900px`, **ET** reset explicite dans le JS (`hTrack.style.transform = ''`) quand on détecte mobile.

### Scroll horizontal — cartes invisibles en mobile
**Bug :** `.horizontal-sticky` reste en `display: flex; align-items: center`, les cartes se replient à hauteur 0 par conflit flex + aspect-ratio.
**Solution :** forcer `display: block` sur sticky, track et cartes en mobile, avec `overflow: visible`.

### Placeholder d'images
**Bug initial :** les images Unsplash ne chargeaient pas chez tous les utilisateurs → cases vides partout.
**Solution :** générateur SVG inline qui produit des compositions thématiques déterministes (seed-based) à la volée. Les vraies photos se chargent par-dessus quand elles sont disponibles.
**Ne jamais** supposer que les images distantes vont charger. Toujours avoir un fallback visuel immédiat.

### Noms de personnes inventés
**Bug historique :** j'avais inventé "Rémi Castaing, maître-ferronnier" dans un exemple précédent. Ne **jamais** inventer de noms de personnes réels-plausibles sans baliser `[[ NOM ]]`. Risque de collision avec quelqu'un qui existe vraiment, et mauvaise pratique.

### Curseur custom et mobile
**Règle :** le curseur est désactivé via `@media (pointer: coarse)`. Le JS utilise `window.matchMedia('(pointer: fine)').matches` pour ne pas attacher de listeners mousemove sur tactile.

---

## 4. Tests manuels obligatoires avant commit

Pas de suite de tests automatisés (volontairement, pour garder le projet léger). **Checklist humaine à chaque modif :**

1. Ouvrir dans Chrome/Firefox desktop → scroll complet du site
2. Vérifier la console : **zéro erreur, zéro warning rouge**
3. DevTools responsive → tester 375px, 768px, 1024px, 1440px
4. Tester le scroll horizontal (escaliers) : progression fluide, compteur qui s'incrémente
5. Tester les particules : ne s'émettent **que** pendant le scroll, retombent par gravité
6. Vérifier que les placeholders SVG s'affichent partout (4 escaliers, 2 cheminées, 3 mobiliers, 6 portes/verrières, 5 ateliers)
7. Désactiver le JS → le site doit rester lisible (dégradation gracieuse)
8. Tester le formulaire de contact : soumission sans `[[ ENDPOINT_FORMULAIRE ]]` → message d'erreur propre ; avec endpoint valide → succès
9. Naviguer sur `mentions.html` : nav retourne vers `index.html#section`, footer cohérent

---

## 5. Workflow de personnalisation

L'utilisateur final a besoin de remplacer les placeholders `[[ ... ]]` et les `data-src` des images. Séquence recommandée :

1. **Grep tous les placeholders** : `grep -rn "\[\[" *.html` → donne toutes les lignes à remplir (les deux pages)
2. **Remplacer par `find/replace` global** dans l'éditeur (un passage par placeholder unique)
3. **Configurer l'endpoint du formulaire** : remplacer `[[ ENDPOINT_FORMULAIRE ]]` dans `index.html` par une URL Formspree / Basin / endpoint PHP maison
4. **Placer les photos** dans un dossier `photos/` adjacent aux HTML (convention : `photos/<categorie>-<nom>.jpg`). Les placeholders SVG restent visibles tant que la vraie photo n'est pas chargée.
5. **Retirer la classe `img-treat`** sur les photos déjà parfaitement exposées (la garder pour harmoniser des photos hétérogènes)
6. **OG/meta** : mettre à jour `og:url`, `og:image`, `canonical` avec l'URL de production, et fournir un `og-image.jpg` (1200×630) à la racine
7. **Tester en local** avec `python3 -m http.server 8000` avant de pousser

### Traitement des photos

Pipeline non-destructif : les fichiers restent neutres, le rendu éditorial (grayscale + sépia + hue-rotate) est appliqué **au runtime** par la classe CSS `.img-treat`. Ne jamais cuire le traitement dans les JPG.

**Outillage requis :** `imagemagick`, `libheif-examples`, paquet `webp` (fournit `cwebp`).

**Flux :**
1. Renommer les sources avec les slots du site : `escalier-01.HEIC`, `cheminee-02.jpeg`, `mobilier-03.jpg`, …
2. Les placer dans `photos/source/` (créé au premier lancement du script)
3. Lancer `./scripts/process-photos.sh`
4. Le script produit `photos/<slot>.jpg` (quality 85, ≤1600 px de large, EXIF strippé) et `photos/<slot>.webp` (quality 82)
5. Le JS détecte WebP à l'exécution : les navigateurs modernes chargent le `.webp` (~30 % plus léger), les autres retombent sur le `.jpg`
6. Idempotent : le script saute les fichiers dont les sorties sont plus récentes que la source

**Slots actuellement référencés** (à remplir ou à ajuster dans `index.html`) :
- `escalier-01` à `escalier-04` (section 01)
- `cheminee-01` à `cheminee-02` (section 02 — 2 vues de la cheminée «&nbsp;Goutte&nbsp;»)
- `mobilier-01` à `mobilier-03` (section 03 — trio : table Occitane, console, pied étoile)
- `verriere-01` à `verriere-03`, `porte-01`, `porte-02`, `linteau-01` (section 04 Portes & Verrières)
- `atelier-01` à `atelier-05` (section 05 Atelier — chantier + fabrication)

---

## 6. Déploiement

**Cible :** GitHub Pages. Ne publie **que** les fichiers web-facing (HTML + CSS + JS + photos traitées). Le reste du repo (scripts, docs, sources photo, workflow CI) reste accessible aux contributeurs mais n'est pas exposé en ligne.

**Workflow :** `.github/workflows/deploy.yml` — se déclenche à chaque push sur `main`. Il copie `index.html`, `mentions.html`, `styles.css`, `script.js`, `photos/*.jpg`, `photos/*.webp` dans un dossier `_site/` qui est ensuite déployé par `actions/deploy-pages@v4`.

**Setup initial (une seule fois) :**
1. Créer le repo sur github.com (nom suggéré : `just`)
2. `git remote add origin git@github.com:<user>/just.git`
3. `git push -u origin main`
4. Aller dans **Settings → Pages → Build and deployment → Source : GitHub Actions**
5. Attendre le premier run (~2 min) ; l'URL finale apparaît dans l'onglet Actions

**URL attendue :** `https://<user>.github.io/just/`

**Après le premier déploiement :** mettre à jour les 4 placeholders `[[ https://votre-site.fr/ ]]` et `[[ https://votre-site.fr/og-image.jpg ]]` dans `index.html` avec l'URL réelle, uploader `og-image.jpg` (1200×630) à la racine.

---

## 7. Évolutions prioritaires si demandées

Déjà livré (avril 2026) :
- ✅ Page `mentions.html` (charte partagée, lien dans le footer)
- ✅ Formulaire de contact (HTML natif + fetch POST vers endpoint configurable, feedback inline)
- ✅ Favicon SVG inline + OG/Twitter cards
- ✅ Lazy loading des vraies photos (IntersectionObserver avec `rootMargin: 400px`, `img.decoding='async'`)

Restant si demandé :
1. **Galeries étendues par catégorie** — dupliquer la grille mobilier en `mobilier.html` / `escaliers.html` etc. avec plus de pièces. Partager nav/footer à la main (pas de build).
2. **Page 404 personnalisée** — étincelle solitaire au centre, lien retour (cf. DESIGN.md §9)
3. **Sitemap.xml + robots.txt** pour le SEO
4. **Image OG réelle** — générer `og-image.jpg` (1200×630) à partir du hero avec la charte du site

---

## 8. Évolutions à refuser

Si l'utilisateur demande, expliquer poliment pourquoi c'est contraire à la direction du projet :

- ❌ **Thème clair** ou toggle dark/light : le noir est l'identité, un mode clair serait un autre site
- ❌ **Framework JS** (React, Vue, Svelte) : le projet fait ~1700 lignes, un framework serait un overhead démesuré
- ❌ **CMS** (WordPress, Strapi) : le contenu évolue peu (quelques pièces par an), gérer en HTML direct est plus simple
- ❌ **Chatbot commercial** ou widget tiers : rompt l'atmosphère de galerie
- ❌ **Pop-up newsletter** : non
- ❌ **Animations GSAP** ou Lenis : le vanilla actuel est suffisant, les dépendances sont du poids mort

---

## 9. Contact

Si tu es un agent IA qui reprend ce projet et que quelque chose te paraît incohérent avec ces docs, **demande avant de modifier**. Il y a probablement une raison historique derrière la bizarrerie, et la liste des bugs passés (section 3) n'est pas exhaustive.

Le fichier `DESIGN.md` complète ce document sur les aspects purement esthétiques. Les deux sont à jour au moment de la création de cette version.
