# -*- coding: utf-8 -*-
"""Miro 8-image tree -> ../data.js (mindmap render format).

원천: '성과평가 프로세스' Miro 마인드맵 캡처 8장 (mindmap 1~8.png).
루트: HR 성과관리 프로세스 (MBO+OKR 통합).
트리(부모-자식) 정의 후 동일 data.js 포맷으로 생성.
group(색상)=깊이별 type / layer(필터축)=대분류 브랜치.
"""
import io

# ----- 색상 그룹(깊이별) -----
GROUPS = [
    ('core',    '중심',   '#1f2937'),
    ('process', '대분류', '#356CB5'),
    ('phase',   '단계',   '#7c3aed'),
    ('concept', '항목',   '#0891b2'),
    ('activity','세부',   '#2563eb'),
    ('task',    '내용',   '#4f46e5'),
]
DEPTH_GROUP = {0: 'core', 1: 'process', 2: 'phase', 3: 'concept', 4: 'activity', 5: 'task'}

# ----- 필터축(대분류 브랜치) + 브랜치별 색상 -----
# color = 노드(테두리·연결선)·Layer 필터칩 공통색. 노드 배경은 JS에서 밝은 tint 처리.
LAYERS = [
    ('core',  '중심',             '#334155'),
    ('okr',   'OKR 핵심개념',     '#2563EB'),
    ('mbo',   'MBO 핵심개념',     '#7C3AED'),
    ('align', 'X1 정렬·연계',     '#E11D48'),
    ('change','X2 변화관리·문화', '#EA580C'),
    ('link',  '성과평가 연계',    '#0D9488'),
    ('u1',    'U1 목표수립',      '#16A34A'),
    ('u2',    'U2 실행·점검',     '#0EA5E9'),
    ('u3',    'U3 평가',          '#CA8A04'),
    ('u4',    'U4 피드백',        '#DB2777'),
]

# 트리: (label, layer, [children...])  — 자식은 (label, [children]) 또는 "label"
T = (
 "HR 성과관리 프로세스 (MBO+OKR 통합)", "core", [

 # ===== OKR 핵심개념 =====
 ("OKR 핵심개념", "okr", [
   ("Objective (목표)", [
     "성취하고자 하는 것의 표현",
     "간결하고 영감을 주며 도전적",
     "일상적·안정 목표가 아닌 새로 만들고 구축하는 목표",
     "아무도 못 본 새로운 목표 지향",
   ]),
   ("Key Result (핵심결과)", [
     "목표 진행 과정 측정하는 결과 지표",
     "목표별 2~5개 설정",
     "양적·측정 가능한 지표",
     "Baseline 지표",
     "Positive Metric 지표",
     "Negative Metric 지표",
     "Milestone 지표",
   ]),
   ("FAST 핵심원칙", [
     "Focus: 집중과 전념 3-5개 목표에 집중",
     "Align: 정렬과 연결 투명함 전제 개인 업무와 조직 비전 정렬",
     "Stretch: 도전적 목표 한계 뛰어넘는 높은 목표 구축",
     "Track & Update: 목표·핵심결과 지속 추적 및 지속/보완/시작/중단 변용",
   ]),
   ("Initiative", [
     "핵심결과 달성 위한 통제 가능한 행동 지표",
     "가설 세우고 즉시 실행",
     "상위 목표와 연계된 실행 수단",
   ]),
   ("CFR 요소", [
     "Conversation: 구성원 간 대화 목표 공감 팀원과 리더 공유·정렬",
     "Feedback: 양방향 결과·과정 피드백 네트워크 형태",
     "Recognition: 작은 성취 인정 정례화 공유·북돋움",
   ]),
 ]),

 # ===== MBO 핵심개념 =====
 ("MBO 핵심개념", "mbo", [
   ("전통적 MBO 한계", [
     "Top-down 목표관리 연단위 경직 목표",
     "과거·결과 중심 평가",
     "형식적 프로세스 운영",
     "평가보상 도구화 문제",
   ]),
   ("성과관리 History", [
     "테일러리즘·포디즘의 생산성 관리 기반",
     "테일러리즘에서 MBO로 진화",
     "포디즘의 생산성 관리 방식",
     "연단위 경직 목표관리 체계",
   ]),
   ("New Rules 전환", [
     "연1회→상시 피드백으로 전환",
     "개인성과→조직성과 중심으로 전환",
     "비공개→공개 방식으로 전환",
     "Top-down→Bottom-up 방향 전환",
     "평가연계→간접연계 방식으로 전환",
   ]),
   ("MBO 프로세스", [
     "목표수립 2-3월 시작",
     "Mid-year Review 7월 중간점검",
     "평가 12-1월 연말 평가",
     "Feedback 1월 결과 공유",
   ]),
 ]),

 # ===== X1 정렬·연계 (Alignment) =====
 ("X1 정렬·연계 (Alignment)", "align", [
   ("OKR vs MBO 차이", [
     "MBO 기계적 Cascading·할당 방식",
     "OKR 상위 목표 기여 기반 유연한 연계",
     "상위 목표로 하위로 기계적 Cascade 지양",
   ]),
   ("수직적 Alignment", [
     "Top-Down 방향성·의미 정렬",
     "Bottom-Up 기여 기반 자율 수립",
     "상위조직과 하위조직 간 균형",
   ]),
   ("수평적 Alignment", [
     "수평 조직 간 우선순위 논의",
     "기능적 연결·협업 강화",
     "조직 수평 조직 간 정렬",
   ]),
   ("Core OKR", [
     "재무 성과 직접 창출·기여",
     "직접적 Alignment 방식",
     "상위 성과지표 직접 기여 검토",
   ]),
   ("Support OKR", [
     "간접 기여·지원 조직",
     "간접적 Alignment 방식",
     "상위 OKR에 간접 기여 방식·충돌 여부 검토",
   ]),
   ("Alignment Workshop", [
     "조직 간 OKR 적합성·연계성 검토",
     "우선순위 수립 및 결정",
     "인적·물적 자원 배분 결정",
     "경영진/OKR Champion 조직별 Alignment 주도",
   ]),
 ]),

 # ===== X2 변화관리·원칙·문화 =====
 ("X2 변화관리·원칙·문화", "change", [
   ("변화관리 전략 3단계", [
     "Step1 변화 가치 정의",
     "Step2 소규모 적용·촉진",
     "Step3 전파·확장 정착",
   ]),
   ("6대 행동강령", [
     "성장 마인드 기르기 Growth Mindset 콘테스트",
     "좋은 질문하기 What·How 열린 질문",
     "OKR 공유하기 전 과정 시스템 공개",
     "Alignment 연습 Transparency 미팅",
     "책임 주기 설정 Daily/Weekly/Monthly/Quarterly Cadence",
     "AD-FIT 코칭 Assess·Define·Focus·Implement·Take-away",
   ]),
   ("역할 정의", [
     "팀원 OKR 담당자 수립·실행·측정·회고",
     "팀장 OKR 관리자 논의·정렬·코칭·피드백",
     "OKR Champion 상위 조직별 책임자",
     "임원/CEO 변화 의지·전략 공유·자원 배분·정렬 주도",
   ]),
   ("OKR 도입 원칙", [
     "진정한 OKR 아무도 못 본 새로운 목표",
     "집중·우선순위 높은 3-5개 목표에 집중",
     "투명성 기반 조직 전체 공개 운영",
   ]),
 ]),

 # ===== 성과평가 연계 =====
 ("성과평가 연계", "link", [
   ("OKR 활용 평가", [
     "결과 직접 평가 벗어나 목표 의미·과정 종합 판단",
     "다각적 논의로 평가·보상 연계",
     "목표 난이도·환경·내부 이슈 종합 고려",
   ]),
   ("종합 리뷰 프로세스", [
     "목표·360 피드백·배지 통해 성과 종합 리뷰",
     "성과 내용·난이도·달성 과정 종합",
     "역량 실천 종합 리뷰",
     "종합 리뷰→인재 스냅샷→인재 논의 순서",
   ]),
   ("인재 스냅샷", [
     "성과·역량·승진가능성 기록",
     "이직위험·보상·저성과 이슈 기록",
     "블록·종합등급 구성원 종합 기록",
   ]),
   ("Talent Session", [
     "성과·보상·육성·인재관리 역량 논의",
     "평가 결과 객관성·공정성 제고",
     "조직 인재 포트폴리오 관리",
   ]),
   ("MBO 평가 프로세스", [
     "KPI 항목별 실적 집계",
     "자기평가 실시",
     "상사평가 실시",
     "Calibration 차상위자 Review·조정",
     "등급 확정·보고",
   ]),
   ("MBO-OKR 통합 연계 포인트", [
     "OKR 과정 데이터 MBO 평가 인풋으로 활용",
     "정성적 과정 평가와 정량적 KPI 병행",
     "상시 피드백으로 연말 평가 부담 경감",
   ]),
 ]),

 # ===== U1 목표수립 (Define) =====
 ("U1 목표수립 (Define)", "u1", [
   ("목표 Pool 작성 및 우선순위화", [
     "5-7개 목표 Brainstorming",
     "우선순위 3-5개로 압축",
     "우선상위·협력 팀원 논의",
   ]),
   ("핵심결과 Pool 작성 및 우선순위화", [
     "목표별 달팀원 팀장 최종 목표 확인",
     "영향력과 팀원 팀장 핵심결과 도출",
     "목표별 3-5개 핵심결과 확정",
   ]),
   ("개인 KPI·목표수준·가중치 설정", [
     "FAST 원칙 기반 개인 OKR 확정",
     "Initiative 상위 목표 연계 실행 수단 수립",
     "Performance 성과관리 팀원 팀장 연계 확인",
   ]),
   ("목표 검토 회의 및 확정", [
     "데이터 주기 시작일 설정",
     "공유 범위 전사 공유 또는 조직 내 설정",
     "OKR 측정 진행률 지속 측정할 지표 설정",
   ]),
   ("OKR Canvas 활용 Brainstorming", [
     "전사 Mission 공유 및 조직 방향성 확인",
     "팀원 담당 1시간 이내 전사 및 조직 OKR 이해",
     "팀장 OKR Canvas 목표·핵심결과 공유",
   ]),
 ]),

 # ===== U2 실행·점검 (Execute & Measure) — unified_process.json u.check 상세 =====
 ("U2 실행·점검 (Execute & Measure)", "u2", [
   ("측정 Measuring", [
     "OKR 진행 과정 기록·측정",
     "각 KR로 목표 진행 수준 산출",
     "자기 점검 및 승인",
   ]),
   ("리뷰 Reviewing", [
     ("주간 브리핑 (목표 점검·회고)", [
       "미팅 사전 준비 Scrum",
       "목표점검 Agenda (진척도·핵심결과·지원요청)",
       "회고 문항 Follow Up (보완·중단·지속 결정)",
     ]),
     "KPTA 검토법 (Keep·Try·Problem·Action)",
     "Kanban 운영 (To Do·Doing·Done)",
   ]),
   ("추적·개선 Track & Update", [
     ("OKR 달성도 종합리뷰", [
       "개인 종합 리뷰 (FAST 원칙별 검증)",
       "상위관리자 리뷰 (CFR 종합)",
       "OKR 지향노트 (차기 OKR 정교화)",
     ]),
     "Next OKR 개선방안 (지속·보완·중단 결정)",
   ]),
   ("Mid-year Review 중간점검", [
     ("Mid-year Review 준비", [
       "Review 일정·Guide 수립",
       "본인 중간점검 양식 작성",
       "달성도 사전 점검·면담 일정 Arrange",
       "본인 중간 점검 Template",
     ]),
     ("중간 점검 면담", [
       "1:1 중간 점검 면담 실시",
       "면담 참관·진행 현황 Monitoring",
     ]),
     ("결과 정리·취합", [
       "면담 결과 정리·송부",
       "결과 취합·보고 (BG장/CEO)",
       "Mid-year Review 결과 정리 Template",
     ]),
     ("Check Point 점검", [
       "Check A: 역할·책임 변화 (R&R)",
       "Check B: 목표 진척도 (Progress)",
       "Intervention 개입",
     ]),
     ("면담 진행 Checklist", [
       "Process 측면 점검",
       "Contents 측면 (목표 달성도) 점검",
     ]),
     "STAR 기법 (Situation·Task·Action·Result)",
   ]),
 ]),

 # ===== U3 평가 (Review) — unified_process.json u.eval 상세 =====
 ("U3 평가 (Review)", "u3", [
   ("OKR 활용 (성과 평가)", [
     "성과 평가의 변화 (개선·발전 리뷰)",
     ("OKR 활용 프로세스", [
       ("종합 리뷰", [
         "360 피드백",
         "배지 (인정·피드백)",
       ]),
       "성과의 해석 (난이도·환경·내부 이슈)",
       "인재 스냅샷",
       "인재 스냅샷 자가진단 (평가 오류 점검)",
       "인재 논의 Talent Session",
     ]),
   ]),
   ("평가 (KPI 점수·등급 산출)", [
     ("평가 지침 수립·안내", [
       "평가 운영 계획 수립·보고",
       "중역/팀장 평가 Guide 배포·Training",
     ]),
     ("자기 평가", [
       "평가항목별 실적 자료 집계",
       "자기 평가서 작성",
       "자기평가서 송부",
       "평가 Template",
     ]),
     ("상사 평가", [
       "자기 평가 결과 검토",
       "상사 평가 실시",
       "정성평가 근거 Template",
     ]),
     ("Calibration", [
       "Calibration 준비",
       "차상위자 평가 결과 Review",
       "Calibration Meeting 실시",
       "BG HR Review Report",
     ]),
     ("평가 결과 확정·보고", [
       "평가 점수 확정·등급 부여",
       "평가 결과 정리·보고",
       "최종 평가 등급 확정 정리 양식",
     ]),
     ("신규·이동·TF 평가 Guide", [
       ("TF/Project 성과 반영 Process", [
         "주체별 역할 (피평가자·TF Mgr·팀장·HR)",
         "TF/PRJ 평가점수 산출 (세부항목×가중치)",
       ]),
     ]),
     ("성과 Back-up Data 수집", [
       "설명 항목",
       "예시 항목",
     ]),
     ("Calibration Point", [
       "Calibration의 목적",
       "주요 검토 포인트 (관대화·중심화·가혹화)",
     ]),
     ("HR 평가결과 분석", [
       ("전체 점수 분포 분석", [
         "Dimension 구분 (직책×Category)",
         "통계 지표 (평균·표준편차·첨도·편도)",
       ]),
       ("조직별 비교 분석", [
         "평균과의 Gap",
       ]),
       ("MBO Category별 비교 분석", [
         "Category별 총점 영향도",
       ]),
     ]),
   ]),
 ]),

 # ===== U4 피드백 (Feedback) — unified_process.json u.fb 상세 =====
 ("U4 피드백 (Feedback)", "u4", [
   ("CFR (Conversation·Feedback·Recognition)", [
     "Conversation (구성원 간 대화)",
     "Feedback (결과·과정 피드백)",
     "Recognition (성취에 대한 인정)",
   ]),
   ("Feedback (평가 결과 Feedback)", [
     ("Feedback 준비", [
       "평가자 대상 Feedback 안내",
       "Feedback 면담 계획 수립",
       ("Feedback Note 작성", [
         "Feedback Note (점수·등급·성과급·Comment)",
       ]),
     ]),
     ("Feedback 실시", [
       "1:1 Feedback Meeting 실시",
       "진행 현황 Monitoring",
     ]),
     ("Feedback 결과 정리", [
       "결과 정리·송부",
       "결과 취합·보고 (BG장/CEO)",
       "Feedback Meeting 결과 정리 양식",
     ]),
     "Feedback Template",
     "효과적 Communication Tips (경청·질문·긍정언어)",
     ("구성원 상황별 Feedback Point", [
       "Positive Feedback (동기부여)",
       "Negative Feedback (성과 강화)",
     ]),
   ]),
 ]),
 ]
)

# ----- 트리 평탄화 -----
nodes = []   # dict: id, group, layer, label, summary, detail, src
edges = []   # dict: from, to
_ctr = [0]


def nid():
    _ctr[0] += 1
    return 'n%d' % _ctr[0]


def norm(child):
    """child -> (label, [grandchildren])"""
    if isinstance(child, str):
        return child, []
    return child[0], child[1]


def walk(label, layer, children, depth, parent_id):
    gid = 'root' if depth == 0 else nid()
    grp = DEPTH_GROUP.get(depth, 'task')
    nodes.append({
        'id': gid, 'group': grp, 'layer': layer, 'label': label,
        'summary': label, 'detail': [], 'src': '성과평가 프로세스 (Miro)',
    })
    if parent_id is not None:
        edges.append({'from': parent_id, 'to': gid})
    for ch in children:
        clabel, gch = norm(ch)
        walk(clabel, layer, gch, depth + 1, gid)


root_label, root_layer, root_branches = T
# 루트 노드
nodes.append({
    'id': 'root', 'group': 'core', 'layer': 'core', 'label': root_label,
    'summary': root_label, 'detail': [], 'src': '성과평가 프로세스 (Miro)',
})
# 각 대분류 브랜치(자체 layer 보유)
for blabel, blayer, bchildren in root_branches:
    walk(blabel, blayer, bchildren, 1, 'root')


# ----- data.js 출력 -----
def esc(s):
    return (str(s).replace('\\', '\\\\').replace('"', '\\"')
            .replace('\n', '\\n').replace('\r', ''))


def jlist(items):
    return '[' + ', '.join('"' + esc(x) + '"' for x in items) + ']'


o = io.open('../data.js', 'w', encoding='utf-8')
w = o.write
w('/* ============================================================\n')
w(' *  성과평가 프로세스 마인드맵 데이터 (v5 — Miro 재현)\n')
w(' *  출처: \'성과평가 프로세스\' Miro 마인드맵 (mindmap 1~8.png)\n')
w(' *  생성: process_json/build_miro.py\n')
w(' *\n')
w(' *  group(색상) = 깊이별 type / layer(필터축) = 대분류 브랜치\n')
w(' * ============================================================ */\n\n')

w('const GROUPS = {\n')
for k, lab, col in GROUPS:
    w('  %-10s { label: "%s", color: "%s" },\n' % (k + ':', lab, col))
w('};\n\n')

# 브랜치(대분류=layer)별 색상 — 노드 테두리·연결선·필터칩·범례 공통색
w('/* 브랜치(대분류) 색상 = 노드 테두리·연결선·Layer 필터칩·범례 공통 (노드 배경은 밝은 tint) */\n')
w('const LAYER_COLORS = {\n')
for k, lab, col in LAYERS:
    w('  %-10s "%s",\n' % (k + ':', col))
w('};\n\n')

w('const TPL_UNIFIED_NODES = [\n')
for n in nodes:
    w('  { id: "%s", group: "%s", layer: "%s", label: "%s",\n'
      % (esc(n['id']), n['group'], n['layer'], esc(n['label'])))
    w('    summary: "%s",\n' % esc(n['summary']))
    w('    detail: %s, src: "%s" },\n' % (jlist(n['detail']), esc(n['src'])))
w('];\n\n')

w('const TPL_UNIFIED_EDGES = [\n')
for e in edges:
    w('  { from: "%s", to: "%s" },\n' % (esc(e['from']), esc(e['to'])))
w('];\n\n')

w('const PROCESS_TEMPLATES = {\n')
w('  unified: {\n')
w('    name: "성과평가 프로세스 (MBO+OKR 통합)",\n')
w('    desc: "OKR/MBO 핵심개념 + 정렬·연계 + 변화관리 + 성과평가 연계 + 통합 4단계(목표수립→실행·점검→평가→피드백).",\n')
w('    layers: {\n')
for k, lab, col in LAYERS:
    w('      %-8s { label: "%s", color: "%s" },\n' % (k + ':', lab, col))
w('    },\n')
w('    groupLayer: { core: "core" },\n')
w('    nodes: TPL_UNIFIED_NODES, edges: TPL_UNIFIED_EDGES\n')
w('  }\n')
w('};\n\n')
w('const DEFAULT_TEMPLATE = "unified";\n\n')
w('/* 하위 호환 전역 */\n')
w('const NODES = PROCESS_TEMPLATES[DEFAULT_TEMPLATE].nodes;\n')
w('const EDGES = PROCESS_TEMPLATES[DEFAULT_TEMPLATE].edges;\n')
o.close()
print('nodes=%d edges=%d' % (len(nodes), len(edges)))
