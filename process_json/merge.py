#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""4개 소스 JSON 병합 + 무결성 검증."""
import json, sys, collections, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
FILES = ["okr_nodes.json", "pm_nodes_1.json", "pm_nodes_2.json", "pm_nodes_3.json"]

all_nodes = []
per = {}
for f in FILES:
    with open(f, encoding="utf-8") as fh:
        data = json.load(fh)
    per[f] = len(data)
    for n in data:
        n["_origin"] = f
        all_nodes.append(n)

# id 중복 검사
ids = [n["id"] for n in all_nodes]
dup = [k for k, v in collections.Counter(ids).items() if v > 1]
idset = set(ids)

# 끊긴 참조 검사
broken_parent, broken_rel = [], []
for n in all_nodes:
    p = n.get("parent")
    if p and p not in idset:
        broken_parent.append((n["id"], p))
    for r in (n.get("rel") or []):
        if r.get("to") and r["to"] not in idset:
            broken_rel.append((n["id"], r["to"]))

# type 분포
types = collections.Counter(n.get("type") for n in all_nodes)

print("=== per-file ===")
for f, c in per.items():
    print(f"  {f}: {c}")
print(f"TOTAL nodes: {len(all_nodes)}")
print("=== types ===")
for t, c in sorted(types.items(), key=lambda x: -x[1]):
    print(f"  {t}: {c}")
print(f"=== dup ids: {len(dup)} ===")
for d in dup:
    print("  DUP", d)
print(f"=== broken parent refs: {len(broken_parent)} ===")
for a, b in broken_parent:
    print(f"  {a} -> {b}")
print(f"=== broken rel refs: {len(broken_rel)} ===")
for a, b in broken_rel:
    print(f"  {a} -> {b}")

with open("_merged_raw.json", "w", encoding="utf-8") as fh:
    json.dump(all_nodes, fh, ensure_ascii=False, indent=2)
print("\nwrote _merged_raw.json")
