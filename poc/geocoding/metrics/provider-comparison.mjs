function rate(n, d) {
  return d ? n / d : 0;
}

function groupBy(records, keyFn) {
  const groups = new Map();
  for (const record of records) {
    const key = keyFn(record) ?? "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return groups;
}

function summarize(records) {
  const total = records.length;
  const ok = records.filter(r => r.status === "ok");
  const accepted = records.filter(r => r.validation === "ACCEPTED");
  const review = records.filter(r => r.validation === "REVIEW");
  const rejected = records.filter(r => r.validation === "REJECTED");

  const territorialCorrect = ok.filter(r =>
    r.validation_detail?.checks?.country === true &&
    (r.validation_detail?.checks?.province === true ||
     r.validation_detail?.checks?.municipality === true)
  );

  const spatialControlled = records.filter(r =>
    Number.isFinite(r.spatial_validation?.distance_meters)
  );

  const spatialAccurate = spatialControlled.filter(r =>
    r.spatial_validation.distance_meters <= 150
  );

  const falsePositive = ok.filter(r =>
    r.validation === "REJECTED"
  );

  return {
    cases: total,
    result_rate: rate(ok.length, total),
    territorial_correct_rate: rate(territorialCorrect.length, total),
    accepted_rate: rate(accepted.length, total),
    review_rate: rate(review.length, total),
    rejected_rate: rate(rejected.length, total),
    false_positive_rate: rate(falsePositive.length, ok.length),
    spatial_control_cases: spatialControlled.length,
    spatial_within_150m_rate: rate(spatialAccurate.length, spatialControlled.length)
  };
}

export function compareProviders(records) {
  const providers = groupBy(records, r => r.provider);
  return [...providers.entries()].map(([provider, providerRecords]) => ({
    provider,
    ...summarize(providerRecords)
  }));
}

export function compareByCaseType(records) {
  const groups = groupBy(records, r => r.case_type ?? r.case_types?.[0] ?? "unknown");
  return [...groups.entries()].map(([case_type, caseRecords]) => ({
    case_type,
    ...compareProviders(caseRecords)
  }));
}

export function compareByPrecision(records) {
  const groups = groupBy(records, r =>
    r.result?.precision ??
    r.result?.raw?.result_type ??
    r.result?.raw?.type ??
    "unknown"
  );
  return [...groups.entries()].map(([precision, precisionRecords]) => ({
    precision,
    ...compareProviders(precisionRecords)
  }));
}

export function compareByProvince(records) {
  const groups = groupBy(records, r => r.expected?.province?.name);
  return [...groups.entries()].map(([province, provinceRecords]) => ({
    province,
    ...compareProviders(provinceRecords)
  }));
}
