import { useEffect, useState } from "react";
import type { Dataset } from "@/lib/dataset";
import { getDataset } from "@/lib/storage";

export function useDataset(id: string): { dataset: Dataset | null; loading: boolean } {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const ds = getDataset(id);
    setDataset(ds ?? null);
    setLoading(false);
    const onChange = () => setDataset(getDataset(id) ?? null);
    window.addEventListener("datasets:changed", onChange);
    return () => window.removeEventListener("datasets:changed", onChange);
  }, [id]);
  return { dataset, loading };
}
