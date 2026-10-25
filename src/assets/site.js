import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./site.css";
import { business, servicePriceLabel, services, whatsappUrl } from "../config.js";

gsap.registerPlugin(ScrollTrigger);

const body = document.body;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");

class SoundDesign {
  constructor() {
    this.context = null;
    this.master = null;
    this.enabled = false;
    this.lastPlayed = new Map();
    try { this.remembered = localStorage.getItem("lavamed-sound") === "enabled"; }
    catch { this.remembered = false; }
  }

  updateControls() {
    document.querySelectorAll("[data-sound-toggle]").forEach((button) => {
      const state = button.querySelector("[data-sound-state]");
      button.classList.toggle("is-on", this.enabled);
      button.classList.toggle("is-remembered", !this.enabled && this.remembered);
      button.setAttribute("aria-pressed", String(this.enabled));
      button.setAttribute("aria-label", this.enabled ? "Desativar experiência sonora" : this.remembered ? "Reativar experiência sonora" : "Ativar experiência sonora");
      if (state) state.textContent = this.enabled ? "ON" : this.remembered ? "READY" : "OFF";
    });
  }

  async enable() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.context ||= new AudioContextClass({ latencyHint: "interactive" });
    if (this.context.state === "suspended") await this.context.resume();
    this.master ||= this.context.createGain();
    this.master.disconnect();
    this.master.gain.setValueAtTime(.72, this.context.currentTime);
    this.master.connect(this.context.destination);
    this.enabled = true;
    this.remembered = true;
    try { localStorage.setItem("lavamed-sound", "enabled"); } catch {}
    this.updateControls();
    this.play("hero", true);
  }

  disable() {
    this.enabled = false;
    this.remembered = false;
    if (this.master && this.context) this.master.gain.setTargetAtTime(.0001, this.context.currentTime, .015);
    try { localStorage.setItem("lavamed-sound", "disabled"); } catch {}
    this.updateControls();
  }

  async toggle() {
    if (this.enabled) this.disable();
    else await this.enable();
  }

  tone({ frequency = 440, endFrequency = frequency, duration = .1, volume = .025, type = "sine", delay = 0 }) {
    if (!this.context || !this.master) return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(.018, duration / 3));
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + .02);
  }

  noise({ duration = .3, volume = .018, from = 350, to = 1500 }) {
    if (!this.context || !this.master) return;
    const length = Math.ceil(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / length);
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.Q.value = .65;
    filter.frequency.setValueAtTime(from, now);
    filter.frequency.exponentialRampToValueAtTime(to, now + duration * .72);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + .035);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(now);
    source.stop(now + duration + .02);
  }

  play(name, immediate = false) {
    if (!this.enabled || !this.context || !this.master) return;
    const intervals = { click: 90, reveal: 650, scene: 850, liquid: 1000, whoosh: 700, hero: 1200 };
    const now = performance.now();
    if (!immediate && now - (this.lastPlayed.get(name) || 0) < (intervals[name] || 300)) return;
    this.lastPlayed.set(name, now);

    if (name === "click") this.tone({ frequency: 920, endFrequency: 560, duration: .055, volume: .014, type: "triangle" });
    if (name === "scene") {
      this.tone({ frequency: 92, endFrequency: 124, duration: .34, volume: .026, type: "sine" });
      this.tone({ frequency: 620, endFrequency: 410, duration: .18, volume: .008, type: "triangle", delay: .025 });
    }
    if (name === "whoosh") this.noise({ duration: .42, volume: .018, from: 260, to: 1850 });
    if (name === "liquid") {
      this.noise({ duration: .46, volume: .016, from: 1100, to: 360 });
      [0, .075, .145].forEach((delay, index) => this.tone({ frequency: 1180 - index * 170, endFrequency: 430 - index * 45, duration: .16, volume: .008, type: "sine", delay }));
    }
    if (name === "reveal") {
      this.tone({ frequency: 210, endFrequency: 520, duration: .28, volume: .014, type: "sine" });
      this.noise({ duration: .24, volume: .009, from: 480, to: 1240 });
    }
    if (name === "hero") {
      this.tone({ frequency: 58, endFrequency: 86, duration: .9, volume: .034, type: "sine" });
      this.tone({ frequency: 232, endFrequency: 348, duration: .72, volume: .009, type: "triangle", delay: .08 });
      this.noise({ duration: .68, volume: .012, from: 220, to: 1380 });
    }
  }
}

const soundDesign = new SoundDesign();

function initSoundDesign() {
  soundDesign.updateControls();
  document.querySelectorAll("[data-sound-toggle]").forEach((button) => button.addEventListener("click", () => soundDesign.toggle()));
  document.querySelectorAll(".cta-pill,.header-cta,.submit-button,.faq-item button").forEach((control) => control.addEventListener("pointerdown", () => soundDesign.play("click")));
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
  const location = [business.city, business.state].filter(Boolean).join(", ");
  const neighborhood = business.neighborhood ? `Bairro ${business.neighborhood}` : "";
  const items = [location, neighborhood, business.address, business.openingHours].filter(Boolean).map((item) => `<span>${item}</span>`);
  if (business.whatsapp) items.push(`<a href="${whatsappUrl()}" target="_blank" rel="noopener">WhatsApp ${business.phoneDisplay || business.whatsapp} ↗</a>`);
  if (business.instagram) items.push(`<a href="${business.instagram}" target="_blank" rel="noopener">Instagram ↗</a>`);
  if (business.mapsUrl) items.push(`<a href="${business.mapsUrl}" target="_blank" rel="noopener">Como chegar ↗</a>`);
  meta.innerHTML = items.length ? items.join("") : "<span>Dados comerciais em atualização</span>";
});

function initHeroMotion() {
  const hero = document.querySelector("[data-hero]");
  if (!hero || reducedMotion) return;
  const backdrop = hero.querySelector(".hero-backdrop");
  const car = hero.querySelector(".hero-car-layer");
  const carImage = car?.querySelector("img");
  const specular = hero.querySelector(".hero-specular");
  const beam = hero.querySelector(".hero-beam");
  const lens = hero.querySelector(".hero-lens");
  const titleLines = hero.querySelectorAll(".title-mask > span");
  const eyebrow = hero.querySelector(".eyebrow");
  const bottom = hero.querySelector(".hero-bottom");

  const context = gsap.context(() => {
    gsap.set(titleLines, { yPercent: 115, clipPath: "inset(0 0 100% 0)" });
    gsap.set([eyebrow, bottom], { autoAlpha: 0, y: 24 });
    gsap.set(car, { xPercent: 13, scale: 1.1, rotateY: -5, transformPerspective: 1200 });
    gsap.set(specular, { xPercent: -12, opacity: 0 });
    gsap.set(backdrop, { scale: 1.16, filter: "brightness(.38) saturate(.55) blur(2px)" });

    gsap.timeline({ defaults: { ease: "power4.out" } })
      .to(backdrop, { scale: 1.08, filter: "brightness(.58) saturate(.7) blur(1.2px)", duration: 1.65 }, 0)
      .to(car, { xPercent: 0, scale: 1, rotateY: 0, duration: 1.8 }, .08)
      .to(carImage, { filter: "brightness(.88) saturate(.92)", duration: 1.5 }, .1)
      .to(beam, { xPercent: 660, opacity: .82, duration: 1.45, ease: "power2.inOut" }, .28)
      .to(specular, { xPercent: 7, opacity: .52, duration: 1.25, ease: "power2.inOut" }, .42)
      .to(titleLines, { yPercent: 0, clipPath: "inset(0)", duration: .92, stagger: .11 }, .46)
      .to(eyebrow, { autoAlpha: 1, y: 0, duration: .65 }, .66)
      .to(bottom, { autoAlpha: 1, y: 0, duration: .72 }, .82)
      .to(lens, { scale: 1.16, opacity: .52, duration: 1.2 }, .35);

    gsap.timeline({
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1.15, invalidateOnRefresh: true }
    })
      .to(backdrop, { yPercent: 9, scale: 1.14, ease: "none" }, 0)
      .to(car, { xPercent: 7, yPercent: 4, scale: 1.06, rotateY: 2.2, ease: "none" }, 0)
      .to(specular, { xPercent: 25, opacity: .22, ease: "none" }, 0)
      .to(".hero-copy", { yPercent: -12, opacity: .08, ease: "none" }, 0)
      .to(".hero-wordmark", { xPercent: -7, opacity: .35, ease: "none" }, 0);
  }, hero);

  return () => context.revert();
}

function initCameraStory() {
  const section = document.querySelector("[data-camera]");
  if (!section) return;
  const stage = section.querySelector(".camera-stage");
  const acts = [...section.querySelectorAll("[data-camera-act]")];
  const scenes = [...section.querySelectorAll("[data-scene]")];
  const count = section.querySelector("[data-camera-count]");
  const meter = section.querySelector("[data-camera-progress]");
  const scan = section.querySelector(".scan-line");
  const aperture = section.querySelector(".camera-aperture");
  const liquid = section.querySelector(".liquid-canvas");
  const displacement = section.querySelector("#water-displace");
  const noise = section.querySelector("#water-noise");

  const showScene = (index) => {
    scenes.forEach((scene, sceneIndex) => scene.classList.toggle("is-active", sceneIndex === index));
    if (count) count.textContent = String(index + 1).padStart(2, "0");
  };

  if (reducedMotion) {
    showScene(0);
    return;
  }

  const media = gsap.matchMedia();
  media.add({ desktop: "(min-width: 769px)", mobile: "(max-width: 768px)" }, ({ conditions }) => {
    let activeScene = -1;
    const context = gsap.context(() => {
      gsap.set(acts, { autoAlpha: 0 });
      gsap.set(acts[0], { autoAlpha: 1 });
      gsap.set(scenes, { autoAlpha: 0, y: 70, yPercent: -35 });
      gsap.set(scenes[0], { autoAlpha: 1, y: 0 });
      gsap.set(liquid, { opacity: 0 });

      const timeline = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: conditions.desktop ? () => `+=${innerHeight * 3.7}` : "bottom bottom",
          pin: conditions.desktop ? stage : false,
          pinSpacing: true,
          scrub: conditions.desktop ? 1.2 : .75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: ({ progress: value }) => {
            const index = value < .25 ? 0 : value < .5 ? 1 : value < .75 ? 2 : 3;
            if (index !== activeScene) {
              if (activeScene >= 0) soundDesign.play(index === 2 ? "liquid" : "scene");
              activeScene = index;
              showScene(index);
            }
            gsap.set(meter, { scaleY: value });
          }
        }
      });

      timeline
        .to(acts[0].querySelector("img"), { scale: 1.28, xPercent: -3, duration: 1 }, 0)
        .to(scan, { x: "34vw", opacity: .6, duration: .85 }, 0)
        .to(aperture, { rotate: 18, scale: 1.08, duration: 1 }, 0)
        .to(scenes[0], { autoAlpha: 0, y: -65, duration: .2 }, .68)
        .fromTo(acts[1], { autoAlpha: 0, clipPath: "inset(10% 8% 10% 48%)" }, { autoAlpha: 1, clipPath: "inset(0%)", duration: .42 }, .7)
        .to(acts[0], { autoAlpha: 0, duration: .22 }, .76)
        .to(acts[1].querySelector("img"), { scale: 1.36, xPercent: -11, yPercent: 3, duration: .95 }, .72)
        .to(scenes[1], { autoAlpha: 1, y: 0, duration: .24 }, .76)
        .to(scan, { x: "69vw", opacity: .78, duration: .8 }, .72)
        .to(scenes[1], { autoAlpha: 0, y: -65, duration: .2 }, 1.66)
        .fromTo(acts[2], { autoAlpha: 0, clipPath: "circle(0% at 72% 48%)" }, { autoAlpha: 1, clipPath: "circle(82% at 72% 48%)", duration: .62 }, 1.62)
        .to(acts[1], { autoAlpha: 0, duration: .25 }, 1.82)
        .to(displacement, { attr: { scale: 36 }, duration: .58 }, 1.65)
        .to(noise, { attr: { baseFrequency: "0.018 0.055" }, duration: .7 }, 1.65)
        .to(liquid, { opacity: .7, duration: .34 }, 1.68)
        .to(scenes[2], { autoAlpha: 1, y: 0, duration: .25 }, 1.72)
        .to(scan, { x: "86vw", opacity: .22, duration: .8 }, 1.65)
        .to(scenes[2], { autoAlpha: 0, y: -65, duration: .2 }, 2.58)
        .fromTo(acts[3], { autoAlpha: 0, scale: 1.12, clipPath: "inset(45% 0 45% 0)" }, { autoAlpha: 1, scale: 1, clipPath: "inset(0%)", duration: .55 }, 2.55)
        .to(acts[2], { autoAlpha: 0, duration: .3 }, 2.75)
        .to(liquid, { opacity: 0, duration: .35 }, 2.62)
        .to(scenes[3], { autoAlpha: 1, y: 0, duration: .28 }, 2.67)
        .to(aperture, { rotate: 54, scale: .78, opacity: .2, duration: .85 }, 2.55)
        .to(scan, { x: "96vw", opacity: 0, duration: .65 }, 2.55)
        .to(acts[3].querySelector("img"), { scale: 1.02, xPercent: 2, duration: .9 }, 2.58);
    }, section);
    return () => context.revert();
  });
}

function initServiceVisual() {
  const visual = document.querySelector("[data-service-visual]");
  if (!visual) return;
  const image = visual.querySelector("[data-service-image]");
  const placeholder = visual.querySelector("[data-service-placeholder]");
  const caption = visual.querySelector("[data-service-caption]");
  const mediaLabel = visual.querySelector("[data-service-media-label]");
  const price = visual.querySelector("[data-service-price]");
  const number = visual.querySelector(".visual-number");
  let active = document.querySelector(".service-row.is-active")?.dataset.service || "";
  let timeline;

  const render = (slug) => {
    if (!slug || slug === active) return;
    const service = services.find((item) => item.slug === slug);
    if (!service) return;
    active = slug;
    document.querySelectorAll(".service-row").forEach((row) => row.classList.toggle("is-active", row.dataset.service === slug));

    const incoming = service.image ? image : placeholder;
    const outgoing = image.hidden ? placeholder : image;
    const swap = () => {
      placeholder.className = `service-placeholder is-${service.slug}`;
      placeholder.querySelector(":scope > span").textContent = `LVM / ${service.number}`;
      number.textContent = service.number;
      caption.textContent = service.name;
      if (price) price.textContent = servicePriceLabel(service);
      if (service.image) {
        image.src = service.image.src;
        image.srcset = service.image.webpSrcSet;
        image.sizes = "(max-width: 900px) 100vw, 50vw";
        image.width = service.image.width;
        image.height = service.image.height;
        image.alt = service.image.alt;
        if (mediaLabel) mediaLabel.textContent = service.image.illustrative
          ? "Composição conceitual — não representa atendimento real"
          : service.image.classification.startsWith("Exterior finalizado")
            ? "Acervo LavaMed / exterior finalizado"
            : `Acervo LavaMed / ${service.image.classification.split("—")[0].trim()}`;
        image.hidden = false;
        placeholder.hidden = true;
      } else {
        image.hidden = true;
        image.removeAttribute("src");
        placeholder.hidden = false;
      }
    };

    timeline?.kill();
    soundDesign.play("whoosh");
    gsap.killTweensOf([image, placeholder]);
    gsap.set(outgoing, { autoAlpha: 1, scale: 1, clipPath: "inset(0%)" });
    if (reducedMotion) { swap(); gsap.set(incoming, { autoAlpha: 1, scale: 1, clipPath: "inset(0%)" }); return; }
    timeline = gsap.timeline()
      .to(outgoing, { autoAlpha: 0, scale: 1.035, duration: .18, ease: "power2.in" })
      .call(() => { swap(); gsap.set(incoming, { autoAlpha: 0, scale: .97, clipPath: "inset(0 100% 0 0)" }); })
      .to(incoming, { autoAlpha: 1, scale: 1, clipPath: "inset(0%)", duration: .62, ease: "power4.out" });
  };

  document.querySelectorAll(".service-row").forEach((row) => {
    row.addEventListener("pointerenter", () => render(row.dataset.service));
    row.addEventListener("focus", () => render(row.dataset.service));
  });
}

function initCompare() {
  document.querySelectorAll("[data-compare]").forEach((compare) => {
    const handle = compare.querySelector(".compare-handle");
    let dragging = false;
    const setPosition = (clientX) => {
      const bounds = compare.getBoundingClientRect();
      const position = Math.max(2, Math.min(98, ((clientX - bounds.left) / bounds.width) * 100));
      compare.style.setProperty("--position", `${position}%`);
      handle.setAttribute("aria-valuenow", String(Math.round(position)));
    };
    compare.addEventListener("pointerdown", (event) => { dragging = true; compare.setPointerCapture(event.pointerId); setPosition(event.clientX); soundDesign.play("reveal"); });
    compare.addEventListener("pointermove", (event) => { if (dragging) setPosition(event.clientX); });
    compare.addEventListener("pointerup", () => dragging = false);
    compare.addEventListener("pointercancel", () => dragging = false);
    handle.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const current = Number(handle.getAttribute("aria-valuenow"));
      const next = event.key === "Home" ? 2 : event.key === "End" ? 98 : current + (event.key === "ArrowRight" ? 4 : -4);
      const value = Math.max(2, Math.min(98, next));
      compare.style.setProperty("--position", `${value}%`);
      handle.setAttribute("aria-valuenow", String(value));
      soundDesign.play("reveal");
    });
  });
}

function initGallery() {
  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    let down = false;
    let moved = false;
    let suppressClick = false;
    let startX = 0;
    let startScroll = 0;
    gallery.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      down = true; moved = false; startX = event.clientX; startScroll = gallery.scrollLeft;
      gallery.classList.add("is-dragging"); gallery.setPointerCapture(event.pointerId);
    });
    gallery.addEventListener("pointermove", (event) => {
      if (!down) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 7) moved = true;
      gallery.scrollLeft = startScroll - distance * 1.25;
    });
    const finish = () => {
      if (moved) { suppressClick = true; setTimeout(() => suppressClick = false, 120); }
      down = false; gallery.classList.remove("is-dragging");
      moved = false;
    };
    gallery.addEventListener("pointerup", finish);
    gallery.addEventListener("pointercancel", finish);
    gallery.addEventListener("click", (event) => {
      if (event.detail > 0 && suppressClick) { event.preventDefault(); event.stopPropagation(); }
    }, true);
    gallery.addEventListener("keydown", (event) => {
      const amount = Math.max(260, gallery.clientWidth * .68);
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault(); gallery.scrollBy({ left: event.key === "ArrowRight" ? amount : -amount, behavior: reducedMotion ? "auto" : "smooth" });
      }
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault(); gallery.scrollTo({ left: event.key === "End" ? gallery.scrollWidth : 0, behavior: reducedMotion ? "auto" : "smooth" });
      }
    });
  });
}

function initLiquidCanvas(canvas) {
  if (reducedMotion) return;
  const context = canvas.getContext("2d", { alpha: true });
  const mode = canvas.dataset.liquidCanvas;
  let width = 0, height = 0, dpr = 1, frame = 0, running = false, time = 0;
  const drops = Array.from({ length: 24 }, (_, index) => ({ x: (index * 137.4) % innerWidth, y: (index * 83.7) % innerHeight, r: 1 + (index % 4) * .55, speed: .12 + (index % 5) * .045, drift: ((index % 3) - 1) * .06 }));
  const resize = () => {
    width = canvas.clientWidth; height = canvas.clientHeight; dpr = Math.min(1.5, devicePixelRatio || 1);
    canvas.width = Math.max(1, width * dpr); canvas.height = Math.max(1, height * dpr); context.setTransform(dpr,0,0,dpr,0,0);
  };
  const drawDrops = () => {
    drops.forEach((drop) => {
      drop.y += drop.speed; drop.x += drop.drift;
      if (drop.y > height + 10) { drop.y = -10; drop.x = Math.random() * width; }
      const gradient = context.createRadialGradient(drop.x-drop.r*.4,drop.y-drop.r*.4,.1,drop.x,drop.y,drop.r*2.3);
      gradient.addColorStop(0,"rgba(244,248,250,.72)"); gradient.addColorStop(.35,"rgba(0,206,245,.22)"); gradient.addColorStop(1,"rgba(0,206,245,0)");
      context.fillStyle = gradient; context.beginPath(); context.arc(drop.x,drop.y,drop.r*2.3,0,Math.PI*2); context.fill();
    });
  };
  const drawCaustics = () => {
    context.globalCompositeOperation = "lighter";
    for (let line = 0; line < 7; line++) {
      context.beginPath();
      for (let x = -30; x <= width + 30; x += 18) {
        const y = height * (.2 + line * .105) + Math.sin(x * .012 + time * .018 + line) * (18 + line * 2) + Math.sin(x * .035 - time * .012) * 8;
        if (x === -30) context.moveTo(x,y); else context.lineTo(x,y);
      }
      context.strokeStyle = line % 2 ? "rgba(0,206,245,.08)" : "rgba(244,248,250,.055)";
      context.lineWidth = 1.2 + (line % 3) * .35; context.stroke();
    }
    context.globalCompositeOperation = "source-over";
  };
  const draw = () => {
    if (!running) return;
    context.clearRect(0,0,width,height); time += 1;
    if (mode === "caustics") drawCaustics(); else drawDrops();
    frame = requestAnimationFrame(draw);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) { running = true; draw(); }
    if (!entry.isIntersecting && running) { running = false; cancelAnimationFrame(frame); }
  }, { rootMargin: "150px" }).observe(canvas);
}

function initMenu() {
  const button = document.querySelector(".menu-toggle");
  const panel = document.querySelector(".menu-panel");
  if (!button || !panel) return;
  panel.inert = true;
  let returnFocus = null;
  const setMenu = (open) => {
    soundDesign.play("whoosh");
    body.classList.toggle("menu-open", open); panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open)); button.setAttribute("aria-expanded", String(open));
    panel.inert = !open;
    button.querySelector(".menu-label").textContent = open ? "Fechar" : "Menu";
    if (open) { returnFocus = document.activeElement; panel.querySelector("a")?.focus({ preventScroll: true }); }
    else if (returnFocus) returnFocus.focus();
  };
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const opening = button.getAttribute("aria-expanded") !== "true";
    setMenu(opening);
    if (opening) setTimeout(() => panel.querySelector("a")?.focus({ preventScroll: true }), 900);
  });
  addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("menu-open")) setMenu(false);
    if (event.key !== "Tab" || !body.classList.contains("menu-open")) return;
    const focusable = [...panel.querySelectorAll("a,button")]; const first = focusable[0]; const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}

function initPageTransitions() {
  const transition = document.querySelector(".transition");
  const strips = transition ? [...transition.children] : [];
  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.href === location.href) return;
      event.preventDefault();
      if (reducedMotion || !transition) { location.href = url.href; return; }
      gsap.set(transition, { visibility: "visible", pointerEvents: "all" });
      gsap.fromTo(strips, { scaleY: 0, transformOrigin: "bottom" }, { scaleY: 1, duration: .62, stagger: .055, ease: "power4.inOut", onComplete: () => location.href = url.href });
    });
  });
}

function initCommonInteractions() {
  let ticking = false;
  const updateScroll = () => {
    const scrollTop = scrollY; const available = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (progress) progress.style.transform = `scaleY(${Math.min(1, scrollTop / available)})`;
    header?.classList.toggle("is-scrolled", scrollTop > 30); ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, { passive: true });
  updateScroll();

  document.querySelectorAll(".faq-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item"); const open = item.classList.toggle("is-open"); button.setAttribute("aria-expanded", String(open));
    });
  });

  const form = document.querySelector("[data-contact-form]");
  form?.addEventListener("submit", (event) => {
    event.preventDefault(); const data = new FormData(form); const status = form.querySelector(".form-status");
    if (!business.whatsapp) { status.textContent = "O canal de agendamento será publicado assim que o contato oficial for confirmado."; return; }
    const name = String(data.get("nome") || "").trim(); const service = String(data.get("servico") || "uma avaliação"); const message = String(data.get("mensagem") || "").trim();
    const text = `Olá, LavaMed! Meu nome é ${name}. Gostaria de conversar sobre ${service}.${message ? ` ${message}` : ""}`;
    open(`https://wa.me/${business.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank", "noopener"); status.textContent = "Abrindo o WhatsApp…";
  });
}

function initPointerEffects() {
  if (!finePointer || reducedMotion) return;
  const cursor = document.querySelector(".cursor");
  const moveCursorX = gsap.quickTo(cursor, "x", { duration: .18, ease: "power3" });
  const moveCursorY = gsap.quickTo(cursor, "y", { duration: .18, ease: "power3" });
  addEventListener("pointermove", (event) => { cursor.style.opacity = "1"; moveCursorX(event.clientX - 19); moveCursorY(event.clientY - 19); }, { passive: true });
  document.querySelectorAll("a,button,[data-compare]").forEach((node) => {
    node.addEventListener("pointerenter", () => cursor?.classList.add("is-link")); node.addEventListener("pointerleave", () => cursor?.classList.remove("is-link"));
  });
  document.querySelectorAll(".magnetic").forEach((node) => {
    const x = gsap.quickTo(node,"x",{duration:.45,ease:"power3"}); const y = gsap.quickTo(node,"y",{duration:.45,ease:"power3"});
    node.addEventListener("pointermove", (event) => { const rect=node.getBoundingClientRect(); x((event.clientX-rect.left-rect.width/2)*.16); y((event.clientY-rect.top-rect.height/2)*.16); });
    node.addEventListener("pointerleave", () => { x(0); y(0); });
  });
  const hero = document.querySelector("[data-hero]"); const lens = hero?.querySelector(".hero-lens"); const wordmark = hero?.querySelector(".hero-wordmark");
  hero?.addEventListener("pointermove", (event) => {
    const x = event.clientX / innerWidth - .5; const y = event.clientY / innerHeight - .5;
    gsap.to(lens,{x:x*45,y:y*28,duration:.9,ease:"power3.out",overwrite:"auto"});
    gsap.to(wordmark,{x:x*-16,y:y*-8,duration:1.1,ease:"power3.out",overwrite:"auto"});
  });
}

initHeroMotion();
initSoundDesign();
initCameraStory();
initServiceVisual();
initCompare();
initGallery();
initMenu();
initPageTransitions();
initCommonInteractions();
initPointerEffects();
document.querySelectorAll("[data-liquid-canvas]").forEach(initLiquidCanvas);

addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
let refreshTimer;
addEventListener("resize", () => {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 180);
}, { passive: true });
addEventListener("orientationchange", () => setTimeout(() => ScrollTrigger.refresh(), 220), { passive: true });
