# -*- coding: utf-8 -*-
"""
enhanced_mindmap.json → agent_spec.json
레이어드 마인드맵에서 AI Agent 시스템 아키텍처를 자동 도출.
 - Orchestrator(AI Agent) → Manager(단계별) → Sub-agent(활동별) → Assistant/DB(지식)
 - 각 Sub-agent: 실행 활동/task, 필요 지식(Data/맥락/원칙=tools), 산출물, Human-in-loop 게이트
 - Assistant 지식 카탈로그(Data source / Context provider / Principle·Rule base)
"""
import json, collections, os

HERE = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(HERE, 'enhanced_mindmap.json'), encoding='utf-8'))
N = {n['id']: n for n in M['nodes']}
EDGES = M['edges']

# 인접: from -> [(type,to)]
out_adj = collections.defaultdict(list)
for e in EDGES:
    out_adj[e['from']].append((e['type'], e['to']))

PHASE_LABEL = {p['id']: p['label'] for p in M['phases']}
PHASE_NOTE = {p['id']: p.get('okr_mbo_note') for p in M['phases']}

def children(nid, types):
    return [t for ty, t in out_adj[nid] if ty in types]

# parent 트리(무사이클)로 자식 맵 구성 — 원본 rel 역방향 contain 사이클 회피
kids = collections.defaultdict(list)
for n in M['nodes']:
    if n.get('parent'): kids[n['parent']].append(n['id'])

def descendants(root):
    """root 하위 전체(parent 트리 DFS)"""
    out, stack = [], list(kids[root])
    while stack:
        x = stack.pop()
        out.append(x)
        stack.extend(kids[x])
    return out

def subtree_tasks(activity_id):
    """활동 + 하위 L2 task/output 전체(parent 트리)"""
    ids = [activity_id]
    for d in descendants(activity_id):
        if N.get(d, {}).get('layer') == 'L2_activity':
            ids.append(d)
    return ids

def knowledge_for(node_ids):
    data, ctx, prin = set(), set(), set()
    for nid in node_ids:
        for ty, to in out_adj[nid]:
            if ty == 'requires_data': data.add(to)
            elif ty == 'interpreted_by': ctx.add(to)
            elif ty == 'governed_by': prin.add(to)
    return data, ctx, prin

def lbl(nid): return N.get(nid, {}).get('label', nid)

# === DEVELOP: 헬퍼 ============================================================
def nearest_activity(nid):
    """노드의 최근접 activity 조상(자기 포함). parent 트리 상행."""
    cur = nid
    seen = set()
    while cur and cur not in seen:
        seen.add(cur)
        n = N.get(cur)
        if not n: return None
        if n['layer'] == 'L2_activity' and n['kind'] == 'activity':
            return cur
        cur = n.get('parent')
    return None

# activity-level precede 의존 그래프
act_up = collections.defaultdict(set)   # A <- upstream
act_dn = collections.defaultdict(set)   # A -> downstream
for e in EDGES:
    if e['type'] != 'precede': continue
    fa, ta = nearest_activity(e['from']), nearest_activity(e['to'])
    if fa and ta and fa != ta:
        act_dn[fa].add(ta); act_up[ta].add(fa)

# === DEVELOP: Sub-agent 유형/자율도 분류 =====================================
# 우선순위 순서대로 키워드 매칭
SA_PATTERN_RULES = [
    ("facilitator", ["회의", "면담", "Meeting", "Workshop", "Talent", "논의", "Session", "Feedback 실시"]),
    ("monitor",     ["Monitoring", "참관", "취합", "보고", "정리 및 취합", "consolidate", "결과 분석", "평가결과 분석", "Summary"]),
    ("validator",   ["점검", "검토", "검증", "적정성", "Check", "Grid", "Balance", "Calibration", "Review", "진단", "확정", "서명", "확인"]),
    ("calculator",  ["가중치", "Target", "점수", "산출", "Cascading", "집계", "평점"]),
    ("retriever",   ["지침", "안내", "배포", "설명회", "Guide 적용", "자료 준비", "준비"]),
]
SA_PATTERN_DESC = {
    "generator":   "초안·산출물 생성 (LLM 생성)",
    "calculator":  "수치 계산·산정 (결정적 연산)",
    "validator":   "규칙 기반 검증·점검 (rule check)",
    "retriever":   "지침·데이터 조회·배포",
    "facilitator": "회의·면담 실시간 보조 (가이드·질문·기록)",
    "monitor":     "진행 모니터링·취합·리포트 자동화",
}
def sa_pattern(label):
    for pat, keys in SA_PATTERN_RULES:
        if any(k in label for k in keys):
            return pat
    return "generator"

def autonomy(pattern, has_gate):
    if has_gate:                     return "human_approve"   # 사람 승인 필수
    if pattern == "facilitator":     return "human_led"       # 사람 주도, AI 보조
    if pattern in ("monitor", "retriever"): return "auto"     # 완전 자동
    if pattern == "calculator":      return "auto_with_review"
    return "suggest"                                          # generator/validator: 제안

def tool_interface(data, ctx, prin):
    ops = []
    if data: ops.append({"op": "query.data", "mode": "structured_db", "n": len(data)})
    if ctx:  ops.append({"op": "retrieve.context", "mode": "rag", "n": len(ctx)})
    if prin: ops.append({"op": "validate.principle", "mode": "rule_engine", "n": len(prin)})
    return ops

# === DEVELOP: Manager 운영 명세 (단계별 저작, 매뉴얼 근거) ====================
MANAGER_DEV = {
    "u.goal": {
        "entry_criteria": "연간 MBO 운영계획·지침 확정, 상위(전사/조직) 목표 수립 완료",
        "exit_criteria": "전 피평가자 목표 2차 평가자 Confirm(서명) 및 시스템 등록 완료",
        "coordination": "sequential",
        "quality_gates": [
            {"rule": "KPI 항목 가중치 5~25% 범위", "threshold": "min 5% / max 25%", "source": "pm.out.weight_check"},
            {"rule": "개인 KPI 개수 ≤ 10개", "threshold": "≤10 (11+ 과다)", "source": "pm.out.weight_check.kpicount"},
            {"rule": "동일 가중치 과다 부여 금지", "threshold": "절반 미만", "source": "pm.out.weight_check.samevalue"},
            {"rule": "SMART/FAST 충족 점검", "threshold": "체크리스트 통과", "source": "pm.tips.goal.kpipool.smart / okr.principle.fast"},
            {"rule": "Target Level 음수·과다(Too Stretched) 점검", "threshold": "전년대비 합리범위", "source": "pm.out.target_check"},
            {"rule": "Direct Cascading 비중 Function 특성 부합", "threshold": "Front 낮음/Back 차별화/Staff 높음", "source": "pm.tips.goal.hrreview.directcascading"},
        ],
        "escalation": "가중치/Target 이상치·Cascading 불균형 → HR 운영자·평가자 Contact으로 Rationale 확인",
        "okr_mbo_branching": {"OKR": "OKR Canvas Brainstorming→FAST 점검→Performance Plus 등록", "MBO": "KPI Pooling→Cascading→가중치/Target→검토회의→서명 확정"},
    },
    "u.check": {
        "entry_criteria": "목표 확정 후 운영 기간 경과(주간/반기 시점 도래)",
        "exit_criteria": "중간점검 면담 전수 실시·결과 취합 및 보고 완료",
        "coordination": "sequential",
        "quality_gates": [
            {"rule": "R&R 변화 반영(Check A)", "threshold": "조직·직무 변동 확인", "source": "pm.out.midyear_checkpoint.checkA"},
            {"rule": "목표 진척도 부진/충족 분류(Check B)", "threshold": "기대수준 대비", "source": "pm.out.midyear_checkpoint.checkB"},
            {"rule": "면담 실시율 100%", "threshold": "전 피평가자", "source": "pm.myr.interview"},
        ],
        "escalation": "부진 항목·R&R 변동 大 → Intervention(개입) 수준 결정, 목표 보완 요청",
        "okr_mbo_branching": {"OKR": "주간 Start/Review 브리핑 상시 점검", "MBO": "Mid-year Review 1:1 면담"},
    },
    "u.eval": {
        "entry_criteria": "평가 운영계획·Guide 확정, 운영 기간 종료(실적 확정)",
        "exit_criteria": "Calibration 거쳐 평가 점수·등급 확정 및 BG장/CEO 보고 완료",
        "coordination": "sequential",
        "quality_gates": [
            {"rule": "부문별 평가등급 인원비율 Guide 준수", "threshold": "Guide 범위", "source": "pm.ev.confirm.grade"},
            {"rule": "Calibration 경향(관대화/중심화/가혹화) 점검", "threshold": "분포 정상범위", "source": "pm.out.dist_analysis"},
            {"rule": "조직별 평균 Gap 점검", "threshold": "전체 평균 대비", "source": "pm.out.org_analysis.gap"},
            {"rule": "실적자료 신뢰성·자기평가 타당성 검증", "threshold": "근거 충족", "source": "pm.ev.supervisor.review"},
        ],
        "escalation": "왜곡 평가·Gap 이상 → Calibration Meeting 재평가/조정 요청(HR 배석)",
        "okr_mbo_branching": {"OKR": "결과 직접등급화 지양·종합 해석·인재 논의", "MBO": "KPI 달성도 점수→상사평가→Calibration→등급"},
    },
    "u.fb": {
        "entry_criteria": "평가 결과 확정",
        "exit_criteria": "전 피평가자 Feedback Meeting 실시·결과 취합 보고 완료",
        "coordination": "sequential",
        "quality_gates": [
            {"rule": "전 피평가자 Feedback Meeting 실시", "threshold": "100%", "source": "pm.fb.conduct"},
            {"rule": "성과급 지급률 산정 근거 명시", "threshold": "Note 기재", "source": "pm.fb.prepare.note"},
            {"rule": "자기평가 Gap 큰 항목·미달성 KPI 설명", "threshold": "면담 포함", "source": "pm.fb.conduct.meeting"},
        ],
        "escalation": "Negative 성과·감정 이슈 → 문제해결적 Approach·개선계획 수립",
        "okr_mbo_branching": {"OKR": "CFR(대화·피드백·인정) 상시 루프", "MBO": "평가결과 1:1 Feedback Note 면담"},
    },
    "x.align": {
        "entry_criteria": "조직별 OKR/목표 초안 수립 (목표수립 단계와 병행)",
        "exit_criteria": "조직 간 OKR 적합성·연계성 검토 및 자원 배분 결정",
        "coordination": "parallel",
        "quality_gates": [
            {"rule": "상위 KR을 하위 Objective로 설정 금지", "threshold": "위반 0", "source": "okr.align.guideline"},
            {"rule": "Core=직접 / Support=간접 Alignment", "threshold": "유형 일치", "source": "okr.align.option"},
            {"rule": "조직 간 균형 배분·충돌 점검", "threshold": "충돌 0", "source": "okr.align.support-review"},
        ],
        "escalation": "조직 간 우선순위 충돌 → Alignment Workshop에서 경영진/Champion 조정",
        "okr_mbo_branching": {"OKR": "기여 기반 직·간접 유연 연계", "MBO": "상위→하위 기계적 Cascading(가중치/Target 검증으로 보강)"},
    },
    "x.change": {
        "entry_criteria": "상시 (전 단계 횡단)",
        "exit_criteria": "상시 (정착·문화화 지속)",
        "coordination": "parallel",
        "quality_gates": [
            {"rule": "6대 행동강령 준수", "threshold": "Action Plan 이행", "source": "okr.cm.code"},
            {"rule": "책임 주기(D/W/M/Q) Cadence 운영", "threshold": "주기 충족", "source": "okr.cm.cadence"},
            {"rule": "투명성 — 전 과정 시스템 공개", "threshold": "공개 운영", "source": "okr.cm.sharing"},
        ],
        "escalation": "변화 저항·수용도 저하 → 임원/CEO 변화 의지·자원 재확인",
        "okr_mbo_branching": {"OKR": "변화관리 3단계·6대 행동강령", "MBO": "명시적 단계 없음 — AI Agent 도입 자체가 변화관리 대상"},
    },
}

# === DEVELOP: Assistant 지식 도메인 (retrieval_mode·backing system) ==========
DOMAINS = [
    {"id": "d.org",      "label": "직무·조직 체계", "retrieval_mode": "structured_db",
     "system": "HRIS / 직무체계 DB", "keys": ["직무", "R&R", "역할", "Value Chain", "Function", "조직", "Customer", "Process"]},
    {"id": "d.goalkpi",  "label": "목표·KPI 데이터", "retrieval_mode": "structured_db",
     "system": "Performance Plus (OKR/MBO)", "keys": ["주기", "Target Date", "Visibility", "Measurement", "공개", "측정", "KPI 선정 기준", "Initiative"]},
    {"id": "d.actuals",  "label": "실적·성과 분포 데이터", "retrieval_mode": "structured_db",
     "system": "성과 Data Warehouse", "keys": ["실적", "달성", "분포", "통계", "평균", "Gap", "집계표", "Category"]},
    {"id": "d.weightrule","label": "가중치·Target 규칙", "retrieval_mode": "rule_engine",
     "system": "Rule Engine / Monitoring Tool", "keys": ["가중치", "상한", "하한", "Target", "Cap", "Threshold", "산출식", "데이터 분포", "개수"]},
    {"id": "d.evalrule", "label": "평가·등급 규칙", "retrieval_mode": "rule_engine",
     "system": "Rule Engine", "keys": ["등급", "인원", "Calibration", "관대", "중심", "가혹", "음수", "과다", "Goal Grid", "Direct Cascading", "Balance"]},
    {"id": "d.method",   "label": "방법론·원칙", "retrieval_mode": "knowledge_base",
     "system": "Knowledge Base (rule+RAG)", "keys": ["SMART", "FAST", "Focus", "Align", "Stretch", "Track", "VDT", "Cascading", "CFR", "STAR", "순위법", "쌍대", "요소평가", "방법", "Method", "원칙", "유형", "Approach", "Objective", "Key Result", "Rules"]},
    {"id": "d.context",  "label": "맥락·해석", "retrieval_mode": "rag",
     "system": "Context Store / RAG", "keys": ["맥락"]},
    {"id": "d.feedback", "label": "면담·피드백 가이드", "retrieval_mode": "rag",
     "system": "KB / RAG", "keys": ["Feedback", "면담", "Communication", "Point", "Positive", "Negative", "Intervention", "우려", "대응"]},
    {"id": "d.template", "label": "산출물 템플릿", "retrieval_mode": "template_store",
     "system": "Document Store", "keys": ["Template", "양식", "Sheet", "Note", "Report", "Checklist", "Canvas", "Matrix"]},
]
def classify_domain(node):
    lab = node['label']; nid = node['id']
    # 맥락 레이어는 우선 피드백/일반 분기
    if node['layer'] == 'L3_context':
        if any(k in lab for k in ["Feedback", "면담", "피드백"]) or nid.startswith("ctx.fb") or "fb" in nid:
            return "d.feedback"
        return "d.context"
    for d in DOMAINS:
        if d['id'] in ("d.context",): continue
        if any(k in lab for k in d['keys']):
            return d['id']
    # data 기본 → actuals, principle 기본 → method
    return "d.actuals" if node['layer'] == 'L3_data' else "d.method"

# --- Sub-agents: 활동(activity) 단위 ---
subagents = []
for n in M['nodes']:
    if n['layer'] == 'L2_activity' and n['kind'] == 'activity':
        tasks = subtree_tasks(n['id'])
        data, ctx, prin = knowledge_for(tasks)
        outputs = set()
        gates = []
        for tid in tasks:
            outputs.update(children(tid, {'produces'}))
            tn = N[tid]
            if tn.get('human_in_loop'):
                gates.append({"id": tid, "label": tn['label']})
        pattern = sa_pattern(n['label'])
        has_gate = len(gates) > 0
        # io_contract: 활동+task 의 inputs/outputs 합집합
        ins, outs = set(), set()
        for tid in tasks:
            ins.update(N[tid].get('inputs', []) or [])
            outs.update(N[tid].get('outputs', []) or [])
        outs.update(lbl(x) for x in outputs)
        aid = n['id']
        subagents.append({
            "id": "sa." + aid,
            "label": n['label'],
            "phase": n['phase'],
            "phase_label": PHASE_LABEL.get(n['phase']),
            "origin": n['origin'],
            # --- DEVELOP ---
            "agent_type": pattern,
            "agent_type_desc": SA_PATTERN_DESC[pattern],
            "autonomy_level": autonomy(pattern, has_gate),
            "goal": n.get('summary'),
            "tool_interface": tool_interface(data, ctx, prin),
            "io_contract": {"inputs": sorted(ins), "outputs": sorted(outs)},
            "dependencies": {
                "upstream": sorted("sa." + x for x in act_up.get(aid, [])),
                "downstream": sorted("sa." + x for x in act_dn.get(aid, [])),
            },
            "guardrails": sorted([lbl(x) for x in prin]),  # 준수 원칙
            # --- 기존 ---
            "executes": [{"id": t, "label": lbl(t), "kind": N[t]['kind']} for t in tasks],
            "tools": {
                "data": sorted([lbl(x) for x in data]),
                "context": sorted([lbl(x) for x in ctx]),
                "principle": sorted([lbl(x) for x in prin]),
            },
            "produces": sorted([lbl(x) for x in outputs]),
            "human_in_loop_gates": gates,
            "human_roles": n.get('user_subroles', []),
        })

# --- Managers: phase 단위 ---
managers = []
for p in M['phases']:
    sas = [s for s in subagents if s['phase'] == p['id']]
    dev = MANAGER_DEV.get(p['id'], {})
    managers.append({
        "id": "mgr." + p['id'],
        "label": p['label'] + " Manager",
        "phase": p['id'],
        "kind": p.get('kind'),
        "summary": p['summary'],
        "okr_mbo_note": PHASE_NOTE.get(p['id']),
        # --- DEVELOP ---
        "entry_criteria": dev.get('entry_criteria'),
        "exit_criteria": dev.get('exit_criteria'),
        "coordination": dev.get('coordination'),
        "quality_gates": dev.get('quality_gates', []),
        "escalation": dev.get('escalation'),
        "okr_mbo_branching": dev.get('okr_mbo_branching'),
        # --- 기존 ---
        "manages_subagents": [s['id'] for s in sas],
        "subagent_count": len(sas),
        "human_gate_count": sum(len(s['human_in_loop_gates']) for s in sas),
    })

# --- Assistant 지식 카탈로그 ---
def cat(layer):
    items = [{"id": n['id'], "label": n['label'], "phase": n['phase'], "origin": n['origin']}
             for n in M['nodes'] if n['layer'] == layer]
    return sorted(items, key=lambda x: (x['phase'] or '', x['label']))

# 지식노드 → 도메인 분류·집계
KNOW = [n for n in M['nodes'] if n['layer'] in ('L3_data', 'L3_context', 'L3_principle')]
dom_members = collections.defaultdict(list)
for n in KNOW:
    did = classify_domain(n)
    dom_members[did].append({"id": n['id'], "label": n['label'], "layer": n['layer'],
                             "phase": n['phase'], "origin": n['origin']})

knowledge_domains = []
for d in DOMAINS:
    mem = sorted(dom_members.get(d['id'], []), key=lambda x: (x['phase'] or '', x['label']))
    by_layer = collections.Counter(m['layer'] for m in mem)
    knowledge_domains.append({
        "id": d['id'], "label": d['label'],
        "retrieval_mode": d['retrieval_mode'], "backing_system": d['system'],
        "count": len(mem),
        "by_layer": {"data": by_layer.get('L3_data', 0), "context": by_layer.get('L3_context', 0),
                     "principle": by_layer.get('L3_principle', 0)},
        "members": mem,
    })

# 주체별 read scope (access_matrix의 L3 접근에서 도출)
read_scope = {a['id']: a['layer_access']['L3_knowledge']
              for a in M['actors']}

assistant = {
    "id": "assistant",
    "label": "AI Assistant / DB / Infra",
    "access_apis": [
        {"op": "query.data", "desc": "정형 데이터 조회(직무·실적·KPI)", "mode": "structured_db"},
        {"op": "compute", "desc": "가중치·Target·점수 계산", "mode": "function"},
        {"op": "retrieve.context", "desc": "맥락·가이드 검색", "mode": "rag"},
        {"op": "validate.principle", "desc": "원칙·규칙 결정적 검증", "mode": "rule_engine"},
        {"op": "get_template", "desc": "산출물 양식 제공", "mode": "template_store"},
        {"op": "log_audit", "desc": "접근·변경 감사 기록", "mode": "audit"},
    ],
    "knowledge_domains": knowledge_domains,
    "backing_systems": sorted({d['system'] for d in DOMAINS}),
    "governance": {
        "read_scope_by_actor": read_scope,
        "audit": "전 지식 접근·산출물 변경 감사 로그",
        "sensitive": "평가 점수·등급·성과급(보상) 데이터는 PII·기밀 — 주체 권한(Admin/평가자/피평가자)에 따라 분리 접근",
    },
    "knowledge_catalog": {
        "data_sources": cat('L3_data'),
        "context_providers": cat('L3_context'),
        "principle_rule_bases": cat('L3_principle'),
    },
    "counts": {
        "data": len(cat('L3_data')),
        "context": len(cat('L3_context')),
        "principle": len(cat('L3_principle')),
        "domains": len(knowledge_domains),
    },
}

# --- Orchestrator ---
orchestrator = {
    "id": "orchestrator",
    "label": "AI Agent (Orchestrator)",
    "flow": [p['id'] for p in M['phases'] if p.get('kind') == 'core'],
    "cross_cutting": [p['id'] for p in M['phases'] if p.get('kind') == 'cross'],
    "responsibility": next(a['responsibility'] for a in M['actors'] if a['id'] == 'ai_agent'),
    "manages": [m['id'] for m in managers],
    "human_gate_total": sum(len(s['human_in_loop_gates']) for s in subagents),
}

result = {
    "meta": {
        "title": "성과관리·평가 E2E AI Agent 아키텍처 Spec (마인드맵 자동 도출)",
        "derived_from": "enhanced_mindmap.json",
        "purpose": "레이어드 마인드맵에서 Agent 시스템 구성요소를 도출한 개발 기획 명세. Orchestrator→Manager→Sub-agent→Assistant 4계층.",
        "architecture": "AI Agent(오케스트레이터) ─ AI Manager(단계 6) ─ AI Sub-agent(활동 35) ─ AI Assistant/DB(지식 175). User는 Human-in-loop 게이트로 개입.",
        "develop_notes": {
            "manager": "단계 entry/exit·quality_gates(매뉴얼 근거 검증규칙)·coordination·escalation·OKR/MBO 분기 추가",
            "subagent": "agent_type·autonomy_level·tool_interface(query/retrieve/validate)·io_contract·dependencies(precede)·guardrails 추가",
            "assistant": "평면 카탈로그 → knowledge_domains(retrieval_mode·backing_system)·access_apis·governance 추가",
        },
        "counts": {
            "managers": len(managers),
            "subagents": len(subagents),
            "human_gates": orchestrator['human_gate_total'],
            "knowledge_data": assistant['counts']['data'],
            "knowledge_context": assistant['counts']['context'],
            "knowledge_principle": assistant['counts']['principle'],
            "knowledge_domains": len(knowledge_domains),
            "subagent_types": dict(collections.Counter(s['agent_type'] for s in subagents)),
            "autonomy_levels": dict(collections.Counter(s['autonomy_level'] for s in subagents)),
            "manager_quality_gates": sum(len(m['quality_gates']) for m in managers),
        },
    },
    "orchestrator": orchestrator,
    "managers": managers,
    "subagents": subagents,
    "assistant": assistant,
}

outp = os.path.join(HERE, 'agent_spec.json')
json.dump(result, open(outp, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print("written:", outp)
print("managers:", len(managers), "| subagents:", len(subagents),
      "| human_gates:", orchestrator['human_gate_total'])
print("knowledge: data", assistant['counts']['data'],
      "ctx", assistant['counts']['context'], "principle", assistant['counts']['principle'])
# subagent별 도구 수 분포 점검
empty = [s['id'] for s in subagents if not (s['tools']['data'] or s['tools']['context'] or s['tools']['principle'])]
print("subagents w/o any tool:", len(empty), empty[:5])
