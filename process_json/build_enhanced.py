# -*- coding: utf-8 -*-
"""
성과관리·평가 E2E AI Agent 기획용 마인드맵 고도화 빌더.
입력: unified_process.json (261 노드, OKR+MBO 통합)
출력: enhanced_mindmap.json
  - 레이어(L1 프로세스 / L2 세부활동 / L3 HR Domain Knowledge{Data·맥락·원칙}) 태깅  [목표1]
  - 레이어간 관계 엣지 (contains/requires_data/interpreted_by/governed_by/produces/precede/cascade/align/feedback/support)  [목표2]
  - 주체(User/AI Agent/AI Manager/AI Sub-agent/AI Assistant·DB·Infra) × 레이어 접근 매트릭스  [목표3]
  - 맥락(Context) 레이어 신규 저작 + OKR/MBO 특이사항 note
"""
import json, collections, os

HERE = os.path.dirname(os.path.abspath(__file__))
src = json.load(open(os.path.join(HERE, 'unified_process.json'), encoding='utf-8'))
NODES = {n['id']: n for n in src['nodes']}

# ---------------------------------------------------------------------------
# 0. 레이어 정의 [목표1]
# ---------------------------------------------------------------------------
LAYERS = [
    {"id": "L1_process", "label": "프로세스", "order": 1,
     "def": "성과관리·평가 E2E 흐름의 단계(목표수립→실행·점검→평가→피드백) + 횡단(정렬·연계, 변화관리·원칙·문화). AI Agent가 '지금 어느 단계인가'를 인지하는 최상위 정보 접근 단계."},
    {"id": "L2_activity", "label": "세부활동", "order": 2,
     "def": "각 프로세스 단계에서 실제로 수행되는 활동·세부 task·산출물(output). 주체별로 구분되며 AI Sub-agent가 실행하는 실행 단위."},
    {"id": "L3_knowledge", "label": "HR Domain Knowledge", "order": 3,
     "def": "세부활동을 수행/해석/판단하는 데 필요한 HR 지식. Data·맥락·원칙 3종으로 구성되며 AI Assistant/DB/Infra가 제공.",
     "sublayers": [
         {"id": "L3_data", "label": "Data(기초 정보)",
          "def": "활동에 필요한 객관적 기초 정보. 예) 직무체계·직무 데이터, R&R, 전년 실적, 가중치 상·하한, Target 산출식."},
         {"id": "L3_context", "label": "맥락(해석 정보)",
          "def": "활동 진행 시 고려해야 할 해석 정보. 예) 상위 조직 목표, 시황, 동료 목표 수준, 전략적 중요도, Function 특성, 평가 경향."},
         {"id": "L3_principle", "label": "원칙(기준 정보)",
          "def": "활동이 추구·준수해야 할 기준·기법. 예) SMART, FAST, Cascading 방법론, 가중치 설정법, Calibration 기준, CFR."},
     ]},
]

# ---------------------------------------------------------------------------
# 1. 타입 → 레이어 매핑 [목표1]
# ---------------------------------------------------------------------------
# concept 중 '배경/비교/상황' 성격은 맥락, 나머지(기법·방법론)는 원칙으로 분류
CONCEPT_AS_CONTEXT = {
    "okr.concept.history", "okr.concept.mbo-limit", "okr.example.job-type",
    "okr.align.vs-mbo", "okr.concept.new-old-rules", "okr.concept.true-objective",
}

def layer_of(n):
    t = n['type']
    if t == 'phase':    return 'L1_process', 'phase'
    if t == 'activity': return 'L2_activity', 'activity'
    if t == 'task':     return 'L2_activity', 'task'
    if t == 'output':   return 'L2_activity', 'output'
    if t == 'data':     return 'L3_data', 'data'
    if t == 'principle':return 'L3_principle', 'principle'
    if t == 'role':     return 'actor_ref', 'role'
    if t == 'concept':
        if n['id'] in CONCEPT_AS_CONTEXT: return 'L3_context', 'context'
        return 'L3_principle', 'principle'
    return 'L2_activity', t

# ---------------------------------------------------------------------------
# 2. 주체(Actor) 모델 [목표3]
# ---------------------------------------------------------------------------
ACTORS = [
    {"id": "user", "label": "User (사람)", "kind": "human",
     "subroles": ["피평가자(실무자)", "1차평가자(팀장)", "2차평가자(중역/BG장)", "경영진(임원/CEO)",
                  "HR 운영자", "Admin", "System Supervisor"],
     "responsibility": "프로세스 개시·지시, 목표/평가 확정·서명 등 최종 의사결정, 면담·회의 참여, AI 산출물 검토·승인, 예외 처리. Admin은 권한·정책·마스터데이터 설정, System Supervisor는 운영 모니터링·이상 개입.",
     "layer_access": {
         "L1_process": "지시·승인·감독 — 단계 개시/확정 권한(목표 확정, 평가 등급 확정)",
         "L2_activity": "참여·의사결정 — 검토회의·면담·서명, AI 초안 검토·수정·승인",
         "L3_knowledge": "열람 — 판단 근거(Data·맥락·원칙) 확인, 정책/마스터데이터 등록(Admin)",
     }},
    {"id": "ai_agent", "label": "AI Agent (오케스트레이터)", "kind": "ai",
     "responsibility": "성과관리·평가 E2E 전 단계를 오케스트레이션. 사용자 대화 인터페이스, 현재 단계·상태 관리, 다음 단계 트리거, 단계별 AI Manager 호출·결과 종합, 사용자 승인 게이트 관리.",
     "layer_access": {
         "L1_process": "전 단계 오케스트레이션 — 상태 추적·단계 전이·완료 판정",
         "L2_activity": "활동 분배·진행 관리 — Manager에 위임, 진척·이슈 집계",
         "L3_knowledge": "간접 질의 — Assistant에 지식 요청, 결과 사용자에 요약",
     }},
    {"id": "ai_manager", "label": "AI Manager (단계 책임)", "kind": "ai",
     "responsibility": "단일 프로세스 단계(목표수립/실행점검/평가/피드백) 또는 횡단 도메인(정렬, 변화관리) 책임. 해당 단계 정책·가이드 적용, 세부활동 Sub-agent 조정, 품질·정합성 검증(예: 가중치 Balance, Cascading 비중, Calibration 경향), 일정 관리.",
     "layer_access": {
         "L1_process": "단계 책임 — 한 단계의 정책·SLA·완료조건 보유",
         "L2_activity": "활동 조정·품질검증 — Sub-agent 배치, 산출물 검증, 일정 관리",
         "L3_knowledge": "단계 관련 지식·정책 참조 — 검증 기준/원칙 적용",
     }},
    {"id": "ai_subagent", "label": "AI Sub-agent (활동 실행)", "kind": "ai",
     "responsibility": "개별 세부활동·task 실행. OKR Canvas/목표 Pool 초안, KPI Pooling·가중치 계산, 체크리스트 점검, 모니터링/취합/리포트 자동화, 면담 가이드·질문 생성, 평가 점수 산출 보조 등. 결과는 사용자/Manager 검증 대상.",
     "layer_access": {
         "L1_process": "읽기 — 소속 단계 컨텍스트 확인",
         "L2_activity": "실행 소유 — 활동/task 수행·산출물 초안 생성",
         "L3_knowledge": "직접 조회·적용 — 활동별 Data·맥락·원칙을 호출하여 실행에 반영",
     }},
    {"id": "ai_assistant", "label": "AI Assistant / DB / Infra (지식·데이터)", "kind": "infra",
     "responsibility": "HR Domain Knowledge 계층 소유. 직무체계·R&R·실적·조직목표 등 Data 저장·검색, 맥락(상위목표·시황·동료수준 등) 제공, 원칙·기법(SMART·FAST·Cascading 등) 규칙 베이스. RAG/툴 호출·권한·감사 로그·시스템(Performance Plus 등) 연동 인프라.",
     "layer_access": {
         "L1_process": "지원 — 단계별 필요 데이터 인덱싱",
         "L2_activity": "지원 — 활동 입력/산출물 영속화·검색",
         "L3_knowledge": "소유 — Data·맥락·원칙 저장·검색·제공(read API)",
     }},
]

# HR actor 문자열 → user subrole 매핑(부분일치)
HR_TO_USER = [
    (("피평가자", "팀원", "담당자"), "피평가자(실무자)"),
    (("1차평가자", "팀장"), "1차평가자(팀장)"),
    (("2차평가자", "중역", "BG장", "차상위"), "2차평가자(중역/BG장)"),
    (("임원", "CEO", "경영진", "Champion", "상위관리자", "상위조직"), "경영진(임원/CEO)"),
    (("HR",), "HR 운영자"),
    (("동료",), "피평가자(실무자)"),
]

def user_subroles(hr_actor):
    if not hr_actor: return []
    out = []
    for keys, sub in HR_TO_USER:
        if any(k in hr_actor for k in keys):
            out.append(sub)
    return sorted(set(out))

# ai_owner 규칙: 어떤 AI 컴포넌트가 이 노드를 실행/제공하는가
def ai_owner(layer, kind):
    if layer == 'L1_process':   return 'ai_manager'
    if layer == 'L2_activity':
        return 'ai_manager' if kind == 'activity' else 'ai_subagent'  # task/output → subagent
    if layer in ('L3_data', 'L3_context', 'L3_principle'): return 'ai_assistant'
    return 'ai_agent'

# human-in-the-loop: 사용자 승인/결정이 필수인 노드
HIL_KEYS = ("확정", "서명", "승인", "결정", "Confirm", "Calibration", "등급", "면담", "회의", "보고")
def human_in_loop(label):
    return any(k in label for k in HIL_KEYS)

# ---------------------------------------------------------------------------
# 3. 맥락(Context) 레이어 신규 저작 — 활동별 해석 정보 [목표1·목표2]
#    (id, parent_activity, label, summary, source)
# ---------------------------------------------------------------------------
CONTEXT_NODES = [
    # U1 목표수립
    ("ctx.goal.personal", "okr.define.personal", "개인 목표 설정 맥락",
     "상위(전사·조직) OKR, 협력 조직 OKR, 개인 R&R, 과거 목표·달성도, 시황·전략 우선순위를 종합 해석하여 도전수준·방향을 정함", "OKR"),
    ("ctx.goal.selfgoal", "pm.gs.self-goal", "자기 목표 수립 맥락",
     "상위 조직장 목표, 직무체계·R&R, 전년 실적 추이, 동료/팀 목표 수준, 전략적 중요도를 고려하여 KPI·목표수준 설정", "MBO"),
    ("ctx.goal.weight", "pm.tips.goal.weight", "가중치·Target 설정 맥락",
     "재무vs전략 Category 간 비중 Trade-off, 전략적 중요도(최우선), 조직 공헌도·업무 비중, Function 특성(Front 재무·Back 차별화·Staff 전략), 경영진 의지·벤치마킹", "MBO"),
    ("ctx.goal.kpipool", "pm.tips.goal.kpipool", "KPI 도출 맥락",
     "Value Chain·Biz Process, 대상 고객 needs, 전사·상위 전략과제, 기능 영역 특성에 따라 도출 방법론(Process/Customer/Cascading) 선택", "MBO"),
    ("ctx.goal.review", "pm.gs.review-meeting", "목표 검토 회의 맥락",
     "조직목표 적합성, 목표 난이도·실현가능성, 가중치 적정성, 피평가자 우려 유형을 고려하여 협의·조정", "MBO"),
    # U2 실행·점검
    ("ctx.check.midyear", "pm.myr.interview", "중간 점검 면담 맥락",
     "R&R 변화(조직·직무), 목표 진척도(부진/충족)와 성과 Driver, 내·외부 환경 이슈를 분석하여 개입(Intervention) 수준 결정", "MBO"),
    ("ctx.check.weekly", "okr.review.weekly-briefing", "주간 점검·회고 맥락",
     "우선순위 변화, 시장·전략 변동, 협력·지원 이슈를 반영해 목표 지속/보완/중단을 판단", "OKR"),
    # U3 평가
    ("ctx.eval.self", "pm.ev.self", "자기·상사 평가 맥락",
     "목표 난이도, 환경적 이슈, 직무 복잡성, 실적자료 신뢰성을 고려하여 달성도·정성 평가의 타당성을 해석", "MBO"),
    ("ctx.eval.interpret", "okr.eval.interpretation", "성과 해석 맥락",
     "최종 결과가 아닌 목표 난이도·환경 이슈·내부 이슈를 종합하여 성과의 상대적 수준을 판단", "OKR"),
    ("ctx.eval.calibration", "pm.ev.calibration", "Calibration 맥락",
     "평가 경향(관대화/중심화/가혹화), 평가자 간 눈높이 차이, 부문별 등급 인원비율 Guide, 조직별 평균 Gap을 고려하여 조정", "MBO"),
    ("ctx.eval.talent", "okr.eval.talent-session", "인재 논의 맥락",
     "성과 분포, 승진 가능성, 이직 위험, 핵심가치·역량 실천 수준을 다면적으로 고려하여 평가·보상·육성 연계", "OKR"),
    # U4 피드백
    ("ctx.fb.conduct", "pm.fb.conduct", "Feedback 면담 맥락",
     "성과 수준(Positive/Negative), 구성원 감정 상황, 자기평가와의 Gap, 차년도 목표 고려사항을 반영하여 면담 방식 선택", "MBO"),
    # X1 정렬
    ("ctx.align.vertical", "okr.align.vertical", "수직 정렬 맥락",
     "상위 목표 기여도, Top-Down 방향성과 Bottom-Up 자율 수립의 균형, 상·하위 조직 간 정렬도를 해석", "OKR"),
    ("ctx.align.horizontal", "okr.align.horizontal", "수평 정렬 맥락",
     "수평 조직 간 우선순위, 기능적 연결·협업 필요성, 자원 배분·충돌 여부를 고려하여 연계", "OKR"),
    # X2 변화관리
    ("ctx.change.strategy", "okr.cm.strategy", "변화관리 맥락",
     "변화 가치 정의, 조직 수용도, 소규모 적용 성공사례 전파 가능성을 고려한 단계적 확산", "OKR"),
]

# task 단위 맥락 확장 — 해석·판단이 필요한 task에 한정 (기계적 송부/취합 제외)
TASK_CONTEXT_NODES = [
    # U1 목표수립 (OKR Canvas)
    ("ctx.t.obj-brainstorm", "okr.define.obj-brainstorm", "목표 Brainstorming 맥락",
     "전사·조직 OKR, 개인 R&R, 과거 목표를 해석하여 OKR 원칙·목표 의미를 반영한 목표 Pool 발산", "OKR"),
    ("ctx.t.obj-priority", "okr.define.obj-priority", "목표 우선순위화 맥락",
     "상위·협력 조직 OKR 연계를 최우선으로 중요성·시급성을 비교하여 3~5개 수렴", "OKR"),
    ("ctx.t.kr-brainstorm", "okr.define.kr-brainstorm", "핵심결과 발산 맥락",
     "목표별 검증·추적 지표 Type과 최선을 다했을 때 60~70% 달성 가능한 도전적 목표값을 해석", "OKR"),
    ("ctx.t.kr-priority", "okr.define.kr-priority", "핵심결과 우선순위 맥락",
     "영향력·실현가능성 기준으로 Easy Wins/Big Bets/Incremental/Money Pits 유형화하여 선택", "OKR"),
    # U1 목표수립 (MBO)
    ("ctx.t.role-csf", "pm.gs.self-goal.role-csf", "역할책임·CSF 정의 맥락",
     "상위 조직장 목표 달성 지원 역할, 핵심 고유업무, 직무체계·R&R을 해석하여 핵심성공요인 정의", "MBO"),
    ("ctx.t.kpi-target", "pm.gs.self-goal.kpi-target", "KPI·목표수준 설정 맥락",
     "재무/전략/인재 Category 균형, 전년 실적 대비 Cap/Target/Threshold 수준, 가중치 전략적 중요도를 해석", "MBO"),
    ("ctx.t.cascade-pooling", "pm.tips.goal.kpipool.cascading.pooling", "Cascading KPI Pooling 맥락",
     "VDT Key Value Driver, 전략체계도 전략과제, 재무기여도·전략연계성·개선용이성 기준으로 예비 KPI 우선순위 해석", "MBO"),
    ("ctx.t.kpi-validation", "pm.tips.goal.kpipool.validation", "KPI 검증 맥락",
     "전략연계성·측정가능성·통제가능성·목표설정용이성 등 최소 3개 기준으로 적정성 판단(관리가능 5~6개)", "MBO"),
    ("ctx.t.member-verify", "pm.tips.goal.cascade.member.verify", "팀원 Draft 검증 맥락",
     "팀 목표 달성 가능성, 개인별 역할/책임 수준 적정성을 중심으로 Goal Setting 정합성 해석", "MBO"),
    ("ctx.t.hrreview-review", "pm.gs.review-feedback.review", "기능별 HR 검토 맥락",
     "Cascading 비율, 재무/전략 가중치 Balance, Target Level의 Function별(Front/Back/Staff) 전형 경향 대비 특이 Case 해석", "MBO"),
    # U2 실행·점검
    ("ctx.t.review-agenda", "okr.review.agenda", "목표점검 Agenda 맥락",
     "업무 진척도·달성 핵심결과·지원요청(Critical Issues) 세 척도를 다각도로 해석하여 리뷰 초점 결정", "OKR"),
    ("ctx.t.next-okr", "okr.track.next-okr", "Next OKR 개선 맥락",
     "회고 결과별 고려 Point로 목표 수준·우선순위를 재해석하여 지속/보완/중단 결정", "OKR"),
    ("ctx.t.manager-review", "okr.review.manager-review", "상위관리자 리뷰 맥락",
     "주간 CFR 누적과 개인 종합리뷰를 종합하여 연간 퍼포먼스·차기 OKR 방향을 해석", "OKR"),
    ("ctx.t.myr-precheck", "pm.myr.prepare.pre-check", "면담 사전점검 맥락",
     "피평가자 중간점검 양식 기반 부진/충족 항목과 주요 면담 Point를 사전 해석", "MBO"),
    # U3 평가
    ("ctx.t.comprehensive", "okr.eval.comprehensive-review", "종합 리뷰 맥락",
     "목표·피드백·360 피드백을 통해 성과 내용·난이도·달성 과정과 핵심가치·역량 실천 수준을 종합 해석", "OKR"),
    ("ctx.t.self-diagnosis", "okr.eval.self-diagnosis", "평가 자가진단 맥락",
     "성과 분포를 확인하고 관대화·가혹화·중심화·관계 평가 오류 가능성을 해석", "OKR"),
    ("ctx.t.eval-write", "pm.ev.self.write", "자기평가서 작성 맥락",
     "목표수준 달성도, 달성 근거·부진 원인, 환경 이슈를 해석하여 점수·평점·의견 산정", "MBO"),
    ("ctx.t.supervisor-review", "pm.ev.supervisor.review", "자기평가 검토 맥락",
     "집계 실적자료의 정확성·신뢰성과 자기평가 결과의 타당성을 해석", "MBO"),
    ("ctx.t.confirm-grade", "pm.ev.confirm.grade", "등급 부여 맥락",
     "Calibration 조정 결과와 부문별 평가등급 인원비율 Guide를 해석하여 개인별 등급 확정", "MBO"),
    # U4 피드백
    ("ctx.t.fb-note", "pm.fb.prepare.note", "Feedback Note 작성 맥락",
     "조직성과·개인성과 Category별 점수, 성과급 지급률, 자기평가 Gap을 해석하여 Comment 구성", "MBO"),
    # X1 정렬
    ("ctx.t.core-review", "okr.align.core-review", "Core OKR 정렬 맥락",
     "상위 성과지표 직접 기여(수직)와 조직 간 균형 배분(수평 Core-Core)을 해석", "OKR"),
    ("ctx.t.support-review", "okr.align.support-review", "Support OKR 정렬 맥락",
     "상위 OKR 간접 기여 경로와 Core·타 Support OKR과의 충돌 여부를 해석", "OKR"),
    # X2 변화관리
    ("ctx.t.cadence", "okr.cm.cadence", "책임 주기 설정 맥락",
     "Daily/Weekly 업무 체크, Monthly 진척·지식 공유, Quarterly OKR Cycle 리뷰의 조직 cadence를 해석", "OKR"),
]
# 잔여 task 전수 맥락 — 사무적 task는 운영 맥락(대상·시점·시스템·형식·누락점검·의존성), 방법론 step은 실질 맥락
REMAINING_CTX = [
    # U1 OKR Canvas
    ("ctx.r.okr-confirm", "okr.define.confirm", "OKR 확정 결정 맥락",
     "Target Date(분기/1~3년), Visibility(전사/조직 공개), Alignment 연계 대상, Measurement(절대값/달성률/달성여부)를 결정", "OKR"),
    ("ctx.r.okr-checklist", "okr.define.checklist", "OKR 점검 맥락",
     "FAST 원칙별 점검 항목으로 점수화하여 재수립·수정 임계 판단", "OKR"),
    ("ctx.r.initiative", "okr.define.initiative-set", "Initiative 설정 맥락",
     "통제 가능한 행동 지표 성격, 가설 수립 후 즉시 실행 가능성을 고려", "OKR"),
    ("ctx.r.sys-register", "okr.define.system-register", "시스템 등록 맥락",
     "Performance Plus 등록 필수 필드(목표·KR·주기·연계목표·공개범위·Initiative·담당/관리자), 시스템 운영 시점", "OKR"),
    # U2 OKR review/cm
    ("ctx.r.meeting-prep", "okr.review.meeting-prep", "Scrum 사전준비 맥락",
     "Off-line 미팅 前 전 주차 점검·우선순위·금주 핵심결과를 Scrum/Kanban으로 사전 공유", "OKR"),
    ("ctx.r.retro-q", "okr.review.retro-question", "회고 문항 맥락",
     "성취 또는 장애 발생을 trigger로 보완·중단·지속 논의", "OKR"),
    ("ctx.r.self-review", "okr.review.self-review", "개인 종합 리뷰 맥락",
     "FAST 원칙별 검증 Point로 연간 목표 달성·성장을 노트·구두로 리뷰", "OKR"),
    ("ctx.r.growth", "okr.cm.growth-mindset", "Growth Mindset 맥락",
     "고정 사고→창의·도전 사고 전환, 콘테스트로 도전적 목표 설정 유도", "OKR"),
    ("ctx.r.goodq", "okr.cm.good-question", "좋은 질문 맥락",
     "What·How 중심 열린 질문으로 회의·논의 효율화", "OKR"),
    ("ctx.r.sharing", "okr.cm.sharing", "OKR 공유 맥락",
     "목표·과정·피드백 전 과정을 시스템에 공개하고 일상적으로 공유", "OKR"),
    ("ctx.r.practice-align", "okr.cm.practice-align", "Transparency 미팅 맥락",
     "전사 전략·계획·시장 변동 공유와 Q&A로 OKR 정렬 유도", "OKR"),
    ("ctx.r.adfit", "okr.cm.adfit-coaching", "AD-FIT 코칭 맥락",
     "Assess·Define·Focus·Implement·Take-away 5단계, 체크리스트 작성·제출 의무", "OKR"),
    # U1 MBO guideline
    ("ctx.r.holding-plan", "pm.gs.guideline.holding-plan", "연간 운영계획 맥락",
     "연초 Top Team 보고 확정, FA/VM과 재무·전략목표 지침 협의 일정·의존성", "MBO"),
    ("ctx.r.sub-brief", "pm.gs.guideline.subsidiary-briefing", "자회사 설명회 맥락",
     "대상=자회사/BG HR, 목표수립 지침·프로세스별 주요 Activity Guide 전달", "MBO"),
    ("ctx.r.local-plan", "pm.gs.guideline.local-plan", "내부 운영계획 맥락",
     "지주 배포 지침을 자회사/BG 상황에 맞게 조정, FA/전략팀 KPI 지침 취합, CEO/BG장 보고", "MBO"),
    ("ctx.r.exec-brief", "pm.gs.guideline.exec-briefing", "중역/팀장 설명회 맥락",
     "평가자로서 수행할 주요 Activity Guide 중심, 설명회 자료 자체 구성", "MBO"),
    # U1 MBO self-goal
    ("ctx.r.exec-strategy", "pm.gs.self-goal.exec-strategy", "중역 전략MBO 맥락",
     "전략과제·성공의 정의(중장기)·KPI·Target·Action Plan, 추진과제 Milestone 시기별 기입", "MBO"),
    ("ctx.r.self-submit", "pm.gs.self-goal.submit", "자기목표 송부 맥락",
     "대상=상위 조직장/BG HR, IT System 운영 시 불필요, 중역은 공통 Template Soft Copy", "MBO"),
    # U1 MBO review-meeting
    ("ctx.r.rm-arrange", "pm.gs.review-meeting.arrange", "검토회의 Arrange 맥락",
     "CEO/BG장-중역, 중역-팀장 일정 수립(팀원은 팀장 직접), 피평가자별 자료 준비 의존성", "MBO"),
    ("ctx.r.rm-conduct", "pm.gs.review-meeting.conduct", "검토회의 실시 맥락",
     "피평가자별 자기목표 발표, 수립 결과 Review·개선 방향 협의", "MBO"),
    ("ctx.r.rm-revise", "pm.gs.review-meeting.revise", "목표 수정·정리 맥락",
     "협의 내용 반영 수정 후 BG HR 송부, 진행결과 Summary 반영(팀원은 팀장이 Progress Check)", "MBO"),
    ("ctx.r.rf-collect", "pm.gs.review-feedback.collect", "중역 수정본 취합 맥락",
     "재무=FA, 전략=VM팀 별도 취합, 직원목표=자회사/BG 자체관리 분기 규칙", "MBO"),
    # U1 MBO confirm
    ("ctx.r.cf-finalize", "pm.gs.confirm.finalize", "목표 최종 수정·서명 맥락",
     "기능별 Review 결과 반영, 직속 상사 송부(중역은 Hard Copy 서명 후 BG HR)", "MBO"),
    ("ctx.r.cf-sign1", "pm.gs.confirm.sign1", "1차 평가자 서명 맥락",
     "피평가자 서명 개인목표설정서 최종 Review 후 서명", "MBO"),
    ("ctx.r.cf-sign2", "pm.gs.confirm.sign2", "2차 평가자 Confirm 맥락",
     "최종 Review 후 서명으로 목표 Confirm 게이트", "MBO"),
    ("ctx.r.cf-summary", "pm.gs.confirm.collect-summary", "목표 취합·Summary 맥락",
     "Confirm 목표설정서 취합·누락 점검, 중역 서명본 지주 전달, 진행결과 Summary/Report", "MBO"),
    # U2 MBO myr
    ("ctx.r.myr-plan", "pm.myr.prepare.plan", "Mid-year Review 계획 맥락",
     "운영 계획·설명회·Training, 2분기 QBR 연계 일정 의존성", "MBO"),
    ("ctx.r.myr-self", "pm.myr.prepare.self-check", "본인 중간점검 작성 맥락",
     "평가항목별 중간 실적 집계, 직속상사 e-mail 발송", "MBO"),
    ("ctx.r.myr-conduct", "pm.myr.interview.conduct", "중간점검 면담 실시 맥락",
     "달성도·부진원인·지원필요 설명, 평가자 의견·개선 방향/지원 논의", "MBO"),
    ("ctx.r.myr-monitor", "pm.myr.interview.monitor", "면담 참관 맥락",
     "BG장-중역, 중역-팀장 면담 Sampling 참관, 진행·이슈 점검", "MBO"),
    ("ctx.r.myr-record", "pm.myr.result.record", "면담 결과 정리 맥락",
     "현 수준 의견·주요 협의 내용 정리, BG HR 송부", "MBO"),
    ("ctx.r.myr-consol", "pm.myr.result.consolidate", "면담 결과 취합 맥락",
     "진행경과·목표달성도·Issue 요약, 자회사/지주 HR 송부 및 BG장/CEO 보고", "MBO"),
    # U3 MBO ev
    ("ctx.r.ev-plan", "pm.ev.guideline.plan", "평가 운영계획 맥락",
     "Top Team 보고, FA/VM과 재무·전략 KPI 평가 Guide 협의 일정", "MBO"),
    ("ctx.r.ev-brief", "pm.ev.guideline.brief", "평가 Guide 배포 맥락",
     "Milestone·운영 Tip 중심 Guide 배포·Training, CEO/BG장 보고", "MBO"),
    ("ctx.r.ev-collect", "pm.ev.self.collect-data", "실적자료 집계 맥락",
     "MBO 달성도 평가용 실적 집계·분석, 유관팀 협조·자료 신뢰성", "MBO"),
    ("ctx.r.ev-self-submit", "pm.ev.self.submit", "자기평가서 송부 맥락",
     "직속상사 발송(중역은 BG Controller/전략팀/HR Soft Copy)", "MBO"),
    ("ctx.r.ev-evaluate", "pm.ev.supervisor.evaluate", "상사 평가 실시 맥락",
     "항목별 달성도 점수·가중치 평점, 정성평가 점수·근거, 차상위/BG HR 발송", "MBO"),
    ("ctx.r.cal-prep", "pm.ev.calibration.prepare", "Calibration 준비 맥락",
     "상사평가 결과 검토·HR Review Report 작성하여 Calibrator 전달", "MBO"),
    ("ctx.r.cal-review", "pm.ev.calibration.review", "Calibration Review 맥락",
     "항목별 평가 근거 타당성 Review, Issue 시 재평가/조정 요청", "MBO"),
    ("ctx.r.cal-meeting", "pm.ev.calibration.meeting", "Calibration Meeting 맥락",
     "1차-2차 평가자 조정, HR 배석 검토 의견·평가 결과 확정 지원", "MBO"),
    ("ctx.r.ev-report", "pm.ev.confirm.report", "평가 결과 보고 맥락",
     "확정 결과 BG HR 발송, BG장/CEO 보고, 지주에 중역 결과 전달", "MBO"),
    # U4 MBO fb
    ("ctx.r.fb-notify", "pm.fb.prepare.notify", "Feedback 안내 맥락",
     "일정·양식·면담 Guideline 송부, 확정 평가 결과 평가자 재송부", "MBO"),
    ("ctx.r.fb-plan", "pm.fb.prepare.plan", "Feedback 면담계획 맥락",
     "피평가자별 1:1 면담 계획 수립, BG HR 송부", "MBO"),
    ("ctx.r.fb-meeting", "pm.fb.conduct.meeting", "Feedback Meeting 맥락",
     "평가결과·성과급 지급률 근거 설명, 자기평가 Gap·미달성 KPI 논의, 차년도 목표 협의", "MBO"),
    ("ctx.r.fb-monitor", "pm.fb.conduct.monitor", "Feedback Monitoring 맥락",
     "평가자별 면담 일정 계획 대비 진행 상황 확인", "MBO"),
    ("ctx.r.fb-record", "pm.fb.result.record", "Feedback 결과 정리 맥락",
     "평가 점수·Meeting 실시 여부·특이사항 종합 정리, BG HR 송부", "MBO"),
    ("ctx.r.fb-consol", "pm.fb.result.consolidate", "Feedback 취합·보고 맥락",
     "평가자별 결과 취합 Report, 지주 HR 송부 및 BG장/CEO 보고", "MBO"),
    # MBO 방법론 step
    ("ctx.r.cas-steps", "pm.tips.goal.kpipool.cascading.steps", "Cascading Method 단계 맥락",
     "전사/상위 전략과제·중점추진과제, 팀 Mission·업무분장 핵심역할, Process/Customer Map 도출과제 일치 시 성과책임 배분·가중치 중요도", "MBO"),
    ("ctx.r.proc-steps", "pm.tips.goal.kpipool.process.steps", "Process/Function Charting 맥락",
     "Value Chain Biz Process, 개인 Main Task, CSF, KPI 도출. 기능 선후관계 불명확·독립 시 생략", "MBO"),
    ("ctx.r.cust-steps", "pm.tips.goal.kpipool.customer.steps", "Customer Mapping 맥락",
     "고객 분류·조직단위 역할·활동, 고객별 기대수준. 고객 다양·동일 Quality 미제공 시 적합", "MBO"),
    ("ctx.r.w-rank", "pm.tips.goal.weight.weight.rank", "순위법/요소평가법 맥락",
     "전략적 중요도 우선순위·환산순위 비율로 가중치 산출(중요도 차이 반영 한계)", "MBO"),
    ("ctx.r.w-pair", "pm.tips.goal.weight.weight.pairwise", "쌍대비교법 맥락",
     "지표 쌍대 비교점수 합계 비율로 가중치(정교하나 지표 多 시 비교 수 급증)", "MBO"),
    ("ctx.r.gg-check", "pm.tips.goal.hrreview.goalgrid.check", "Goal Grid 점검 맥락",
     "Achieve/Preserve/Avoid/Eliminate 분면별 정합성·과대/과소 목표수준 점검", "MBO"),
    ("ctx.r.dc-check", "pm.tips.goal.hrreview.directcascading.check", "Direct Cascading 점검 맥락",
     "비중 과다/과소 Case, Function 특성 부합(Front 낮음/Back 차별화/Staff 높음) 점검", "MBO"),
    ("ctx.r.bal-check", "pm.tips.goal.hrreview.balance.check", "재무/전략 Balance 점검 맥락",
     "재무/전략 가중치 전형 경향 대비 특이 Case, Front/Back/Staff별 일반 특성 부합 점검", "MBO"),
]
CONTEXT_NODES = CONTEXT_NODES + TASK_CONTEXT_NODES + REMAINING_CTX

# ---------------------------------------------------------------------------
# 4. OKR / MBO 특이사항 note (통합 진행 원칙, 차이 나는 지점만 명시)
# ---------------------------------------------------------------------------
OKR_MBO_NOTE = {
    "u.goal":  "통합 진행. OKR=OKR Canvas Brainstorming·자율 수립·시스템 등록 / MBO=KPI Pooling·계층 Cascading·가중치/Target·서명 확정. 두 방식 모두 SMART·상위목표 연계 원칙 공유.",
    "u.check": "통합 진행. OKR=주간 Start/Review 브리핑 등 상시 점검 / MBO=Mid-year Review 1회 면담. 둘 다 진척도·R&R 변화 점검 후 목표 보완.",
    "u.eval":  "통합 진행. MBO=KPI 달성도 점수·등급·상대비율·Calibration / OKR=결과 직접등급화 지양, 목표 의미·과정 종합 해석·인재 논의. 평가-보상 연계 정도가 상이.",
    "u.fb":    "통합 진행. MBO=평가결과 1:1 Feedback Note 면담 / OKR=CFR(대화·피드백·인정) 상시 루프. 둘 다 차년도 목표로 연결.",
    "x.align": "통합 진행. MBO=상위→하위 기계적 Cascading·할당 / OKR=기여 기반 직·간접 유연 연계. 본 설계는 유연 연계를 기본, 기계적 Cascading은 가중치/Target 검증 단계에서 보강.",
    "x.change":"OKR 고유. MBO에는 명시적 변화관리 단계 없음. AI Agent 도입 자체가 변화관리 대상이므로 본 단계를 운영 문화·원칙 계층으로 횡단 적용.",
}

# ---------------------------------------------------------------------------
# 5. 노드 변환
# ---------------------------------------------------------------------------
SRC_MAP = {"OKR": "OKR", "PM(MBO)": "MBO"}
out_nodes = []
for n in src['nodes']:
    layer, kind = layer_of(n)
    hr = n.get('actor')
    nn = {
        "id": n['id'],
        "label": n['label'],
        "summary": n.get('summary'),
        "layer": layer,
        "kind": kind,
        "phase": n.get('uphase'),
        "hr_actor": hr,
        "user_subroles": user_subroles(hr),
        "ai_owner": ai_owner(layer, kind),
        "human_in_loop": human_in_loop(n['label']) if layer in ('L1_process', 'L2_activity') else False,
        "origin": SRC_MAP.get(n.get('source'), n.get('source')),
        "parent": n.get('parent'),
        "keywords": n.get('keywords', []),
        "inputs": n.get('inputs', []),
        "outputs": n.get('outputs', []),
        "timing": n.get('timing'),
        "src_page": n.get('src'),
    }
    out_nodes.append(nn)

# 맥락 노드 추가
for cid, parent, label, summary, srcv in CONTEXT_NODES:
    pa = NODES.get(parent, {})
    out_nodes.append({
        "id": cid, "label": label, "summary": summary,
        "layer": "L3_context", "kind": "context",
        "phase": pa.get('uphase'), "hr_actor": pa.get('actor'),
        "user_subroles": user_subroles(pa.get('actor')),
        "ai_owner": "ai_assistant", "human_in_loop": False,
        "origin": srcv, "parent": parent, "keywords": [],
        "inputs": [], "outputs": [], "timing": None, "src_page": "기획(저작)",
    })

OUT_IDS = {n['id'] for n in out_nodes}
LAYER_OF = {n['id']: n['layer'] for n in out_nodes}
KIND_OF = {n['id']: n['kind'] for n in out_nodes}

# ---------------------------------------------------------------------------
# 6. 엣지 — 레이어간 관계/연결성 [목표2]
# ---------------------------------------------------------------------------
EDGE_TYPES = {
    "contains":      "포함/구성 (프로세스→활동→task)",
    "produces":      "산출물 생성 (활동→output)",
    "requires_data": "Data 필요 (활동→Data)",
    "interpreted_by":"맥락으로 해석 (활동→맥락)",
    "governed_by":   "원칙 준수 (활동→원칙)",
    "precede":       "선후 (활동→활동)",
    "measure":       "측정",
    "align":         "정렬·연계",
    "cascade":       "상위→하위 전개",
    "feedback":      "피드백 루프",
    "support":       "횡단 지원 (정렬/변화관리→코어 단계, 주체→활동)",
}
edges = []
seen = set()
def add_edge(f, t, ty, label=None):
    if f not in OUT_IDS or t not in OUT_IDS: return
    k = (f, t, ty)
    if k in seen: return
    seen.add(k)
    e = {"from": f, "to": t, "type": ty}
    if label: e["label"] = label
    edges.append(e)

# 6a. parent→child 를 레이어 의미에 맞는 엣지로 (자식 레이어 기준)
for n in out_nodes:
    p = n.get('parent')
    if not p or p not in OUT_IDS: continue
    cl = n['layer']
    if cl == 'L3_data':        ty = 'requires_data'
    elif cl == 'L3_context':   ty = 'interpreted_by'
    elif cl == 'L3_principle': ty = 'governed_by'
    elif n['kind'] == 'output':ty = 'produces'
    else:                      ty = 'contains'
    add_edge(p, n['id'], ty)

# 6b. 원본 rel 보존 (precede/measure/align/feedback/cascade/support/contain)
for n in src['nodes']:
    for r in n.get('rel', []):
        ty = r['type']
        if ty == 'contain':
            # 부모-자식에서 이미 처리되지 않은 contain 은 contains 로
            add_edge(n['id'], r['to'], 'contains')
        else:
            add_edge(n['id'], r['to'], ty)

# 6c. 프로세스 단계 ↔ 통합 phase 매핑(원본 unified_edges) — phase 노드끼리
for ue in src.get('unified_edges', []):
    # u.* 통합 단계는 가상 노드. 실제 phase 노드만 존재하므로 to 가 OUT_IDS 에 있을 때만.
    add_edge(ue['from'], ue['to'], 'contains', ue.get('label'))

stats = collections.Counter(e['type'] for e in edges)

# ---------------------------------------------------------------------------
# 7. 접근 매트릭스 [목표3]
# ---------------------------------------------------------------------------
ACCESS_MATRIX = []
for a in ACTORS:
    for lid in ("L1_process", "L2_activity", "L3_knowledge"):
        ACCESS_MATRIX.append({
            "actor": a["id"], "actor_label": a["label"],
            "layer": lid, "mode": a["layer_access"][lid],
        })

# ---------------------------------------------------------------------------
# 8. 통합 프로세스 백본 (4 코어 + 2 횡단) + 특이사항
# ---------------------------------------------------------------------------
PHASES = []
for ph in src['unified_phases']:
    PHASES.append({
        "id": ph['id'], "label": ph['label'], "kind": ph.get('kind'),
        "summary": ph['summary'],
        "okr_mbo_note": OKR_MBO_NOTE.get(ph['id']),
        "maps": ph.get('maps', []),
    })

# ---------------------------------------------------------------------------
# 9. 출력
# ---------------------------------------------------------------------------
layer_counts = collections.Counter(n['layer'] for n in out_nodes)
result = {
    "meta": {
        "title": "성과관리·평가 E2E AI Agent — 레이어드 마인드맵 (OKR+MBO 통합)",
        "purpose": "성과관리·평가 End-to-End AI Agent 개발을 위한 기획. 레이어(프로세스/세부활동/HR Domain Knowledge)·레이어간 관계·주체별 접근방식을 구조화.",
        "sources": src['meta']['sources'],
        "principle": "OKR과 MBO를 구분 없이 통합 진행하되, 방식이 다른 지점만 phase.okr_mbo_note 및 node.origin 으로 명시.",
        "goals": {
            "목표1": "레이어(프로세스·세부활동·HR Domain Knowledge{Data·맥락·원칙}) 정리 — layers + node.layer",
            "목표2": "레이어별 관계/연결성 정리 — edges + edge_types",
            "목표3": "주체별 레이어 접근 방식 정의 — actors + access_matrix",
        },
        "counts": {
            "nodes": len(out_nodes),
            "edges": len(edges),
            "by_layer": dict(layer_counts),
            "by_edge_type": dict(stats),
            "context_authored": len(CONTEXT_NODES),
        },
    },
    "layers": LAYERS,
    "actors": ACTORS,
    "access_matrix": ACCESS_MATRIX,
    "edge_types": EDGE_TYPES,
    "phases": PHASES,
    "nodes": out_nodes,
    "edges": edges,
}

outpath = os.path.join(HERE, 'enhanced_mindmap.json')
json.dump(result, open(outpath, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print("written:", outpath)
print("nodes:", len(out_nodes), "edges:", len(edges))
print("by_layer:", dict(layer_counts))
print("by_edge_type:", dict(stats))
