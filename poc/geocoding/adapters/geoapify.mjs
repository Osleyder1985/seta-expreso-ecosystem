import { buildStructuredQuery, fetchJson, normalizeProviderResult, httpStatusToBenchmarkStatus } from "./common.mjs";

export async function geocodeGeoapify(input) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) throw new Error("GEOAPIFY_API_KEY is required");

  const base = process.env.GEOAPIFY_BASE_URL ?? "https://api.geoapify.com/v1/geocode/search";
  const query = input.raw || buildStructuredQuery(input);
  const url = new URL(base);
  url.searchParams.set("text", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("filter", "countrycode:cub");
  url.searchParams.set("apiKey", apiKey);

  const started = performance.now();
  const { response, body } = await fetchJson(url);
  const latency = performance.now() - started;
  const status = httpStatusToBenchmarkStatus(response.status);

  if (status !== "ok") return { status, http_status: response.status, latency_ms: latency, result: null };

  const first = body?.results?.[0];
  if (!first) return { status: "no_result", http_status: response.status, latency_ms: latency, result: null };

  return {
    status: "ok",
    http_status: response.status,
    latency_ms: latency,
    result: normalizeProviderResult("geoapify", {
      raw: first,
      coordinates: first.lat != null && first.lon != null ? { latitude: first.lat, longitude: first.lon } : null,
      address: first,
      confidence: first.rank?.confidence ?? null,
      precision: first.rank?.match_type ?? first.result_type ?? null,
      source_id: first.place_id ?? null
    }, latency)
  };
}
