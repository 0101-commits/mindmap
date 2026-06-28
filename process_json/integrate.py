#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""265 원자노드를 1개 통합 성과관리/평가 프로세스로 결합.
- PM 마스터 phase 중복 제거(chunk3 pm.phase.* -> chunk1 정규 id)
- 약식 별칭 참조 교정
- 통합 단계(U1~U4, X1~X2) 스파인 부여(uphase)
"""
import json, io, sys, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

nodes = json.load(open("_merged_raw.json", encoding="utf-8"))

# 1) id 리매핑 (중복 phase 통합 + 별칭 교정)
REMAP = {
    "pm.goal": "pm.goal-setting",
    "pm.midyear": "pm.mid-year-review",
    "pm.eval": "pm.evaluation",
    "pm.phase.goalsetting": "pm.goal-setting",
    "pm.phase.midyear": "pm.mid-year-review",
    "pm.phase.evaluation": "pm.evaluation",
    "pm.phase.feedback": "pm.feedback",
}
def rm(x): return REMAP.get(x, x)

# 자기 id가 리매핑 대상(중복 phase)인 노드는 제거, 단 정규 노드에 src/summary 보강
canon = {n["id"]: n for n in nodes if n["id"] not in REMAP}
for n in nodes:
    if n["id"] in REMAP:
        tgt = canon.get(rm(n["id"]))
        if tgt and n.get("src") and n["src"] not in (tgt.get("src") or ""):
            tgt["src"] = f"{tgt.get('src','')}; {n['src']}".strip("; ")

merged = list(canon.values())
# parent/rel 참조 교정
for n in merged:
    if n.get("parent"):
        n["parent"] = rm(n["parent"])
    for r in (n.get("rel") or []):
        if r.get("to"):
            r["to"] = rm(r["to"])

idmap = {n["id"]: n for n in merged}

# 2) 통합 단계 정의
UNIFIED = [
    {"id":"u.goal",  "type":"uphase","kind":"core","label":"U1 목표수립",
     "summary":"전략·상위목표 연계하여 개인 목표/OKR·KPI·가중치·목표수준 설정·확정",
     "maps":["okr.process.define","pm.goal-setting","pm.tips"]},
    {"id":"u.check", "type":"uphase","kind":"core","label":"U2 실행·점검",
     "summary":"상시 측정·리뷰(OKR)와 중간점검 면담(MBO)으로 진척도 추적·성과개선·목표 보완",
     "maps":["okr.process.measuring","okr.process.reviewing","okr.process.track","pm.mid-year-review"]},
    {"id":"u.eval",  "type":"uphase","kind":"core","label":"U3 평가",
     "summary":"자기/상사/2차 평가·Calibration으로 점수·등급 확정(MBO) + OKR 성과 활용",
     "maps":["okr.eval","pm.evaluation"]},
    {"id":"u.fb",    "type":"uphase","kind":"core","label":"U4 피드백",
     "summary":"평가결과 Feedback 면담·Note + CFR(대화·피드백·인정) 상시 피드백 루프",
     "maps":["pm.feedback"]},
    {"id":"x.align", "type":"uphase","kind":"cross","label":"X1 정렬·연계",
     "summary":"수직(상위→하위 Cascading)·수평(부서간) 목표 정렬. 전 단계 횡단 지원",
     "maps":["okr.align"]},
    {"id":"x.change","type":"uphase","kind":"cross","label":"X2 변화관리·원칙·문화",
     "summary":"OKR 전환 변화관리 + FAST 원칙 + 행동강령 등 운영 문화. 전 단계 횡단",
     "maps":["okr.cm"]},
]

# 3) uphase 귀속: 조상 체인에서 가장 구체적인 매핑 키 탐색
PRIORITY = [
    ("okr.process.define","u.goal"),
    ("okr.process.measuring","u.check"),("okr.process.reviewing","u.check"),
    ("okr.process.track","u.check"),
    ("okr.align","x.align"),
    ("okr.eval","u.eval"),
    ("okr.cm","x.change"),
    ("okr.cfr","u.fb"),
    ("pm.goal-setting","u.goal"),("pm.tips.goal","u.goal"),("pm.tips","u.goal"),
    ("pm.mid-year-review","u.check"),
    ("pm.evaluation","u.eval"),
    ("pm.feedback","u.fb"),
]
def ancestry(nid, seen=None):
    seen = seen or set()
    chain = []
    cur = nid
    while cur and cur in idmap and cur not in seen:
        seen.add(cur); chain.append(cur)
        cur = idmap[cur].get("parent")
    return chain

def resolve_uphase(n):
    chain = ancestry(n["id"])
    for key, up in PRIORITY:
        if key in chain:
            return up
    # 폴백: 독립 노드 휴리스틱
    nid, lab, typ = n["id"], n.get("label",""), n.get("type")
    txt = (nid + " " + lab).lower()
    if "cfr" in txt or "피드백" in lab or "feedback" in txt or "인정" in lab:
        return "u.fb"
    if "align" in txt or "정렬" in lab or "cascad" in txt or "연계" in lab:
        return "x.align"
    if typ == "principle":
        return "x.change"
    if nid.startswith("okr"):
        return "x.change"   # OKR 정의/원칙/문화 -> 변화·문화
    if "kpi" in txt or "목표" in lab:
        return "u.goal"
    return "core"           # PM 공통(process 개요/role 등)

for n in merged:
    n["uphase"] = resolve_uphase(n)
    n["source"] = "OKR" if n["id"].startswith("okr") else "PM(MBO)"
    n.pop("_origin", None)

# 4) 통합 phase -> 소스 phase 연결 엣지 + 검증
edges = []
for u in UNIFIED:
    for m in u["maps"]:
        if m in idmap:
            edges.append({"from":u["id"],"to":m,"type":"contain","label":"통합단계 매핑"})

# 검증
ids = set(idmap)
bad_p = [(n["id"],n["parent"]) for n in merged if n.get("parent") and n["parent"] not in ids]
bad_r = [(n["id"],r["to"]) for n in merged for r in (n.get("rel") or []) if r.get("to") and r["to"] not in ids]

out = {
  "meta": {
    "title": "통합 성과관리·평가 프로세스 (OKR Manual + PM Manual MBO 결합)",
    "sources": ["HCG 성과관리 OKR Manual Deck (108p)", "HCG PM Manual Masterbook (180p)"],
    "decomposition": "프로세스 원자 단위 (phase>activity>task>output/data) + 형태소 어근 keywords + 관계(rel)",
    "unit_count": len(merged),
    "rel_types": {"precede":"선후","contain":"포함/구성","measure":"측정","align":"정렬·연계",
                  "feedback":"피드백루프","cascade":"상위→하위 전개","support":"지원"},
  },
  "unified_phases": UNIFIED,
  "unified_edges": edges,
  "nodes": merged,
}
json.dump(out, open("unified_process.json","w",encoding="utf-8"), ensure_ascii=False, indent=2)

# 리포트
print(f"통합 노드: {len(merged)}  (중복 phase {len(nodes)-len(merged)}개 제거)")
print(f"끊긴 parent: {len(bad_p)}  끊긴 rel: {len(bad_r)}")
for a,b in bad_p+bad_r: print("  BROKEN", a, "->", b)
print("\n=== uphase x type 분포 ===")
mat = collections.Counter((n["uphase"], n["type"]) for n in merged)
ups = ["u.goal","u.check","u.eval","u.fb","x.align","x.change","core"]
typs = ["phase","activity","task","output","data","role","concept","principle"]
hdr = "uphase".ljust(9)+"".join(t[:5].rjust(7) for t in typs)+"   합계"
print(hdr)
for u in ups:
    row=[mat.get((u,t),0) for t in typs]
    print(u.ljust(9)+"".join(str(v).rjust(7) for v in row)+str(sum(row)).rjust(7))
print("\n=== source 분포 ===", dict(collections.Counter(n["source"] for n in merged)))
print("wrote unified_process.json")
