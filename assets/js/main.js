/* =====================================================================
   LYRA MOTORS - Interactions
   ===================================================================== */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Header : état au scroll ---------- */
  const header = $(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const toggle = $(".nav__toggle");
  const closeMenu = () => document.body.classList.remove("menu-open");
  if (toggle) {
    toggle.addEventListener("click", () => document.body.classList.toggle("menu-open"));
    $$(".mobile-menu a").forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- Année courante ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Reveal au scroll ----------
     Rendu ré-exécutable : les cartes véhicules sont créées après le chargement
     (voir vehicules.js), il faut pouvoir les prendre en charge à leur arrivée. */
  const io = (reduceMotion || !("IntersectionObserver" in window))
    ? null
    : new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  function armerReveals(racine = document) {
    // Stagger automatique pour les groupes
    const groupes = racine.matches && racine.matches("[data-stagger]")
      ? [racine] : $$("[data-stagger]", racine);
    groupes.forEach((group) => {
      const step = parseFloat(group.dataset.stagger) || 0.08;
      $$(".reveal, .line-mask", group).forEach((el, i) => {
        if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i * step) + "s");
      });
    });
    $$(".reveal, .line-mask", racine).forEach((el) => {
      if (el.dataset.revealArme) return;
      el.dataset.revealArme = "1";
      if (io) io.observe(el); else el.classList.add("in");
    });
  }
  armerReveals();

  /* ---------- Compteurs (count-up) ---------- */
  const counters = $$("[data-count]");
  if (counters.length) {
    const format = (n, dec) => n.toLocaleString("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split(".")[1] || "").length;
      const dur = 1600; const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(target * eased, dec);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = format(target, dec);
      };
      requestAnimationFrame(tick);
    };
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach((el) => (el.textContent = el.dataset.count.replace(".", ",")));
    } else {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach((el) => cio.observe(el));
    }
  }

  /* ---------- Marquee d'avis : duplication pour boucle continue ---------- */
  $$(".marquee__track").forEach((track) => {
    const clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.querySelectorAll("*").forEach(() => {});
    const frag = document.createDocumentFragment();
    Array.from(clone.children).forEach((c) => frag.appendChild(c));
    track.appendChild(frag);
  });

  /* ---------- Hero : parallaxe douce ---------- */
  const scene = $(".hero__scene");
  if (scene && !reduceMotion) {
    const layers = $$("[data-depth]", scene);
    let raf = null, mx = 0, my = 0;
    const hero = $(".hero");
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    const apply = () => {
      layers.forEach((l) => {
        const d = parseFloat(l.dataset.depth) || 0;
        l.style.transform = `translate3d(${mx * d * 26}px, ${my * d * 16}px, 0)`;
      });
      raf = null;
    };
  }

  /* ---------- Hero : poussière dorée (canvas) ---------- */
  const canvas = $(".hero__canvas");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, particles = [], anim;
    const COUNT = 46;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const seed = () => {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 2.2 + 0.4,
        vy: -(Math.random() * 0.24 + 0.05),
        vx: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.5 + 0.1,
        tw: Math.random() * Math.PI * 2,
      }));
    };
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y += p.vy; p.x += p.vx; p.tw += 0.02;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        const flick = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(174, 207, 232, ${flick})`;
        ctx.shadowBlur = 8; ctx.shadowColor = "rgba(174, 207, 232,0.5)";
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      anim = requestAnimationFrame(frame);
    };
    resize(); seed(); frame();
    window.addEventListener("resize", () => { cancelAnimationFrame(anim); resize(); seed(); frame(); });
  }

  /* ---------- Filtres véhicules ----------
     Les cartes sont relues à chaque clic (elles arrivent après le chargement) et
     le filtre ne touche QUE la grille du stock : la grille « à l'importation »
     est une sélection courte, elle reste entière. */
  const filters = $$(".filter");
  if (filters.length) {
    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((f) => f.classList.remove("is-active"));
        btn.classList.add("is-active");
        const cat = btn.dataset.filter;
        $$("#grid-stock .vcard").forEach((card, i) => {
          const show = cat === "all" || card.dataset.category === cat;
          if (show) {
            card.style.display = "";
            card.style.animation = "none";
            // reflow puis anim
            void card.offsetWidth;
            card.style.animation = `fadeUp 0.5s var(--ease-out) ${(i % 6) * 0.05}s both`;
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  /* Les cartes véhicules viennent d'être injectées : on les arme comme le reste. */
  document.addEventListener("lyra:vehicules-rendus", () => {
    $$("#grid-stock, #grid-import").forEach((g) => armerReveals(g));
  });

  /* ---------- FAQ accordéon ---------- */
  $$(".faq__q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq__item");
      const open = item.classList.contains("open");
      // Accordéon exclusif (optionnel : commenter pour multi-ouverture)
      $$(".faq__item.open").forEach((o) => { if (o !== item) o.classList.remove("open"); });
      item.classList.toggle("open", !open);
      q.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ---------- Pré-remplissage depuis « Demander ce véhicule » ----------
     Les cartes « à l'importation » pointent vers contact.html?vehicule=…
     On amorce le message pour que le visiteur n'ait pas à tout retaper. */
  (function prefillVehicule() {
    const form = $("#contact-form");
    if (!form) return;
    const modele = new URLSearchParams(location.search).get("vehicule");
    if (!modele) return;
    const msg = $("#message", form);
    if (msg && !msg.value) {
      msg.value = "Bonjour, je suis intéressé par ce véhicule à l'importation : " + modele +
                  ".\nPouvez-vous me dire ce qui est possible ?";
    }
    const type = $("#type", form);
    if (type && !type.value) {
      // La carte porte déjà sa catégorie : on choisit l'option correspondante.
      const cible = /mustang|camaro|corvette|challenger|911|gt\b/i.test(modele) ? "Sportive & GT"
                  : /wrangler|ram|f-150|hilux|ranger|pick/i.test(modele) ? "Pick-up, 4×4 & utilitaire"
                  : "";
      if (cible) Array.from(type.options).forEach((o) => { if (o.text === cible) type.value = o.value || o.text; });
    }
    const bloc = form.closest("section") || form;
    bloc.scrollIntoView({ behavior: "smooth", block: "start" });
  })();

  /* ---------- Formulaire contact (démo front-end) ---------- */
  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const success = $("#form-success");
      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = "Envoi en cours…"; }
      // Démo : pas de back-end connecté. Simule l'accusé de réception.
      setTimeout(() => {
        form.style.display = "none";
        if (success) success.classList.add("show");
      }, 700);
    });
  }

  /* ---------- Magnétisme léger (boutons phares) ---------- */
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    $$("[data-magnetic]").forEach((el) => {
      const strength = 18;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Vidéos ----------
     Règles : muettes + boucle + playsinline (seule combinaison qui autorise
     l'autoplay sur mobile). Une vidéo n'est révélée QUE si elle joue vraiment :
     sinon l'image de repli reste affichée. Chargement différé à l'approche
     du viewport pour ne pas plomber le premier rendu. */
  (function videos() {
    const hero = $(".hero__video");
    const lazy = $$("video[data-video]");

    if (reduceMotion) {
      // Mouvement réduit : rien ne doit bouger. Le hero n'ayant plus d'image de
      // repli, on affiche une image FIXE de la vidéo plutôt qu'un aplat vide.
      if (hero) {
        hero.addEventListener("loadeddata", () => {
          try { hero.currentTime = 6; } catch (e) {}
          hero.classList.add("is-playing");   // rend visible, sans jamais lancer la lecture
        }, { once: true });
        hero.addEventListener("error", () => hero.remove());
        hero.load();
      }
      return;
    }

    const start = (v) => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {}); // autoplay refusé -> on garde l'image
    };

    if (hero) {
      /* Le hero se joue UNE SEULE FOIS puis reste figé sur sa dernière image :
         c'est un plan d'arrivée, le rejouer en boucle n'aurait pas de sens et
         ferait un saut visible à chaque reprise. */
      hero.addEventListener("playing", () => hero.classList.add("is-playing"), { once: true });
      hero.addEventListener("error", () => hero.remove());
      hero.addEventListener("ended", () => hero.classList.add("is-ended"), { once: true });
      start(hero);
      // Économie : on coupe la vidéo quand l'onglet passe en arrière-plan.
      // Si elle est déjà terminée, on ne la relance surtout pas.
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) hero.pause();
        else if (hero.isConnected && !hero.ended) start(hero);
      });
    }

    if (!lazy.length) return;
    const arm = (v) => {
      if (v.dataset.armed) return;
      v.dataset.armed = "1";
      v.addEventListener("playing", () => v.classList.add("is-playing"), { once: true });
      v.addEventListener("error", () => v.remove());
      v.src = v.dataset.video;
      start(v);
    };
    /* Tuiles à deux plans : on alterne le plan visible toutes les 6 s.
       Le premier est marqué d'emblée pour qu'il n'y ait jamais de trou. */
    $$(".gtile--duo").forEach((tile) => {
      const clips = $$("video", tile);
      if (clips.length < 2) return;
      clips[0].classList.add("is-front");
      let i = 0;
      setInterval(() => {
        clips[i].classList.remove("is-front");
        i = (i + 1) % clips.length;
        clips[i].classList.add("is-front");
      }, 6000);
    });

    if (!("IntersectionObserver" in window)) { lazy.forEach(arm); return; }
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { arm(e.target); }
        else if (e.target.dataset.armed) { e.target.pause(); }
      });
    }, { rootMargin: "200px" });
    lazy.forEach((v) => vio.observe(v));
  })();

  /* ---------- Photos réelles injectées (repli = illustration SVG dessous) ---------- */
  (function injectPhotos() {
    const P = "https://images.pexels.com/photos/";
    const q = (w, h) => `?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;
    function put(host, base, w, h) {
      if (!host) return;
      const img = document.createElement("img");
      img.className = "photo"; img.loading = "lazy"; img.decoding = "async"; img.alt = "";
      img.onerror = () => img.remove();
      img.src = P + base + q(w, h);
      host.appendChild(img);
    }
    const CAT = {
      "Sportives & GT": "29098285/pexels-photo-29098285.jpeg",
      "SUV & berlines premium": "18340797/pexels-photo-18340797.jpeg",
      "4×4, pick-up & utilitaires": "12021856/pexels-photo-12021856.jpeg",
      "Véhicules du quotidien": "16296957/pexels-photo-16296957/free-photo-of-view-of-a-silver-volkswagen-golf-r32-parked-in-sunlight.jpeg",
    };
    $$(".cat").forEach((c) => {
      const t = c.querySelector("h3");
      if (t && CAT[t.textContent.trim()]) put(c.querySelector(".cat__bg"), CAT[t.textContent.trim()], 900, 620);
    });
    /* Les photos des cartes véhicules ne sont plus ici : chaque annonce porte la
       sienne dans assets/data/vehicules.json, et vehicules.js la pose lui-même. */
  })();
})();
