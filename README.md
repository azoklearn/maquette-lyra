# Lyra Motors - Site vitrine

Site vitrine premium pour une société d'import / vente de véhicules (Europe & USA → France).
HTML/CSS/JavaScript **sans dépendance ni build** : il suffit d'ouvrir les fichiers.

## Pages
| Fichier | Page |
|---|---|
| `index.html` | Accueil (hero, importation sur mesure, catégories, processus, avis, CTA) |
| `vehicules.html` | Véhicules (cartes filtrables, CTA leboncoin) |
| `importation.html` | Importation (carte animée des routes, processus détaillé, FAQ) |
| `contact.html` | Contact (formulaire + coordonnées) |

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
├─ assets/
│  ├─ css/styles.css      → design system complet (couleurs, typo, composants)
│  ├─ js/main.js          → nav, animations au scroll, filtres, formulaire…
│  └─ img/
│     ├─ logo.png         → écusson Lyra Motors (header + footer)
│     ├─ hero.png         → photo du hero (accueil)
│     └─ favicon.svg      → favicon accordé à l'écusson
└─ README.md
```

## Palette
Le design system repose sur trois matières, toutes définies dans `:root` (`assets/css/styles.css`) :

| Rôle | Token | Valeur |
|---|---|---|
| Fond global (platine froid) | `--canvas` | `#EEF0F3` |
| Surfaces / cartes | `--surface` | `#FBFBFD` |
| Encre (titres) | `--ink` | `#111C26` |
| Navy de l'écusson (sections sombres) | `--brand` / `--brand-deep` | `#082038` / `#001020` |
| **Carmin** (action, remplissage) | `--accent` | `#C22A33` |
| Carmin foncé (**tout texte** accentué sur fond clair) | `--accent-deep` | `#7A1D27` |
| Acier clair (accents des sections **sombres**) | `--accent-2` | `#AEC8DC` |
| Carmin clair (texte accentué sur fond **sombre**) | `--accent-on-dark` | `#E97078` |

**Deux règles à respecter si vous modifiez le site :**
1. Sur fond **clair**, le carmin `--accent` ne sert qu'en **remplissage** (boutons). Tout **texte**
   accentué doit utiliser `--accent-deep`, sinon le contraste passe sous le seuil WCAG.
2. Sur fond **sombre** (navy ou photo), les accents passent en `--accent-2` (acier) ou
   `--accent-on-dark` : le carmin foncé y devient illisible. Les CTA des sections navy sont
   d'ailleurs des **plaques acier** à texte navy, pas des boutons carmin.

Toutes les paires de texte respectent WCAG AA (≥ 4,5:1) et les bordures de contrôles ≥ 3:1
(`--line-strong`). Changer une seule valeur de `:root` suffit à repropager la couleur partout.

## Photos
Le site est illustré avec de **vraies photos** (voitures, port, showroom) issues de **Pexels**
(banque d'images gratuite, libres d'usage), chargées en ligne. Deux garde-fous :
- si une photo ne charge pas (hors-ligne, lien changé), l'**illustration SVG** reprend
  automatiquement le relais - le site n'est jamais « cassé » ;
- les photos des **cartes véhicules** sont des visuels de démonstration : remplacez-les par
  les photos réelles de vos annonces (voir le tableau de correspondance dans `assets/js/main.js`,
  objet `VEH`, ou déposez vos propres fichiers).

## À personnaliser
1. **Image du hero (accueil)** - la photo utilisée est `assets/img/hero.png`. Pour la changer,
   remplacez simplement ce fichier (un prompt de génération est fourni plus bas).
2. **Liens leboncoin** - dans `vehicules.html`, chaque bouton *« Voir l'annonce »* pointe
   pour l'instant vers `https://www.leboncoin.fr`. Remplacez par l'URL réelle de chaque annonce
   (repères `<!-- Remplacer href par l'URL de l'annonce leboncoin -->`).
3. **Formulaire de contact** - `contact.html` affiche une confirmation côté navigateur (démo).
   Pour recevoir réellement les demandes, branchez le `<form id="contact-form">` à votre
   service (Formspree, EmailJS, ou un back-end) dans `assets/js/main.js`.
4. **Coordonnées** - e-mail / téléphone (`contact@lyramotors.fr`, `+33 6 00 00 00 00`) à remplacer
   partout (header, footer, page contact).
5. **Couleurs & typo** - tout est centralisé dans les variables `:root` en haut de `styles.css`
   (voir la section « Palette » ci-dessus et ses deux règles d'usage).
6. **Logo** - `assets/img/logo.png` (écusson détouré, fond transparent). Le remplacer suffit :
   il est utilisé dans les en-têtes et pieds de page des 4 pages.

## Prompt image du hero
Générez une image **16:9** et enregistrez-la sous `assets/img/hero.jpg` :

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
