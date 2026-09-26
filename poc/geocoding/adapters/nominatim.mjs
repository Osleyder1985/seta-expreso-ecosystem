import { buildStructuredQuery, fetchJson, normalizeProviderResult, httpStatusToBenchmarkStatus } from "./common.mjs";

export async function geocodeNominatim(input) {
  const base = process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org/search";
  const query = input.raw || buildStructuredQuery(input);
  const url = new URL(base);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "cu");

  const userAgent = process.env.NOMINATIM_USER_AGENT ?? "SETA-EXPRESO-Geocoding-Benchmark/0.1 (contact required)";
  const started = performance.now();
  const { response, body } = await fetchJson(url, {
    headers: { "User-Agent": userAgent }
  });
  const latency = performance.now() - started;
  const status = httpStatusToBenchmarkStatus(response.status);

  if (status !== "ok") return { status, http_status: response.status, latency_ms: latency, result: null };
  if (!Array.isArray(body) || body.length === 0) return { status: "no_result", http_status: response.status, latency_ms: latency, result: null };

  const first = body[0];
  return {
    status: "ok",
    http_status: response.status,
    latency_ms: latency,
    result: normalizeProviderResult("nominatim", {
      raw: first,
      coordinates: first.lat != null && first.lon != null ? { latitude: Number(first.lat), longitude: Number(first.lon) } : null,
      address: first.address ?? {},
      confidence: first.importance ?? null,
      precision: first.type ?? first.addresstype ?? null,
      source_id: first.place_id ?? null
    }, latency)
  };
}
