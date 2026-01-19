export type DensityMode = "comfortable" | "compact";

export function applyDensity(mode: DensityMode) {
  document.documentElement.dataset.uiDensity = mode;
}
