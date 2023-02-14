import Stats from "stats.js";

let stats;
let startInferenceTime;
let numInferences = 0;
let inferenceTimeSum = 0;
let lastPanelUpdate = 0;

export function setupStats() {
  stats = new Stats();
  stats.customFpsPanel = stats.addPanel(new Stats.Panel("FPS", "#0ff", "#002"));
  stats.showPanel(stats.domElement.children.length - 1);

  const parent = document.getElementById("stats");
  parent.appendChild(stats.domElement);

  const statsPanes = parent.querySelectorAll("canvas");

  for (let i = 0; i < statsPanes.length; ++i) {
    statsPanes[i].style.width = "140px";
    statsPanes[i].style.height = "80px";
  }
  return stats;
}

// stats 用
export function beginEstimatePosesStats() {
  startInferenceTime = (performance || Date).now();
}

// stats 用
export function endEstimatePosesStats() {
  const endInferenceTime = (performance || Date).now();
  inferenceTimeSum += endInferenceTime - startInferenceTime;
  ++numInferences;

  const panelUpdateMilliseconds = 1000;
  if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
    const averageInferenceTime = inferenceTimeSum / numInferences;
    inferenceTimeSum = 0;
    numInferences = 0;
    stats.customFpsPanel.update(
      1000.0 / averageInferenceTime,
      120 /* maxValue */
    );
    lastPanelUpdate = endInferenceTime;
  }
}
