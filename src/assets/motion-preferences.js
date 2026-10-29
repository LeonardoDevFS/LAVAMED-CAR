const key = "lavamed-motion";
const modes = ["auto", "cinematic", "reduced"];
const system = window.matchMedia("(prefers-reduced-motion: reduce)");
const valid = (value) => modes.includes(value);

function readPreference() {
  // The URL also preserves the choice when browser storage is unavailable.
  const parameter = new URL(location.href).searchParams.get(key);
  if (valid(parameter)) return parameter;
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) return saved;
  } catch {}
  return "auto";
}

export const motionMode = readPreference();
export const reducedMotion = motionMode === "reduced" || (motionMode === "auto" && system.matches);
document.documentElement.dataset.motionMode = motionMode;
document.documentElement.dataset.motionEffective = reducedMotion ? "reduced" : "cinematic";

export function initMotionPreferences() {
  const panel = document.querySelector(".menu-panel nav");
  if (panel) {
    const control = document.createElement("div");
    control.className = "motion-preferences";
    control.innerHTML = `<label for="motion-mode">Experiência visual</label>
      <select id="motion-mode" aria-describedby="motion-description">
        <option value="auto">Automático</option>
        <option value="cinematic">Cinematográfico</option>
        <option value="reduced">Movimento reduzido</option>
      </select>
      <small id="motion-description">Automático segue o sistema. A troca recarrega a página. Experiência sempre silenciosa.</small>`;
    panel.after(control);
    const select = control.querySelector("select");
    select.value = motionMode;
    select.addEventListener("change", () => {
      if (!valid(select.value) || select.value === motionMode) return;
      const url = new URL(location.href);
      try {
        localStorage.setItem(key, select.value);
        url.searchParams.delete(key);
      } catch {
        url.searchParams.set(key, select.value);
      }
      location.replace(url.href);
    });
  }
}

// Reload rather than leaving GSAP timelines and CSS in conflicting states.
const onSystemChange = () => {
  if (motionMode === "auto") location.reload();
};
if (system.addEventListener) system.addEventListener("change", onSystemChange);
else system.addListener(onSystemChange);
