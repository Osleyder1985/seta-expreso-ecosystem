export function buildStructuredQuery(input) {
  const parts = [
    input.structured?.street,
    input.structured?.house_number,
    input.structured?.locality,
    input.structured?.municipality,
    input.structured?.province,
    input.structured?.country
  ].filter(Boolean);

  return parts.join(", ");
}

export function normalizeProviderResult(provider, response, latencyMs) {
  return {
    provider,
    latency_ms: latencyMs,
    raw: response.raw ?? null,
    coordinates: response.coordinates ?? null,
    address: response.address ?? {},
    confidence: response.confidence ?? null,
    precision: response.precision ?? null,
    source_id: response.source_id ?? null
  };
}

export function httpStatusToBenchmarkStatus(status) {
  if (status === 429) return "rate_limited";
  if (status >= 200 && status < 300) return "ok";
  return "http_error";
}

export async function fetchJson(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.headers ?? {})
      }
    });
    const text = await response.text();
    let body = null;
    try { body = JSON.parse(text); } catch {}
    return { response, body };
  } catch (error) {
    if (error.name === "AbortError") {
      const e = new Error("Request timed out");
      e.code = "TIMEOUT";
      throw e;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
