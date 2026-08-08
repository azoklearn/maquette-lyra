/* =====================================================================
   LYRA MOTORS - Fiche véhicule
   Une seule page pour tout le catalogue : vehicule.html?id=<identifiant>.
   Le contenu vient de assets/data/vehicules.json, comme les grilles.
   ===================================================================== */
(function () {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const L = window.LYRA;

  const hote = $("#fiche");
  if (!hote) return;

  const id = new URLSearchParams(location.search).get("id");

  function introuvable(message) {
    hote.innerHTML =
      '<div class="fiche-vide">' +
        "<h1>Véhicule introuvable</h1>" +
        "<p>" + L.esc(message) + "</p>" +
        '<a class="btn btn--accent" href="vehicules.html">Voir tous les véhicules ' +
        '<svg class="arw" width="16" height="16"><use href="#i-arrow-r"/></svg></a>' +
      "</div>";
    document.title = "Véhicule introuvable · Lyra Motors";
  }

  function specLigne(icone, cle, valeur) {
    if (!valeur) return "";
    return '<div class="fspec"><svg width="17" height="17"><use href="#i-' + icone + '"/></svg>' +
           '<span class="k">' + cle + "</span>" +
           '<span class="v">' + L.esc(valeur) + "</span></div>";
  }

  function rendre(v, tous) {
    const estImport = v.statut === "import";
    const clichés = L.photos(v);
    document.title = v.titre + " · Lyra Motors";

    const meta = $('meta[name="description"]');
    if (meta) {
      meta.content = v.titre + (v.annee ? ", " + v.annee : "") +
        (estImport ? ", disponible à l'importation" : ", disponible") +
        (v.prix ? " à " + v.prix + " € clé en main" : "") + ". Import Europe & USA par Lyra Motors.";
    }

    /* Galerie. Pour un véhicule en stock ce sont les photos de CE véhicule.
       Pour l'importation, ce sont des exemples du modèle : la nuance est dite
       explicitement, sinon deux teintes différentes passeraient pour une erreur. */
    const vignettes = clichés.length > 1
      ? '<div class="fgal__thumbs" role="tablist" aria-label="Photos du véhicule">' +
          clichés.map((p, i) =>
            '<button class="fgal__thumb' + (i === 0 ? " is-active" : "") + '" data-i="' + i + '"' +
            ' role="tab" aria-selected="' + (i === 0) + '"' +
            ' aria-label="Photo ' + (i + 1) + " sur " + clichés.length + '">' +
            '<img src="' + L.esc(L.photoURL(p, 220, 165)) + '" alt="" loading="lazy" /></button>').join("") +
        "</div>"
      : "";

    const noteGalerie = estImport && clichés.length > 1
      ? '<p class="fgal__note">Exemples de ce modèle. Le véhicule sera photographié pour vous avant tout engagement.</p>'
      : "";

    const prix = v.prix
      ? '<p class="fprix">' + L.esc(v.prix) + ' <span>€</span>' +
        (v.prixMention ? '<small>' + L.esc(v.prixMention) + "</small>" : "") + "</p>"
      : '<p class="fprix fprix--ask">Prix sur devis</p>';

    const action = estImport
      ? '<a class="lbc lbc--ask" href="contact.html?vehicule=' + encodeURIComponent(v.titre) + '">' +
          '<span class="lbc__label">Demander ce véhicule<small>recherche lancée sous 48 h</small></span>' +
          '<span class="lbc__ico"><svg width="16" height="16"><use href="#i-arrow-r"/></svg></span></a>'
      : '<a class="lbc" href="' + L.esc(v.lien || "https://www.leboncoin.fr") + '" target="_blank" rel="noopener">' +
          '<span class="lbc__label">Voir l\'annonce<small>sur leboncoin pro</small></span>' +
          '<span class="lbc__ico"><svg width="16" height="16"><use href="#i-arrow"/></svg></span></a>';

    const delai = estImport && v.delai
      ? '<p class="fdelai"><svg width="15" height="15"><use href="#i-clock"/></svg>' +
        "Délai estimé : <b>" + L.esc(v.delai) + "</b></p>"
      : "";

    hote.innerHTML =
      '<nav class="crumbs" aria-label="Fil d\'Ariane">' +
        '<a href="index.html">Accueil</a> <span class="sep">/</span> ' +
        '<a href="vehicules.html">Véhicules</a> <span class="sep">/</span> ' +
        "<span>" + L.esc(v.titre) + "</span></nav>" +

      '<div class="fiche">' +
        '<div class="fgal">' +
          '<div class="fgal__main">' +
            '<img id="fgal-img" src="' + L.esc(L.photoURL(clichés[0], 1200, 800)) + '" alt="' + L.esc(v.titre) + '" />' +
            '<span class="vcard__badge">' + L.esc(v.badge || "") + "</span>" +
            (estImport ? '<span class="fgal__tag">À l\'importation</span>' : '<span class="fgal__tag fgal__tag--stock">Disponible</span>') +
          "</div>" +
          vignettes + noteGalerie +
        "</div>" +

        '<aside class="finfo">' +
          '<p class="eyebrow">' + L.esc(v.drapeau || "") + " " + L.esc(v.origine || "") + "</p>" +
          "<h1>" + L.esc(v.titre) + "</h1>" +
          prix + delai +
          '<div class="fspecs">' +
            specLigne("cal", "Année", v.annee) +
            specLigne("gauge", "Kilométrage", v.km) +
            specLigne("engine", "Motorisation", v.motorisation) +
            specLigne("fuel", "Carburant", v.carburant) +
            specLigne("cog", "Boîte", v.boite) +
            specLigne("pin", "Provenance", v.origine) +
          "</div>" +
          '<div class="factions">' + action + L.boutonWhatsApp(v, "lg") + "</div>" +
          '<p class="fnote">Prix clé en main : transport, douane, homologation et carte grise compris. Aucun frais caché.</p>' +
        "</aside>" +
      "</div>";

    /* Galerie : les vignettes changent l'image principale. */
    const principale = $("#fgal-img");
    $$(".fgal__thumb").forEach((b) => {
      b.addEventListener("click", () => {
        const i = parseInt(b.dataset.i, 10);
        principale.src = L.photoURL(clichés[i], 1200, 800);
        $$(".fgal__thumb").forEach((x) => {
          x.classList.toggle("is-active", x === b);
          x.setAttribute("aria-selected", String(x === b));
        });
      });
    });
    principale.addEventListener("error", () => {
      principale.replaceWith(Object.assign(document.createElement("div"),
        { className: "fgal__vide", textContent: "Photo indisponible" }));
    });

    /* Suggestions : même catégorie, même disponibilité, en excluant ce véhicule. */
    const proches = tous.filter((x) => x.id !== v.id && x.categorie === v.categorie).slice(0, 3);
    const bloc = $("#aussi");
    if (proches.length && bloc) {
      bloc.hidden = false;
      $("#grid-aussi").innerHTML = proches.map((x) => {
        const p = L.photos(x)[0];
        return '<a class="mini" href="' + L.esc(L.lienFiche(x)) + '">' +
          '<span class="mini__ph">' + (p ? '<img src="' + L.esc(L.photoURL(p, 400, 300)) + '" alt="" loading="lazy" />' : "") + "</span>" +
          '<span class="mini__t">' + L.esc(x.titre) + "</span>" +
          '<span class="mini__p">' + (x.prix ? L.esc(x.prix) + " €" : "Sur devis") +
          (x.statut === "import" ? " · à l'importation" : "") + "</span></a>";
      }).join("");
    }

    document.dispatchEvent(new CustomEvent("lyra:vehicules-rendus"));
  }

  if (!id) return introuvable("Aucun véhicule n'a été demandé.");

  fetch("assets/data/vehicules.json", { cache: "no-cache" })
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then((data) => {
      const tous = Array.isArray(data) ? data : (data.vehicules || []);
      const v = tous.find((x) => x.id === id);
      if (!v) return introuvable("Ce véhicule n'est plus au catalogue. Il a peut-être été vendu.");
      rendre(v, tous);
    })
    .catch((err) => {
      introuvable("Le catalogue n'a pas pu être chargé. Réessayez dans un instant.");
      console.error("[lyra] fiche :", err);
    });
})();
