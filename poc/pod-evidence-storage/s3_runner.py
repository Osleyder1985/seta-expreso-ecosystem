#!/usr/bin/env python3
"""S3-compatible POD evidence storage PoC using boto3.

The runner assumes an S3-compatible endpoint and synthetic credentials.
Authorization is intentionally represented at the application boundary;
the storage credential is never exposed to the simulated customer actor.
"""

from __future__ import annotations

import hashlib
import json
import os
import tarfile
import tempfile
import time
from pathlib import Path

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError


SIZES = {"1MiB": 1 << 20, "5MiB": 5 << 20, "10MiB": 10 << 20, "20MiB": 20 << 20}
CHUNK = 1 << 20
BUCKET = os.getenv("POD_POC_BUCKET", "seta-pod-poc")


class Unauthorized(Exception):
    pass


def synthetic_bytes(size: int) -> bytes:
    block = hashlib.sha256(b"SETA-EXPRESO-POD-POC").digest()
    q, r = divmod(size, len(block))
    return block * q + block[:r]


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


class S3EvidenceStorage:
    def __init__(self, client):
        self.client = client
        self.authorized_actors = {"admin", "agency", "customer"}

    def put(self, evidence_id, content, expected_hash):
        actual = digest(content)
        if actual != expected_hash:
            raise ValueError("hash mismatch before upload")
        key = f"evidence/{evidence_id}"
        try:
            head = self.client.head_object(Bucket=BUCKET, Key=key)
            if head.get("Metadata", {}).get("sha256") == expected_hash:
                return
            raise ValueError("immutable evidence key already contains different content")
        except ClientError as exc:
            if exc.response.get("Error", {}).get("Code") not in {"404", "NoSuchKey", "NotFound"}:
                raise
        self.client.put_object(
            Bucket=BUCKET,
            Key=key,
            Body=content,
            ContentType="image/jpeg",
            Metadata={"sha256": expected_hash},
        )

    def get(self, evidence_id, expected_hash, actor):
        if actor not in self.authorized_actors:
            raise Unauthorized(actor)
        data = self.client.get_object(Bucket=BUCKET, Key=f"evidence/{evidence_id}")["Body"].read()
        if digest(data) != expected_hash:
            raise ValueError("stored content corrupted")
        return data

    def delete(self, evidence_id):
        self.client.delete_object(Bucket=BUCKET, Key=f"evidence/{evidence_id}")


def t01(s, eid, content):
    h = digest(content)
    started = time.perf_counter()
    s.put(eid, content, h)
    elapsed = time.perf_counter() - started
    assert s.get(eid, h, "admin") == content
    return {"elapsed_s": elapsed, "sha256": h}


def t02(s, eid, content):
    assert s.get(eid, digest(content), "customer") == content
    return {"authorized_read": True}


def t03(s, eid, content):
    try:
        s.get(eid, digest(content), "anonymous")
    except Unauthorized:
        return {"unauthorized_rejected": True}
    raise AssertionError("unauthorized read was accepted")


def t04(client, eid, content):
    key = f"evidence/{eid}-multipart"
    upload = client.create_multipart_upload(Bucket=BUCKET, Key=key, Metadata={"sha256": digest(content)})
    upload_id = upload["UploadId"]
    parts = []
    try:
        for number, offset in enumerate(range(0, len(content), CHUNK), 1):
            part = content[offset:offset + CHUNK]
            response = client.upload_part(
                Bucket=BUCKET, Key=key, UploadId=upload_id,
                PartNumber=number, Body=part
            )
            parts.append({"PartNumber": number, "ETag": response["ETag"]})
        client.complete_multipart_upload(
            Bucket=BUCKET, Key=key,
            UploadId=upload_id, MultipartUpload={"Parts": parts}
        )
        restored = client.get_object(Bucket=BUCKET, Key=key)["Body"].read()
        assert restored == content
        return {"resumed_bytes": len(restored), "parts": len(parts)}
    except Exception:
        client.abort_multipart_upload(Bucket=BUCKET, Key=key, UploadId=upload_id)
        raise


def t05(s, eid, content):
    h = digest(content)
    s.put(eid, content, h)
    s.put(eid, content, h)
    assert s.get(eid, h, "admin") == content
    return {"duplicate_put_safe": True}


def t06(s, eid, content, endpoint):
    h = digest(content)
    s.put(eid, content, h)
    restarted = S3EvidenceStorage(boto3.client("s3", endpoint_url=endpoint, config=Config(signature_version="s3v4")))
    assert restarted.get(eid, h, "admin") == content
    return {"recovered_after_restart": True}


def t07(s, client, eid, content):
    h = digest(content)
    s.put(eid, content, h)
    altered = bytearray(content)
    altered[0] ^= 0xFF
    client.put_object(Bucket=BUCKET, Key=f"evidence/{eid}", Body=bytes(altered), Metadata={"sha256": h})
    try:
        s.get(eid, h, "admin")
    except ValueError:
        return {"corruption_detected": True}
    raise AssertionError("corruption was not detected")


def t08(s, client, eid, content, tmp):
    h = digest(content)
    s.put(eid, content, h)
    backup = Path(tmp) / "backup.tar.gz"
    export = Path(tmp) / "export"
    export.mkdir()
    data = client.get_object(Bucket=BUCKET, Key=f"evidence/{eid}")["Body"].read()
    (export / eid).write_bytes(data)
    with tarfile.open(backup, "w:gz") as archive:
        archive.add(export, arcname="evidence")
    restore = Path(tmp) / "restore"
    restore.mkdir()
    with tarfile.open(backup, "r:gz") as archive:
        archive.extractall(restore, filter="data")
    assert (restore / "evidence" / eid).read_bytes() == content
    return {"backup_restore": True, "backup_bytes": backup.stat().st_size}


def main():
    endpoint = os.environ["S3_ENDPOINT"]
    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=os.environ["S3_ACCESS_KEY"],
        aws_secret_access_key=os.environ["S3_SECRET_KEY"],
        region_name="us-east-1",
        config=Config(signature_version="s3v4"),
    )
    try:
        client.create_bucket(Bucket=BUCKET)
    except ClientError as exc:
        if exc.response.get("Error", {}).get("Code") not in {"BucketAlreadyOwnedByYou", "BucketAlreadyExists"}:
            raise
    storage = S3EvidenceStorage(client)
    results = {"poc": "pod-evidence-storage", "implementation": "s3-compatible", "tests": {}}
    with tempfile.TemporaryDirectory(prefix="seta-pod-s3-poc-") as tmp:
        for label, size in SIZES.items():
            content = synthetic_bytes(size)
            eid = f"synthetic-{label}"
            results["tests"][label] = {
                "T01": t01(storage, eid, content),
                "T02": t02(storage, eid, content),
                "T03": t03(storage, eid, content),
                "T04": t04(client, eid, content),
                "T05": t05(storage, eid, content),
                "T06": t06(storage, eid, content, endpoint),
                "T07": t07(storage, client, eid, content),
                "T08": t08(storage, client, eid, content, tmp),
            }
            storage.delete(eid)
    out = Path("poc/pod-evidence-storage/s3-results.json")
    out.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
