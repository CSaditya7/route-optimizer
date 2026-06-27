/**
 * Create a DOM element for a MapLibre GL marker.
 *
 * @param {string|number} label  - text inside the pin (e.g. "D", 1, 2…)
 * @param {"depot"|"stop"|"optimized"} type
 * @returns {HTMLDivElement}
 */
export function createMarkerEl(label, type = "stop") {
  const colors = {
    depot:     { bg: "#f59e0b", text: "#2a1700", ring: "#fcd34d" },
    stop:      { bg: "#38bdf8", text: "#04141f", ring: "#7dd3fc" },
    optimized: { bg: "#22c55e", text: "#052e16", ring: "#4ade80" },
  };
  const { bg, text, ring } = colors[type] || colors.stop;

  const el = document.createElement("div");
  el.style.cssText = `
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${bg};
    color: ${text};
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 700;
    font-size: ${String(label).length > 2 ? "10px" : "13px"};
    border: 2.5px solid ${ring};
    box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 0 2px rgba(0,0,0,0.2);
    cursor: grab;
    transition: transform 120ms ease, box-shadow 120ms ease;
    user-select: none;
  `;
  el.textContent = String(label);

  el.addEventListener("mouseenter", () => {
    el.style.transform = "scale(1.15)";
    el.style.boxShadow = `0 4px 16px rgba(0,0,0,0.6), 0 0 0 3px ${ring}55`;
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "";
    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.5), 0 0 0 2px rgba(0,0,0,0.2)";
  });

  return el;
}
