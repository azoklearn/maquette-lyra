# Lyra Motors - Site vitrine

Site vitrine premium pour une société d'import / vente de véhicules (Europe & USA → France).
HTML/CSS/JavaScript **sans dépendance ni build** : il suffit d'ouvrir les fichiers.

## Pages
| Fichier | Page |
|---|---|
| `index.html` | Accueil (hero, importation sur mesure, catégories, processus, avis, CTA) |
| `vehicules.html` | Véhicules (stock filtrable + CTA leboncoin, et section « à l'importation ») |
| `importation.html` | Importation (carte animée des routes, processus détaillé, FAQ) |
| `contact.html` | Contact (formulaire + coordonnées) |
| `admin.html` | **Panel d'édition du catalogue** (non référencé, non lié depuis le site) |

## Lancer le site
- **Simple** : double-cliquez sur `index.html`.
- **Recommandé** (pour les polices/animations dans de bonnes conditions), servez le dossier :
  ```bash
  python3 -m http.server 8000
  ```
  puis ouvrez http://localhost:8000

## Structure
```
lyra/
├─ index.html · vehicules.html · importation.html · contact.html
├─ admin.html             → panel d'édition du catalogue
├─ assets/
│  ├─ css/styles.css      → design system complet (couleurs, typo, composants)
│  ├─ data/
│  │  └─ vehicules.json   → LE CATALOGUE : source unique des annonces
│  ├─ js/
│  │  ├─ main.js          → nav, animations au scroll, filtres, formulaire…
│  │  ├─ vehicules.js     → construit les deux grilles à partir du JSON
│  │  └─ admin.js         → panel : lit et écrit le JSON via l'API GitHub
│  └─ img/
│     ├─ logo.png         → écusson Lyra Motors (header + footer)
│     ├─ favicon.svg      → favicon accordé à l'écusson
│     └─ vehicules/       → photos envoyées depuis le panel
└─ README.md
```

## Palette
Toute la palette est dérivée du **logo** (écusson navy) et volontairement lumineuse :
le fond reste clair, et les blocs sombres utilisent un navy éclairci pour ne pas alourdir la page.
Tout est défini dans `:root` (`assets/css/styles.css`).

| Rôle | Token | Valeur |
|---|---|---|
| Fond global (platine bleuté) | `--canvas` | `#EEF1F5` |
| Surfaces / cartes | `--surface` | `#FBFCFE` |
| Encre (titres) | `--ink` | `#122231` |
| Sections sombres (navy éclairci) | `--brand` / `--brand-deep` | `#12395C` / `#0B2740` |
| **Accent** (action, remplissage) | `--accent` | `#2A6C9E` |
| Accent foncé (**tout texte** accentué sur fond clair) | `--accent-deep` | `#1B4A6E` |
| Acier clair (accents des sections **sombres**) | `--accent-2` | `#AECFE8` |
| Bleu clair (texte accentué sur fond **sombre**) | `--accent-on-dark` | `#8FC3E6` |

**Deux règles à respecter si vous modifiez le site :**
1. Sur fond **clair**, `--accent` ne sert qu'en **remplissage** (boutons). Tout **texte** accentué
   doit utiliser `--accent-deep`, sinon le contraste passe sous le seuil WCAG.
2. Sur fond **sombre** (navy ou photo), les accents passent en `--accent-2` ou `--accent-on-dark`.
   Les CTA des sections navy sont d'ailleurs des **plaques claires** à texte navy.

Toutes les paires de texte respectent WCAG AA (≥ 4,5:1) et les bordures de contrôles ≥ 3:1
(`--line-strong`). Changer une seule valeur de `:root` suffit à repropager la couleur partout.

## Vidéo
Le site intègre de la vidéo à trois endroits, toujours **muette, en boucle et sans contrôle** :
- **hero de l'accueil** : **100 % vidéo**, un plan unique en plein cadre (quai de ferries,
  voitures au premier plan).
  > **A REGLER AVANT MISE EN LIGNE** - le fichier actuel est une *prévisualisation* iStock :
  > il porte le **filigrane Getty**, ne fait que **768x432** (soit x3,3 d'agrandissement sur
  > écran retina) et **n'est pas licencié**. Achetez le fichier HD sur iStock, hébergez-le, et
  > remplacez le `src` du `<video class="hero__video">` dans `index.html`.
- **galerie de l'accueil** : 3 tuiles animées (badge ▶) ;
- **page Importation** : bande « Transport & suivi en direct » (logistique portuaire).

Garde-fous (importants si vous modifiez ces blocs) :
- les vidéos **hors hero** sont posées par-dessus une image de repli et ne sont révélées que
  si elles démarrent réellement. Connexion lente, autoplay refusé, mobile économe : l'image
  reste, rien n'est cassé ;
- le **hero n'a pas d'image de repli** : son filet de sécurité est l'aplat marine de la section
  (`.hero { background: var(--brand-deep) }`). Si la vidéo ne démarre pas, le hero retombe sur
  ce marine, sur lequel le texte blanc reste parfaitement lisible ;
- attributs obligatoires pour l'autoplay mobile : `muted loop playsinline` ;
- les vidéos hors hero sont en `preload="none"` et ne se chargent qu'à l'approche de
  l'écran, puis se mettent en pause quand elles en sortent ;
- lecture suspendue quand l'onglet passe en arrière-plan, et **aucune vidéo ne démarre**
  si l'utilisateur a activé « réduire les animations » (`prefers-reduced-motion`). Dans ce
  cas la vidéo du hero est tout de même chargée et **figée sur une image fixe**
  (`currentTime = 6`) : le hero garde son visuel sans qu'aucun pixel ne bouge.

Pour changer une vidéo : remplacez l'URL dans l'attribut `data-video` (ou `src` pour le hero).
Les fichiers actuels viennent de **Pexels** (libres d'usage) et sont chargés en ligne.

## Photos
Le site est illustré avec de **vraies photos** (voitures, port, atelier) issues de **Pexels**
(banque d'images gratuite, libre d'usage), chargées en ligne. Trois règles :

1. **Aucune photo montrant des personnes identifiables.** Des inconnus en photo laisseraient
   croire qu'il s'agit de vos clients ou de votre équipe. Les visuels « humains » sont donc
   remplacés par des objets parlants : clés sur cuir, atelier, quai portuaire.
2. Si une photo ne charge pas (hors-ligne, lien changé), l'**illustration SVG** reprend
   automatiquement le relais : le site n'est jamais « cassé ».
3. Les photos des **cartes véhicules** sont des visuels de démonstration. Elles se changent
   désormais annonce par annonce dans le **panel** (voir « Catalogue » ci-dessous), pas dans le code.
4. La catégorie **Sportives & GT** est illustrée en muscle car américaine : Camaro ZL1 sur la
   tuile catégorie (`CAT` dans `main.js`), Shelby GT350 sur la tuile galerie (`index.html`),
   Corvette C8 sur la carte véhicule (`VEH`). Si vous changez ces plans, gardez une voiture
   **haute dans le cadre** pour la tuile catégorie : son voile couvre le tiers bas.

## Catalogue et panel d'administration

### Comment ça marche
Toutes les annonces vivent dans **un seul fichier** : `assets/data/vehicules.json`.
Il n'y a **aucune base de données** et **aucun serveur** : le dépôt GitHub *est* la base.

```
admin.html  --(API GitHub)-->  assets/data/vehicules.json  --(fetch)-->  vehicules.html
```

`vehicules.js` lit ce fichier et construit **deux grilles** à partir du champ `statut` :

| `statut` | Section | Bouton |
|---|---|---|
| `stock` | *Nos véhicules disponibles à l'import* | **Voir l'annonce** → leboncoin |
| `import` | *Disponibles à l'importation* | **Demander ce véhicule** → contact pré-rempli |

Les compteurs des filtres (`Tous 11`, `Sportives & GT 3`…) se calculent tout seuls : plus de
chiffre écrit en dur à corriger quand vous ajoutez une annonce. Une catégorie devenue vide
disparaît de la barre de filtres.

### Utiliser le panel
1. Ouvrez `admin.html` (par exemple `https://<votre-site>/admin.html`). La page est en
   `noindex` et **n'est liée depuis aucune page du site**.
2. **La première fois seulement**, sur chaque ordinateur : collez votre jeton GitHub et
   choisissez un mot de passe (12 caractères minimum).
3. **Ensuite, vous ne tapez plus que le mot de passe.** Le panel s'ouvre directement sur le
   catalogue.
4. Ajoutez / modifiez / supprimez. Chaque enregistrement crée un **commit** dans le dépôt.
   GitHub Pages reconstruit le site en une à deux minutes.

Le jeton GitHub se crée dans *Settings → Developer settings → Personal access tokens →
**Fine-grained tokens*** :
- **Repository access** : uniquement `maquette-lyra`
- **Permissions → Repository → Contents** : `Read and write`
- **rien d'autre**, et une expiration courte (30 à 90 jours)

Une photo peut être fournie de trois façons, au choix :
- une **adresse d'image** (`https://…`) ;
- un **fichier envoyé depuis le panel** : il est déposé dans `assets/img/vehicules/` (4 Mo max) ;
- un **chemin Pexels** (`16284856/pexels-photo-16284856.jpeg`), comme les visuels de démonstration.

### Sécurité : comment le jeton est protégé

**Le jeton n'est jamais écrit dans le dépôt.** Il est chiffré dans votre navigateur avec votre
mot de passe, et le résultat chiffré est rangé dans le `localStorage` de cet ordinateur :

| | |
|---|---|
| Chiffrement | **AES-256-GCM** (authentifié) |
| Dérivation de la clé | **PBKDF2-SHA256, 250 000 tours**, sel aléatoire de 16 octets |
| Vérification du mot de passe | aucune : c'est le déchiffrement lui-même qui échoue |

Le mot de passe **est** la clé de déchiffrement, pas un simple écran de garde : sans lui, ce qui
est stocké est inexploitable, et il n'existe nulle part de copie à comparer. Un essai coûte
environ 50 ms, ce qui rend une attaque par force brute très lente — à condition que le mot de
passe soit réellement solide.

Conséquences pratiques, à connaître :
- **Mot de passe perdu = jeton perdu.** Il n'y a pas de récupération : on efface le coffre et on
  recommence avec un nouveau jeton GitHub. C'est le prix d'un chiffrement réel.
- Le jeton est enregistré **par ordinateur et par navigateur**. Sur une autre machine, il faut
  refaire la configuration une fois.
- Le panel **se reverrouille tout seul après 30 minutes** sans activité, et le bouton
  *Verrouiller* le fait immédiatement.
- Un jeton refusé par GitHub n'est **pas** conservé : la configuration recommence proprement.
- `admin.html` est un fichier public comme les autres. N'importe qui peut l'ouvrir, mais sans le
  mot de passe **et** sans le coffre présent sur cet ordinateur, la page ne fait rien. Si vous
  voulez une vraie page privée, hébergez-la ailleurs que sur le site public.
- Le chiffrement exige **https** (ou `localhost`) : en ouvrant le fichier par double-clic
  (`file://`), le panel affiche un message d'explication et refuse de fonctionner.
- Le panel envoie le `sha` du fichier à chaque écriture : si quelqu'un a modifié le catalogue
  entre-temps, GitHub **refuse** au lieu d'écraser, et le panel vous demande de recharger.

> **Ce qu'il ne faut pas faire :** écrire le jeton en dur dans `admin.js` ou dans un fichier du
> dépôt. Sur un dépôt public, le *secret scanning* de GitHub le détecte et le **révoque
> automatiquement** ; le panel cesserait de fonctionner de lui-même. Et un mot de passe vérifié
> en JavaScript ne protégerait rien, puisque le jeton serait lisible dans la source de la page.

### Limite connue
La liste des véhicules est construite **par JavaScript**. Sans JS, la page affiche un message
d'explication plutôt que les cartes (le reste de la page fonctionne normalement). C'est le prix
du « pas de base de données, pas de build ». Si le référencement de chaque annonce devient
important, l'étape suivante est une **GitHub Action** qui régénère le HTML à chaque commit du
JSON : même panel, même fichier, mais des cartes présentes dans la page servie.

## À personnaliser
1. **Vidéo du hero (accueil)** - `src` du `<video class="hero__video">` dans `index.html`.
   Le clip actuel est un fichier de prévisualisation iStock à remplacer (voir l'encadré plus
   haut). Si vous changez de plan, **revérifiez le contraste du texte** : le voile
   (`.hero__scrim`) et l'étalonnage (`.hero__video { filter }`) sont calibrés pour un plan
   très clair. Un plan sombre passera derrière un voile trop lourd ; les valeurs à remettre
   sont notées en commentaire au-dessus de `.hero__scrim` dans `styles.css`.
2. **Liens leboncoin** - chaque annonce pointe pour l'instant vers `https://www.leboncoin.fr`.
   Renseignez l'URL réelle dans le champ « Lien de l'annonce leboncoin » du panel.
3. **Formulaire de contact** - `contact.html` affiche une confirmation côté navigateur (démo).
   Pour recevoir réellement les demandes, branchez le `<form id="contact-form">` à votre
   service (Formspree, EmailJS, ou un back-end) dans `assets/js/main.js`.
4. **Coordonnées** - e-mail / téléphone (`contact@lyramotors.fr`, `+33 6 00 00 00 00`) à remplacer
   partout (header, footer, page contact).
5. **Couleurs & typo** - tout est centralisé dans les variables `:root` en haut de `styles.css`
   (voir la section « Palette » ci-dessus et ses deux règles d'usage).
6. **Logo** - `assets/img/logo.png` (écusson détouré, fond transparent). Le remplacer suffit :
   il est utilisé dans les en-têtes et pieds de page des 4 pages.

## Prompt image du hero (archive)
Le hero est aujourd'hui entièrement vidéo et n'utilise plus d'image. Ce prompt est conservé
si vous souhaitez revenir à un fond photo : générez une image **16:9**, enregistrez-la sous
`assets/img/hero.jpg` et rajoutez un `<img class="hero__img">` sous `.hero__split`.

> Wide cinematic photograph at golden-hour dawn on a premium car-export quay. In the foreground,
> three distinct vehicles lined up on a polished concrete dock, rim-lit by warm sunrise light:
> a rugged American pickup truck on the left, a low sleek sports car (Porsche-style silhouette)
> in the centre, and an elegant classic sedan on the right. In the background, a large container
> cargo ship with stacked containers and tall port cranes on calm water, soft morning haze.
> Warm champagne-gold and deep petrol-blue palette, ivory sky with a soft sun glow, refined
> luxurious editorial mood, subtle film grain, muted elegant tones. Professional automotive
> photography, shallow depth of field, 35mm, ultra-detailed, no text, no logos. --ar 16:9

## Accessibilité & robustesse
- Entièrement responsive (mobile, tablette, desktop) + menu mobile plein écran.
- Respecte `prefers-reduced-motion`.
- Le contenu reste **visible même si le JavaScript est désactivé** (les états d'animation
  sont conditionnés à la classe `.js`).
- Polices Google Fonts (Fraunces, Manrope, Space Mono) avec repli système si hors-ligne.
