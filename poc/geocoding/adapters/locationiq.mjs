import { buildStructuredQuery, fetchJson, normalizeProviderResult, httpStatusToBenchmarkStatus } from "./common.mjs";

export async function geocodeLocationIQ(input) {
  const key = process.env.LOCATIONIQ_API_KEY;
  if (!key) throw new Error("LOCATIONIQ_API_KEY is required");

  const base = process.env.LOCATIONIQ_BASE_URL ?? "https://us1.locationiq.com/v1/search";
  const query = input.raw || buildStructuredQuery(input);
  const url = new URL(base);
  url.searchParams.set("key", key);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "cu");

  const started = performance.now();
  const { response, body } = await fetchJson(url);
  const latency = performance.now() - started;
  const status = httpStatusToBenchmarkStatus(response.status);

  if (status !== "ok") return { status, http_status: response.status, latency_ms: latency, result: null };
  if (!Array.isArray(body) || body.length === 0) return { status: "no_result", http_status: response.status, latency_ms: latency, result: null };

  const first = body[0];
  return {
    status: "ok",
    http_status: response.status,
    latency_ms: latency,
    result: normalizeProviderResult("locationiq", {
      raw: first,
      coordinates: first.lat != null && first.lon != null ? { latitude: Number(first.lat), longitude: Number(first.lon) } : null,
      address: first.address ?? {},
      confidence: first.matchquality ?? null,
      precision: first.type ?? null,
      source_id: first.place_id ?? null
    }, latency)
  };
}
