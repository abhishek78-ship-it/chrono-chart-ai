import { useEffect, useState } from "react";
import { listDatasets } from "@/lib/storage";
import type { Dataset } from "@/lib/dataset";

export function useDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  useEffect(() => {
    const load = () => setDatasets(listDatasets());
    load();
    const onChange = () => load();
    window.addEventListener("datasets:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("datasets:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return datasets;
}
