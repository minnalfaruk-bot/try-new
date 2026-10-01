const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const music = $("#bgMusic");
const soundBtn = $("#soundBtn");
const startScreen = $("#startScreen");
const startInvitation = $("#startInvitation");
const zipCard = $("#zipCard");
let playing = false;
let userHasInteracted = false;

/* Keep the page underneath the opening cover from scrolling. */
document.body.classList.add("lock");

window.addEventListener("load", () => {
  setTimeout(() => {
    $(".loader")?.classList.add("hide");
    $(".hero")?.classList.add("loaded");
  }, 250);
  loadOptionalImages();
  initParticles();
});

/* ---------------------------------------------------------
   MUSIC
   No sound is forced before START. The START click is the
   intentional user gesture that begins audible playback.
--------------------------------------------------------- */
if (music) {
  music.volume = 0.6;
  music.preload = "auto";
  music.autoplay = false;
  music.muted = false;
  music.playsInline = true;
}

async function startMusic(){
  if(!music) return false;

  try {
    music.muted = false;
    music.volume = 0.6;
    await music.play();
    playing = true;
    if(soundBtn) soundBtn.textContent = "Ⅱ";
    return true;
  } catch(e) {
    return false;
  }
}

/* ---------------------------------------------------------
   START SCREEN
   START -> music + top-to-bottom ZIP opening -> current site.
--------------------------------------------------------- */
startInvitation?.addEventListener("click", async () => {
  if(startScreen?.classList.contains("opening")) return;

  userHasInteracted = true;

  /* This call happens inside the same click gesture. */
  await startMusic();

  startScreen?.classList.add("opening");
  zipCard?.classList.add("opening");

  window.setTimeout(() => {
    startScreen?.classList.add("done");
    document.body.classList.remove("lock");
  }, 1500);
});

/* Existing invitation button remains exactly after the START cover. */
$("#enterBtn")?.addEventListener("click", async () => {
  userHasInteracted = true;
  if(!playing) await startMusic();
  $(".hero")?.classList.add("open");
  setTimeout(() => $("#countdown")?.scrollIntoView({behavior:"smooth"}), 950);
});

soundBtn?.addEventListener("click", async (event) => {
  event.stopPropagation();
  userHasInteracted = true;

  if(!playing){
    await startMusic();
  } else {
    music.pause();
    playing = false;
    soundBtn.textContent = "♫";
  }
});

function loadOptionalImages(){
  $$(".photo-slot").forEach(slot => {
    const img = $("img", slot);
    if(!img) return;
    img.addEventListener("load", () => {
      slot.classList.add("has-image");
      slot.closest(".name-section")?.classList.add("has-photo");
    });
    img.addEventListener("error", () => {
      slot.classList.remove("has-image");
      slot.closest(".name-section")?.classList.remove("has-photo");
    });
    if(img.complete && img.naturalWidth) {
      slot.classList.add("has-image");
      slot.closest(".name-section")?.classList.add("has-photo");
    }
  });
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); });
}, {threshold:.15});
$$(".reveal-section").forEach(x => io.observe(x));


/* Reveal the moved Nikah Dua above Ashik ♥ Shifana. */
const transitionDua = $(".transition-dua");
if (transitionDua) {
  const transitionDuaObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        transitionDuaObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  transitionDuaObserver.observe(transitionDua);
}

function initParticles(){
  const c = $("#particles");
  if(!c) return;
  const ctx = c.getContext("2d");
  let w, h, dpr, pts = [];

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + "px";
    c.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed(){
    const count = Math.min(135, Math.max(90, Math.floor(window.innerWidth / 7)));
    pts = Array.from({length: count}, () => {
      const isHeart = Math.random() < 0.42;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: isHeart ? Math.random() * 7 + 4 : Math.random() * 2.6 + 0.7,
        alpha: Math.random() * 0.55 + 0.18,
        speed: Math.random() * 0.42 + 0.08,
        drift: (Math.random() - 0.5) * 0.18,
        tw: Math.random() * Math.PI * 2,
        rot: (Math.random() - 0.5) * 0.6,
        rotSpeed: (Math.random() - 0.5) * 0.012,
        heart: isHeart
      };
    });
  }

  function drawHeart(x, y, size, rotation, alpha){
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.9);
    ctx.bezierCurveTo(-size * 1.45, -size * 0.05, -size * 0.85, -size * 1.1, 0, -size * 0.42);
    ctx.bezierCurveTo(size * 0.85, -size * 1.1, size * 1.45, -size * 0.05, 0, size * 0.9);
    ctx.closePath();
    const g = ctx.createRadialGradient(-size * 0.25, -size * 0.25, 0, 0, 0, size * 1.5);
    g.addColorStop(0, "rgba(255,246,214,0.98)");
    g.addColorStop(0.55, "rgba(232,199,122,0.78)");
    g.addColorStop(1, "rgba(194,145,255,0.16)");
    ctx.fillStyle = g;
    ctx.shadowBlur = size * 2.4;
    ctx.shadowColor = "rgba(255,235,175,0.38)";
    ctx.fill();
    ctx.restore();
  }

  function drawSparkle(x, y, size, alpha){
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(255,244,210,0.92)";
    ctx.lineWidth = 0.8;
    ctx.shadowBlur = size * 2.5;
    ctx.shadowColor = "rgba(232,199,122,0.5)";
    ctx.beginPath();
    ctx.moveTo(-size * 1.8, 0);
    ctx.lineTo(size * 1.8, 0);
    ctx.moveTo(0, -size * 1.8);
    ctx.lineTo(0, size * 1.8);
    ctx.stroke();
    ctx.restore();
  }

  function draw(t){
    ctx.clearRect(0, 0, w, h);
    for(const p of pts){
      p.y += p.speed;
      p.x += p.drift;
      p.tw += 0.035;
      p.rot += p.rotSpeed;

      if(p.y > h + 25){
        p.y = -25;
        p.x = Math.random() * w;
      }
      if(p.x < -25) p.x = w + 25;
      if(p.x > w + 25) p.x = -25;

      const pulse = 0.58 + 0.42 * Math.sin(p.tw);
      const alpha = p.alpha * pulse;

      if(p.heart){
        drawHeart(p.x, p.y, p.size, p.rot, alpha);
      } else {
        drawSparkle(p.x, p.y, p.size, alpha);
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    resize();
    seed();
  });

  resize();
  seed();
  requestAnimationFrame(draw);
}


// Countdown to Nikah — 15 November 2026, 10:00 AM
(function initCountdown(){
  const target = new Date("2026-11-15T10:00:00+05:30").getTime();
  const daysEl = $("#days"), hoursEl = $("#hours"), minutesEl = $("#minutes"), secondsEl = $("#seconds");
  if(!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
  function update(){
    const diff = Math.max(0, target - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    daysEl.textContent = String(days).padStart(2,"0");
    hoursEl.textContent = String(hours).padStart(2,"0");
    minutesEl.textContent = String(minutes).padStart(2,"0");
    secondsEl.textContent = String(seconds).padStart(2,"0");
  }
  update();
  setInterval(update, 1000);
})();
