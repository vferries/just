# DESIGN.md

Document de référence pour la direction visuelle du site de l'atelier de ferronnerie. À lire avant toute modification stylistique — les choix ici ne sont pas arbitraires.

---

## 1. Direction visuelle

**Nom de code :** *Forge & Soie* — industriel luxueux.

**Tension centrale :** la brutalité du métal travaillé (acier, étincelles, forge) + l'élégance d'une galerie d'art éditoriale (typographie raffinée, espaces aérés, images traitées comme des œuvres).

Le site n'est **ni** un site d'artisan rustique (pas de bois clair, pas de typos manuscrites, pas de couleurs terreuses), **ni** un portfolio designer froid (pas de tout-blanc, pas de grid systémique, pas de sans-serif partout). C'est un entre-deux : **noir profond + chaleur du feu**, avec une typographie qui tire vers la haute couture plus que vers l'atelier.

**Références mentales utiles :**
- Magazine éditorial sombre (The Gentlewoman, Cabana en version sombre)
- Galeries d'art contemporain (fond noir, lumière dirigée sur les pièces)
- Photographie industrielle noir & blanc + accents d'étincelle

**À fuir absolument :**
- Sites "artisan" avec fond sépia et couronnes de laurier
- Esthétique "tech startup" (purple gradients, Inter partout, cards arrondies)
- Typographies manuscrites, scripts, ou tout ce qui imite l'écriture
- Photos de ferronnerie tirant vers le kitch médiéval / rustique

---

## 2. Palette

Les couleurs vivent dans `:root` comme variables CSS. **Ne jamais en inventer de nouvelles** sans réfléchir à l'équilibre global.

| Variable         | Hex       | Usage                                           |
|------------------|-----------|-------------------------------------------------|
| `--bg`           | `#07070a` | Fond principal, quasi-noir avec nuance bleutée  |
| `--bg-1`         | `#0c0c10` | Sections alternées (escaliers, mobilier)        |
| `--bg-2`         | `#131318` | Cartes, zones surélevées                        |
| `--ink`          | `#f0ece4` | Texte principal (blanc cassé chaud, pas pur)    |
| `--ink-soft`     | `#b8b3a8` | Texte secondaire                                |
| `--ink-muted`    | `#5e5a52` | Méta-infos, labels discrets                     |
| `--line`         | `#1f1f25` | Séparateurs fins                                |
| `--line-bright`  | `#2e2e36` | Séparateurs accentués                           |
| `--spark`        | `#ff7a2e` | **Accent principal** — l'orange braise          |
| `--spark-bright` | `#ffb56b` | Accent clair (hover, cœur d'étincelle)          |
| `--spark-white`  | `#fff4d6` | Le plus clair, ultra-incandescent               |
| `--steel`        | `#8a8e95` | Gris acier (rare, pour contraster)              |

**Règle d'or :** l'orange `--spark` est l'accent, il n'est **jamais** une couleur de remplissage. Il sert à ponctuer, pas à dominer. Utilisé massivement, il casse tout l'équilibre.

Le blanc du texte (`--ink`) est **chaud et cassé** (`#f0ece4`), jamais du blanc pur. Le blanc pur sur ce fond ferait médical.

---

## 3. Typographie

Trois familles, chacune avec un rôle strict. **Ne jamais en ajouter une quatrième.**

### Bodoni Moda — display
```css
font-family: "Bodoni Moda", "Didot", serif;
```
- Pour tous les titres, les citations, les noms de pièces
- Volontairement en italique dans les moments forts (accent émotionnel)
- Le Bodoni a des empattements très fins et des contrastes forts : c'est ce qui donne le côté éditorial/couture
- **Ne jamais** lui donner un `font-weight` supérieur à 500 — ça casse son caractère

### Inter Tight — body
```css
font-family: "Inter Tight", sans-serif;
font-weight: 300;
```
- Sans-serif condensée pour le corps de texte
- Poids 300 par défaut (la légèreté est essentielle)
- Surtout pas Inter "normal" — Inter Tight a une compression qui marche avec le Bodoni

### JetBrains Mono — métadonnées
```css
font-family: "JetBrains Mono", monospace;
letter-spacing: 0.2em;
text-transform: uppercase;
```
- Pour les labels, numéros de section, coordonnées, horaires
- Toujours en MAJUSCULES avec tracking ~0.2em
- Apporte le côté technique/industriel, contrepoint au Bodoni

**Règle :** un titre = Bodoni italique. Un paragraphe = Inter Tight 300. Un label technique = JetBrains uppercase. Jamais l'inverse.

---

## 4. Mise en page et rythme

### Principes structurants
- **Asymétrie volontaire** : les grilles sont décalées, les cartes se chevauchent, les titres cassent parfois l'alignement. Ne jamais tout centrer "pour faire propre".
- **Espaces généreux** : `padding: 10rem 2.5rem` sur les sections est la norme. La respiration fait autant partie du design que les contenus.
- **Max-width 1500px** pour le contenu principal — au-delà, ça devient illisible.
- **Titres démesurés** : `clamp(3rem, 8vw, 8rem)` pour les headings de section, `clamp(3.5rem, 14vw, 16rem)` pour le hero. L'échelle typographique est le principal effet de style.

### Effets d'entrée (reveal au scroll)
Cinq variantes existent, à utiliser selon le contexte :
- `.reveal` — apparition simple avec translateY
- `.reveal-mask` — voile qui se lève latéralement
- `.reveal-image` — image qui dézoome + voile vertical qui se lève
- `.reveal-stagger` — enfants qui apparaissent en cascade
- `.reveal-words` — mot par mot pour les phrases fortes

**Ne jamais** empiler plusieurs reveals sur un même élément, et **ne jamais** révéler des textes trop longs mot par mot (ça traîne).

### Interactions
- Tout élément cliquable ou survolable a un feedback. Pas de bouton qui ne réagit pas.
- Les transitions durent **entre 0.4s et 1.4s** avec `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out prononcé) ou `cubic-bezier(0.76, 0, 0.24, 1)` (ease-in-out marqué). **Jamais** `ease` par défaut.

---

## 5. Le canvas d'étincelles

C'est la signature visuelle du site. À traiter avec précaution.

**Principes :**
- L'émetteur est en **bas du hero**, sa position X avance vers la droite au fil du scroll dans le hero.
- L'émission est **pilotée par la vitesse de scroll**, pas en continu. Tant qu'on ne scrolle pas, rien ne sort.
- Les particules partent **vers la droite, légèrement vers le haut** (~-17°), puis retombent en arc sous la gravité.
- Mix de **points incandescents** (halo radial cuivre) et de **traînées filantes** (lignes courtes).

**Ne pas toucher sauf compréhension complète :**
- Le `ctx.clearRect()` à chaque frame est **obligatoire** — sinon voile noir résiduel qui couvre les sections.
- Le `try/catch` autour de `createRadialGradient` est **nécessaire** — le rayon peut devenir 0 quand une particule meurt, ce qui throw en boucle.
- Les `Math.max(0.5, ...)` sur size et lineWidth protègent aussi contre la même erreur.

**Si tu ajoutes des particules ailleurs** (autres sections par exemple) : conserve le pilotage par `scrollEnergy` pour éviter de cramer des CPU.

---

## 6. Images et placeholders

Deux systèmes coexistent :

1. **Placeholders SVG générés** (dans le JS). Fonctions `makeStaircase`, `makeFireplace`, `makeFurniture`, `makePortrait`. Chacune produit une composition thématique sombre avec accents cuivre. **Seeds déterministes** → chaque image est unique mais stable.

2. **Vraies photos** (via `data-src`). Le JS tente de les charger ; si succès, elles écrasent le placeholder et reçoivent la classe `.img-treat` (filtre grayscale + sepia + hue-rotate) pour harmoniser l'ambiance.

**Philosophie :** le site doit être **visuellement complet même sans photos**. Les placeholders ne sont pas des "trous" mais des compositions assumées.

Quand les vraies photos arrivent :
- Format paysage ou portrait selon la grille (cf. code)
- Minimum 1600px de large
- **Éviter** les photos au flash ou surexposées → le filtre `img-treat` donne mauvais résultat
- **Préférer** les photos en lumière latérale, avec ombres marquées, sur fond neutre

---

## 7. Responsive

**Breakpoints :**
- `900px` : passage majeur (le scroll horizontal devient pile verticale, les grilles se simplifient)
- `720px` : nav réduite, métadonnées secondaires masquées

**Règles :**
- Le sticky et le scroll horizontal sont **désactivés en mobile** (vraiment, sinon c'est cassé).
- En mobile, les grilles complexes (mob-grid 12 colonnes) passent en 2 colonnes simples.
- Le curseur custom est **désactivé** sous 900px ou sur pointeur coarse.
- Le canvas d'étincelles reste actif sur mobile (léger, pas de coût mousemove).

---

## 8. Ce qui ne doit jamais arriver

- ❌ Ajouter une librairie JS (tout est vanilla, et ça doit le rester — moins de poids, moins de CVE, moins de maintenance)
- ❌ Ajouter Tailwind ou une autre méthodologie CSS concurrente aux variables + classes
- ❌ Remplacer une des trois fonts par une "plus moderne"
- ❌ Mettre un gradient pastel / purple / rose quelque part
- ❌ Arrondir les coins (border-radius) sur les images, cartes ou boutons — tout est en angles vifs
- ❌ Utiliser des emojis dans l'interface
- ❌ Casser le principe "noir dominant + orange ponctuel"
- ❌ Ajouter des animations au hover sur tout (seulement sur les éléments signifiants : cartes d'œuvres, liens, CTA)

---

## 9. Extensions futures envisageables

Ces idées respectent la direction et peuvent être ajoutées sans briser la cohérence :
- Une page **galerie par catégorie** avec un lightbox sobre
- Une page **atelier** avec une vidéo muette en fond
- Un **bloc presse** avec logos désaturés sur fond noir
- Un **formulaire de contact** avec champs style editorial (labels JetBrains uppercase, inputs sans bordure visible, underline qui s'allume en orange au focus)
- Une **page 404** avec une étincelle solitaire au centre

Ces idées **cassent** la direction et doivent être refusées :
- Un chatbot / assistant IA
- Des notifications de cookies colorées
- Des badges "certifié / vérifié" en couleurs vives
- Un carrousel automatique de témoignages avec étoiles
