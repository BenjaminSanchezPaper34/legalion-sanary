/* ==========================================================================
   Signature Paper34 (kit PAPER34-SIGNATURE-KIT, version statique)
   Au survol du logo : une onde de fumée WebGL aux bleus Paper34 jaillit,
   puis suit le curseur. À la sortie, l'émission se coupe après 500 ms, la
   fumée se dissipe d'elle-même et le canvas est démonté après 10 s — jamais
   de fondu d'opacité. Moteur chargé au premier survol seulement (zéro coût
   au repos) ; coupé au doigt et en prefers-reduced-motion.
   ========================================================================== */
(() => {
  const lien = document.querySelector(".footer-paper34");
  const footer = lien && lien.closest("footer");
  if (!lien || !footer) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) return;

  // Les bleus Paper34 — la DA du studio, pas celle du client
  const FUMEE = [
    { r: 0, g: 0.45, b: 0.9 },
    { r: 0.1, g: 0.6, b: 1.0 },
    { r: 0.6, g: 0.4, b: 1.0 },
    { r: 0.0, g: 0.3, b: 0.7 },
  ];
  const emitRef = { current: true };
  const apiRef = { current: null };
  let voile = null;
  let demonter = null;
  let chargement = null;
  let tCoupe;
  let tDemontage;

  const chargerMoteur = () =>
    chargement ||
    (chargement = new Promise((ok, ko) => {
      const s = document.createElement("script");
      s.src = "/js/vendor/paper34-fumee.js";
      s.onload = () => ok(window.Paper34Fumee);
      s.onerror = ko;
      document.head.appendChild(s);
    }));

  const eteindre = () => {
    if (demonter) demonter();
    demonter = null;
    if (voile) voile.remove();
    voile = null;
  };

  lien.addEventListener("pointerenter", () => {
    clearTimeout(tCoupe);
    clearTimeout(tDemontage);
    emitRef.current = true;
    chargerMoteur().then((moteur) => {
      if (!moteur) return;
      if (!voile) {
        voile = document.createElement("div");
        voile.className = "footer-fumee";
        voile.setAttribute("aria-hidden", "true");
        footer.appendChild(voile);
        demonter = moteur.monter(voile, {
          colors: FUMEE,
          emitRef,
          apiRef,
          densityDissipation: 1.6,
          velocityDissipation: 1.6,
          curl: 8,
          splatRadius: 0.28,
          splatForce: 7000,
        });
      }
      // Onde d'accueil au centre du logo, une fois le canvas posé
      requestAnimationFrame(() =>
        setTimeout(() => {
          const r = lien.getBoundingClientRect();
          if (apiRef.current) apiRef.current.splashAt(r.left + r.width / 2, r.top + r.height / 2, 0.45);
        }, 60)
      );
    }).catch(() => {});
  });

  lien.addEventListener("pointerleave", () => {
    clearTimeout(tCoupe);
    clearTimeout(tDemontage);
    tCoupe = setTimeout(() => (emitRef.current = false), 500);
    tDemontage = setTimeout(eteindre, 10000);
  });
})();
