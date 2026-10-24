import { business, whatsappUrl } from "/config.js";

const root = document.documentElement;
const body = document.body;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

if (!reducedMotion) {
  document.querySelectorAll(".hero .title-mask > span").forEach((line, index) => {
    line.animate(
      [
        { clipPath: "inset(0 0 100% 0)", transform: "translateY(38%)" },
        { clipPath: "inset(0)", transform: "translateY(0)" }
      ],
      { duration: 900, delay: 220 + index * 115, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }
    );
  });
}

document.querySelectorAll("[data-year]").forEach((node) => node.textContent = new Date().getFullYear());
document.querySelectorAll("[data-booking]").forEach((link) => {
  link.href = whatsappUrl(link.dataset.service || "");
  if (business.whatsapp) {
    link.target = "_blank";
    link.rel = "noopener";
  }
});

document.querySelectorAll("[data-business-meta]").forEach((meta) => {
  const items = [business.city, business.address, business.openingHours].filter(Boolean).map((item) => `<span>${item}</span>`);
  if (business.instagram) items.push(`<a href="${business.instagram}" target="_blank" rel="noopener">Instagram ↗</a>`);
  if (business.mapsUrl) items.push(`<a href="${business.mapsUrl}" target="_blank" rel="noopener">Como chegar ↗</a>`);
  meta.innerHTML = items.length ? items.join("") : "<span>Dados comerciais em atualização</span>";
});

const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
let ticking = false;

function updateScroll() {
  const scrollTop = window.scrollY;
  const available = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  if (progress) progress.style.transform = `scaleY(${Math.min(1, scrollTop / available)})`;
  header?.classList.toggle("is-scrolled", scrollTop > 30);
  updateCamera();
  ticking = false;
}

addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScroll);
    ticking = true;
  }
}, { passive: true });

const menuButton = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
let returnFocus = null;

function setMenu(open) {
  if (!menuButton || !menuPanel) return;
  body.classList.toggle("menu-open", open);
  menuPanel.classList.toggle("is-open", open);
  menuPanel.setAttribute("aria-hidden", String(!open));
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.querySelector(".menu-label").textContent = open ? "Fechar" : "Menu";
  if (open) {
    returnFocus = document.activeElement;
    setTimeout(() => menuPanel.querySelector("a")?.focus(), 180);
  } else if (returnFocus) {
    returnFocus.focus();
  }
}

menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
addEventListener("keydown", (event) => {
  if (event.key === "Escape" && body.classList.contains("menu-open")) setMenu(false);
  if (event.key === "Tab" && body.classList.contains("menu-open")) {
    const focusable = [...menuPanel.querySelectorAll("a,button")];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || link.hasAttribute("download")) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.href === location.href) return;
    event.preventDefault();
    const transition = document.querySelector(".transition");
    transition?.classList.add("is-active");
    setTimeout(() => { location.href = url.href; }, reducedMotion ? 0 : 720);
  });
});

const camera = document.querySelector("[data-camera]");
const cameraScenes = [...document.querySelectorAll("[data-scene]")];
const cameraCount = document.querySelector("[data-camera-count]");

function updateCamera() {
  if (!camera || reducedMotion) return;
  const rect = camera.getBoundingClientRect();
  const distance = camera.offsetHeight - innerHeight;
  const value = Math.max(0, Math.min(1, -rect.top / Math.max(1, distance)));
  const scene = Math.min(3, Math.floor(value * 4));
  cameraScenes.forEach((node, index) => node.classList.toggle("is-active", index === scene));
  if (cameraCount) cameraCount.textContent = String(scene + 1).padStart(2, "0");
  camera.style.setProperty("--scan", `${12 + value * 76}vw`);
  camera.style.setProperty("--camera-x", `${-value * 5}%`);
  const image = camera.querySelector(".camera-image img");
  if (image) image.style.transform = `scale(${1.13 - value * .05}) translate3d(${-value * 5}%, ${Math.sin(value * Math.PI) * -2}%, 0)`;
}
if (cameraScenes.length) cameraScenes[0].classList.add("is-active");

document.querySelectorAll(".service-row").forEach((row) => {
  row.addEventListener("pointerenter", () => {
    const visual = document.querySelector(".services-visual");
    if (!visual) return;
    document.querySelectorAll(".service-row").forEach((item) => item.classList.remove("is-active"));
    row.classList.add("is-active");
    const index = Number(row.dataset.service || 1);
    visual.classList.add("is-changing");
    visual.querySelector(".visual-number").textContent = String(index).padStart(2, "0");
    const positions = ["20%", "35%", "50%", "65%", "78%", "90%"];
    setTimeout(() => {
      visual.querySelector("img").style.objectPosition = `${positions[index - 1]} center`;
      visual.classList.remove("is-changing");
    }, 220);
  });
});

document.querySelectorAll("[data-compare]").forEach((compare) => {
  const handle = compare.querySelector(".compare-handle");
  let dragging = false;
  const setPosition = (clientX) => {
    const bounds = compare.getBoundingClientRect();
    const position = Math.max(2, Math.min(98, ((clientX - bounds.left) / bounds.width) * 100));
    compare.style.setProperty("--position", `${position}%`);
    handle.setAttribute("aria-valuenow", String(Math.round(position)));
  };
  compare.addEventListener("pointerdown", (event) => { dragging = true; compare.setPointerCapture(event.pointerId); setPosition(event.clientX); });
  compare.addEventListener("pointermove", (event) => { if (dragging) setPosition(event.clientX); });
  compare.addEventListener("pointerup", () => dragging = false);
  compare.addEventListener("pointercancel", () => dragging = false);
  handle.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const current = Number(handle.getAttribute("aria-valuenow"));
    const next = event.key === "Home" ? 2 : event.key === "End" ? 98 : current + (event.key === "ArrowRight" ? 4 : -4);
    compare.style.setProperty("--position", `${Math.max(2, Math.min(98, next))}%`);
    handle.setAttribute("aria-valuenow", String(Math.max(2, Math.min(98, next))));
  });
});

document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  let down = false;
  let startX = 0;
  let startScroll = 0;
  gallery.addEventListener("pointerdown", (event) => { down = true; startX = event.clientX; startScroll = gallery.scrollLeft; gallery.classList.add("is-dragging"); gallery.setPointerCapture(event.pointerId); });
  gallery.addEventListener("pointermove", (event) => { if (down) gallery.scrollLeft = startScroll - (event.clientX - startX) * 1.25; });
  gallery.addEventListener("pointerup", () => { down = false; gallery.classList.remove("is-dragging"); });
  gallery.addEventListener("pointercancel", () => { down = false; gallery.classList.remove("is-dragging"); });
});

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const open = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
  });
});

const contactForm = document.querySelector("[data-contact-form]");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const status = contactForm.querySelector(".form-status");
  if (!business.whatsapp) {
    status.textContent = "O canal de agendamento será publicado assim que o contato oficial for confirmado.";
    return;
  }
  const name = String(data.get("nome") || "").trim();
  const service = String(data.get("servico") || "uma avaliação");
  const message = String(data.get("mensagem") || "").trim();
  const text = `Olá, LavaMed! Meu nome é ${name}. Gostaria de conversar sobre ${service}.${message ? ` ${message}` : ""}`;
  const phone = business.whatsapp.replace(/\D/g, "");
  open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  status.textContent = "Abrindo o WhatsApp…";
});

if (finePointer) {
  const cursor = document.querySelector(".cursor");
  let cursorX = innerWidth / 2;
  let cursorY = innerHeight / 2;
  addEventListener("pointermove", (event) => {
    cursorX += (event.clientX - cursorX) * .78;
    cursorY += (event.clientY - cursorY) * .78;
    if (cursor) { cursor.style.opacity = "1"; cursor.style.transform = `translate3d(${cursorX - 19}px,${cursorY - 19}px,0)`; }
  }, { passive: true });
  document.querySelectorAll("a,button,[data-compare]").forEach((node) => {
    node.addEventListener("pointerenter", () => cursor?.classList.add("is-link"));
    node.addEventListener("pointerleave", () => cursor?.classList.remove("is-link"));
  });
  document.querySelectorAll(".magnetic").forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      node.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .16}px,${(event.clientY - rect.top - rect.height / 2) * .16}px)`;
    });
    node.addEventListener("pointerleave", () => node.style.transform = "");
  });
  const hero = document.querySelector(".hero");
  hero?.addEventListener("pointermove", (event) => {
    const x = (event.clientX / innerWidth - .5) * 12;
    const y = (event.clientY / innerHeight - .5) * 8;
    hero.querySelector(".hero-media img").style.transform = `scale(1.015) translate3d(${x}px,${y}px,0)`;
  });
}

function initWaterCanvas() {
  const canvas = document.querySelector(".water-canvas");
  if (!canvas || reducedMotion) return;
  const context = canvas.getContext("2d", { alpha: true });
  const drops = Array.from({ length: 22 }, (_, index) => ({
    x: (index * 137.4) % innerWidth,
    y: (index * 83.7) % innerHeight,
    r: 1 + (index % 4) * .55,
    speed: .12 + (index % 5) * .045,
    drift: ((index % 3) - 1) * .06
  }));
  let width = 0, height = 0, dpr = 1, frame = 0;
  const resize = () => {
    width = canvas.clientWidth; height = canvas.clientHeight; dpr = Math.min(1.5, devicePixelRatio || 1);
    canvas.width = width * dpr; canvas.height = height * dpr; context.setTransform(dpr,0,0,dpr,0,0);
  };
  const draw = () => {
    context.clearRect(0,0,width,height);
    drops.forEach((drop) => {
      drop.y += drop.speed; drop.x += drop.drift;
      if (drop.y > height + 10) { drop.y = -10; drop.x = Math.random() * width; }
      const gradient = context.createRadialGradient(drop.x-drop.r*.4,drop.y-drop.r*.4,.1,drop.x,drop.y,drop.r*2.3);
      gradient.addColorStop(0,"rgba(244,248,250,.72)"); gradient.addColorStop(.35,"rgba(0,206,245,.22)"); gradient.addColorStop(1,"rgba(0,206,245,0)");
      context.fillStyle = gradient; context.beginPath(); context.arc(drop.x,drop.y,drop.r*2.3,0,Math.PI*2); context.fill();
    });
    frame = requestAnimationFrame(draw);
  };
  resize(); draw(); addEventListener("resize", resize, { passive:true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(frame); else draw(); });
}

initWaterCanvas();
updateScroll();
