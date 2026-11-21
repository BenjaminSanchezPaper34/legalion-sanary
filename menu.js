/* =========================================================
   Le Galion : moteur de rendu de la carte
   Charge menu.json et l'injecte dans #menu.
   Aucune dépendance, vanilla JS.
   ========================================================= */

(async function () {
  const root = document.getElementById("menu");
  if (!root) return;

  let data;
  let T = {};
  try {
    const [res, resT] = await Promise.all([
      fetch("menu.json", { cache: "no-cache" }),
      fetch("translations.json", { cache: "no-cache" }).catch(() => null),
    ]);
    if (!res.ok) throw new Error("HTTP " + res.status);
    data = await res.json();
    if (resT && resT.ok) T = await resT.json();
  } catch (err) {
    root.innerHTML = '<p class="loading">Carte momentanément indisponible.</p>';
    console.error("[Galion] menu.json load failed:", err);
    return;
  }

  /* ---------- Langues : traductions maison (translations.json), aucune traduction automatique ----------
     menu.json reste la source en français ; translations.json associe chaque texte français à sa
     traduction par langue. Les noms des plats et des crêpes restent en français. */
  const LANGS = ["fr", "en", "es", "de", "it", "nl"];
  const fromUrl = new URLSearchParams(location.search).get("lang");
  let stored = null;
  try { stored = localStorage.getItem("galion-lang"); } catch (e) {}
  let lang = LANGS.includes(fromUrl) ? fromUrl : LANGS.includes(stored) ? stored : "fr";
  // Texte traduit si disponible, sinon le français
  const tr = (s) => (s && lang !== "fr" && T[lang] && T[lang][s]) || s;

  // Échappe le HTML pour éviter toute injection depuis menu.json
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  // "19,00€" → "19,00<sup>€</sup>"
  // [[terme]] = terme gardé en français dans toutes les langues (rouille, pommes darphin) : on retire les crochets
  const rich = (s) => esc(tr(s)).replace(/\[\[(.+?)\]\]/g, "$1");
  // Nom de boisson : traduit sauf si "no_translate": true (Noisette, Grand crème…)
  const dname = (it) => esc(it.no_translate ? it.name : tr(it.name));

  const fmtPrice = (p) => {
    if (!p) return "";
    const m = String(p).match(/^(.*?)(\s?€)\s*$/);
    return m ? `${esc(m[1])}<sup>€</sup>` : esc(p);
  };

  const renderItem = (it) => `
    <div class="item">
      <h3 class="item__name">${esc(it.name)}</h3>
      <span class="item__price">${fmtPrice(it.price)}</span>
      ${it.description ? `<p class="item__desc">${rich(it.description)}</p>` : ""}
    </div>`;

  const renderSubsection = (s) => `
    <div class="subsection">
      <p class="subsection__title">${esc(tr(s.title))}</p>
      <span class="subsection__price">${fmtPrice(s.price)}</span>
    </div>`;

  const renderFormula = (s) => `
    <section class="section section--formula" id="${esc(s.id)}">
      <div class="formula">
        <h2 class="formula__title">${esc(tr(s.title))}</h2>
        ${s.note ? `<p class="formula__note">${esc(tr(s.note))}</p>` : ""}
        <span class="formula__price">${fmtPrice(s.price)}</span>
        <div class="formula__group">
          <p class="formula__starter">${esc(tr(s.formula.starter))}</p>
        </div>
        <div class="formula__group">
          <ul class="formula__choices">
            ${s.formula.mains.map((m) => `<li>${esc(tr(m))}</li>`).join("")}
          </ul>
        </div>
        <div class="formula__group">
          <ul class="formula__choices">
            ${s.formula.desserts.map((d) => `<li>${esc(tr(d))}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>`;

  const renderList = (s) => {
    const subs = (s.subsections || []).map(renderSubsection).join("");
    const items = (s.items || []).map(renderItem).join("");
    const addons = (s.addons || []).length
      ? `<div class="addons">${s.addons.map((a) => renderItem({ ...a, name: tr(a.name) })).join("")}</div>`
      : "";
    const flavors = s.flavors
      ? `<div class="flavors">
          ${s.flavors.ice_creams ? `<div class="flavors__group">
            <p class="flavors__label">${esc(tr("Parfums des glaces"))}</p>
            <p class="flavors__list">${esc(tr(s.flavors.ice_creams))}</p>
          </div>` : ""}
          ${s.flavors.sorbets ? `<div class="flavors__group">
            <p class="flavors__label">${esc(tr("Parfums des sorbets"))}</p>
            <p class="flavors__list">${esc(tr(s.flavors.sorbets))}</p>
          </div>` : ""}
        </div>`
      : "";
    return `
      <section class="section" id="${esc(s.id)}">
        <h2 class="section__title">${esc(tr(s.title))}</h2>
        ${subs}
        ${items}
        ${addons}
        ${flavors}
      </section>`;
  };

  // Rend une ligne boisson : nom + prix unique, OU nom + prix multi-tailles (ex: 25cl/50cl)
  const renderDrink = (it) => {
    if (Array.isArray(it.sizes)) {
      const sizes = it.sizes
        .map((s) => `<span class="drink__size">${esc(s.label)} <strong>${fmtPrice(s.price)}</strong></span>`)
        .join("");
      return `
        <div class="drink drink--multi">
          <span class="drink__name">${dname(it)}</span>
          <span class="drink__sizes">${sizes}</span>
        </div>`;
    }
    return `
      <div class="drink">
        <span class="drink__name">${dname(it)}</span>
        <span class="drink__price">${fmtPrice(it.price)}</span>
        ${it.description ? `<p class="drink__desc">${rich(it.description)}</p>` : ""}
      </div>`;
  };

  const renderDrinks = (s) => `
    <section class="section section--drinks" id="${esc(s.id)}">
      <h2 class="section__title">${esc(tr(s.title))}</h2>
      ${(s.groups || []).map((g) => `
        <div class="drinks-group">
          <h3 class="drinks-group__title">${esc(tr(g.title))}</h3>
          ${g.subtitle ? `<p class="drinks-group__subtitle">${esc(g.subtitle)}</p>` : ""}
          ${(g.items || []).map(renderDrink).join("")}
        </div>`).join("")}
    </section>`;

  const renderSection = (s) => {
    if (s.type === "formula") return renderFormula(s);
    if (s.type === "drinks") return renderDrinks(s);
    return renderList(s);
  };

  // Rendu complet de la carte dans la langue courante (relancé à chaque changement de langue)
  let observer = null;
  let sigLoaded = false;
  const render = () => {
  // Render menu sections
  root.innerHTML = data.sections.map(renderSection).join("");

  // Lien Facebook (révélé une fois l'URL connue)
  const fb = document.getElementById("facebook-link");
  if (fb && data.facebook_url) {
    fb.href = data.facebook_url;
    fb.hidden = false;
  }

  // Navigation par section : chips sticky avec état actif synchronisé au scroll
  const navEl = document.getElementById("section-nav");
  if (navEl) {
    navEl.innerHTML = `
      <ul class="section-nav__list">
        ${data.sections.map((s) => `
          <li class="section-nav__item">
            <a class="section-nav__link" href="#${esc(s.id)}" data-target="${esc(s.id)}">
              ${esc(tr(s.nav_label || s.title))}
            </a>
          </li>`).join("")}
      </ul>`;
    navEl.hidden = false;

    // Centre une pastille horizontalement DANS le conteneur nav,
    // sans toucher au scroll du document (sinon ça annule le scroll vers la section).
    const centerChipInNav = (chip) => {
      const list = chip.closest(".section-nav__list");
      if (!list) return;
      const target = chip.offsetLeft + chip.offsetWidth / 2 - list.clientWidth / 2;
      list.scrollTo({ left: target, behavior: "smooth" });
    };

    const links = new Map();
    navEl.querySelectorAll("a[data-target]").forEach((a) => {
      links.set(a.dataset.target, a);
      // Au clic : scroll fluide vers la section + recentrage horizontal de la pastille
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(a.dataset.target);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        centerChipInNav(a);
        history.replaceState(null, "", "#" + a.dataset.target);
      });
    });

    // Met à jour la pastille active selon la section visible en haut du viewport.
    // rootMargin : on cible une fine bande sous le nav sticky (~80px en haut).
    const setActive = (id) => {
      links.forEach((link, key) => link.classList.toggle("is-active", key === id));
      const active = links.get(id);
      if (active) centerChipInNav(active);
    };

    if ("IntersectionObserver" in window) {
      if (observer) observer.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length) setActive(visible[0].target.id);
        },
        { rootMargin: "-80px 0px -65% 0px", threshold: 0 }
      );
      document.querySelectorAll("main .section").forEach((s) => observer.observe(s));
    }
  }

  // Render footer (le bouton PDF boissons a disparu : la section Boissons est désormais dans la carte)
  const tail = document.getElementById("tail");
  if (tail) {
    tail.innerHTML = `
      <footer class="footer">
        ${(data.footer_notices || []).map((n) => `<p>${esc(tr(n))}</p>`).join("")}
        ${data.boissons_pdf ? `
          <p class="footer__pdf">
            <a href="${esc(data.boissons_pdf)}" target="_blank" rel="noopener">Carte imprimable (PDF)</a>
          </p>` : ""}
        <p class="footer__legal"><a href="/mentions-legales">${esc(tr("Mentions légales"))}</a></p>
        <p class="footer__credit">
          <a class="footer-paper34" href="https://paper34.fr" target="_blank" rel="noopener">${esc(tr("Réalisé par"))} <img src="images/logo-paper34.svg" alt="Paper34" width="72" height="14"></a>
        </p>
      </footer>`;
    // Signature Paper34 (kit statique) : chargée une fois, au premier rendu du footer
    if (!sigLoaded) {
      sigLoaded = true;
      const sig = document.createElement("script");
      sig.src = "js/paper34-signature.js";
      document.body.appendChild(sig);
    }
  }
  };

  // Sélecteur de langue maison (boutons FR / EN / ES / DE / IT / NL de index.html)
  const buttons = document.querySelectorAll(".lang-switcher__btn");
  const applyLang = (l) => {
    lang = l;
    document.documentElement.lang = l;
    buttons.forEach((b) => {
      const on = b.dataset.lang === l;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem("galion-lang", l); } catch (e) {}
    render();
  };
  buttons.forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));
  applyLang(lang);
})();
