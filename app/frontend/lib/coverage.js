import { t } from "~/i18n";

// Dimension order, chart form and key colours come from the design handoff.
export const DIMENSIONS = [
  { id: "age", form: "rows", key: "var(--color-key-age)" },
  { id: "skin_tone", form: "columns", key: "var(--color-key-skin)" },
  { id: "gender", form: "label-above", key: "var(--color-key-gender)" },
  { id: "body", form: "label-above", key: "var(--color-key-body)" },
  { id: "disability", form: "rows", key: "var(--color-key-disability)" },
];

export function bucketLabel(dimension, value) {
  if (dimension === "skin_tone") return value;
  if (dimension === "disability" && value === "other")
    return t("taxonomy.disability.otherShort");
  return t(`taxonomy.${dimension}.${value}`);
}

export function groupBuckets(buckets) {
  return DIMENSIONS.map((dimension) => ({
    ...dimension,
    title: t(`taxonomy.${dimension.id}.label`),
    buckets: (buckets ?? [])
      .filter((bucket) => bucket.dimension === dimension.id)
      .map((bucket) => ({
        ...bucket,
        label: bucketLabel(dimension.id, bucket.value),
      })),
  }));
}

export const percent = (value, target) =>
  target > 0 ? Math.max(0, Math.min(100, (value / target) * 100)) : 0;
