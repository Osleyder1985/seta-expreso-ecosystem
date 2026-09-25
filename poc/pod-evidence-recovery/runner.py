#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json,shutil,tempfile
from pathlib import Path
N=30
TYPES=["RECIPIENT_ID_PHOTO","PACKAGE_CONDITION_PHOTO","RECIPIENT_SIGNATURE"]
def payload(i): return (f"synthetic-evidence-{i:03d}-".encode()*2048)[:8192]
def sha(b): return hashlib.sha256(b).hexdigest()
def build(root):
    (root/"metadata").mkdir(parents=True); (root/"objects").mkdir()
    rows=[]
    for i in range(1,N+1):
        b=payload(i); eid=f"evidence-{i:03d}"
        row={"evidenceId":eid,"physicalBultoId":f"bulto-{i:03d}","deliveryAttemptId":f"attempt-{i:03d}","evidenceType":TYPES[(i-1)%3],"contentHash":sha(b),"size":len(b),"storageReference":f"objects/{eid}"}
        (root/"metadata"/f"{eid}.json").write_text(json.dumps(row,sort_keys=True)+"\n"); (root/"objects"/eid).write_bytes(b); rows.append(row)
    return rows
def meta(root): return [json.loads(p.read_text()) for p in sorted((root/"metadata").glob("*.json"))]
def inventory(root):
    rows=meta(root); refs={r["evidenceId"] for r in rows}; objects={p.name for p in (root/"objects").iterdir() if p.is_file()}
    missing=sorted(refs-objects); orphan=sorted(objects-refs); corrupt=[]
    for r in rows:
        p=root/"objects"/r["evidenceId"]
        if p.exists() and sha(p.read_bytes())!=r["contentHash"]: corrupt.append(r["evidenceId"])
    return {"metadata_count":len(rows),"object_count":len(objects),"missing_content":missing,"orphan_objects":orphan,"corrupt_content":corrupt}
def snap(a,b): shutil.copytree(a,b,dirs_exist_ok=True)
def main():
    with tempfile.TemporaryDirectory() as td:
        root=Path(td); base=root/"base"; rows=build(base); backup=root/"backup"; snap(base,backup)
        restore=root/"restore"; snap(backup,restore); r02=inventory(restore)
        r03=root/"missing"; snap(backup,r03); (r03/"objects"/rows[0]["evidenceId"]).unlink()
        r04=root/"corrupt"; snap(backup,r04); (r04/"objects"/rows[1]["evidenceId"]).write_bytes(b"CORRUPTED")
        r05=root/"metadata-without-object"; snap(backup,r05); (r05/"objects"/rows[2]["evidenceId"]).unlink()
        r06=root/"orphan"; snap(backup,r06); (r06/"objects"/"evidence-orphan-999").write_bytes(b"orphan")
        r07=root/"repeat"; snap(backup,r07); snap(backup,r07)
        r08=root/"partial"; snap(backup,r08); target=rows[3]["evidenceId"]; (r08/"objects"/target).unlink(); before=inventory(r08); shutil.copy2(backup/"objects"/target,r08/"objects"/target); after=inventory(r08)
        return {"dataset":{"physicalBultos":N,"evidence":N,"types":3},"R01_backup_consistent":inventory(backup),"R02_restore_complete":r02,"R03_missing_content":inventory(r03),"R04_corrupt_content":inventory(r04),"R05_metadata_without_object":inventory(r05),"R06_orphan_object":inventory(r06),"R07_repeat_restore":inventory(r07),"R08_partial_recovery":{"before":before,"after":after},"R09_post_restore_verification":r02,"R10_discrepancy_inventory":{"missing":inventory(r03)["missing_content"],"corrupt":inventory(r04)["corrupt_content"],"orphan":inventory(r06)["orphan_objects"]}}
if __name__=="__main__": print(json.dumps(main(),sort_keys=True,indent=2))
