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
| `vehicule.html` | **Fiche véhicule** — une page pour tout le catalogue (`?id=<identifiant>`) |
| `mentions-legales.html` | Mentions légales (obligatoires, art. 6-III LCEN) |
| `confidentialite.html` | Politique de confidentialité (RGPD) |
| `cgv.html` | Conditions générales de vente et de service |
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
│  │  ├─ main.js           → nav, animations au scroll, filtres, formulaire…
│  │  ├─ vehicules-lib.js  → photos, WhatsApp, liens : partagé liste + fiche
│  │  ├─ vehicules.js      → construit les deux grilles à partir du JSON
│  │  ├─ vehicule-detail.js→ construit la fiche d'un véhicule
│  │  └─ admin.js          → panel : lit et écrit le JSON via l'API GitHub
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
- **hero de l'accueil** : **100 % vidéo**, un plan unique en plein cadre : un coupé américain
  descendant la rampe d'un navire roulier à l'heure bleue. Fichier local
  (`assets/video/hero.mp4`, 368 Ko, 1280x720, 6 s, sans piste audio).
  > **A REMPLACER** - ce plan a été généré par IA (Kling) sur un **palier gratuit**. Il porte
  > deux filigranes visibles, **VEED** en haut à droite et **KlingAI** en bas à droite, et la
  > licence d'un palier gratuit ne couvre généralement pas l'usage commercial. Ré-exportez
  > depuis un palier payant et remplacez `assets/video/hero.mp4` : rien d'autre ne bouge.
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

### Fiche véhicule
Chaque carte est **cliquable** et mène à `vehicule.html?id=<identifiant>` : une seule page sert
tout le catalogue. On y trouve la galerie, les caractéristiques, le prix, les deux boutons
d'action et trois suggestions de la même catégorie.

Techniquement, la carte est rendue cliquable par un **lien « étiré »** : le `<a>` du titre couvre
toute la carte via son `::after`. C'est ce qui permet de garder les boutons *Voir l'annonce* et
*WhatsApp* fonctionnels **sans imbriquer un lien dans un autre**, ce que le HTML interdit.

### Plusieurs photos par annonce
`photos` est une **liste**. La première sert de vignette dans la grille, les suivantes
alimentent la galerie de la fiche (vignettes cliquables sous l'image principale). Un compteur
apparaît sur la vignette dès qu'il y a plus d'une photo.

Sur les annonces **à l'importation**, la galerie est légendée « Exemples de ce modèle » : ces
véhicules n'existent pas encore en stock, les photos illustrent le modèle et pas un exemplaire
précis. Sans cette mention, deux teintes différentes dans la même galerie passeraient pour une
erreur.

### WhatsApp
Chaque véhicule porte un bouton WhatsApp vers le **06 19 78 67 52**, avec un message déjà
rédigé, **différent selon la disponibilité** :

| Statut | Message pré-rempli |
|---|---|
| `stock` | « Bonjour Lyra Motors, je suis intéressé par la **Ford Mustang GT** à **62 900 €** vue sur votre site. Est-elle toujours disponible ? » |
| `import` | « Bonjour Lyra Motors, je souhaite faire importer une **Camaro ZL1** (estimation **72 000 €** vue sur votre site). Pouvez-vous me dire ce qui est possible et sous quel délai ? » |

Le numéro se change à un seul endroit : la constante `WHATSAPP` en haut de
`assets/js/vehicules-lib.js` (format international sans espace ni `+` : le `0` initial saute,
`06 19 78 67 52` devient `33619786752`).

Le bouton est un **contour navy avec le logo vert** plutôt qu'un aplat vert : la couleur de la
marque WhatsApp jurerait avec la palette, alors que le logo suffit à le rendre reconnaissable.

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

Les photos s'ajoutent en liste, dans l'ordre que vous voulez (flèches ↑ ↓ pour réordonner,
✕ pour retirer). **La première est la vignette.** Chaque ligne accepte :
- une **adresse d'image** (`https://…`) ;
- un **chemin Pexels** (`16284856/pexels-photo-16284856.jpeg`), comme les visuels de démonstration ;
- ou vous envoyez **plusieurs fichiers d'un coup** depuis l'ordinateur : ils sont déposés dans
  `assets/img/vehicules/` à l'enregistrement (JPEG/PNG/WebP, 4 Mo par fichier).

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

## Pages légales

Trois pages, reliées depuis le pied de page de tout le site.

### Ce qui reste à faire avant la mise en ligne
L'identité de la société est renseignée (SIREN 994 734 788, SIRET 994 734 788 00015,
TVA FR55 994 734 788, SARL au capital de 100 €, créée le 03/12/2025, immatriculée au RNE
le 12/12/2025). Il reste **neuf** mentions surlignées <code>À COMPLÉTER</code> :

| Page | À renseigner |
|---|---|
| Mentions légales | greffe d'immatriculation, adresse e-mail, directeur de la publication (le gérant), statut mandataire/revendeur, médiateur de la consommation |
| Confidentialité | adresse e-mail de contact pour l'exercice des droits |
| CGV | statut juridique, portée du droit de rétractation, garantie commerciale |

Le **code NAF n'est volontairement pas affiché** : il n'est pas obligatoire dans des mentions
légales, et le code enregistré (71.12B, ingénierie) ne correspond pas à l'activité décrite sur
le site. L'afficher signalerait l'écart à tout visiteur. Voir l'avertissement ci-dessous.

### Deux points qui demandent un arbitrage
1. **Mandataire ou revendeur ?** Le statut change tout : qui doit la garantie légale de
   conformité, qui est vendeur, comment la TVA s'applique. Les CGV posent les deux hypothèses
   côte à côte ; il faut trancher et supprimer celle qui ne s'applique pas.
2. **Droit de rétractation.** Un véhicule sourcé sur cahier des charges peut relever de
   l'exception de l'article L221-28 3° du code de la consommation (bien personnalisé). C'est
   une question d'espèce : à arbitrer avec un conseil.

> Les CGV sont une **base structurée, pas un document validé**. Faites-les relire par un
> professionnel du droit avant de les opposer à un client.

### Cookies : il n'y en a pas
Le site ne dépose **aucun cookie** chez le visiteur : pas de mesure d'audience, pas de traceur
publicitaire. Aucun bandeau de consentement n'est donc nécessaire, et c'est écrit tel quel dans
la politique de confidentialité.

En revanche, l'affichage des pages déclenche des requêtes vers **Google Fonts**, **Pexels**,
**iStock** et **GitHub Pages**, qui reçoivent de ce fait l'adresse IP du visiteur. C'est
documenté honnêtement dans la politique de confidentialité. Pour supprimer le point le plus
sensible (Google Fonts, sur lequel la jurisprudence européenne est sévère), il suffirait
d'**héberger les polices dans `assets/`** au lieu de les charger depuis Google : c'est une
demi-heure de travail et cela accélère aussi le premier rendu.

## À personnaliser
1. **Vidéo du hero (accueil)** - remplacez `assets/video/hero.mp4` (voir l'encadré plus haut).
   Si vous changez de plan, **revérifiez le contraste du texte** : le voile (`.hero__scrim`) et
   l'étalonnage (`.hero__video { filter }`) sont calibrés ensemble.
   > Contre-intuitif, et vérifié à la mesure : le voile reste **lourd** même avec ce plan
   > sombre. Le ciel couvert occupe tout le haut-gauche, donc le tiers gauche n'est pas
   > sombre (luminance 117/255) alors que c'est là que se trouve toute la copie. Avec le
   > voile « d'origine », l'eyebrow tombe à 2,68:1, sous le seuil. Ce qui a été neutralisé,
   > c'est l'**étalonnage** (`brightness .80 -> 1.00`), pour que la vidéo garde sa propre
   > lumière au lieu d'être écrasée.
   > Contrastes mesurés sur les pixels rendus, seconde par seconde : nav 10,7 / eyebrow 6,1 /
   > H1 8,5 / paragraphe 11,4. Tous au-dessus du seuil.
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
