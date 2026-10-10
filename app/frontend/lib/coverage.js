import { t } from "~/i18n";

// Dimension order and chart form follow docs/DESIGN_LANGUAGE.md.
export const DIMENSIONS = [
  { id: "age", form: "rows" },
  { id: "skin_tone", form: "columns" },
  { id: "gender", form: "label-above" },
  { id: "body", form: "label-above" },
  { id: "disability", form: "rows" },
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
