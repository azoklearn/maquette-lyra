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
│  └─ img/favicon.svg     → logo / favicon (créé sur mesure)
└─ README.md
```

## Photos
Le site est illustré avec de **vraies photos** (voitures, port, showroom) issues de **Pexels**
(banque d'images gratuite, libres d'usage), chargées en ligne. Deux garde-fous :
- si une photo ne charge pas (hors-ligne, lien changé), l'**illustration SVG** reprend
  automatiquement le relais - le site n'est jamais « cassé » ;
- les photos des **cartes véhicules** sont des visuels de démonstration : remplacez-les par
  les photos réelles de vos annonces (voir le tableau de correspondance dans `assets/js/main.js`,
  objet `VEH`, ou déposez vos propres fichiers).

## À personnaliser
1. **Image du hero (accueil)** - une photo premium s'affiche par défaut. Pour la vôtre,
   déposez votre visuel sous `assets/img/hero.jpg` : il remplace automatiquement la photo par défaut.
   → Prompt de génération fourni ci-dessous.
2. **Liens leboncoin** - dans `vehicules.html`, chaque bouton *« Voir l'annonce »* pointe
   pour l'instant vers `https://www.leboncoin.fr`. Remplacez par l'URL réelle de chaque annonce
   (repères `<!-- Remplacer href par l'URL de l'annonce leboncoin -->`).
3. **Formulaire de contact** - `contact.html` affiche une confirmation côté navigateur (démo).
   Pour recevoir réellement les demandes, branchez le `<form id="contact-form">` à votre
   service (Formspree, EmailJS, ou un back-end) dans `assets/js/main.js`.
4. **Coordonnées** - e-mail / téléphone (`contact@lyramotors.fr`, `+33 6 00 00 00 00`) à remplacer
   partout (header, footer, page contact).
5. **Couleurs & typo** - tout est centralisé dans les variables `:root` en haut de `styles.css`.

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
