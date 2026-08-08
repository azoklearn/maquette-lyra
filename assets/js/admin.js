/* =====================================================================
   LYRA MOTORS - Panel véhicules
   Écrit directement dans le dépôt GitHub via l'API Contents. Pas de base de
   données, pas de serveur : le fichier assets/data/vehicules.json EST la base.

   Cycle d'un enregistrement :
     GET  /contents/<fichier>   -> on récupère le JSON + son "sha"
     (PUT /contents/<image>)    -> si une photo a été jointe
     PUT  /contents/<fichier>   -> on renvoie le JSON modifié, avec le sha

   Le sha est la protection contre l'écrasement : si quelqu'un a modifié le
   fichier entre-temps, GitHub refuse (409) et on recharge au lieu d'écraser.
   ===================================================================== */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const API = "https://api.github.com";
  const CLE_COFFRE = "lyra_admin_coffre";   // jeton CHIFFRE (localStorage)
  const CLE_REGLAGES = "lyra_admin_repo";   // owner/repo/branche/chemin (non secret)
  const VERROU_MS = 30 * 60 * 1000;         // re-verrouillage apres 30 min d'inactivite

  let jeton = null;                          // en memoire uniquement, jamais ecrit
  let minuterie = null;

  let etat = {
    sha: null,        // sha du fichier JSON tel que chargé
    data: null,       // contenu complet du fichier
    liste: [],        // raccourci vers data.vehicules
    indexEdite: -1,   // -1 = création
    fichiers: [],     // fichiers en attente d'envoi
    photos: [],       // adresses des photos de l'annonce en cours
  };

  /* ---------- utilitaires ---------- */

  // btoa ne sait pas gérer les accents : on passe par UTF-8 explicitement.
  function b64encode(texte) {
    const octets = new TextEncoder().encode(texte);
    let bin = "";
    octets.forEach((o) => (bin += String.fromCharCode(o)));
    return btoa(bin);
  }
  function b64decode(b64) {
    const bin = atob(String(b64).replace(/\s/g, ""));
    const octets = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(octets);
  }

  function slug(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "vehicule";
  }

  // Les valeurs viennent du JSON du dépôt : on les échappe quand même avant de
  // les injecter en HTML, pour qu'un caractère de balisage dans un titre ne
  // puisse jamais casser (ou détourner) l'écran d'administration.
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function dit(cible, texte, type) {
    const el = $(cible);
    el.hidden = false;
    el.className = "log log--" + (type || "info");
    el.textContent = texte;
  }
  function tais(cible) { $(cible).hidden = true; }

  function occupe(texte) {
    $("#pending").hidden = !texte;
    if (texte) $("#pending-txt").textContent = texte;
  }

  const conf = () => ({
    owner:  $("#f-owner").value.trim(),
    repo:   $("#f-repo").value.trim(),
    branch: $("#f-branch").value.trim() || "main",
    path:   $("#f-path").value.trim(),
    token:  jeton || "",
  });

  async function gh(chemin, options) {
    const c = conf();
    const r = await fetch(API + chemin, Object.assign({}, options, {
      headers: Object.assign({
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization": "Bearer " + c.token,
      }, (options || {}).headers),
    }));
    let corps = null;
    try { corps = await r.json(); } catch (e) { /* 204 sans corps */ }
    if (!r.ok) {
      const msg = (corps && corps.message) || ("HTTP " + r.status);
      const err = new Error(msg);
      err.statut = r.status;
      throw err;
    }
    return corps;
  }

  function messageErreur(err) {
    if (err.statut === 401) return "Jeton refusé (401). Vérifiez qu'il est complet et non expiré.";
    if (err.statut === 403) return "Accès refusé (403). Le jeton doit avoir la permission « Contents : Read and write » sur ce dépôt.";
    if (err.statut === 404) return "Introuvable (404). Vérifiez le propriétaire, le dépôt, la branche et le chemin du fichier.";
    if (err.statut === 409) return "Le fichier a changé sur GitHub depuis le chargement. Rechargez le catalogue avant d'enregistrer.";
    if (err.statut === 422) return "Requête refusée (422) : " + err.message;
    return err.message || "Erreur inconnue.";
  }

  /* ---------- coffre : le jeton chiffré par le mot de passe ----------
     Rien de tout ceci ne part dans le dépôt. Le jeton est chiffré en AES-256-GCM
     avec une clé dérivée du mot de passe (PBKDF2, 250 000 tours). Sans le mot de
     passe, ce qui est stocké dans le navigateur est inexploitable : le mot de
     passe n'est pas un simple contrôle d'accès, c'est la clé de déchiffrement.
     GCM est authentifié : un mauvais mot de passe fait échouer le déchiffrement,
     on n'a donc rien à comparer ni à stocker pour vérifier le mot de passe. */

  const b64 = (buf) => btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  async function deriverCle(motDePasse, sel) {
    const base = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(motDePasse), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: sel, iterations: 250000, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }

  async function ranger(token, motDePasse) {
    const sel = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cle = await deriverCle(motDePasse, sel);
    const chiffre = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, cle, new TextEncoder().encode(token));
    localStorage.setItem(CLE_COFFRE, JSON.stringify({
      v: 1, sel: b64(sel), iv: b64(iv), data: b64(chiffre),
    }));
  }

  async function ouvrir(motDePasse) {
    const brut = localStorage.getItem(CLE_COFFRE);
    if (!brut) throw new Error("Aucun jeton enregistré sur cet ordinateur.");
    const c = JSON.parse(brut);
    const cle = await deriverCle(motDePasse, unb64(c.sel));
    // Lève une exception si le mot de passe est faux (tag d'authentification GCM).
    const clair = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: unb64(c.iv) }, cle, unb64(c.data));
    return new TextDecoder().decode(clair);
  }

  const coffrePlein = () => !!localStorage.getItem(CLE_COFFRE);

  /* Réglages du dépôt : pas secrets, on les garde en clair pour ne pas les retaper. */
  function chargerReglages() {
    try {
      const r = JSON.parse(localStorage.getItem(CLE_REGLAGES) || "{}");
      ["owner", "repo", "branch", "path"].forEach((k) => {
        if (r[k]) $("#f-" + k).value = r[k];
      });
    } catch (e) { /* réglages illisibles : on garde les valeurs par défaut */ }
  }
  function enregistrerReglages() {
    const c = conf();
    localStorage.setItem(CLE_REGLAGES, JSON.stringify({
      owner: c.owner, repo: c.repo, branch: c.branch, path: c.path,
    }));
  }

  /* ---------- verrouillage ---------- */

  function relancerMinuterie() {
    clearTimeout(minuterie);
    minuterie = setTimeout(() => verrouiller(true), VERROU_MS);
  }

  function verrouiller(auto) {
    jeton = null;
    clearTimeout(minuterie);
    etat = { sha: null, data: null, liste: [], indexEdite: -1, fichiers: [], photos: [] };
    $("#p-list").hidden = true;
    $("#p-form").hidden = true;
    $("#b-lock").hidden = true;
    $("#u-pass").value = "";
    ecranAuth();
    dit("#log-conn", auto
      ? "Panel verrouillé après 30 minutes sans activité. Entrez votre mot de passe."
      : "Panel verrouillé.", "info");
  }

  function ecranAuth() {
    const plein = coffrePlein();
    $("#setup").hidden = plein;
    $("#unlock").hidden = !plein;
    $("#p-auth").hidden = false;
  }

  function deverrouille() {
    $("#p-auth").hidden = true;
    $("#b-lock").hidden = false;
    relancerMinuterie();
    ["click", "keydown"].forEach((e) =>
      document.addEventListener(e, relancerMinuterie, { passive: true }));
  }

  /* ---------- chargement ---------- */

  async function charger() {
    const c = conf();
    if (!c.owner || !c.repo || !c.path) { dit("#log-conn", "Renseignez le propriétaire, le dépôt et le chemin du fichier (voir « Réglages du dépôt »).", "ko"); return false; }
    if (!c.token) { dit("#log-conn", "Panel verrouillé.", "ko"); return false; }

    dit("#log-conn", "Chargement…", "info");
    try {
      const url = "/repos/" + c.owner + "/" + c.repo + "/contents/" + encodeURI(c.path) +
                  "?ref=" + encodeURIComponent(c.branch);
      const rep = await gh(url, { method: "GET" });
      const data = JSON.parse(b64decode(rep.content));

      etat.sha = rep.sha;
      etat.data = data;
      etat.liste = Array.isArray(data) ? data : (data.vehicules || []);
      if (!Array.isArray(data) && !data.vehicules) etat.data.vehicules = etat.liste;

      enregistrerReglages();
      tais("#log-conn");
      deverrouille();
      $("#p-list").hidden = false;
      rendreListe();
      return true;
    } catch (err) {
      ecranAuth();
      dit("#log-conn", messageErreur(err), "ko");
      $("#p-list").hidden = true;
      return false;
    }
  }

  /* ---------- liste ---------- */

  function urlPhoto(p) {
    if (!p) return "";
    if (/^https?:\/\//.test(p) || p.startsWith("assets/")) return p;
    return "https://images.pexels.com/photos/" + p + "?auto=compress&cs=tinysrgb&fit=crop&w=160&h=120";
  }

  function rendreListe() {
    const hote = $("#items");
    hote.textContent = "";
    const nStock = etat.liste.filter((v) => v.statut !== "import").length;
    const nImp = etat.liste.length - nStock;
    $("#count-badge").textContent = nStock + " en stock · " + nImp + " à l'importation";

    etat.liste.forEach((v, i) => {
      const el = document.createElement("div");
      el.className = "item" + (i === etat.indexEdite ? " is-editing" : "");
      const src = urlPhoto((v.photos && v.photos[0]) || v.photo);
      const vign = src
        ? '<img src="' + esc(src) + '" alt="" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'ph\',textContent:\'?\'}))" />'
        : '<div class="ph">—</div>';
      el.innerHTML =
        vign +
        '<div><div class="nm">' + esc(v.titre || "(sans titre)") + "</div>" +
        '<div class="mt"><span class="tag tag--' + (v.statut === "import" ? "import" : "stock") + '">' +
          (v.statut === "import" ? "importation" : "stock") + "</span> · " +
          esc(v.categorie || "?") + " · " + (v.prix ? esc(v.prix) + " €" : "sur devis") + "</div></div>" +
        '<div class="acts"><button data-edit="' + i + '">Modifier</button>' +
        '<button class="del" data-del="' + i + '">Supprimer</button></div>';
      hote.appendChild(el);
    });

    hote.querySelectorAll("[data-edit]").forEach((b) =>
      b.addEventListener("click", () => ouvrirFormulaire(parseInt(b.dataset.edit, 10))));
    hote.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => supprimer(parseInt(b.dataset.del, 10))));
  }

  /* ---------- formulaire ---------- */

  const CHAMPS = ["statut", "categorie", "badge", "titre", "drapeau", "origine",
                  "annee", "km", "carburant", "boite", "motorisation", "prix", "prixMention",
                  "lien", "delai"];

  const BADGES = {
    sport: "Sportives & GT", premium: "SUV & berlines premium",
    pickup: "4×4 & pick-up", daily: "Quotidien",
  };

  /* ---------- éditeur de photos ----------
     La première photo sert de vignette dans la liste, les suivantes alimentent
     la galerie de la fiche : d'où les flèches pour changer l'ordre. */

  function rendrePhotos() {
    const hote = $("#v-photos");
    hote.textContent = "";
    if (!etat.photos.length) {
      hote.innerHTML = '<p class="hint">Aucune photo. La silhouette dessinée servira de repli.</p>';
    }
    etat.photos.forEach((ph, i) => {
      const src = urlPhoto(ph);
      const row = document.createElement("div");
      row.className = "prow";
      row.innerHTML =
        (src ? '<img src="' + esc(src) + '" alt="" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'ph\',textContent:\'?\'}))" />'
             : '<div class="ph">—</div>') +
        '<input value="' + esc(ph) + '" data-i="' + i + '" spellcheck="false" placeholder="https://… ou assets/img/vehicules/photo.jpg" />' +
        '<span class="pacts">' +
          '<button type="button" title="Monter" data-up="' + i + '"' + (i === 0 ? " disabled" : "") + ">\u2191</button>" +
          '<button type="button" title="Descendre" data-down="' + i + '"' + (i === etat.photos.length - 1 ? " disabled" : "") + ">\u2193</button>" +
          '<button type="button" class="x" title="Retirer" data-x="' + i + '">\u2715</button>' +
        "</span>";
      hote.appendChild(row);
    });

    hote.querySelectorAll("input[data-i]").forEach((inp) =>
      inp.addEventListener("change", () => {
        etat.photos[parseInt(inp.dataset.i, 10)] = inp.value.trim();
        rendrePhotos();
      }));
    const bouge = (de, vers) => {
      const [x] = etat.photos.splice(de, 1);
      etat.photos.splice(vers, 0, x);
      rendrePhotos();
    };
    hote.querySelectorAll("[data-up]").forEach((b) =>
      b.addEventListener("click", () => bouge(+b.dataset.up, +b.dataset.up - 1)));
    hote.querySelectorAll("[data-down]").forEach((b) =>
      b.addEventListener("click", () => bouge(+b.dataset.down, +b.dataset.down + 1)));
    hote.querySelectorAll("[data-x]").forEach((b) =>
      b.addEventListener("click", () => { etat.photos.splice(+b.dataset.x, 1); rendrePhotos(); }));
  }

  function rendreFile() {
    const ul = $("#v-queue");
    ul.hidden = !etat.fichiers.length;
    ul.innerHTML = etat.fichiers.map((f) =>
      "<li>" + esc(f.name) + " \u00b7 " + Math.round(f.size / 1024) + " Ko \u2014 sera envoy\u00e9 \u00e0 l'enregistrement</li>").join("");
  }

  function basculerChamps() {
    const estImport = $("#v-statut").value === "import";
    $("#wrap-lien").hidden = estImport;
    $("#wrap-delai").hidden = !estImport;
  }

  function ouvrirFormulaire(i) {
    etat.indexEdite = typeof i === "number" ? i : -1;
    etat.fichiers = [];
    $("#v-file").value = "";
    const v = etat.indexEdite >= 0 ? etat.liste[etat.indexEdite] : {
      statut: "stock", categorie: "sport", badge: BADGES.sport,
      prixMention: "clé en main", drapeau: "🇺🇸", origine: "États-Unis",
      lien: "https://www.leboncoin.fr",
    };
    CHAMPS.forEach((k) => { const el = $("#v-" + k); if (el) el.value = v[k] || ""; });
    etat.photos = Array.isArray(v.photos) ? v.photos.slice() : (v.photo ? [v.photo] : []);
    rendrePhotos(); rendreFile();
    $("#form-title").textContent = etat.indexEdite >= 0 ? "Modifier « " + (v.titre || "") + " »" : "Nouvelle annonce";
    basculerChamps();
    tais("#log-form");
    $("#p-form").hidden = false;
    rendreListe();
    $("#p-form").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function fermerFormulaire() {
    $("#p-form").hidden = true;
    etat.indexEdite = -1;
    etat.fichiers = [];
    etat.photos = [];
    rendreListe();
  }

  function lireFormulaire() {
    const v = {};
    CHAMPS.forEach((k) => { const el = $("#v-" + k); if (el) v[k] = el.value.trim(); });
    v.photos = etat.photos.filter(Boolean);
    v.id = (etat.indexEdite >= 0 && etat.liste[etat.indexEdite].id) || slug(v.titre);
    if (v.statut === "import") v.lien = ""; else v.delai = "";
    return v;
  }

  /* ---------- écriture sur GitHub ---------- */

  async function ecrireFichier(chemin, contenuB64, message, sha) {
    const c = conf();
    const corps = { message: message, content: contenuB64, branch: c.branch };
    if (sha) corps.sha = sha;
    return gh("/repos/" + c.owner + "/" + c.repo + "/contents/" + encodeURI(chemin), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corps),
    });
  }

  function lireFichierB64(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result).split(",")[1]);
      fr.onerror = () => rej(new Error("Lecture du fichier impossible."));
      fr.readAsDataURL(file);
    });
  }

  async function enregistrer() {
    const v = lireFormulaire();
    if (!v.titre) return dit("#log-form", "Le modèle est obligatoire.", "ko");

    $("#b-save").disabled = true;
    let sauvegarde = null;
    try {
      // 1. photo jointe -> on la dépose d'abord, puis on pointe dessus
      for (let k = 0; k < etat.fichiers.length; k++) {
        const f = etat.fichiers[k];
        const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const chemin = "assets/img/vehicules/" + slug(v.titre) + "-" + Date.now() + "-" + k + "." + ext;
        dit("#log-form", "Envoi de la photo " + (k + 1) + " sur " + etat.fichiers.length + "…", "info");
        occupe("Envoi " + (k + 1) + "/" + etat.fichiers.length + "…");
        await ecrireFichier(chemin, await lireFichierB64(f), "Ajoute une photo de " + v.titre, null);
        v.photos.push(chemin);
      }

      // 2. mise à jour de la liste en mémoire (sauvegarde pour pouvoir revenir
      //    en arrière si la publication échoue : l'écran doit toujours refléter
      //    l'état réel du dépôt, jamais un ajout fantôme)
      sauvegarde = etat.liste.slice();
      if (etat.indexEdite >= 0) etat.liste[etat.indexEdite] = v;
      else etat.liste.push(v);
      if (Array.isArray(etat.data)) etat.data = etat.liste;
      else etat.data.vehicules = etat.liste;
      if (!Array.isArray(etat.data)) etat.data.maj = new Date().toISOString().slice(0, 10);

      // 3. commit du JSON
      const action = etat.indexEdite >= 0 ? "Modifie" : "Ajoute";
      dit("#log-form", "Publication…", "info");
      occupe("Publication…");
      const rep = await ecrireFichier(
        conf().path,
        b64encode(JSON.stringify(etat.data, null, 2) + "\n"),
        action + " " + v.titre + " dans le catalogue",
        etat.sha
      );
      etat.sha = rep.content.sha;

      dit("#log-form", "Publié. La page véhicules affichera la modification dès que GitHub Pages aura reconstruit le site (comptez une à deux minutes).", "ok");
      etat.fichiers = [];
      $("#v-file").value = "";
      fermerFormulaire();
    } catch (err) {
      if (sauvegarde) {
        etat.liste = sauvegarde;
        if (Array.isArray(etat.data)) etat.data = etat.liste; else etat.data.vehicules = etat.liste;
        rendreListe();
      }
      const suite = err.statut === 409 ? " Cliquez sur « Charger le catalogue » avant de réessayer." : "";
      dit("#log-form", messageErreur(err) + suite, "ko");
    } finally {
      occupe(null);
      $("#b-save").disabled = false;
    }
  }

  async function supprimer(i) {
    const v = etat.liste[i];
    if (!v) return;
    if (!confirm("Supprimer définitivement « " + v.titre + " » du catalogue ?\n\nLa modification part tout de suite sur GitHub.")) return;

    const sauvegarde = etat.liste.slice();
    etat.liste.splice(i, 1);
    if (Array.isArray(etat.data)) etat.data = etat.liste; else etat.data.vehicules = etat.liste;

    occupe("Suppression…");
    try {
      const rep = await ecrireFichier(
        conf().path,
        b64encode(JSON.stringify(etat.data, null, 2) + "\n"),
        "Retire " + v.titre + " du catalogue",
        etat.sha
      );
      etat.sha = rep.content.sha;
      etat.indexEdite = -1;
      $("#p-form").hidden = true;
      dit("#log-conn", "« " + v.titre + " » supprimé.", "ok");
      rendreListe();
    } catch (err) {
      // Échec : on rétablit la liste pour que l'écran reflète le dépôt.
      etat.liste = sauvegarde;
      if (Array.isArray(etat.data)) etat.data = etat.liste; else etat.data.vehicules = etat.liste;
      rendreListe();
      dit("#log-conn", messageErreur(err), "ko");
    } finally {
      occupe(null);
    }
  }

  /* ---------- branchements ---------- */

  /* --- première configuration : on range le jeton chiffré, puis on ouvre --- */
  $("#b-setup").addEventListener("click", async () => {
    const t = $("#s-token").value.trim();
    const p1 = $("#s-pass").value;
    const p2 = $("#s-pass2").value;
    if (!t) return dit("#log-conn", "Collez votre jeton GitHub.", "ko");
    if (p1.length < 12) return dit("#log-conn", "Mot de passe trop court : 12 caractères minimum. C'est lui qui chiffre le jeton.", "ko");
    if (p1 !== p2) return dit("#log-conn", "Les deux mots de passe ne correspondent pas.", "ko");

    $("#b-setup").disabled = true;
    dit("#log-conn", "Chiffrement…", "info");
    try {
      await ranger(t, p1);
      jeton = t;
      const ok = await charger();
      if (!ok) {
        // Jeton refusé par GitHub : inutile de le garder, sinon l'utilisateur se
        // retrouve devant un écran de mot de passe pour un jeton qui ne marche pas.
        localStorage.removeItem(CLE_COFFRE);
        jeton = null;
        ecranAuth();
        return;
      }
      $("#s-token").value = ""; $("#s-pass").value = ""; $("#s-pass2").value = "";
    } catch (err) {
      dit("#log-conn", "Impossible d'enregistrer le jeton : " + err.message, "ko");
    } finally {
      $("#b-setup").disabled = false;
    }
  });

  /* --- utilisations suivantes : mot de passe seul --- */
  let essais = 0;
  async function deverrouiller() {
    const mdp = $("#u-pass").value;
    if (!mdp) return dit("#log-conn", "Entrez votre mot de passe.", "ko");
    $("#b-unlock").disabled = true;
    dit("#log-conn", "Déverrouillage…", "info");
    try {
      jeton = await ouvrir(mdp);
      essais = 0;
      $("#u-pass").value = "";
      const ok = await charger();
      if (!ok) jeton = null;   // mot de passe bon, mais jeton expiré ou révoqué
    } catch (err) {
      jeton = null;
      essais++;
      dit("#log-conn", "Mot de passe incorrect." +
        (essais >= 3 ? "\n\nMot de passe oublié ? Le jeton ne peut pas être récupéré : cliquez sur « Oublier ce jeton » et recommencez la configuration avec un nouveau jeton GitHub." : ""), "ko");
      // Ralentit une tentative en force brute, en plus des 250 000 tours de PBKDF2.
      await new Promise((r) => setTimeout(r, Math.min(essais * 400, 3000)));
    } finally {
      $("#b-unlock").disabled = false;
    }
  }
  $("#b-unlock").addEventListener("click", deverrouiller);
  $("#u-pass").addEventListener("keydown", (e) => { if (e.key === "Enter") deverrouiller(); });

  $("#b-lock").addEventListener("click", () => verrouiller(false));

  $("#b-reset").addEventListener("click", () => {
    if (!confirm("Oublier le jeton enregistré sur cet ordinateur ?\n\nIl faudra le recoller pour utiliser le panel. Le jeton lui-même reste valide côté GitHub : révoquez-le là-bas si c'est ce que vous voulez.")) return;
    localStorage.removeItem(CLE_COFFRE);
    jeton = null;
    ecranAuth();
    dit("#log-conn", "Jeton effacé de cet ordinateur.", "info");
  });

  $("#b-new").addEventListener("click", () => ouvrirFormulaire(-1));
  $("#b-cancel").addEventListener("click", fermerFormulaire);
  $("#b-save").addEventListener("click", enregistrer);
  $("#v-statut").addEventListener("change", basculerChamps);

  $("#v-categorie").addEventListener("change", (e) => {
    // Confort : la pastille suit la catégorie tant qu'on ne l'a pas personnalisée.
    const b = $("#v-badge");
    if (!b.value || Object.values(BADGES).indexOf(b.value) >= 0) b.value = BADGES[e.target.value] || "";
  });

  $("#b-add-photo").addEventListener("click", () => { etat.photos.push(""); rendrePhotos(); });

  $("#v-file").addEventListener("change", (e) => {
    const choisis = Array.from(e.target.files || []);
    const LIMITE = 4 * 1024 * 1024;
    const trop = choisis.filter((f) => f.size > LIMITE);
    if (trop.length) {
      dit("#log-form", "Ignoré, plus de 4 Mo : " + trop.map((f) => f.name).join(", "), "ko");
    } else {
      tais("#log-form");
    }
    etat.fichiers = etat.fichiers.concat(choisis.filter((f) => f.size <= LIMITE));
    e.target.value = "";   // permet de re-choisir le même fichier
    rendreFile();
  });

  /* ---------- démarrage ---------- */

  if (!window.isSecureContext || !crypto.subtle) {
    // WebCrypto exige https (ou localhost) : sans lui, pas de chiffrement possible.
    $("#p-auth").innerHTML = '<div class="warn"><b>Page non sécurisée.</b> Le chiffrement du ' +
      'jeton exige une connexion <b>https</b> (ou <code>localhost</code>). Ouvrez cette page ' +
      'depuis l\'adresse https de votre site, pas en double-cliquant sur le fichier.</div>';
  } else {
    chargerReglages();
    ecranAuth();
  }
})();
