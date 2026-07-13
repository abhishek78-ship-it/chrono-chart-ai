import type { Dataset } from "./dataset";

const KEY = "add.datasets.v1";

function safeParse(json: string | null): Dataset[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed as Dataset[];
  } catch {
    /* ignore */
  }
  return [];
}

export function listDatasets(): Dataset[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY)).sort(
    (a, b) => b.uploadedAt - a.uploadedAt,
  );
}

export function getDataset(id: string): Dataset | undefined {
  return listDatasets().find((d) => d.id === id);
}

export function saveDataset(dataset: Dataset): void {
  if (typeof window === "undefined") return;
  const all = safeParse(window.localStorage.getItem(KEY)).filter(
    (d) => d.id !== dataset.id,
  );
  all.push(dataset);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage full — trim biggest & retry once
    all.sort((a, b) => a.rows.length - b.rows.length);
    all.pop();
    window.localStorage.setItem(KEY, JSON.stringify(all));
  }
  window.dispatchEvent(new Event("datasets:changed"));
}

export function deleteDataset(id: string): void {
  if (typeof window === "undefined") return;
  const remaining = safeParse(window.localStorage.getItem(KEY)).filter(
    (d) => d.id !== id,
  );
  window.localStorage.setItem(KEY, JSON.stringify(remaining));
  window.dispatchEvent(new Event("datasets:changed"));
}

export function renameDataset(id: string, name: string): void {
  if (typeof window === "undefined") return;
  const all = safeParse(window.localStorage.getItem(KEY));
  const target = all.find((d) => d.id === id);
  if (!target) return;
  target.name = name.trim() || target.name;
  window.localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("datasets:changed"));
}
