import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./site.css";
import { business, servicePriceLabel, services, whatsappUrl } from "../config.js";

gsap.registerPlugin(ScrollTrigger);

const body = document.body;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine) and (hover: hover)").matches;
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");

// Remove a preferência legada para que versões anteriores não deixem estado residual.
try { localStorage.removeItem("lavamed-sound"); } catch {}

document.querySelectorAll("[data-year]").forEach((node) => node.textContent = new Date().getFullYear());
document.querySelectorAll("[data-booking]").forEach((link) => {
  const service = services.find((item) => item.slug === link.dataset.service || item.name === link.dataset.service);
  link.href = whatsappUrl(service || link.dataset.service || "");
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
  const provenance = hero.querySelector(".hero-provenance");

  const context = gsap.context(() => {
    gsap.set(titleLines, { yPercent: 108, autoAlpha: 0 });
    gsap.set([eyebrow, bottom, provenance], { autoAlpha: 0, y: 24 });
    gsap.set(car, { xPercent: 10, scale: 1.085, rotateY: -4, clipPath: "polygon(20% 31%, 66% 20%, 100% 24%, 100% 91%, 7% 91%)", transformPerspective: 1200 });
    gsap.set(specular, { xPercent: -12, opacity: 0 });
    gsap.set(backdrop, { scale: 1.145, filter: "brightness(.24) saturate(.72) blur(2px)" });

    const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
      .to(backdrop, { scale: 1.07, filter: "brightness(.47) saturate(.84) blur(.8px)", duration: 1.55 }, 0)
      .to(car, { xPercent: 0, scale: 1, rotateY: 0, clipPath: "polygon(5% 27%, 62% 17%, 100% 21%, 100% 94%, 3% 94%)", duration: 1.72 }, .06)
      .to(carImage, { filter: "brightness(.9) saturate(1.02) contrast(1.04)", duration: 1.45 }, .08)
      .to(beam, { xPercent: 660, opacity: .78, duration: 1.34, ease: "power2.inOut" }, .2)
      .to(specular, { xPercent: 8, opacity: .5, duration: 1.2, ease: "power2.inOut" }, .34)
      .to(titleLines, { yPercent: 0, autoAlpha: 1, duration: .86, stagger: .09, onComplete: () => gsap.set(titleLines, { clearProps: "transform,opacity,visibility" }) }, .42)
      .to(eyebrow, { autoAlpha: 1, y: 0, duration: .58 }, .61)
      .to(bottom, { autoAlpha: 1, y: 0, duration: .68 }, .76)
      .to(provenance, { autoAlpha: 1, y: 0, duration: .55 }, .9)
      .to(lens, { scale: 1.14, opacity: .5, duration: 1.1 }, .3);

    (document.fonts?.ready || Promise.resolve()).then(() => {
      ScrollTrigger.refresh();
      intro.play(0);
    });

    gsap.timeline({
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1.15, invalidateOnRefresh: true }
    })
      .to(backdrop, { yPercent: 10, scale: 1.13, ease: "none" }, 0)
      .to(car, { xPercent: 5, yPercent: 3, scale: 1.045, rotateY: 1.5, ease: "none" }, 0)
      .to(specular, { xPercent: 25, opacity: .22, ease: "none" }, 0)
      .to(".hero-copy", { yPercent: -12, opacity: .08, ease: "none" }, 0)
      .to(".hero-wordmark", { xPercent: -7, opacity: .35, ease: "none" }, 0);
  }, hero);

  return () => context.revert();
}

function initProcessCinema() {
  const section = document.querySelector("[data-process-cinema]");
  if (!section) return;
  const slot = section.querySelector("[data-process-video-slot]");
  const panels = [...section.querySelectorAll("[data-dual-panel]")];
  const previews = [...section.querySelectorAll("[data-process-preview]")];
  const selectButtons = [...section.querySelectorAll("[data-dual-select]")];
  const openButtons = [...section.querySelectorAll("[data-video-open]")];
  const nextButton = section.querySelector("[data-dual-next]");
  const nextLabel = section.querySelector("[data-dual-next-label]");
  const dialog = document.querySelector("[data-video-dialog]");
  const fullVideo = dialog?.querySelector("[data-process-full]");
  const closeButton = dialog?.querySelector("[data-video-close]");
  const dialogTitle = dialog?.querySelector("[data-video-dialog-title]");
  const dialogDuration = dialog?.querySelector("[data-video-dialog-duration]");
  const stateKeys = panels.map((panel) => panel.dataset.dualPanel);
  const panelByState = new Map(panels.map((panel) => [panel.dataset.dualPanel, panel]));
  const previewByState = new Map(previews.map((video) => [video.dataset.processPreview, video]));
  const mobileQuery = window.matchMedia("(max-width: 700px)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || ""));
  const allowAmbientPlayback = !reducedMotion && !saveData;
  const userPausedStates = new Set();
  let activeState = slot?.dataset.activeState || "before";
  let experienceVisible = false;
  let opener = null;

  const formatTime = (seconds) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
  };

  const loadVideo = (video) => {
    if (!video || video.dataset.loaded === "true") return;
    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });
    if (video.dataset.src) {
      video.src = video.dataset.src;
      video.removeAttribute("data-src");
    }
    video.dataset.loaded = "true";
    video.load();
  };

  const updatePreviewControls = (state) => {
    const video = previewByState.get(state);
    const panel = panelByState.get(state);
    if (!video || !panel) return;
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 6;
    const percentage = Math.min(1000, Math.max(0, Math.round((video.currentTime / duration) * 1000)));
    const seek = panel.querySelector(`[data-dual-seek="${state}"]`);
    const time = panel.querySelector(`[data-dual-time="${state}"]`);
    const toggle = panel.querySelector(`[data-dual-play="${state}"]`);
    if (seek && document.activeElement !== seek) seek.value = String(percentage);
    if (time) time.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
    if (toggle) {
      const playing = !video.paused && !video.ended;
      toggle.setAttribute("aria-pressed", String(playing));
      toggle.setAttribute("aria-label", `${playing ? "Pausar" : "Reproduzir"} preview — ${state === "before" ? "Antes" : "Depois"}`);
      const icon = toggle.querySelector("i");
      const label = toggle.querySelector("span");
      if (icon) icon.textContent = playing ? "Ⅱ" : "▶";
      if (label) label.textContent = playing ? "Pausar" : "Reproduzir";
    }
  };

  const setPanelVideoState = (state, value) => {
    const panel = panelByState.get(state);
    if (!panel) return;
    panel.dataset.videoState = value;
    const status = panel.querySelector("[data-dual-status]");
    if (status) status.textContent = value === "fallback" ? "Pôster disponível" : value === "playing" ? "Preview em reprodução" : "Preview silencioso";
    if (state === activeState && slot) slot.dataset.videoState = value;
  };

  const pausePreview = (state, value = "paused") => {
    const video = previewByState.get(state);
    if (!video) return;
    video.pause();
    if (video.dataset.loaded === "true" && panelByState.get(state)?.dataset.videoState !== "fallback") setPanelVideoState(state, value);
    updatePreviewControls(state);
  };

  const playPreview = async (state, { explicit = false } = {}) => {
    const video = previewByState.get(state);
    if (!video || (!explicit && (!allowAmbientPlayback || userPausedStates.has(state)))) return;
    if (explicit) userPausedStates.delete(state);
    stateKeys.filter((key) => key !== state).forEach((key) => pausePreview(key));
    loadVideo(video);
    video.muted = true;
    video.volume = 0;
    try {
      await video.play();
      setPanelVideoState(state, "playing");
    } catch {
      setPanelVideoState(state, "poster");
    }
    updatePreviewControls(state);
  };

  const syncResponsiveAria = () => {
    panels.forEach((panel) => {
      const isActive = panel.dataset.dualPanel === activeState;
      panel.setAttribute("aria-hidden", String(mobileQuery.matches && !isActive));
      panel.querySelectorAll("button,input").forEach((control) => {
        if (mobileQuery.matches && !isActive) control.setAttribute("tabindex", "-1");
        else if (!control.matches("[role=tab]")) control.removeAttribute("tabindex");
      });
    });
  };

  const selectState = (state, { focus = false, explicit = false } = {}) => {
    if (!panelByState.has(state)) return;
    const previousState = activeState;
    activeState = state;
    if (slot) slot.dataset.activeState = state;
    panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.dualPanel === state));
    selectButtons.forEach((button) => {
      const selected = button.dataset.dualSelect === state;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus({ preventScroll: true });
    });
    if (nextButton) nextButton.dataset.targetState = state === "before" ? "after" : "before";
    if (nextLabel) nextLabel.textContent = state === "before" ? "Ver depois" : "Rever antes";
    syncResponsiveAria();
    if (previousState !== state) pausePreview(previousState);
    const activePanel = panelByState.get(state);
    if (!reducedMotion && previousState !== state && activePanel) {
      gsap.fromTo(activePanel, { clipPath: state === "after" ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)", duration: .72, ease: "expo.out", clearProps: "clipPath" });
      const light = activePanel.querySelector(".dual-video-light");
      if (light) gsap.fromTo(light, { xPercent: -130 }, { xPercent: 240, duration: 1.05, ease: "power2.inOut" });
    }
    if (experienceVisible && (allowAmbientPlayback || explicit)) playPreview(state, { explicit });
    else if (slot) slot.dataset.videoState = reducedMotion ? "reduced-motion" : saveData ? "save-data" : activePanel?.dataset.videoState || "poster";
  };

  selectButtons.forEach((button) => {
    button.addEventListener("click", () => selectState(button.dataset.dualSelect));
    button.addEventListener("keydown", (event) => {
      const currentIndex = stateKeys.indexOf(button.dataset.dualSelect);
      let nextIndex = currentIndex;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % stateKeys.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + stateKeys.length) % stateKeys.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = stateKeys.length - 1;
      else return;
      event.preventDefault();
      selectState(stateKeys[nextIndex], { focus: true });
    });
  });
  nextButton?.addEventListener("click", () => selectState(nextButton.dataset.targetState));

  panels.forEach((panel) => {
    const state = panel.dataset.dualPanel;
    const video = previewByState.get(state);
    const toggle = panel.querySelector(`[data-dual-play="${state}"]`);
    const seek = panel.querySelector(`[data-dual-seek="${state}"]`);
    toggle?.addEventListener("click", () => {
      if (!video) return;
      if (activeState !== state) selectState(state, { explicit: false });
      if (toggle.getAttribute("aria-pressed") === "true") {
        userPausedStates.add(state);
        pausePreview(state);
      } else {
        userPausedStates.delete(state);
        playPreview(state, { explicit: true });
      }
    });
    seek?.addEventListener("input", () => {
      if (!video) return;
      if (activeState !== state) selectState(state, { explicit: false });
      loadVideo(video);
      const applySeek = () => {
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 6;
        video.currentTime = (Number(seek.value) / 1000) * duration;
        updatePreviewControls(state);
      };
      if (video.readyState >= 1) applySeek();
      else video.addEventListener("loadedmetadata", applySeek, { once: true });
    });
    video?.addEventListener("loadedmetadata", () => updatePreviewControls(state));
    video?.addEventListener("durationchange", () => updatePreviewControls(state));
    video?.addEventListener("timeupdate", () => updatePreviewControls(state));
    video?.addEventListener("play", () => { setPanelVideoState(state, "playing"); updatePreviewControls(state); });
    video?.addEventListener("pause", () => updatePreviewControls(state));
    let failedSources = 0;
    video?.querySelectorAll("source").forEach((source) => source.addEventListener("error", () => {
      failedSources += 1;
      if (failedSources >= video.querySelectorAll("source").length) setPanelVideoState(state, "fallback");
    }));
    video?.addEventListener("canplay", () => { failedSources = 0; });
    video?.addEventListener("error", () => setPanelVideoState(state, "fallback"));
    video?.addEventListener("volumechange", () => {
      if (!video.muted || video.volume !== 0) { video.muted = true; video.volume = 0; }
    });
  });

  const pauseFullVideo = () => {
    fullVideo?.pause();
    if (fullVideo) {
      try { fullVideo.currentTime = 0; } catch {}
    }
  };
  const resetDialog = () => {
    pauseFullVideo();
    if (fullVideo) {
      fullVideo.removeAttribute("src");
      fullVideo.removeAttribute("poster");
      fullVideo.load();
    }
    opener?.focus({ preventScroll: true });
    opener = null;
    if (experienceVisible && allowAmbientPlayback) playPreview(activeState);
  };

  openButtons.forEach((button) => button.addEventListener("click", async () => {
    if (!dialog || !fullVideo || !button.dataset.videoSrc) return;
    opener = button;
    pausePreview(activeState);
    if (activeState !== button.dataset.videoOpen) selectState(button.dataset.videoOpen, { explicit: false });
    fullVideo.src = button.dataset.videoSrc;
    fullVideo.poster = button.dataset.videoPoster || "";
    fullVideo.setAttribute("aria-label", button.dataset.videoLabel || "Vídeo completo e silencioso do Volkswagen Up");
    if (dialogTitle) dialogTitle.textContent = button.dataset.videoTitle || "VOLKSWAGEN UP";
    if (dialogDuration) dialogDuration.textContent = `${button.dataset.videoDuration || ""} / 720 × 1280`;
    fullVideo.muted = true;
    fullVideo.volume = 0;
    fullVideo.load();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    requestAnimationFrame(() => closeButton?.focus({ preventScroll: true }));
    try { await fullVideo.play(); } catch {}
  }));
  closeButton?.addEventListener("click", () => { pauseFullVideo(); dialog?.close(); });
  dialog?.addEventListener("click", (event) => { if (event.target === dialog) { pauseFullVideo(); dialog.close(); } });
  dialog?.addEventListener("cancel", pauseFullVideo);
  dialog?.addEventListener("close", resetDialog);
  fullVideo?.addEventListener("volumechange", () => {
    if (!fullVideo.muted || fullVideo.volume !== 0) { fullVideo.muted = true; fullVideo.volume = 0; }
  });

  if (slot && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        experienceVisible = entry.isIntersecting && entry.intersectionRatio >= .18;
        if (experienceVisible) {
          if (allowAmbientPlayback) playPreview(activeState);
          else slot.dataset.videoState = reducedMotion ? "reduced-motion" : saveData ? "save-data" : "poster";
        } else {
          stateKeys.forEach((state) => pausePreview(state));
          if (slot.dataset.videoState === "playing") slot.dataset.videoState = "paused";
        }
      }
    }, { rootMargin: "120px 0px", threshold: [0, .18, .5] });
    observer.observe(slot);
  } else if (slot) {
    slot.dataset.videoState = reducedMotion ? "reduced-motion" : saveData ? "save-data" : "poster";
  }
  mobileQuery.addEventListener?.("change", syncResponsiveAria);
  syncResponsiveAria();

  if (reducedMotion) {
    section.dataset.motionState = "static";
    return;
  }
  const composition = section.querySelector(".process-video-composition");
  const intro = section.querySelector(".dual-motion-intro");
  const stage = section.querySelector(".dual-motion-stage");
  const eyebrow = section.querySelector(".process-video-eyebrow");
  const titleLines = [...section.querySelectorAll(".process-video-title-mask > span")];
  const secondary = [...section.querySelectorAll(".process-video-description,.dual-motion-tabs,.dual-motion-footer")];
  const context = gsap.context(() => {
    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: {
        trigger: composition,
        start: "top 84%",
        toggleActions: "play none none reverse",
        onEnter: () => { section.dataset.motionState = "revealed"; },
        onEnterBack: () => { section.dataset.motionState = "revealed"; },
        onLeaveBack: () => { section.dataset.motionState = "reset"; }
      }
    });
    timeline
      .fromTo(intro, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25 }, 0)
      .fromTo(eyebrow, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .55 }, .05)
      .fromTo(titleLines, { yPercent: 118 }, { yPercent: 0, duration: .9, stagger: .1, ease: "expo.out" }, .12)
      .fromTo(stage, { clipPath: "inset(0 100% 0 0)", y: 42 }, { clipPath: "inset(0 0 0 0)", y: 0, duration: 1.05, ease: "expo.out" }, .22)
      .fromTo(panels, { y: 28, scale: .975 }, { y: 0, scale: 1, duration: .82, stagger: .12, clearProps: "transform" }, .48)
      .fromTo(secondary, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .58, stagger: .07 }, .48)
      .fromTo(section.querySelectorAll(".dual-video-light"), { xPercent: -120 }, { xPercent: 245, duration: 1.35, stagger: .12, ease: "power2.inOut" }, .72);
  }, section);
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
  media.add({ desktop: "(min-width: 901px)", mobile: "(max-width: 900px)" }, ({ conditions }) => {
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
  const quote = visual.querySelector("[data-service-quote]");
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
      if (quote) {
        quote.href = whatsappUrl(service);
        quote.dataset.service = service.slug;
      }
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
    if (!reducedMotion) {
      gsap.fromTo(compare, { clipPath: "inset(7% 0 7% 0)", autoAlpha: .55 }, {
        clipPath: "inset(0%)", autoAlpha: 1, duration: .9, ease: "expo.out",
        scrollTrigger: { trigger: compare, start: "top 86%", toggleActions: "play none none reverse" }
      });
    }
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
      const value = Math.max(2, Math.min(98, next));
      compare.style.setProperty("--position", `${value}%`);
      handle.setAttribute("aria-valuenow", String(value));
    });
  });
}

function initGallery() {
  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const section = gallery.closest(".portfolio");
    const meter = section?.querySelector("[data-gallery-meter]");
    const count = section?.querySelector("[data-gallery-count]");
    const items = [...gallery.querySelectorAll(".gallery-item")];
    let down = false;
    let moved = false;
    let suppressClick = false;
    let startX = 0;
    let startScroll = 0;
    let galleryTicking = false;
    const updateGallery = () => {
      const available = Math.max(1, gallery.scrollWidth - gallery.clientWidth);
      const ratio = Math.max(0, Math.min(1, gallery.scrollLeft / available));
      if (meter) meter.style.transform = `scaleX(${Math.max(.08, ratio)})`;
      const center = gallery.scrollLeft + gallery.clientWidth / 2;
      let activeIndex = 0;
      let distance = Infinity;
      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const nextDistance = Math.abs(itemCenter - center);
        if (nextDistance < distance) { distance = nextDistance; activeIndex = index; }
      });
      items.forEach((item, index) => item.classList.toggle("is-active", index === activeIndex));
      if (count) count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
      galleryTicking = false;
    };
    gallery.addEventListener("scroll", () => {
      if (!galleryTicking) { requestAnimationFrame(updateGallery); galleryTicking = true; }
    }, { passive: true });
    gallery.addEventListener("dragstart", (event) => event.preventDefault());
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
    updateGallery();
  });
}

function initFinalScene() {
  const section = document.querySelector(".final-scene");
  if (!section || reducedMotion) return;
  const image = section.querySelector(".final-media img");
  const content = section.querySelector(".final-content");
  gsap.timeline({ scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.1 } })
    .fromTo(image, { scale: 1.13, xPercent: 5, yPercent: -3 }, { scale: 1.02, xPercent: -3, yPercent: 3, ease: "none" }, 0)
    .fromTo(content, { yPercent: 7 }, { yPercent: -4, ease: "none" }, 0);
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
    const selectedService = services.find((item) => item.name === service);
    const priceContext = selectedService?.price != null ? ` Consultei o valor inicial de ${servicePriceLabel(selectedService)}, sujeito à avaliação do veículo.` : "";
    const text = `Olá, LavaMed! Meu nome é ${name}. Tenho interesse em uma avaliação para ${service}.${priceContext}${message ? ` ${message}` : ""}`;
    open(`https://wa.me/${business.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank", "noopener"); status.textContent = "Abrindo o WhatsApp…";
  });
}

function initPointerEffects() {
  if (!finePointer || reducedMotion) return;
  const cursor = document.querySelector(".cursor");
  const root = document.documentElement;
  const supported = Boolean(cursor && window.PointerEvent && CSS.supports("transform", "translate3d(0,0,0)") && typeof gsap.quickSetter === "function");
  if (!supported) return;
  root.classList.remove("has-custom-cursor");
  gsap.set(cursor, { xPercent: -50, yPercent: -50, force3D: true });
  const setCursorX = gsap.quickSetter(cursor, "x", "px");
  const setCursorY = gsap.quickSetter(cursor, "y", "px");
  const interactiveSelector = "a,button,[role='button'],summary,label,select";
  const textSelector = "input,textarea,[contenteditable='true']";
  let currentState = "";

  const setState = (target) => {
    const element = target instanceof Element ? target : null;
    const state = element?.closest(textSelector) ? "text" : element?.closest("[data-compare]") ? "compare" : element?.closest("[data-gallery]") ? "drag" : element?.closest(interactiveSelector) ? "link" : "";
    if (state === currentState) return;
    currentState = state;
    cursor.classList.toggle("is-link", state === "link");
    cursor.classList.toggle("is-drag", state === "drag");
    cursor.classList.toggle("is-compare", state === "compare");
    cursor.classList.toggle("is-text", state === "text");
    cursor.dataset.state = state || "default";
  };
  const hideCursor = () => {
    cursor.classList.remove("is-visible", "is-pressed", "is-link", "is-drag", "is-compare", "is-text");
    currentState = "";
  };
  addEventListener("pointermove", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") {
      hideCursor();
      root.classList.remove("has-custom-cursor");
      return;
    }
    setCursorX(event.clientX);
    setCursorY(event.clientY);
    setState(event.target);
    root.classList.add("has-custom-cursor");
    cursor.classList.toggle("is-visible", currentState !== "text");
  }, { passive: true });
  addEventListener("pointerdown", (event) => { if (!event.pointerType || event.pointerType === "mouse") cursor.classList.add("is-pressed"); }, { passive: true });
  addEventListener("pointerup", () => cursor.classList.remove("is-pressed"), { passive: true });
  addEventListener("pointercancel", hideCursor, { passive: true });
  addEventListener("mouseout", (event) => { if (!event.relatedTarget) hideCursor(); });
  addEventListener("blur", hideCursor);
  document.addEventListener("visibilitychange", () => { if (document.hidden) hideCursor(); });
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
initCameraStory();
initProcessCinema();
initServiceVisual();
initCompare();
initGallery();
initFinalScene();
initMenu();
initPageTransitions();
initCommonInteractions();
initPointerEffects();
document.querySelectorAll("[data-liquid-canvas]").forEach(initLiquidCanvas);

addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
document.fonts?.ready.then(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
let refreshTimer;
addEventListener("resize", () => {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 180);
}, { passive: true });
addEventListener("orientationchange", () => setTimeout(() => ScrollTrigger.refresh(), 220), { passive: true });
