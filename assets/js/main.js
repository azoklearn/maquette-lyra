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

  /* ---------- Reveal au scroll ---------- */
  const revealEls = $$(".reveal, .line-mask");
  // Stagger automatique pour les groupes
  $$("[data-stagger]").forEach((group) => {
    const step = parseFloat(group.dataset.stagger) || 0.08;
    $$(".reveal, .line-mask", group).forEach((el, i) => {
      if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i * step) + "s");
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

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

  /* ---------- Hero : photo réelle (fallback = scène SVG) ---------- */
  const heroPhoto = $(".hero__photo");
  if (heroPhoto) {
    const src = heroPhoto.dataset.src || "assets/img/hero.jpg";
    const img = new Image();
    img.onload = () => {
      heroPhoto.style.backgroundImage = `url("${src}")`;
      heroPhoto.classList.add("loaded");
    };
    img.src = src;
  }

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

  /* ---------- Filtres véhicules ---------- */
  const filters = $$(".filter");
  const vcards = $$(".vcard");
  if (filters.length && vcards.length) {
    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((f) => f.classList.remove("is-active"));
        btn.classList.add("is-active");
        const cat = btn.dataset.filter;
        vcards.forEach((card, i) => {
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
      // Mouvement réduit : aucune vidéo ne démarre, les images de repli suffisent.
      if (hero) hero.removeAttribute("autoplay");
      return;
    }

    const start = (v) => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {}); // autoplay refusé -> on garde l'image
    };

    if (hero) {
      hero.addEventListener("playing", () => hero.classList.add("is-playing"), { once: true });
      hero.addEventListener("error", () => hero.remove());
      start(hero);
      // Économie : on coupe la vidéo quand l'onglet passe en arrière-plan
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) hero.pause();
        else if (hero.isConnected) start(hero);
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
      "Sportives & GT": "38160273/pexels-photo-38160273.jpeg",
      "SUV & berlines premium": "18340797/pexels-photo-18340797.jpeg",
      "4×4, pick-up & utilitaires": "12021856/pexels-photo-12021856.jpeg",
      "Véhicules du quotidien": "16296957/pexels-photo-16296957/free-photo-of-view-of-a-silver-volkswagen-golf-r32-parked-in-sunlight.jpeg",
    };
    $$(".cat").forEach((c) => {
      const t = c.querySelector("h3");
      if (t && CAT[t.textContent.trim()]) put(c.querySelector(".cat__bg"), CAT[t.textContent.trim()], 900, 620);
    });
    const VEH = {
      "Ford Mustang GT": "16284856/pexels-photo-16284856/free-photo-of-black-ford-mustang-on-street.jpeg",
      "Corvette C8 Stingray": "34243843/pexels-photo-34243843.jpeg",
      "Porsche 911 Carrera S": "33621659/pexels-photo-33621659/free-photo-of-white-sports-car-racing-through-san-diego-streets.jpeg",
      "Audi RS6 Avant": "12351517/pexels-photo-12351517.jpeg",
      "Mercedes-AMG C63": "14667492/pexels-photo-14667492.jpeg",
      "Range Rover Sport HSE": "18340797/pexels-photo-18340797.jpeg",
      "Dodge RAM 1500 Limited": "15643000/pexels-photo-15643000/free-photo-of-dodge-ram-1500-long-exposure.jpeg",
      "Ford F-150 Lariat": "12021856/pexels-photo-12021856.jpeg",
      "Toyota Hilux Invincible": "16521273/pexels-photo-16521273/free-photo-of-pick-up-truck-on-field.jpeg",
      "Volkswagen Golf 8 GTI": "20809165/pexels-photo-20809165/free-photo-of-raindrops-on-black-volkswagen-golf-gti.jpeg",
      "MINI Cooper S": "36261943/pexels-photo-36261943/free-photo-of-row-of-mini-cooper-cars-parked-outdoors.jpeg",
    };
    $$(".vcard").forEach((c) => {
      const t = c.querySelector("h3");
      if (t && VEH[t.textContent.trim()]) put(c.querySelector(".vcard__media"), VEH[t.textContent.trim()], 800, 600);
    });
  })();
})();
