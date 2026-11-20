// Efeitos vivos da página: palavras, cartões 3D, partículas de luz, trilha da história, eco e luz do mouse.
(() => {
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toque = matchMedia("(hover: none)").matches;

  /* Palavras que aparecem uma a uma */
  document.querySelectorAll(".palavras").forEach((el) => {
    const partes = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    partes.forEach((p, i) => {
      const s = document.createElement("span");
      s.className = "w"; s.style.setProperty("--i", i); s.textContent = p;
      el.append(s, " ");
    });
  });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } }), { threshold: 0.3 });
  document.querySelectorAll(".palavras").forEach((el) => io.observe(el));
  if (reduzir) return;

  /* Barra de progresso do filme */
  const cine = document.querySelector(".cine");
  const barra = document.querySelector(".cine-barra");

  /* Cartões 3D que seguem o mouse/dedo */
  document.querySelectorAll(".carta").forEach((c) => {
    const mover = (x, y) => {
      const r = c.getBoundingClientRect();
      const px = (x - r.left) / r.width, py = (y - r.top) / r.height;
      c.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
      c.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
      c.style.setProperty("--mx", `${px * 100}%`);
      c.style.setProperty("--my", `${py * 100}%`);
    };
    c.addEventListener("pointermove", (e) => mover(e.clientX, e.clientY));
    c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
  });

  /* Partículas de luz douradas no cardápio */
  const canvas = document.querySelector(".particulas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let pts = [], visivel = false, w = 0, h = 0;
    const iniciar = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (w * h) / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + 0.4, v: Math.random() * 0.35 + 0.08, f: Math.random() * Math.PI * 2 }));
    };
    const desenhar = () => {
      if (visivel) {
        ctx.clearRect(0, 0, w, h);
        for (const p of pts) {
          p.y -= p.v; p.f += 0.02; const x = p.x + Math.sin(p.f) * 8;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          const a = 0.35 + Math.sin(p.f * 2) * 0.25;
          ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245,185,79,${a})`; ctx.shadowColor = "rgba(245,185,79,.9)"; ctx.shadowBlur = 8; ctx.fill();
        }
      }
      requestAnimationFrame(desenhar);
    };
    new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }).observe(canvas);
    addEventListener("resize", iniciar);
    iniciar(); desenhar();
  }

  /* Rolagem: barra do filme, foto do sobre, eco gigante, trilha da história */
  const prazo = document.querySelector(".prazo");
  const cardPrazo = prazo && prazo.querySelector(".card-prazo");
  const prazoFinal = prazo && prazo.querySelector(".prazo-final");
  const fotoSobre = document.querySelector(".sobre-foto img");
  const eco = document.querySelector(".eco");
  const hist = document.querySelector(".bloco--historia");
  const itens = hist ? [...hist.querySelectorAll(".trilha li")] : [];
  const aoRolar = () => {
    if (cine && barra) {
      const p = Math.min(1, Math.max(0, -cine.getBoundingClientRect().top / (cine.offsetHeight - innerHeight)));
      barra.style.setProperty("--p", p);
      // Vapor sobe e cobre a tela (55%→72%), depois abre revelando a foto na poltrona (72%→86%)
      const suave = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
      const palco = cine.querySelector(".cine-palco");
      palco.style.setProperty("--vapor", (suave(0.28, 0.46, p) * (1 - suave(0.5, 0.64, p))).toFixed(3));
      palco.style.setProperty("--foto", suave(0.46, 0.58, p).toFixed(3));
    }
    if (prazo) {
      const r = prazo.getBoundingClientRect();
      const q = Math.min(1, Math.max(0, -r.top / (prazo.offsetHeight - innerHeight)));
      prazo.style.setProperty("--f2", Math.min(1, Math.max(0, (q - 0.04) / 0.1)).toFixed(3));
      const lim = (a, b) => Math.min(1, Math.max(0, (q - a) / (b - a)));
      prazo.style.setProperty("--caos", lim(0.0, 0.08).toFixed(3));
      prazo.style.setProperty("--junta", lim(0.2, 0.32).toFixed(3));
      prazo.style.setProperty("--card", lim(0.28, 0.36).toFixed(3));
      const estado = q < 0.44 ? ["ok", "Vence em 5 dias", 15] : q < 0.56 ? ["atencao", "Vence amanhã", 55] : ["hoje", "Vence hoje!", 90];
      if (cardPrazo.dataset.estado !== estado[0]) {
        cardPrazo.dataset.estado = estado[0];
        cardPrazo.querySelector(".card-prazo-status b").textContent = estado[1];
        cardPrazo.style.setProperty("--gasto", estado[2] + "%");
      }
      const f3 = Math.min(1, Math.max(0, (q - 0.56) / 0.1));
      prazo.style.setProperty("--f3", f3.toFixed(3));
      prazoFinal.classList.toggle("pronto", f3 > 0.5);
    }
    if (fotoSobre) {
      const r = fotoSobre.parentElement.getBoundingClientRect();
      fotoSobre.style.setProperty("--py", `${((r.top + r.height / 2 - innerHeight / 2) / innerHeight) * -60}px`);
    }
    if (eco) {
      const r = eco.parentElement.getBoundingClientRect();
      eco.style.setProperty("--ex", `${(r.top / innerHeight) * 30}%`);
    }
    if (hist) {
      const r = hist.getBoundingClientRect();
      const hp = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / (r.height * 0.8)));
      hist.style.setProperty("--hp", hp.toFixed(3));
      itens.forEach((li, i) => li.classList.toggle("aceso", hp >= (i + 0.5) / itens.length));
    }
  };
  addEventListener("scroll", () => requestAnimationFrame(aoRolar), { passive: true });
  aoRolar();

  /* Luz que segue o mouse */
  const luz = document.querySelector(".luz-cursor");
  if (luz && !toque) addEventListener("pointermove", (e) => { luz.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`; }, { passive: true });
})();

/* Vídeo do clone: toca sozinho (sem som) só quando aparece na tela; com movimento reduzido, mostra os controles */
(() => {
  const v = document.querySelector(".video-clone");
  if (!v) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { v.controls = true; return; }
  new IntersectionObserver(([e]) => { if (e.isIntersecting) { v.play().catch(() => { v.controls = true; }); } else v.pause(); }, { threshold: 0.4 }).observe(v);
})();
