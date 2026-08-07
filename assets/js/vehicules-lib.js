/* =====================================================================
   LYRA MOTORS - Fonctions partagées entre la liste et la fiche véhicule
   Chargé avant vehicules.js et vehicule-detail.js.
   ===================================================================== */
window.LYRA = (function () {
  "use strict";

  /* Numéro WhatsApp au format international, sans espace ni signe.
     06 19 78 67 52  ->  33 6 19 78 67 52 (le 0 initial saute). */
  const WHATSAPP = "33619786752";

  const PEXELS = "https://images.pexels.com/photos/";

  /* Une photo peut être :
     - une URL complète        -> https://...
     - un fichier du dépôt     -> assets/img/vehicules/ma-photo.jpg
     - un chemin Pexels        -> 16284856/pexels-photo-16284856.jpeg
     Les deux premiers passent tels quels, le troisième est complété. */
  function photoURL(p, w, h) {
    if (!p) return "";
    if (/^https?:\/\//.test(p) || p.startsWith("assets/")) return p;
    return PEXELS + p + "?auto=compress&cs=tinysrgb&fit=crop&w=" + (w || 800) + "&h=" + (h || 600);
  }

  /* La première photo sert de vignette ; les suivantes alimentent la galerie. */
  function photos(v) {
    if (Array.isArray(v.photos) && v.photos.length) return v.photos;
    return v.photo ? [v.photo] : [];   // tolère l'ancien format à une seule photo
  }

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));

  /* Message WhatsApp pré-rempli, différent selon que le véhicule est en stock
     (il existe, on demande s'il est dispo) ou à l'importation (il n'existe pas
     encore, on lance une recherche). Le prix est repris pour que le vendeur
     sache tout de suite de quelle annonce on parle. */
  function messageWhatsApp(v) {
    const prix = v.prix ? v.prix + " €" : "prix sur devis";
    if (v.statut === "import") {
      return "Bonjour Lyra Motors, je souhaite faire importer une " + v.titre +
             " (estimation " + prix + " vue sur votre site). " +
             "Pouvez-vous me dire ce qui est possible et sous quel délai ?";
    }
    return "Bonjour Lyra Motors, je suis intéressé par la " + v.titre +
           " à " + prix + " vue sur votre site. Est-elle toujours disponible ?";
  }

  function lienWhatsApp(v) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(messageWhatsApp(v));
  }

  const lienFiche = (v) => "vehicule.html?id=" + encodeURIComponent(v.id);

  /* Logo WhatsApp. Inline plutôt que dans le sprite : la fiche et la liste sont
     deux pages, et l'icône doit exister sur les deux sans duplication de sprite. */
  const ICONE_WA =
    '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">' +
    '<path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Z"/>' +
    '<path fill="#25D366" d="M16.56 14.22c-.25-.13-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03 0 1.19.87 2.35.99 2.51.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z"/></svg>';

  function boutonWhatsApp(v, variante) {
    return '<a class="wa' + (variante ? " wa--" + variante : "") + '" href="' + esc(lienWhatsApp(v)) + '"' +
           ' target="_blank" rel="noopener"' +
           ' aria-label="Écrire sur WhatsApp au sujet de ' + esc(v.titre) + '">' +
           ICONE_WA + "<span>WhatsApp</span></a>";
  }

  return { WHATSAPP, photoURL, photos, esc, messageWhatsApp, lienWhatsApp, lienFiche, boutonWhatsApp };
})();
