export const isRequired = (value) => String(value ?? "").trim().length > 0;
export const isPositiveNumber = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0;
