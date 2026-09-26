export const VALIDATION = Object.freeze({
  ACCEPTED: "ACCEPTED",
  REVIEW: "REVIEW",
  REJECTED: "REJECTED"
});

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function same(a, b) {
  if (!a || !b) return false;
  return normalize(a) === normalize(b);
}

export function validateTerritorialMatch(expected, result) {
  const address = result?.address ?? {};
  const checks = {
    country: expected?.country ? same(expected.country, address.country) : null,
    province: expected?.province?.name ? same(expected.province.name, address.state ?? address.province) : null,
    municipality: expected?.municipality?.name
      ? same(expected.municipality.name, address.city ?? address.municipality ?? address.town)
      : null,
    settlement: expected?.settlement?.name
      ? same(expected.settlement.name, address.city ?? address.town ?? address.village ?? address.municipality)
      : null
  };

  const applicable = Object.values(checks).filter((v) => v !== null);
  const matched = applicable.filter(Boolean).length;
  const territorial_match_rate = applicable.length ? matched / applicable.length : 0;

  const hasCoordinates = Number.isFinite(result?.coordinates?.latitude) &&
    Number.isFinite(result?.coordinates?.longitude);

  let validation = VALIDATION.REJECTED;
  if (hasCoordinates && checks.country === true && (checks.province === true || checks.municipality === true)) {
    validation = territorial_match_rate >= 0.75 ? VALIDATION.ACCEPTED : VALIDATION.REVIEW;
  } else if (hasCoordinates && territorial_match_rate >= 0.5) {
    validation = VALIDATION.REVIEW;
  }

  return {
    validation,
    checks,
    matched_components: matched,
    applicable_components: applicable.length,
    territorial_match_rate
  };
}
