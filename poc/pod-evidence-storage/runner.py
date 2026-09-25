#!/usr/bin/env python3
"""Reproducible POD evidence storage PoC.

Stdlib-only baseline. No real personal data.
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import tarfile
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path


SIZES = {
    "1MiB": 1 * 1024 * 1024,
    "5MiB": 5 * 1024 * 1024,
    "10MiB": 10 * 1024 * 1024,
    "20MiB": 20 * 1024 * 1024,
}
CHUNK = 1024 * 1024


@dataclass(frozen=True)
class Evidence:
    evidence_id: str
    content_hash: str
    size: int
    mime_type: str = "image/jpeg"


class Unauthorized(Exception):
    pass


class HashMismatch(Exception):
    pass


class EvidenceStorage:
    def put(self, evidence: Evidence, content: bytes) -> None: raise NotImplementedError
    def get(self, evidence: Evidence, actor: str) -> bytes: raise NotImplementedError
    def delete(self, evidence: Evidence) -> None: raise NotImplementedError


class FileSystemEvidenceStorage(EvidenceStorage):
    def __init__(self, root: Path, authorized_actors: set[str] | None = None):
        self.root = root
        self.authorized_actors = authorized_actors or {"admin", "agency", "customer"}
        self.root.mkdir(parents=True, exist_ok=True)
        self._processed: set[str] = set()

    def _path(self, evidence: Evidence) -> Path:
        return self.root / evidence.evidence_id[:2] / evidence.evidence_id

    def put(self, evidence: Evidence, content: bytes) -> None:
        if evidence.evidence_id in self._processed:
            return
        digest = hashlib.sha256(content).hexdigest()
        if digest != evidence.content_hash:
            raise HashMismatch(f"expected={evidence.content_hash} actual={digest}")
        if len(content) != evidence.size:
            raise ValueError("size mismatch")
        target = self._path(evidence)
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            # Immutable-content rule: never silently overwrite.
            existing = target.read_bytes()
            if hashlib.sha256(existing).hexdigest() != evidence.content_hash:
                raise HashMismatch("existing content differs")
        else:
            target.write_bytes(content)
        self._processed.add(evidence.evidence_id)

    def get(self, evidence: Evidence, actor: str) -> bytes:
        if actor not in self.authorized_actors:
            raise Unauthorized(actor)
        data = self._path(evidence).read_bytes()
        if hashlib.sha256(data).hexdigest() != evidence.content_hash:
            raise HashMismatch("stored content corrupted")
        return data

    def delete(self, evidence: Evidence) -> None:
        target = self._path(evidence)
        if target.exists():
            target.unlink()


def synthetic_bytes(size: int) -> bytes:
    # Deterministic and memory-simple enough for the selected PoC sizes.
    block = hashlib.sha256(b"SETA-EXPRESO-POD-POC").digest()
    repeats, remainder = divmod(size, len(block))
    return block * repeats + block[:remainder]


def make_evidence(name: str, content: bytes) -> Evidence:
    return Evidence(name, hashlib.sha256(content).hexdigest(), len(content))


def timed(fn):
    started = time.perf_counter()
    value = fn()
    return value, time.perf_counter() - started


def t01(storage, evidence, content):
    _, elapsed = timed(lambda: storage.put(evidence, content))
    assert storage.get(evidence, "admin") == content
    return {"elapsed_s": elapsed, "sha256": evidence.content_hash}


def t02(storage, evidence, content):
    assert storage.get(evidence, "customer") == content
    return {"authorized_read": True}


def t03(storage, evidence):
    try:
        storage.get(evidence, "anonymous")
    except Unauthorized:
        return {"unauthorized_rejected": True}
    raise AssertionError("unauthorized read was accepted")


def t04(storage, evidence, content, root):
    partial = root / "partial"
    partial.parent.mkdir(parents=True, exist_ok=True)
    with partial.open("wb") as f:
        f.write(content[:CHUNK])
        f.flush()
        os.fsync(f.fileno())
    with partial.open("ab") as f:
        for offset in range(CHUNK, len(content), CHUNK):
            f.write(content[offset:offset + CHUNK])
    resumed = partial.read_bytes()
    assert resumed == content
    storage.put(evidence, resumed)
    partial.unlink()
    return {"resumed_bytes": len(resumed)}


def t05(storage, evidence, content):
    storage.put(evidence, content)
    storage.put(evidence, content)
    assert storage.get(evidence, "admin") == content
    return {"duplicate_put_safe": True}


def t06(storage_cls, evidence, content, root):
    storage_cls(root).put(evidence, content)
    restarted = storage_cls(root)
    assert restarted.get(evidence, "admin") == content
    return {"recovered_after_restart": True}


def t07(storage, evidence, content, root):
    storage.put(evidence, content)
    path = storage._path(evidence)
    raw = bytearray(path.read_bytes())
    raw[0] ^= 0xFF
    path.write_bytes(raw)
    try:
        storage.get(evidence, "admin")
    except HashMismatch:
        return {"corruption_detected": True}
    raise AssertionError("corruption was not detected")


def t08(storage, evidence, content, root):
    storage.put(evidence, content)
    backup = root.parent / "backup.tar.gz"
    with tarfile.open(backup, "w:gz") as archive:
        archive.add(storage.root, arcname="evidence")
    restore_root = root.parent / "restore"
    restore_root.mkdir()
    with tarfile.open(backup, "r:gz") as archive:
        archive.extractall(restore_root, filter="data")
    restored = FileSystemEvidenceStorage(restore_root / "evidence")
    assert restored.get(evidence, "admin") == content
    return {"backup_restore": True, "backup_bytes": backup.stat().st_size}


def main():
    results = {"poc": "pod-evidence-storage", "implementation": "filesystem", "tests": {}, "datasets": {}}
    with tempfile.TemporaryDirectory(prefix="seta-pod-poc-") as tmp:
        root = Path(tmp) / "storage"
        storage = FileSystemEvidenceStorage(root)
        for label, size in SIZES.items():
            content = synthetic_bytes(size)
            evidence = make_evidence(f"synthetic-{label}", content)
            dataset = {}
            dataset["T01"] = t01(storage, evidence, content)
            dataset["T02"] = t02(storage, evidence, content)
            dataset["T03"] = t03(storage, evidence)
            dataset["T04"] = t04(storage, evidence, content, Path(tmp) / "resume")
            dataset["T05"] = t05(storage, evidence, content)
            dataset["T06"] = t06(FileSystemEvidenceStorage, evidence, content, root)
            dataset["T07"] = t07(storage, evidence, content, Path(tmp) / f"corrupt-{label}")
            dataset["T08"] = t08(storage, evidence, content, Path(tmp) / f"backup-{label}")
            results["tests"][label] = dataset
            results["datasets"][label] = {"bytes": size, "sha256": evidence.content_hash}
    output = Path("poc/pod-evidence-storage/results.json")
    output.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
