# XLSX Reader Supply-Chain Gate v0.1.0

## Scope

This gate applies to the isolated XLSX reader comparison harness and must be satisfied before a reader is adopted into the Paquetería production architecture.

## Required evidence

1. Exact direct dependency versions.
2. Resolved transitive dependency graph.
3. Generated npm lockfile.
4. Production dependency audit output.
5. Dependency installation with npm ci.
6. Parser installation with lifecycle scripts disabled in the benchmark.
7. Reviewable CI artifacts retaining the lockfile and audit report.

## Current implementation

GitHub Actions now:

1. generates package-lock.json with npm install --package-lock-only --ignore-scripts;
2. installs from that lockfile with npm ci --ignore-scripts;
3. runs npm audit --omit=dev --json;
4. publishes the generated lockfile and audit output as workflow artifacts.

## Gate status

**OPEN — evidence pending execution.**

The lockfile is intentionally generated in CI at this stage rather than committed manually, because its integrity metadata must come from npm resolution and must not be fabricated.

A production adoption decision requires review of the actual generated artifact and audit result. A clean audit is not by itself sufficient: license, provenance, transitive dependencies and parser-specific security behavior must also be reviewed.

## Decision rule

No candidate is selected solely because it has fewer vulnerabilities or fewer dependencies. Any security or supply-chain exception requires explicit documentation and an ADR with compensating controls.
