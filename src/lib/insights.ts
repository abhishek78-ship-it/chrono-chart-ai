import type { Dataset, DatasetSummary } from "./dataset";

export interface MLRecommendation {
  task: "Classification" | "Regression" | "Clustering" | "Time Series" | "Anomaly Detection";
  algorithms: string[];
  target?: string;
  reason: string;
}

export interface Insights {
  summary: string[];
  patterns: string[];
  correlations: string[];
  anomalies: string[];
  business: string[];
  useCases: string[];
  cleaning: string[];
  featureEngineering: string[];
  columnsToRemove: string[];
  columnsToEncode: string[];
  columnsToScale: string[];
  possibleTargets: string[];
  nextSteps: string[];
  ml: MLRecommendation[];
}

function pct(n: number, total: number) {
  if (!total) return 0;
  return (n / total) * 100;
}

export function generateInsights(dataset: Dataset, s: DatasetSummary): Insights {
  const summary: string[] = [];
  summary.push(
    `The dataset "${dataset.name}" contains ${s.rowCount.toLocaleString()} rows across ${s.colCount} columns.`,
  );
  summary.push(
    `${s.numericCols.length} numeric, ${s.categoricalCols.length} categorical, and ${s.datetimeCols.length} datetime columns were detected.`,
  );
  if (s.missingCells > 0) {
    summary.push(
      `Approximately ${s.missingCells.toLocaleString()} missing cells were detected (${pct(
        s.missingCells,
        s.rowCount * s.colCount,
      ).toFixed(1)}% of all cells).`,
    );
  } else {
    summary.push("No missing values were found — the dataset is complete.");
  }
  if (s.duplicateRows > 0) {
    summary.push(`${s.duplicateRows.toLocaleString()} duplicate rows were found and should be reviewed.`);
  }

  // Patterns
  const patterns: string[] = [];
  for (const p of s.profiles) {
    if (p.type === "numeric" && p.std !== undefined && p.mean !== undefined) {
      const cv = p.mean !== 0 ? Math.abs(p.std / p.mean) : 0;
      if (cv > 1) {
        patterns.push(`"${p.name}" shows high variability (coefficient of variation ≈ ${cv.toFixed(2)}), suggesting a wide spread of values.`);
      }
    }
    if (p.type === "categorical" && p.topValues && p.topValues.length > 0) {
      const dominant = p.topValues[0];
      const share = pct(dominant.count, s.rowCount);
      if (share > 60) {
        patterns.push(`"${p.name}" is dominated by "${dominant.value}" (${share.toFixed(1)}% of rows) — the class distribution is imbalanced.`);
      }
    }
  }
  if (patterns.length === 0)
    patterns.push("Distributions look balanced across the profiled columns.");

  // Correlations
  const correlations: string[] = [];
  const strong = s.correlations.filter((c) => Math.abs(c.r) >= 0.6).slice(0, 5);
  if (strong.length === 0 && s.correlations.length > 0) {
    const top = s.correlations[0];
    correlations.push(
      `Strongest linear relationship: "${top.a}" and "${top.b}" (r = ${top.r.toFixed(2)}). No strong correlations detected overall.`,
    );
  } else {
    for (const c of strong) {
      const dir = c.r > 0 ? "positive" : "negative";
      correlations.push(
        `"${c.a}" and "${c.b}" have a strong ${dir} correlation (r = ${c.r.toFixed(2)}).`,
      );
    }
  }
  if (correlations.length === 0)
    correlations.push("At least two numeric columns are required to compute correlations.");

  // Anomalies
  const anomalies: string[] = [];
  for (const p of s.profiles) {
    if (p.type === "numeric" && p.q1 !== undefined && p.q3 !== undefined) {
      const iqr = p.q3 - p.q1;
      const lo = p.q1 - 1.5 * iqr;
      const hi = p.q3 + 1.5 * iqr;
      if (p.min !== undefined && p.max !== undefined && (p.min < lo || p.max > hi)) {
        anomalies.push(`"${p.name}" contains outliers outside [${lo.toFixed(2)}, ${hi.toFixed(2)}] (IQR rule).`);
      }
    }
    if (p.missingPct > 20) {
      anomalies.push(`"${p.name}" is missing ${p.missingPct.toFixed(1)}% of its values.`);
    }
  }
  if (anomalies.length === 0)
    anomalies.push("No significant statistical outliers were detected using the IQR rule.");

  // Business insights + use cases
  const business: string[] = [
    `With ${s.rowCount.toLocaleString()} observations, the dataset is ${
      s.rowCount < 1000 ? "small — suitable for prototyping and exploratory work" : s.rowCount < 100000 ? "medium-sized — ideal for most classical ML workflows" : "large — well suited for training deep learning or gradient boosted models"
    }.`,
  ];
  if (s.datetimeCols.length > 0) {
    business.push(
      `The presence of datetime columns (${s.datetimeCols.join(", ")}) enables trend, seasonality, and time-based cohort analysis.`,
    );
  }
  if (s.categoricalCols.length > 0 && s.numericCols.length > 0) {
    business.push("A mix of categorical and numeric variables supports segmentation and predictive modelling.");
  }

  const useCases: string[] = [];
  if (s.datetimeCols.length > 0 && s.numericCols.length > 0) useCases.push("Forecasting future values from historical trends.");
  if (s.categoricalCols.length > 0) useCases.push("Segmentation and cohort analysis by categorical attributes.");
  if (s.numericCols.length >= 2) useCases.push("Correlation studies and driver analysis between numeric metrics.");
  useCases.push("Automated reporting and KPI dashboards.");

  // Cleaning
  const cleaning: string[] = [];
  const columnsToRemove: string[] = [];
  const columnsToEncode: string[] = [];
  const columnsToScale: string[] = [];
  const possibleTargets: string[] = [];

  for (const p of s.profiles) {
    if (p.missingPct > 60) {
      columnsToRemove.push(p.name);
      cleaning.push(`Consider dropping "${p.name}" — over ${p.missingPct.toFixed(0)}% of values are missing.`);
    } else if (p.missingPct > 0) {
      cleaning.push(
        `Impute missing values in "${p.name}" using ${p.type === "numeric" ? "median or mean" : "mode or a new 'Unknown' category"}.`,
      );
    }
    if (p.unique === s.rowCount && s.rowCount > 1) {
      columnsToRemove.push(p.name);
      cleaning.push(`"${p.name}" appears to be a unique identifier — exclude it from modelling.`);
    }
    if (p.type === "categorical" && p.unique > 1 && p.unique <= 50) {
      columnsToEncode.push(p.name);
    }
    if (p.type === "numeric") {
      columnsToScale.push(p.name);
      // heuristic: binary numeric could be a target
      if (p.unique === 2) possibleTargets.push(p.name);
    }
    if (p.type === "categorical" && p.unique >= 2 && p.unique <= 10) {
      possibleTargets.push(p.name);
    }
  }
  if (s.duplicateRows > 0)
    cleaning.push(`Remove ${s.duplicateRows.toLocaleString()} duplicate rows before analysis.`);
  if (cleaning.length === 0) cleaning.push("Dataset looks clean. Only minor pre-processing is required.");

  // Feature engineering
  const featureEngineering: string[] = [];
  for (const d of s.datetimeCols) {
    featureEngineering.push(`Extract year, month, day, weekday, and hour features from "${d}".`);
  }
  for (const p of s.profiles) {
    if (p.type === "numeric" && p.std !== undefined && p.mean !== undefined && p.mean > 0 && Math.abs(p.std / p.mean) > 1.5) {
      featureEngineering.push(`Apply a log or Box-Cox transform to "${p.name}" to reduce skew.`);
    }
    if (p.type === "categorical" && p.unique > 50) {
      featureEngineering.push(`"${p.name}" is high-cardinality — consider target or frequency encoding.`);
    }
  }
  if (s.correlations.some((c) => Math.abs(c.r) > 0.9)) {
    featureEngineering.push("Highly correlated numeric features detected — consider PCA or dropping redundant columns.");
  }
  if (featureEngineering.length === 0)
    featureEngineering.push("The current feature set is a good baseline. Iterate after a first model run.");

  // ML recommendations
  const ml: MLRecommendation[] = [];
  const binaryTarget = possibleTargets.find((n) => {
    const p = s.profiles.find((x) => x.name === n);
    return p && p.unique === 2;
  });
  const smallCatTarget = possibleTargets.find((n) => {
    const p = s.profiles.find((x) => x.name === n);
    return p && p.type === "categorical" && p.unique >= 2 && p.unique <= 10;
  });
  if (binaryTarget || smallCatTarget) {
    ml.push({
      task: "Classification",
      algorithms: ["Logistic Regression", "Random Forest", "XGBoost / LightGBM"],
      target: binaryTarget ?? smallCatTarget,
      reason: `Column "${binaryTarget ?? smallCatTarget}" has low cardinality and looks like a natural label. Tree-based models handle mixed feature types well.`,
    });
  }
  const contTarget = s.numericCols.find((n) => {
    const p = s.profiles.find((x) => x.name === n);
    return p && p.unique > 20;
  });
  if (contTarget) {
    ml.push({
      task: "Regression",
      algorithms: ["Linear Regression", "Random Forest Regressor", "Gradient Boosting"],
      target: contTarget,
      reason: `"${contTarget}" is continuous with many distinct values — a strong regression target.`,
    });
  }
  if (s.numericCols.length >= 2 && !binaryTarget && !smallCatTarget) {
    ml.push({
      task: "Clustering",
      algorithms: ["K-Means", "DBSCAN", "Hierarchical Clustering"],
      reason: "Multiple numeric features without an obvious label — clustering can surface latent groups.",
    });
  }
  if (s.datetimeCols.length > 0 && s.numericCols.length > 0) {
    ml.push({
      task: "Time Series",
      algorithms: ["ARIMA", "Prophet", "LSTM"],
      target: s.numericCols[0],
      reason: `Datetime column "${s.datetimeCols[0]}" combined with numeric metrics enables temporal forecasting.`,
    });
  }
  if (s.numericCols.length >= 3) {
    ml.push({
      task: "Anomaly Detection",
      algorithms: ["Isolation Forest", "One-Class SVM", "Local Outlier Factor"],
      reason: "Rich numeric feature space supports unsupervised anomaly detection.",
    });
  }
  if (ml.length === 0) {
    ml.push({
      task: "Clustering",
      algorithms: ["K-Means"],
      reason: "Default recommendation — clustering works as a first-pass exploration of any dataset.",
    });
  }

  const nextSteps = [
    "Handle missing values with the strategy suggested above.",
    "Encode categorical variables and scale numeric features.",
    "Split into train / validation / test sets before modelling.",
    "Benchmark 2-3 algorithms and iterate on feature engineering.",
    "Track experiments and evaluate with task-appropriate metrics.",
  ];

  return {
    summary,
    patterns,
    correlations,
    anomalies,
    business,
    useCases,
    cleaning,
    featureEngineering,
    columnsToRemove: Array.from(new Set(columnsToRemove)),
    columnsToEncode,
    columnsToScale,
    possibleTargets: Array.from(new Set(possibleTargets)),
    nextSteps,
    ml,
  };
}
