# -*- coding: utf-8 -*-
"""
통합 마스터 JSON 빌더.
입력: enhanced_mindmap.json + agent_spec.json + (선택) 병렬 agent fragment 4종
출력: unified_master.json
추가 관계/콘텐츠:
 - dataflow 엣지(feeds): node.inputs/outputs 문자열 ↔ output/data 노드 라벨 매칭 → 활동 간 데이터 흐름
 - agent_system ↔ mindmap id 교차참조(subagent.knowledge_node_ids, executes ids, quality_gate.source)
 - governs_xcut 엣지 / metrics / data_entities / exception_flows (fragment 병합)
"""
import json, collections, os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
SCRATCH = r"C:/Users/ckdrb/AppData/Local/Temp/claude/C--Users-ckdrb/8285d5e7-5d82-4994-be1a-24cd596e4931/scratchpad"
M = json.load(open(os.path.join(HERE, 'enhanced_mindmap.json'), encoding='utf-8'))
A = json.load(open(os.path.join(HERE, 'agent_spec.json'), encoding='utf-8'))
N = {n['id']: n for n in M['nodes']}
ID_SET = set(N)

def load_frag(name, key, default):
    p = os.path.join(SCRATCH, name)
    if not os.path.exists(p):
        print("  [skip] fragment missing:", name); return default
    try:
        d = json.load(open(p, encoding='utf-8'))
        v = d.get(key, default)
        print(f"  [ok] {name}: {key} loaded")
        return v
    except Exception as e:
        print("  [warn] fragment parse fail", name, e); return default

# ---------------------------------------------------------------------------
# 1. dataflow 엣지: inputs/outputs 문자열 → output/data 노드 매칭
# ---------------------------------------------------------------------------
def norm(s):
    s = re.sub(r'\([^)]*\)', '', s or '')      # 괄호 제거
    return re.sub(r'\s+', '', s).lower().strip()

# 매칭 후보: output/data/일부 concept 노드(산출물·데이터성)
cand = {}
for n in M['nodes']:
    if n['kind'] in ('output', 'data') or n['layer'] in ('L3_data',):
        cand.setdefault(norm(n['label']), n['id'])

def match_label(s):
    ns = norm(s)
    if len(ns) < 3: return None
    if ns in cand: return cand[ns]
    # 포함 매칭(보수적: 후보 라벨이 입력의 핵심부거나 그 반대, 길이≥4)
    for k, nid in cand.items():
        if len(k) >= 4 and (k in ns or ns in k):
            return nid
    return None

dataflow = []
seen_df = set()
for n in M['nodes']:
    if n['layer'] != 'L2_activity':
        continue
    for s in (n.get('inputs') or []):
        src = match_label(s)
        if src and src != n['id']:
            k = (src, n['id'])
            if k in seen_df: continue
            seen_df.add(k)
            dataflow.append({"from": src, "to": n['id'], "type": "feeds", "label": s})

# ---------------------------------------------------------------------------
# 2. agent_system ↔ mindmap id 교차참조
# ---------------------------------------------------------------------------
# subagent 라벨→지식노드 id 재해결 (tools 는 라벨로 저장됨)
label2id = collections.defaultdict(list)
for n in M['nodes']:
    label2id[n['label']].append(n['id'])
def ids_for(labels):
    out = []
    for l in labels:
        out.extend(label2id.get(l, []))
    return sorted(set(out))

subagents = []
for s in A['subagents']:
    s2 = dict(s)
    s2['knowledge_node_ids'] = {
        "data": ids_for(s['tools']['data']),
        "context": ids_for(s['tools']['context']),
        "principle": ids_for(s['tools']['principle']),
    }
    s2['governs_node_id'] = s['id'][3:]   # sa.<activity-id> → activity id
    subagents.append(s2)

# ---------------------------------------------------------------------------
# 3. fragment 병합
# ---------------------------------------------------------------------------
print("fragments:")
metrics = load_frag('frag_metrics.json', 'metrics', {})
gov_edges = load_frag('frag_governance.json', 'governs_xcut_edges', [])
data_entities = load_frag('frag_entities.json', 'data_entities', [])
exception_flows = load_frag('frag_exceptions.json', 'exception_flows', [])

# governs_xcut 엣지 검증(존재 id만)
gov_clean, gov_drop = [], 0
seen_g = set()
for e in gov_edges:
    f, t = e.get('from'), e.get('to')
    if f in ID_SET and t in ID_SET and (f, t) not in seen_g:
        seen_g.add((f, t)); gov_clean.append(e)
    else:
        gov_drop += 1

# exception_flows 참조 검증(존재하지 않는 id는 null/필터)
def clean_ids(lst):
    return [x for x in (lst or []) if x in ID_SET or x.startswith('mgr.') or x.startswith('sa.')]
for x in exception_flows:
    x['related_nodes'] = clean_ids(x.get('related_nodes'))

# data_entities derived_from 검증
for e in data_entities:
    e['derived_from'] = [x for x in (e.get('derived_from') or []) if x in ID_SET]

# ---------------------------------------------------------------------------
# 4. 통합 엣지 + edge_types 확장
# ---------------------------------------------------------------------------
all_edges = list(M['edges']) + dataflow + gov_clean
edge_types = dict(M['edge_types'])
edge_types['feeds'] = "데이터 흐름 (산출물/데이터 → 소비 활동)"
edge_types['governs_xcut'] = "횡단 원칙 적용 (원칙 → 다수 활동)"

# ---------------------------------------------------------------------------
# 5. crosswalk 인덱스 (레이어↔주체↔agent 컴포넌트)
# ---------------------------------------------------------------------------
crosswalk = {
    "phase_to_manager": {p['id']: "mgr." + p['id'] for p in M['phases']},
    "activity_to_subagent": {s['governs_node_id']: s['id'] for s in subagents},
    "layer_to_owner": {"L1_process": "ai_manager", "L2_activity": "ai_subagent",
                       "L3_data": "ai_assistant", "L3_context": "ai_assistant", "L3_principle": "ai_assistant"},
    "ai_actor_to_human": {a['id']: a.get('subroles') for a in M['actors'] if a['id'] == 'user'},
}

# ---------------------------------------------------------------------------
# 6. 출력
# ---------------------------------------------------------------------------
result = {
    "meta": {
        "title": "성과관리·평가 E2E AI Agent — 통합 마스터 (Unified Master)",
        "purpose": "레이어드 마인드맵·AI Agent 아키텍처·측정·데이터모델·예외플로우를 단일 그래프로 통합한 개발 기획 마스터.",
        "sources": M['meta']['sources'],
        "principle": M['meta'].get('principle'),
        "composition": {
            "from_mindmap": "layers, actors, access_matrix, phases, nodes, edges",
            "from_agent_spec": "agent_system(orchestrator/managers/subagents/assistant)",
            "added_relations": ["feeds(dataflow)", "governs_xcut(횡단 원칙)", "agent↔node 교차참조", "crosswalk 인덱스"],
            "added_content": ["metrics(측정)", "data_entities(데이터 모델)", "exception_flows(예외)"],
        },
        "counts": {
            "nodes": len(M['nodes']),
            "edges_total": len(all_edges),
            "edges_base": len(M['edges']),
            "edges_dataflow_feeds": len(dataflow),
            "edges_governs_xcut": len(gov_clean),
            "managers": len(A['managers']),
            "subagents": len(subagents),
            "knowledge_domains": len(A['assistant'].get('knowledge_domains', [])),
            "metrics_groups": {k: len(v) for k, v in metrics.items()} if metrics else {},
            "data_entities": len(data_entities),
            "exception_flows": len(exception_flows),
        },
        "build": {"governs_xcut_dropped_badref": gov_drop},
    },
    "layers": M['layers'],
    "actors": M['actors'],
    "access_matrix": M['access_matrix'],
    "edge_types": edge_types,
    "phases": M['phases'],
    "nodes": M['nodes'],
    "edges": all_edges,
    "agent_system": {
        "orchestrator": A['orchestrator'],
        "managers": A['managers'],
        "subagents": subagents,
        "assistant": A['assistant'],
    },
    "metrics": metrics,
    "data_entities": data_entities,
    "exception_flows": exception_flows,
    "crosswalk": crosswalk,
}

outp = os.path.join(HERE, 'unified_master.json')
json.dump(result, open(outp, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print("\nwritten:", outp)
print("nodes", len(M['nodes']), "| edges", len(all_edges),
      "(base", len(M['edges']), "+ feeds", len(dataflow), "+ govs_xcut", len(gov_clean), ")")
print("metrics", bool(metrics), "| entities", len(data_entities), "| exceptions", len(exception_flows),
      "| govs dropped", gov_drop)
