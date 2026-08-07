/* =====================================================================
   LYRA MOTORS - Rendu des véhicules
   Source unique : assets/data/vehicules.json (modifiable via admin.html).
   Deux grilles alimentées par le même fichier :
     - statut "stock"  -> disponibles maintenant, bouton leboncoin
     - statut "import" -> disponibles à l'importation, bouton contact
   ===================================================================== */
(function () {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const gridStock  = $("#grid-stock");
  const gridImport = $("#grid-import");
  if (!gridStock && !gridImport) return;

  const PEXELS = "https://images.pexels.com/photos/";

  /* Une photo peut être :
     - une URL complète        -> https://...
     - un fichier du dépôt     -> assets/img/vehicules/ma-photo.jpg
     - un chemin Pexels        -> 16284856/pexels-photo-16284856.jpeg
     Les deux premiers passent tels quels, le troisième est complété. */
  function photoURL(p) {
    if (!p) return "";
    if (/^https?:\/\//.test(p) || p.startsWith("assets/")) return p;
    return PEXELS + p + "?auto=compress&cs=tinysrgb&fit=crop&w=800&h=600";
  }

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Illustration de repli, identique à celle des cartes d'origine : si la photo
     ne charge pas (lien mort, hors-ligne), la silhouette reste et rien n'est cassé. */
  function fallbackSVG(teinte) {
    return (
      '<svg viewBox="0 0 480 340" preserveAspectRatio="xMidYMid slice" style="color:' + teinte + '" aria-hidden="true">' +
      '<rect width="480" height="340" fill="url(#vgrad-light)"/>' +
      '<ellipse cx="245" cy="252" rx="185" ry="18" fill="#12395C" opacity=".12"/>' +
      '<use href="#car-coupe" x="70" y="118" width="360" height="150"/></svg>'
    );
  }

  const TEINTES = ["#12395C", "#1C5480", "#2A6C9E", "#0B2740"];

  function specLi(icone, valeur) {
    if (!valeur) return "";
    return '<li><svg><use href="#i-' + icone + '"/></svg>' + esc(valeur) + "</li>";
  }

  function carte(v, i) {
    const estImport = v.statut === "import";

    const prix = v.prix
      ? '<span class="vcard__price">' + esc(v.prix) + " €" +
        (v.prixMention ? "<small>" + esc(v.prixMention) + "</small>" : "") + "</span>"
      : '<span class="vcard__price vcard__price--ask">Sur devis</span>';

    // Stock : le bouton leboncoin reste l'action principale, inchangé.
    // Importation : pas d'annonce en ligne, on bascule vers la demande.
    const action = estImport
      ? '<a class="lbc lbc--ask" href="contact.html?vehicule=' + encodeURIComponent(v.titre) + '">' +
          '<span class="lbc__label">Demander ce véhicule<small>recherche lancée sous 48 h</small></span>' +
          '<span class="lbc__ico"><svg width="16" height="16"><use href="#i-arrow-r"/></svg></span></a>'
      : '<a class="lbc" href="' + esc(v.lien || "https://www.leboncoin.fr") + '" target="_blank" rel="noopener">' +
          '<span class="lbc__label">Voir l\'annonce<small>sur leboncoin pro</small></span>' +
          '<span class="lbc__ico"><svg width="16" height="16"><use href="#i-arrow"/></svg></span></a>';

    const delai = estImport && v.delai
      ? '<span class="vcard__delai"><svg width="14" height="14"><use href="#i-clock"/></svg>' +
        esc(v.delai) + "</span>"
      : "";

    const art = document.createElement("article");
    art.className = "vcard reveal";
    art.dataset.category = v.categorie || "";
    art.dataset.statut = v.statut || "stock";
    art.innerHTML =
      '<div class="vcard__media">' +
        fallbackSVG(TEINTES[i % TEINTES.length]) +
        '<span class="vcard__badge">' + esc(v.badge || "") + "</span>" +
        '<button class="vcard__fav" aria-label="Ajouter aux favoris"><svg width="18" height="18"><use href="#i-heart"/></svg></button>' +
        '<span class="vcard__origin"><span class="flag">' + esc(v.drapeau || "") + "</span> " + esc(v.origine || "") + "</span>" +
      "</div>" +
      '<div class="vcard__body">' +
        '<div class="vcard__title"><h3>' + esc(v.titre) + "</h3>" + prix + "</div>" +
        '<ul class="vcard__specs">' +
          specLi("cal", v.annee) + specLi("gauge", v.km) +
          specLi("fuel", v.carburant) + specLi("cog", v.boite) +
        "</ul>" +
        delai +
        '<div class="vcard__foot">' + action + "</div>" +
      "</div>";

    // La photo est ajoutée par-dessus la silhouette, et se retire seule si elle échoue.
    const src = photoURL(v.photo);
    if (src) {
      const img = document.createElement("img");
      img.className = "photo"; img.loading = "lazy"; img.decoding = "async";
      img.alt = v.titre || "";
      img.onerror = () => img.remove();
      img.src = src;
      $(".vcard__media", art).appendChild(img);
    }
    return art;
  }

  function remplir(grille, liste) {
    if (!grille) return;
    grille.textContent = "";
    liste.forEach((v, i) => grille.appendChild(carte(v, i)));
    if (!liste.length) {
      grille.innerHTML = '<p class="vgrid-vide">Aucun véhicule pour le moment.</p>';
    }
  }

  /* Les compteurs des filtres suivent les données : plus de chiffre écrit en dur
     qui se désynchronise dès qu'on ajoute une annonce. */
  function majCompteurs(stock) {
    $$(".filter").forEach((btn) => {
      const cat = btn.dataset.filter;
      const n = cat === "all" ? stock.length : stock.filter((v) => v.categorie === cat).length;
      const c = $(".count", btn);
      if (c) c.textContent = n;
      btn.hidden = cat !== "all" && n === 0;
    });
  }

  fetch("assets/data/vehicules.json", { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then((data) => {
      const tous = Array.isArray(data) ? data : (data.vehicules || []);
      const stock  = tous.filter((v) => v.statut !== "import");
      const impo   = tous.filter((v) => v.statut === "import");

      remplir(gridStock, stock);
      remplir(gridImport, impo);
      majCompteurs(stock);

      const secImport = $("#section-import");
      if (secImport) secImport.hidden = impo.length === 0;

      // Les cartes viennent d'être créées : elles doivent recevoir le même
      // traitement que le reste du site (apparition au scroll, filtres).
      document.dispatchEvent(new CustomEvent("lyra:vehicules-rendus"));
    })
    .catch((err) => {
      const msg = '<p class="vgrid-vide">Le catalogue n\'a pas pu être chargé. ' +
                  'Réessayez dans un instant ou <a href="contact.html">contactez-nous</a>.</p>';
      if (gridStock) gridStock.innerHTML = msg;
      if (gridImport) gridImport.innerHTML = "";
      console.error("[lyra] catalogue :", err);
    });
})();
