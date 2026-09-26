import crypto from "node:crypto";
import os from "node:os";

export const PROVENANCE_VERSION = "0.1.0";

const SECRET_KEY = /(key|token|secret|password|authorization|credential)/i;

export function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function sanitizeConfig(config = {}) {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      key,
      SECRET_KEY.test(key) ? "[REDACTED]" : value
    ])
  );
}

export function buildProvenance({
  protocolVersion,
  datasetId,
  datasetVersion,
  datasetContent,
  provider,
  adapterVersion,
  runnerVersion,
  startedAt,
  finishedAt,
  runId,
  requestCount = 0,
  cacheHits = 0,
  cacheMisses = 0,
  rateLimit = null,
  userAgent = null,
  config = {},
  outputContent = ""
}) {
  return {
    provenance_version: PROVENANCE_VERSION,
    protocol_version: protocolVersion,
    run_id: runId,
    dataset: {
      id: datasetId,
      version: datasetVersion,
      sha256: sha256(datasetContent)
    },
    provider,
    adapter_version: adapterVersion,
    runner_version: runnerVersion,
    started_at: startedAt,
    finished_at: finishedAt,
    requests: {
      attempted: requestCount,
      cache_hits: cacheHits,
      cache_misses: cacheMisses,
      rate_limit: rateLimit
    },
    user_agent: userAgent,
    config: sanitizeConfig(config),
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      hostname: os.hostname()
    },
    output_sha256: sha256(outputContent)
  };
}
