/* ============================================================
 *  개인 E2E 성과관리 마인드맵 데이터
 *  출처: [HCG]성과관리 OKR Manual Deck + PM Manual(Masterbook)
 *        + 기획회의(개인 E2E 성과관리 / 1단계 목표수립) 내용 결합
 *
 *  구조 (v3 — 프로세스 템플릿 도입)
 *  ----------------------------------------------------------
 *   GROUPS            : 기능(그룹) 분류 — 노드 색상 기준. 상단 '그룹 필터' 축.
 *   PROCESS_TEMPLATES : 성과관리 프로세스 종류별 트리(초기 데이터) 모음.
 *                       각 템플릿:
 *                         name        화면 표시명
 *                         desc        한 줄 설명
 *                         layers      두 번째 필터 축('Layer/구분') 정의 {key:{label}}
 *                         groupLayer  group → layer 기본 매핑(노드에 layer 미지정 시 사용)
 *                         nodes       [{ id, group, layer?, label, summary, detail[] }]
 *                         edges       [{ from, to, dashes? }]
 *
 *  필터 2축(요구사항 6, AND/교집합):
 *     노드 표시 = (group 필터 ON) AND (layer 필터 ON)
 *     노드의 layer = node.layer || template.groupLayer[node.group] || '_'
 *
 *  각 노드는 반드시 group 속성을 가진다.
 * ============================================================ */

/* ---------- 기능(그룹) 분류 : 색상 기준 ---------- */
const GROUPS = {
  core:      { label: "중심",     color: "#1c1e21" },
  process:   { label: "프로세스", color: "#0064e0" },
  objective: { label: "목표",     color: "#1876f2" },
  context:   { label: "맥락",     color: "#385898" },
  indicator: { label: "지표",     color: "#31a24c" },
  principle: { label: "원칙",     color: "#f2a918" },
  operation: { label: "운영",     color: "#a121ce" },
  develop:   { label: "육성",     color: "#e41e3f" },
  evaluate:  { label: "평가",     color: "#0457cb" },
  data:      { label: "데이터",   color: "#f7b928" },
  content:   { label: "내용",     color: "#1876f2" },
  activity:  { label: "액티비티", color: "#0064e0" },
  layer1:    { label: "Layer 1 · 인터페이스",     color: "#385898" },
  layer2:    { label: "Layer 2 · 오케스트레이션", color: "#e41e3f" },
  layer3:    { label: "Layer 3 · 보안·API",       color: "#1c1e21" },
  layer4:    { label: "Layer 4 · 분산 데이터",     color: "#a121ce" }
};

/* ============================================================
 *  템플릿 1 — E2E 통합 (성과관리 + HR AI 4-Layer 아키텍처)  [기본]
 *  기존 데이터 전체. layer 축 = 성과관리 / Layer1~4.
 * ============================================================ */
const TPL_E2E_NODES = [
  /* ---------- CORE ---------- */
  {
    id: "root", group: "core", label: "개인 E2E\n성과관리",
    title: "개인 단위의 End-to-End 성과관리 체계",
    summary: "목표수립 → 체크인(중간점검) → 평가 → 피드백으로 이어지는 개인 단위 End-to-End 성과관리 전체 흐름.",
    detail: [
      "조직 목표를 개인 목표로 연결하고, 그 달성 과정을 상시 점검·피드백하는 일련의 순환 체계.",
      "기존 MBO의 한계(통제·연단위·결과편중·형식화·평가도구화)를 보완하기 위해 OKR 원칙과 CSF/KPI 기반 목표수립을 결합.",
      "핵심 흐름: ① 목표수립 → ② Mid-year Review(체크인) → ③ 평가 → ④ Feedback → (차기 목표로 순환)."
    ], src: "OKR Deck p.3 · PM Manual p.5"
  },

  /* ---------- PROCESS (E2E 4단계) ---------- */
  {
    id: "p1", group: "process", label: "1단계\n목표수립",
    summary: "상위 조직 목표와 개인 고유업무를 고려해 자기 목표(KPI·목표수준·가중치)를 수립하고 검토회의로 확정.",
    detail: [
      "시기: 통상 2~3월.",
      "흐름: 직무내용 Review → 역할책임 정의 → CSF 도출 → KPI 매칭 → 목표수준/가중치 설정 → 목표 검토회의 → 확정·서명.",
      "산출물: 개인 목표설정서(경영성과 평가서), 전략 MBO 계획서·Milestone(중역).",
      "이 단계가 이번 회의의 핵심 주제 — '맥락'과 '지표' 가지가 모두 여기로 모인다."
    ], src: "PM Manual p.5"
  },
  {
    id: "p2", group: "process", label: "2단계\nMid-year Review\n(체크인)",
    summary: "평가자–피평가자 1:1 중간점검으로 목표 달성도를 점검하고 하반기 Catch-up 계획을 협의.",
    detail: [
      "시기: 통상 7월 (2분기 QBR과 연계).",
      "피평가자가 본인 중간점검 양식으로 달성도·부진원인·지원필요사항 설명.",
      "부진 항목 개선방향, Resource(인력/예산) 재배분, Milestone 조정 협의.",
      "OKR에서는 상시 '체크인(Check-in)' / Weekly Briefing으로 운영."
    ], src: "PM Manual p.5"
  },
  {
    id: "p3", group: "process", label: "3단계\n평가",
    summary: "자기평가 → 상사평가 → Calibration → 평가결과 확정·보상연계.",
    detail: [
      "시기: 통상 12~1월.",
      "자기평가(실적 집계·평점) → 상사평가(타당성 검토·정성평가) → Calibration Meeting(1·2차 평가자 조정).",
      "결과적 측정이 아닌 '성과의 해석': 목표 난이도·대내외 이슈를 고려한 상대적 판단.",
      "인재 스냅샷·Talent Session으로 객관성·공정성 보강."
    ], src: "PM Manual p.5"
  },
  {
    id: "p4", group: "process", label: "4단계\nFeedback",
    summary: "1:1 Feedback 면담으로 평가결과·성과급 근거를 공유하고 차년도 개선점을 협의.",
    detail: [
      "시기: 통상 1월.",
      "Feedback Note: 조직성과·개인성과·성과급 지급률·주요 코멘트.",
      "자기평가와 Gap 큰 항목, 미달성 KPI 중심으로 상세 논의.",
      "차기 목표 수립 시 고려사항으로 연결 → E2E 순환 완성."
    ], src: "PM Manual p.5"
  },

  /* ---------- OBJECTIVE (1단계 목표수립 세부) ---------- */
  {
    id: "o_job", group: "objective", label: "직무내용\nReview",
    summary: "사업계획·상위 조직장 목표·핵심 고유업무를 먼저 검토.",
    detail: [
      "Input: 사업계획, 상위 조직장의 목표 수립 결과, 핵심 고유업무.",
      "개인이 실제 책임지는 Main Task를 명확히 한다.",
      "이후 역할책임·CSF 도출의 출발점."
    ], src: "PM Manual p.10"
  },
  {
    id: "o_role", group: "objective", label: "역할책임\n정의",
    summary: "상위 조직장 목표 달성을 지원하기 위한 본인의 역할·책임을 정의.",
    detail: [
      "Cascading Matrix로 팀 KPI 대비 개인의 역할 정도(전체/일부 책임)를 가시화.",
      "주요 역할 → 개인 KPI로 연결되는 다리."
    ], src: "PM Manual p.10"
  },
  {
    id: "o_csf", group: "objective", label: "CSF 도출",
    summary: "핵심 고유업무별 핵심성공요인(Critical Success Factor)을 정의.",
    detail: [
      "Main Task를 성공적으로 수행하기 위한 기본적·핵심적 요건.",
      "Process/Function Charting 또는 Customer Mapping으로 도출.",
      "CSF → 성과 수준을 측정할 KPI로 연결."
    ], src: "PM Manual p.10"
  },
  {
    id: "o_kpi", group: "objective", label: "KPI 매칭",
    summary: "CSF별 성과수준을 측정할 KPI를 KPI Pool에서 선정.",
    detail: [
      "CSF에 대해 측정 가능한 KPI Pool을 구성.",
      "7대 적정성 기준(최소 3개 적용)으로 선정·검증.",
      "재무/전략/인재 KPI 균형 고려."
    ], src: "PM Manual p.10"
  },
  {
    id: "o_target", group: "objective", label: "목표수준\n설정",
    summary: "KPI별 계획(100)·Threshold(90)·Cap(120)과 전년도 실적을 설정.",
    detail: [
      "Target Level = (당해 Target − 전년도 실적) / 전년도 실적.",
      "도전적이되 달성가능(SMART)한 수준으로 설정.",
      "전년도 실적·특별요인을 평가 시 고려요소로 명시."
    ], src: "PM Manual p.10"
  },
  {
    id: "o_weight", group: "objective", label: "가중치\n부여",
    summary: "KPI 항목별 Impact·전략적 중요도에 따라 가중치 배분.",
    detail: [
      "변별력 유지 가능한 적정 항목 수.",
      "개발(육성) 항목 가중치 최소 5% 이상 권장.",
      "재무/전략/인재 카테고리 Balance 점검."
    ], src: "PM Manual p.10"
  },
  {
    id: "o_confirm", group: "objective", label: "목표 검토회의\n· 확정",
    summary: "상위자와 Alignment·Target·가중치 적정성을 협의 후 서명·확정.",
    detail: [
      "목표 검토 Checklist + Cascading Matrix 활용.",
      "1차/2차 평가자 서명으로 Confirm.",
      "산출물: 목표설정서 수정·확정본, 검토회의 결과 정리."
    ], src: "PM Manual p.10"
  },

  /* ---------- CONTEXT (맥락: 목표수립 Input) ---------- */
  {
    id: "c_job", group: "context", label: "직무내용\n맥락",
    summary: "개인 Job Description·고유 업무. 'Specific'한 목표의 근거.",
    detail: [
      "개인의 역할/책임·업무 특성에 맞게 재무/전략 KPI가 도출되었는지 점검.",
      "Process/Function Charting의 출발 Input."
    ], src: "PM Manual p.10 · OKR Deck p.26"
  },
  {
    id: "c_strategy", group: "context", label: "전략 맥락",
    summary: "전사·BG 전략과제. 전략 KPI 도출의 근거.",
    detail: [
      "경영계획의 전략과제를 체계화·구체화(전략체계도).",
      "전략과제 달성에 영향을 주는 Key Driver → 예비 전략 KPI Pool.",
      "상위자 전략과제가 개인 전략 성과항목으로 배분되었는지 확인."
    ], src: "PM Manual p.10 · OKR Deck p.26"
  },
  {
    id: "c_upper", group: "context", label: "상위지표\n맥락",
    summary: "상위 조직 KPI·목표. 개인 목표가 여기에 기여(Alignment)해야 함.",
    detail: [
      "개인 KPI가 상위자 KPI/목표와 연계성이 있는가?",
      "개인 목표의 합이 상위자 목표 수준에 미달하지 않아야 함.",
      "Cascading Method(Top-down)의 기준."
    ], src: "PM Manual p.10 · OKR Deck p.26"
  },
  {
    id: "c_personal", group: "context", label: "개인 관점",
    summary: "개인 R&R·고객·산출물. Bottom-up 목표 발굴 관점.",
    detail: [
      "나의 주요 업무·산출물(성과)은 무엇인가?",
      "나의 고객은 누구이며 어떤 가치를 제공하는가? (Customer Mapping)",
      "성과 향상을 위해 가장 개선이 필요한 부분은?"
    ], src: "PM Manual p.10 · OKR Deck p.26"
  },
  {
    id: "c_prev", group: "context", label: "전년도 수준",
    summary: "전년도 실적·달성도·가중치. 목표수준 산정의 기준선.",
    detail: [
      "전년도 KPI 달성도·목표수준과 올해 목표수준 비교.",
      "전년도 대비 도전적인지, 가중치가 부당하게 축소되지 않았는지 점검.",
      "제외된 KPI 중 전년도 달성도 낮은 항목 확인."
    ], src: "PM Manual p.10 · OKR Deck p.26"
  },
  {
    id: "c_collab", group: "context", label: "협업 맥락",
    summary: "유관부서·협력조직과의 수평적 연결. Alignment의 한 축.",
    detail: [
      "협업 관계 조직 간 OKR 설정 시 섬세한 조정 필요.",
      "협업 조직 간 OKR Cycle 주기 일치 권장.",
      "Customer Mapping의 내부고객(지원부서·영업부 등)."
    ], src: "PM Manual p.10 · OKR Deck p.26"
  },
  {
    id: "c_support", group: "context", label: "보조 맥락\n(Support)",
    summary: "재무성과를 간접 지원하는 직무. Support OKR로 정렬.",
    detail: [
      "Core OKR: 재무성과 직접 창출/기여 → 직접적 Alignment.",
      "Support OKR: 자원·사람으로 간접 지원 → 간접적 Alignment.",
      "정성적 가치를 KR로 정량화, 구체적 Initiative 설정."
    ], src: "PM Manual p.10 · OKR Deck p.26"
  },

  /* ---------- INDICATOR (지표: CSF/KPI) ---------- */
  {
    id: "i_method", group: "indicator", label: "KPI 도출\n3대 방법",
    summary: "Cascading / Process·Function Charting / Customer Mapping.",
    detail: [
      "A. Cascading(Top-down): 상위 전략목표가 명확할 때.",
      "B. Process/Function Charting: 업무가 프로세스로 종결되는 조직.",
      "C. Customer Mapping: 대상 고객별 기대결과 중심(지원기능)."
    ], src: "PM Manual p.30 · OKR Deck"
  },
  {
    id: "i_cascading", group: "indicator", label: "Cascading\nMethod",
    summary: "전사 목표 → 하위조직 핵심성공요소 기준 목표 배분(Top-down).",
    detail: [
      "Span of Control·영향도를 감안해 목표 Cascading.",
      "재무 KPI는 Value Driver Tree로 Key Value Driver 도출."
    ], src: "PM Manual p.30 · OKR Deck"
  },
  {
    id: "i_vdt", group: "indicator", label: "Value\nDriver Tree",
    summary: "재무성과 증감 Driver 간 인과관계로 KPI Pool 도출.",
    detail: [
      "목표 + 달성방안으로 구성, MECE하게 점차 구체화.",
      "예) 수익향상 = 매출증대 + 비용감소 → 고객기반 확대 …",
      "재무/전략/운영 KPI 모두에 적용 가능."
    ], src: "PM Manual p.30 · OKR Deck"
  },
  {
    id: "i_process", group: "indicator", label: "Process/Function\nCharting",
    summary: "Biz Process → Main Task → CSF → KPI Pool 순으로 도출.",
    detail: [
      "Value Chain에서 주요 Biz Process/Main Function 도출.",
      "Step: Process정의 → 고유 핵심업무 → CSF 정의 → KPI 도출.",
      "예) 직접 수주·Dealer 관리 → 기존고객 유지/신규창출 → 신규 고객 매출액."
    ], src: "PM Manual p.30 · OKR Deck"
  },
  {
    id: "i_customer", group: "indicator", label: "Customer\nMapping",
    summary: "고객 Needs 기준으로 활동 결과를 정의해 KPI 도출.",
    detail: [
      "고객 List-up·Category화 → 주요 역할/활동 → CSF → KPI.",
      "내부고객(지원부서/영업부/팀원/협력업체) 포함.",
      "예) 소비자 만족도 향상 → 고객 Needs Survey 이행률."
    ], src: "PM Manual p.30 · OKR Deck"
  },
  {
    id: "i_csf", group: "indicator", label: "핵심성공요인\nCSF",
    summary: "Main Task를 성공시키는 핵심 요건. KPI의 직전 단계.",
    detail: [
      "예) '정확한 시장정보 조기 파악', '기존고객 유지·신규창출'.",
      "CSF별로 측정 가능한 KPI를 매칭한다."
    ], src: "PM Manual p.30 · OKR Deck"
  },
  {
    id: "i_pool", group: "indicator", label: "KPI Pool",
    summary: "CSF에서 도출된 측정지표 후보군.",
    detail: [
      "도출 후 7대 적정성 기준으로 선정·검증.",
      "재무·전략·인재 카테고리로 분류."
    ], src: "PM Manual p.30 · OKR Deck"
  },
  {
    id: "i_select", group: "indicator", label: "KPI 선정\n7대 기준",
    summary: "Strategic·Measurable·Controllable·Easy-target·Action·Knowable·Balanced.",
    detail: [
      "Strategic: 전략·상위 KPI와 연계되는가?",
      "Measurable: 객관적 측정 가능한가?",
      "Controllable: 역할/책임 범위 내 통제 가능한가?",
      "Easy to set target / Action-enabling / Knowable / Balanced.",
      "최소 3개 이상 적용(보통 전략연계·측정·통제·목표설정 용이성)."
    ], src: "PM Manual p.30 · OKR Deck"
  },
  {
    id: "i_fin", group: "indicator", label: "재무 KPI",
    summary: "매출·EBIT·DSO 등 재무 목표. Core 직무에 직접 연계.",
    detail: ["VDT로 도출. 계획(100)/Threshold(90)/Cap(120)과 전년도 실적 명시."], src: "PM Manual p.30 · OKR Deck"
  },
  {
    id: "i_strat", group: "indicator", label: "전략 KPI",
    summary: "전략과제 달성도. 별도 전략MBO 계획서·Milestone 작성(중역).",
    detail: ["전략체계도·Key Driver 기반. 성공의 정의(중장기)·Action Plan 포함."], src: "PM Manual p.30 · OKR Deck"
  },
  {
    id: "i_people", group: "indicator", label: "인재 KPI",
    summary: "육성·조직역량 등 정성 가치. 정성가치를 KR로 정량화.",
    detail: ["개발 항목 가중치 최소 5% 이상 권장. HR이 Overall Review."], src: "PM Manual p.30 · OKR Deck"
  },

  /* ---------- PRINCIPLE (원칙) ---------- */
  {
    id: "pr_okr", group: "principle", label: "OKR 정의",
    summary: "Objective(목표) + Key Results(2~5개 핵심결과).",
    detail: [
      "Objective: 성취하고자 하는 것의 표현 — 간결·영감·도전적.",
      "Key Result: 진행과정을 측정하는 결과지표, 양적·측정가능.",
      "현상유지를 벗어나는 목표만이 진정한 목표."
    ], src: "OKR Deck p.15~17"
  },
  {
    id: "pr_fast", group: "principle", label: "FAST 원칙",
    summary: "Focus·Align·Stretch·Track. OKR 4대 핵심원칙.",
    detail: [
      "Focus(집중과 전념): 우선순위 3~5개 목표·각 5개 이하 KR.",
      "Align(정렬과 연결): 수직·수평 정렬, 투명성.",
      "Stretch(도전적 목표): 능력의 한계를 넘는 목표.",
      "Track & Update(추적과 변용): 지속/보완/시작/중단."
    ], src: "OKR Deck p.15~17"
  },
  {
    id: "pr_smart", group: "principle", label: "SMART 원칙",
    summary: "Specific·Measurable·Achievable·Realistic·Time-bound.",
    detail: [
      "목표 검토회의 Checklist의 핵심 기준.",
      "개인은 KPI와 연관된 3~5개 목표를 SMART하게 설정.",
      "측정 가능한 동사·기한 명시로 작성."
    ], src: "OKR Deck p.15~17"
  },
  {
    id: "pr_bii", group: "principle", label: "BII",
    summary: "Build·Improve·Innovate. 도전적 목표의 방향.",
    detail: [
      "Build: 기존에 없던 것을 만들어내거나,",
      "Improve: 기존의 것을 발전시키거나,",
      "Innovate: 혁신을 통해 재창조.",
      "직무특성별 OKR 수립(Core/Support)의 기준."
    ], src: "OKR Deck p.15~17"
  },

  /* ---------- OPERATION (운영) ---------- */
  {
    id: "op_checkin", group: "operation", label: "체크인 /\nMid-year Review",
    summary: "상시·중간 점검으로 진척을 확인하고 목표를 보완.",
    detail: [
      "공식 중간점검 면담(1:1) + 상시 체크인 병행.",
      "업무 진척도·달성 핵심결과·지원요청 3대 Agenda.",
      "성취/장애 시 회고로 지속·보완·중단 결정."
    ], src: "OKR Deck p.20~21"
  },
  {
    id: "op_weekly", group: "operation", label: "Weekly\nBriefing",
    summary: "Start Meeting(월)·Review Briefing(금)으로 주간 점검·회고.",
    detail: [
      "Start: 주간 달성계획·핵심결과를 Kanban/Scrum에 사전 공유.",
      "Review: 진척도·달성 KR·이슈 리뷰 후 Next Step.",
      "KPTA 검토법으로 Self-Check 구조화."
    ], src: "OKR Deck p.20~21"
  },
  {
    id: "op_cfr", group: "operation", label: "CFR",
    summary: "Conversation·Feedback·Recognition. OKR을 떠받치는 소통.",
    detail: [
      "OKR 프로세스를 성공적으로 운영하기 위한 뒷받침.",
      "Kudos(동료 감사)·360 피드백·배지로 인정 문화."
    ], src: "OKR Deck p.20~21"
  },
  {
    id: "op_review", group: "operation", label: "종합리뷰\n· 회고노트",
    summary: "개인 종합리뷰 → 상위관리자 리뷰 → OKR 지향노트.",
    detail: [
      "FAST 4축 체크리스트로 자가 종합리뷰.",
      "차기 OKR 정교화를 위한 참고자료.",
      "지속/보완/중단 결정 가이드."
    ], src: "OKR Deck p.20~21"
  },
  {
    id: "op_eval", group: "operation", label: "성과 해석",
    summary: "최종 결과가 아닌 난이도·이슈를 고려한 상대적 판단.",
    detail: [
      "목표 난이도(영향력·혁신성·복잡성·불확실성).",
      "환경 이슈(사회·시장·고객·경쟁사), 내부 이슈(전략·지원·권한·계약).",
      "BII 도전목표 70% 이상 달성 시 '달성했다' 판단."
    ], src: "OKR Deck p.20~21"
  },
  {
    id: "op_talent", group: "operation", label: "인재 스냅샷\n· Talent Session",
    summary: "성과·역량·종합 정보로 다각적 인재 논의(평가 오류 점검).",
    detail: [
      "성과곡선은 정규분포가 아닌 '멱함수' — 핵심인재 소수.",
      "관대화·가혹화·중심화·연공 오류 자가진단.",
      "논의를 통한 객관성·공정성 향상."
    ], src: "OKR Deck p.20~21"
  },
  {
    id: "op_change", group: "operation", label: "변화관리\n3단계",
    summary: "가치 정의 → 적용·촉진(Pioneer) → 전파·확장.",
    detail: [
      "Step1: 임원/CEO 변화의지·도전적 변화목표·장기투자.",
      "Step2: 소규모 Pioneer team 실행·문화 양성.",
      "Step3: 연속 Action Plan·역량향상·운영모델 확장·정착."
    ], src: "OKR Deck p.20~21"
  },
  {
    id: "op_action", group: "operation", label: "OKR 행동강령\n6가지",
    summary: "성장마인드·좋은질문·OKR공유·Alignment·책임주기·AD-FIT 코칭.",
    detail: [
      "① 성장 마인드 기르기(Growth Mindset 콘테스트).",
      "② 좋은 질문하기(What/How 중심·슬기로운 회의시간).",
      "③ OKR 공유하기(투명한 전사 공개).",
      "④ Alignment 연습하기(Transparency 미팅).",
      "⑤ 책임 주기 설정(Daily/Weekly/Monthly/Quarterly).",
      "⑥ AD-FIT 코칭(Assess·Define·Focus·Implement·Take-away)."
    ], src: "OKR Deck p.20~21"
  },

  /* ============================================================
   *  HR AI 아키텍처 4계층 (Layer 1~4)
   * ============================================================ */

  /* ---------- LAYER 1 · HR INTERFACE ---------- */
  {
    id: "l1_users", group: "layer1", label: "👤 임직원 · 리더\nHR 담당자",
    summary: "평가 대상자(임직원)·평가자(리더)·HR 인사 담당자 — 시스템 사용 주체.",
    detail: [
      "임직원: 평가 대상자.",
      "리더: 평가자.",
      "HR 담당자: 인사 운영 주체.",
      "각자의 사번·직급 권한 정보를 가지고 시스템에 접근."
    ], src: "기획회의 (HR AI 아키텍처)"
  },
  {
    id: "l1_agent", group: "layer1", label: "💬 HR AI Agent\n(UI/UX)",
    summary: "권한별 맞춤형 화면 및 챗봇 인터페이스 제공.",
    detail: [
      "사용자의 사번·직급 권한 정보와 함께 명령 전달.",
      "권한(Role)에 따라 노출 화면·기능을 차등 제공.",
      "자연어 챗봇으로 성과·보상 관련 질의 처리."
    ], src: "기획회의 (HR AI 아키텍처)"
  },

  /* ---------- LAYER 2 · ORCHESTRATION & SUB-AGENT ---------- */
  {
    id: "l2_manager", group: "layer2", label: "🤖 HR AI Manager",
    summary: "인사 거버넌스 및 데이터 권한 통제관.",
    detail: [
      "Interface Layer의 명령을 받아 실무 에이전트로 분배.",
      "데이터 권한·거버넌스의 중앙 통제 지점.",
      "Security Filter와 Multi-Agent System을 관장."
    ], src: "기획회의 (HR AI 아키텍처)"
  },
  {
    id: "l2_security", group: "layer2", label: "🛡️ Security Filter",
    summary: "사용자 권한(Role)별 데이터 접근 한도 최종 검증.",
    detail: [
      "Role 기반으로 접근 가능한 데이터 범위를 최종 게이트.",
      "권한 초과 요청 차단.",
      "API Gateway 진입 전 1차 검증선."
    ], src: "기획회의 (HR AI 아키텍처)"
  },
  {
    id: "l2_mas", group: "layer2", label: "⚙️ Multi-Agent\nSystem",
    summary: "역할 분담형 실무 에이전트 집합.",
    detail: [
      "업무별로 독립된 sub-Agent로 작업 분담.",
      "각 에이전트는 데이터망 진입 시 독립 인증 요청."
    ], src: "기획회의 (HR AI 아키텍처)"
  },
  {
    id: "l2_perf", group: "layer2", label: "[실무1] Performance\nEvaluation Agent",
    summary: "정량/정성 성과 분석 실무 에이전트.",
    detail: [
      "KPI 달성도·정성평가 데이터 분석.",
      "E2E 프로세스의 '평가' 단계를 지원.",
      "데이터망 진입을 위한 독립 인증 요청."
    ], src: "기획회의 (HR AI 아키텍처)"
  },
  {
    id: "l2_comp", group: "layer2", label: "[실무2] Compensation\nCalibration Agent",
    summary: "보상 및 연봉 조정 시뮬레이션 실무 에이전트.",
    detail: [
      "성과 결과 기반 보상·연봉 조정 시뮬레이션.",
      "E2E 프로세스의 'Feedback·보상연계'를 지원.",
      "데이터망 진입을 위한 독립 인증 요청."
    ], src: "기획회의 (HR AI 아키텍처)"
  },

  /* ---------- LAYER 3 · SECURITY & API INTEGRATION ---------- */
  {
    id: "l3_gw", group: "layer3", label: "🔒 HR API Gateway\n& IAM",
    summary: "HR 데이터 권한 독립성 게이트웨이 — 권한 격리의 핵심.",
    detail: [
      "각 데이터망에 대한 독립 인증·권한 격리 수행.",
      "Open API 기반 권한 격리 접근 / 사내 폐쇄망 보안 접근 / 의미적 탐색으로 분기.",
      "IAM(Identity & Access Management)으로 신원·접근 통제."
    ], src: "기획회의 (HR AI 아키텍처)"
  },
  {
    id: "l3_saas", group: "layer3", label: "🌐 SaaS 전용 API",
    summary: "개별 테넌트 인증 (OAuth 2.0 토큰 기반, 사외 클라우드 보안).",
    detail: [
      "테넌트별 OAuth 2.0 토큰 인증.",
      "사외 클라우드(SaaS) 보안 연동.",
      "→ SaaS Platform Data Layer 접근."
    ], src: "기획회의 (HR AI 아키텍처)"
  },
  {
    id: "l3_onprem", group: "layer3", label: "🧱 On-Prem 전용 API",
    summary: "사내 망분리 연동 (VPN/전용선, DB 접근 제어 솔루션).",
    detail: [
      "VPN/전용선 기반 사내 망분리 연동.",
      "DB 접근 제어 솔루션 적용.",
      "→ On-Premise Core Systems 접근."
    ], src: "기획회의 (HR AI 아키텍처)"
  },
  {
    id: "l3_mask", group: "layer3", label: "👁️ Data Masking\nTool",
    summary: "주민번호·사번 등 민감정보 실시간 비식별화 처리.",
    detail: [
      "민감정보(주민번호·사번 등) 실시간 비식별화.",
      "SaaS·On-Prem 데이터에 마스킹 적용.",
      "권한 외 사용자에게 원본 노출 차단."
    ], src: "기획회의 (HR AI 아키텍처)"
  },

  /* ---------- LAYER 4 · FEDERATED HR DATA ---------- */
  {
    id: "l4_saas", group: "layer4", label: "[4-A] SaaS Platform\nData Layer",
    summary: "외부 클라우드 기반 협업/활동 데이터.",
    detail: ["HRIS·소통·협업/산출물 데이터를 SaaS 형태로 보관."], src: "기획회의 (HR AI 아키텍처)"
  },
  { id: "l4a_1", group: "layer4", label: "Workday /\nSuccessFactors",
    summary: "HRIS (인사정보 시스템).", detail: ["클라우드 기반 핵심 인사정보 관리."], src: "기획회의 (HR AI 아키텍처)"
  },
  { id: "l4a_2", group: "layer4", label: "Slack / MS Teams",
    summary: "소통 데이터.", detail: ["협업 메신저 기반 커뮤니케이션 활동 데이터."], src: "기획회의 (HR AI 아키텍처)"
  },
  { id: "l4a_3", group: "layer4", label: "Jira / Confluence",
    summary: "협업/산출물 데이터.", detail: ["과제·문서 산출물 및 협업 이력."], src: "기획회의 (HR AI 아키텍처)"
  },

  {
    id: "l4_onprem", group: "layer4", label: "[4-B] On-Premise\nCore Systems",
    summary: "사내 폐쇄망 기반 코어 인사.",
    detail: ["구축형 ERP·급여·징계 등 민감 코어 데이터를 폐쇄망에 보관."], src: "기획회의 (HR AI 아키텍처)"
  },
  { id: "l4b_1", group: "layer4", label: "SAP / Oracle ERP",
    summary: "구축형 ERP.", detail: ["온프레미스 전사 자원관리 시스템."], src: "기획회의 (HR AI 아키텍처)"
  },
  { id: "l4b_2", group: "layer4", label: "급여/보상\n레거시",
    summary: "사내 급여·보상 레거시 시스템.", detail: ["민감 보상 데이터 — 강한 접근통제 필요."], src: "기획회의 (HR AI 아키텍처)"
  },
  { id: "l4b_3", group: "layer4", label: "징계·인사위\n문서",
    summary: "징계 기록 및 인사위원회 문서.", detail: ["최고 민감 등급 — 마스킹·권한 격리 필수."], src: "기획회의 (HR AI 아키텍처)"
  },

  {
    id: "l4_llm", group: "layer4", label: "[4-C] LLM Context\nData Layer",
    summary: "특정 회사 고유 맥락 지식 DB.",
    detail: ["의미적 탐색(semantic search)용 사내 고유 맥락 지식."], src: "기획회의 (HR AI 아키텍처)"
  },
  { id: "l4c_1", group: "layer4", label: "Vector DB",
    summary: "사내 규정·평가기준 임베딩.", detail: ["규정/평가기준 문서를 벡터화하여 의미 검색."], src: "기획회의 (HR AI 아키텍처)"
  },
  { id: "l4c_2", group: "layer4", label: "지식 그래프",
    summary: "조직도·업무 관계.", detail: ["조직도·업무 관계를 그래프로 구조화."], src: "기획회의 (HR AI 아키텍처)"
  },
  { id: "l4c_3", group: "layer4", label: "신년사 ·\n인재상",
    summary: "경영진 신년사 및 인재상 텍스트.", detail: ["회사 고유 가치·인재상 맥락 텍스트."], src: "기획회의 (HR AI 아키텍처)"
  }
];

const TPL_E2E_EDGES = [
  /* root → E2E 프로세스 */
  { from: "root", to: "p1" },
  { from: "root", to: "p2" },
  { from: "root", to: "p3" },
  { from: "root", to: "p4" },
  { from: "p1", to: "p2" }, { from: "p2", to: "p3" }, { from: "p3", to: "p4" },
  { from: "p4", to: "p1", dashes: true }, /* 순환 */

  /* 1단계 목표수립 세부 활동 */
  { from: "p1", to: "o_job" },
  { from: "o_job", to: "o_role" },
  { from: "o_role", to: "o_csf" },
  { from: "o_csf", to: "o_kpi" },
  { from: "o_kpi", to: "o_target" },
  { from: "o_target", to: "o_weight" },
  { from: "o_weight", to: "o_confirm" },

  /* 맥락 → 목표수립 Input */
  { from: "p1", to: "c_job" },
  { from: "p1", to: "c_strategy" },
  { from: "p1", to: "c_upper" },
  { from: "p1", to: "c_personal" },
  { from: "p1", to: "c_prev" },
  { from: "p1", to: "c_collab" },
  { from: "p1", to: "c_support" },
  /* 맥락 → 구체 활동 연결 */
  { from: "c_job", to: "o_job", dashes: true },
  { from: "c_personal", to: "o_role", dashes: true },
  { from: "c_strategy", to: "i_strat", dashes: true },
  { from: "c_upper", to: "i_cascading", dashes: true },
  { from: "c_prev", to: "o_target", dashes: true },
  { from: "c_collab", to: "i_customer", dashes: true },
  { from: "c_support", to: "i_people", dashes: true },

  /* 지표(CSF/KPI) 가지 */
  { from: "o_csf", to: "i_csf" },
  { from: "o_kpi", to: "i_pool" },
  { from: "i_csf", to: "i_pool" },
  { from: "i_pool", to: "i_select" },
  { from: "o_csf", to: "i_method" },
  { from: "i_method", to: "i_cascading" },
  { from: "i_method", to: "i_process" },
  { from: "i_method", to: "i_customer" },
  { from: "i_cascading", to: "i_vdt" },
  { from: "i_process", to: "i_csf", dashes: true },
  { from: "i_customer", to: "i_csf", dashes: true },
  { from: "i_select", to: "i_fin" },
  { from: "i_select", to: "i_strat" },
  { from: "i_select", to: "i_people" },
  { from: "i_vdt", to: "i_fin", dashes: true },

  /* 원칙 */
  // { from: "root", to: "pr_okr" },
  { from: "pr_okr", to: "pr_fast" },
  { from: "pr_okr", to: "pr_bii" },
  { from: "p1", to: "pr_smart", dashes: true },
  { from: "o_target", to: "pr_smart", dashes: true },
  { from: "pr_fast", to: "o_confirm", dashes: true },
  { from: "pr_bii", to: "i_strat", dashes: true },

  /* 운영 */
  // { from: "root", to: "op_checkin" },
  { from: "p2", to: "op_checkin" },
  { from: "op_checkin", to: "op_weekly" },
  { from: "op_weekly", to: "op_cfr" },
  { from: "op_checkin", to: "op_review" },
  { from: "p3", to: "op_eval" },
  { from: "p3", to: "op_talent" },
  { from: "op_review", to: "p4", dashes: true },
  // { from: "root", to: "op_change" },
  { from: "op_change", to: "op_action" },
  { from: "op_action", to: "op_cfr", dashes: true },

  /* ===== HR AI 아키텍처 계층 연결 ===== */
  /* L1 → L2 */
  { from: "l1_users", to: "l1_agent" },
  { from: "l1_agent", to: "l2_manager" },
  /* L2 내부 */
  { from: "l2_manager", to: "l2_security" },
  { from: "l2_manager", to: "l2_mas" },
  { from: "l2_mas", to: "l2_perf" },
  { from: "l2_mas", to: "l2_comp" },
  /* L2 → L3 */
  { from: "l2_perf", to: "l3_gw" },
  { from: "l2_comp", to: "l3_gw" },
  { from: "l2_security", to: "l3_gw", dashes: true },
  /* L3 내부 분기 */
  { from: "l3_gw", to: "l3_saas" },
  { from: "l3_gw", to: "l3_onprem" },
  { from: "l3_gw", to: "l3_mask" },
  /* L3 → L4 */
  { from: "l3_saas", to: "l4_saas" },
  { from: "l3_onprem", to: "l4_onprem" },
  { from: "l3_gw", to: "l4_llm", dashes: true },
  { from: "l3_mask", to: "l4_onprem", dashes: true },
  { from: "l3_mask", to: "l4_saas", dashes: true },
  /* L4 데이터 소스 */
  { from: "l4_saas", to: "l4a_1" },
  { from: "l4_saas", to: "l4a_2" },
  { from: "l4_saas", to: "l4a_3" },
  { from: "l4_onprem", to: "l4b_1" },
  { from: "l4_onprem", to: "l4b_2" },
  { from: "l4_onprem", to: "l4b_3" },
  { from: "l4_llm", to: "l4c_1" },
  { from: "l4_llm", to: "l4c_2" },
  { from: "l4_llm", to: "l4c_3" },
  /* 아키텍처 ↔ E2E 프로세스 통합(보조 연결) */
  // { from: "root", to: "l1_agent", dashes: true },
  { from: "l2_perf", to: "p3", dashes: true },
  { from: "l2_comp", to: "p4", dashes: true },

  /* 2-D 정합화 — 프로세스 ↔ CSF/KPI ↔ Alignment 의미 교차(rel) */
  { from: "o_kpi", to: "i_select", rel: "measure", dashes: true },
  { from: "i_select", to: "o_target", rel: "measure", dashes: true },
  { from: "c_upper", to: "p1", rel: "align", dashes: true },
  { from: "o_confirm", to: "p3", rel: "contribute", dashes: true }
];

/* ============================================================
 *  템플릿 2 — OKR 기반 성과관리
 *  (출처: HCG OKR Manual Deck — Define/Measure/Review/Track)
 * ============================================================ */
const TPL_OKR_NODES = [
  { id: "root", group: "core", layer: "common", label: "OKR 기반\n성과관리",
    summary: "Objective(목표) + Key Results(핵심결과)를 수립·측정·리뷰·개선하는 상시 순환형 성과관리.",
    detail: [
      "MBO의 Top-down·통제 한계를 보완하는 '자율·정렬·도전' 중심 모델.",
      "프로세스: Define(목표수립) → Measuring(측정) → Reviewing(리뷰) → Track & Update(추적·개선).",
      "짧은 주기로 필요시 상시 운영되는 것이 핵심."
    ] },

  { id: "ok_define", group: "process", layer: "define", label: "① 목표수립\nDefine",
    summary: "조직·개인 R&R 브레인스토밍으로 목표와 핵심결과를 설정하고 수직·수평 정렬.",
    detail: [
      "5~7개 목표 Pool 작성 후 우선순위 목표 선정.",
      "수직 정렬(팀장-팀원, 임원-관리자), 수평 정렬(팀원 간·협업부서 간).",
      "OKR 핵심원칙(FAST)과 목표의 의미를 고려."
    ] },
  { id: "ok_measure", group: "process", layer: "measure", label: "② 측정\nMeasuring",
    summary: "각 KR을 측정해 목표 진행 수준을 산출하고 자기 점검·승인.",
    detail: [
      "OKR 진행 과정을 기록/측정.",
      "각 KR 측정값으로 목표 달성률 산출.",
      "개인·조직 단위 진척도 가시화."
    ] },
  { id: "ok_review", group: "process", layer: "review", label: "③ 리뷰\nReviewing",
    summary: "개인·조직 단위 OKR을 점검하고 정렬 이슈·지원사항을 협의.",
    detail: [
      "개인 진척도 / 팀 단위 진척도 점검.",
      "개인-조직 정렬 이슈 및 지원 필요사항 도출.",
      "1:1 미팅으로 성과 공유·코칭."
    ] },
  { id: "ok_track", group: "process", layer: "track", label: "④ 추적·개선\nTrack & Update",
    summary: "Next OKR 회고 및 개선방안 논의 — 지속/보완/시작/중단 결정.",
    detail: [
      "목표 수준·우선순위 재논의.",
      "지속 / 보완 / 시작 / 중단 결정.",
      "다음 회기 OKR 정교화로 순환."
    ] },

  { id: "ok_obj", group: "objective", layer: "define", label: "Objective\n(목표)",
    summary: "성취하고자 하는 것 — 간결·영감·도전적. '무엇(What)'.",
    detail: [
      "현상유지를 벗어나는 도전적 방향.",
      "정성적이고 동기부여가 되는 한 문장.",
      "분기/반기 단위로 3~5개 집중."
    ] },
  { id: "ok_kr", group: "indicator", layer: "measure", label: "Key Results\n(핵심결과)",
    summary: "목표 진행을 측정하는 2~5개 결과지표 — 정량·측정가능. '어떻게(How)'.",
    detail: [
      "최선을 다했을 때 60~70% 달성 가능한 도전적 목표값.",
      "Baseline / Target / Threshold / Milestone Type으로 구성.",
      "Positive·Negative Metric 등 지표 Type 선택."
    ] },
  { id: "ok_pool", group: "indicator", layer: "define", label: "핵심결과\nPool",
    summary: "목표별 검증·추적 가능한 지표 Type과 도전적 목표값을 브레인스토밍한 후보군.",
    detail: [
      "목표 달성 여부를 '무엇으로' 알 수 있는가?",
      "달성 정도를 '어떻게' 측정할 것인가?",
      "유사 목표의 과거 달성결과를 참고해 목표값 산정."
    ] },

  { id: "ok_fast", group: "principle", layer: "common", label: "FAST 원칙",
    summary: "Focus·Align·Stretch·Track — OKR 4대 핵심원칙.",
    detail: [
      "Focus: 우선순위 3~5개 목표, 각 5개 이하 KR.",
      "Align: 수직·수평 정렬과 투명성.",
      "Stretch: 능력의 한계를 넘는 도전.",
      "Track & Update: 지속/보완/시작/중단."
    ] },
  { id: "ok_core", group: "objective", layer: "define", label: "Core OKR",
    summary: "재무성과를 직접 창출·기여하는 직무의 OKR (직접 Alignment).",
    detail: [
      "예) 영업: '영업매출 100억 달성' + 재방문 매출·만족도 KR.",
      "재무성과와 직접 연결되는 핵심 목표."
    ] },
  { id: "ok_support", group: "objective", layer: "define", label: "Support OKR",
    summary: "자원·사람으로 간접 지원하는 직무의 OKR (간접 Alignment).",
    detail: [
      "Core OKR과 충돌하지 않는가? 다른 Support OKR과 충돌하지 않는가? 검토.",
      "예) HR: '누구나 입사하고 싶은 영업환경 구축', IT: '업무 효율화 지원'.",
      "정성 가치를 KR로 정량화."
    ] },

  { id: "ok_checkin", group: "operation", layer: "measure", label: "상시 체크인\nCheck-in",
    summary: "매주/격주 상시 점검 — 진척도·이슈·지원요청 공유.",
    detail: [
      "Weekly Briefing(Start/Review)과 연계.",
      "Kanban/Scrum으로 사전 공유 후 리뷰.",
      "KPTA 검토법으로 Self-Check."
    ] },
  { id: "ok_cfr", group: "operation", layer: "review", label: "CFR\n(소통)",
    summary: "Conversation·Feedback·Recognition — OKR을 떠받치는 소통 체계.",
    detail: [
      "정기 1:1 대화로 성과 공유·코칭.",
      "수시 피드백으로 방향 조정.",
      "Kudos(동료 감사)·배지로 인정 문화."
    ] },
  { id: "ok_calib", group: "operation", layer: "review", label: "등급 조정\nCalibration",
    summary: "매니저들이 모든 개인 등급을 함께 검토·조정해 공정성·객관성 확보.",
    detail: [
      "자기/동료/관리자 평가 결과 종합으로 등급 초안 도출.",
      "Calibration Meeting으로 등급 조정.",
      "반기 단위(연 2회) 절대평가 기반."
    ] },
  { id: "ok_mindset", group: "principle", layer: "common", label: "성장 마인드\n· 행동강령",
    summary: "Growth Mindset·좋은 질문·투명 공유·Alignment 연습·AD-FIT 코칭.",
    detail: [
      "성장 마인드 기르기, 좋은 질문하기(What/How).",
      "OKR 투명 공유, Alignment 연습.",
      "책임 주기 설정, AD-FIT 코칭.",
      "OKR Deck p.88"
    ], src: "OKR Deck p.88" },

  /* ===== 2-A 보강: 이론·배경 ===== */
  { id: "ok_history", group: "principle", layer: "common", label: "성과관리\nHistory",
    summary: "테일러리즘·포디즘(생산성) → MBO(목표경영) → iMBO/OKR로 진화.",
    detail: [
      "테일러리즘: 작업시간·동작 분석으로 생산성 향상(과학적 관리법).",
      "포디즘: 컨베이어 벨트로 공정별 시간관리·생산성 극대화.",
      "MBO: 지시 수행을 넘어 스스로 문제를 찾고 공동 목표로 성과 창출.",
      "OKR Deck p.3"
    ], src: "OKR Deck p.3" },
  { id: "ok_mbolimit", group: "principle", layer: "common", label: "MBO 5대\n한계",
    summary: "Top-down 통제·연단위 경직·결과(재무) 편중·형식화·평가도구화.",
    detail: [
      "① Top-down: 경영진 입맛 목표를 일방 부과 → 통제 수단화.",
      "② Yearly: 연 단위 경직 목표로 실제 업무·성과와 Mismatch.",
      "③ Result-oriented: 과거·재무 수치 편중, 과정·비재무 간과.",
      "④ Official&Formal: 절차적 정당성 위한 형식적 문서화.",
      "⑤ Tool for Incentives: 보상 연계로 보수적 목표 설정.",
      "OKR Deck p.4~9"
    ], src: "OKR Deck p.4~9" },
  { id: "ok_change", group: "principle", layer: "common", label: "변화 기업\n사례",
    summary: "Google·MS·Adobe·GE — 상시·절대평가·코칭형 육성평가로 전환.",
    detail: [
      "Google: 반기 절대평가 + Kudos(동료 감사 포인트) + 상시 피드백.",
      "Microsoft: Stack Ranking 폐지 → Connect Meeting·협업 강조.",
      "Adobe: 연 1회 평가 폐지 → 분기 Check-in·상시 피드백.",
      "GE: 상대평가 폐지 → PD@GE로 목표·업무·피드백 통합.",
      "OKR Deck p.10~13"
    ], src: "OKR Deck p.10~13" },
  { id: "ok_origin", group: "principle", layer: "common", label: "OKR 기원",
    summary: "Andy Grove(Intel, iMBO=OKR) → John Doerr가 Google에 소개.",
    detail: [
      "1968~ Andy Grove: MBO 한계 개선, 인텔만의 iMBO(=OKR) 구축.",
      "1974 John Doerr: 인텔에서 OKR 경험.",
      "1999~ Google에 소개 → 실리콘밸리 전체로 확산.",
      "OKR Deck p.14"
    ], src: "OKR Deck p.14" },
  { id: "ok_bii", group: "objective", layer: "define", label: "진정한 목표\nBII",
    summary: "Build·Improve·Innovate — 현상 유지를 벗어나는 도전적 목표.",
    detail: [
      "Build: 기존에 없던 것을 만들어내거나,",
      "Improve: 기존의 것을 발전시키거나,",
      "Innovate: 혁신을 통해 재창조.",
      "“현상 유지에서 벗어나도록 설계되지 않았다면 진정한 목표가 아니다.”",
      "OKR Deck p.16"
    ], src: "OKR Deck p.16" },
  { id: "ok_newrules", group: "principle", layer: "common", label: "New vs\nOld Rules",
    summary: "MBO의 형식적·경직적 규칙 → OKR의 자유·일상·수평적 규칙.",
    detail: [
      "Old(MBO): 연단위·하향식·비공개·형식적 평가 연계.",
      "New(OKR): 상시·자율·투명 공개·수평적 정렬.",
      "OKR Deck p.18"
    ], src: "OKR Deck p.18" },

  /* ===== 2-A 보강: OKR Canvas 5단계 ===== */
  { id: "ok_canvas", group: "process", layer: "define", label: "OKR Canvas",
    summary: "개인 OKR 수립 Tool — 목표·핵심결과를 Brainstorming·우선순위화·확정.",
    detail: [
      "① 목표 Brainstorming → ② 목표 우선순위화 →",
      "③ 핵심결과 Brainstorming → ④ 핵심결과 우선순위화 → ⑤ 개인 OKR 확정.",
      "팀원(담당자)·팀장(관리자) 1시간 내 논의로 3~5개 목표 확정.",
      "OKR Deck p.24~25"
    ], src: "OKR Deck p.24~25" },
  { id: "ok_c1", group: "objective", layer: "define", label: "①목표\nBrainstorming",
    summary: "전사·조직 OKR·개인 R&R 고려해 영감 주는 목표 5~7개 Pool 작성.",
    detail: [
      "전사 Mission·OKR에 내 업무가 어떻게 기여하는가?",
      "개인 R&R: 주요 업무·산출물·고객·개선필요 영역은?",
      "OKR 핵심원칙(FAST)과 목표의 의미를 반영.",
      "OKR Deck p.26"
    ], src: "OKR Deck p.26" },
  { id: "ok_c2", group: "objective", layer: "define", label: "②목표\n우선순위화",
    summary: "상위·협력 조직 OKR 연계 최우선 + 중요성·시급성으로 3~5개 선정.",
    detail: [
      "상위 조직 및 협력 조직 OKR 연계를 최우선.",
      "목표의 중요성·시급성 기준 우선순위화.",
      "최종 3~5개 목표로 압축.",
      "OKR Deck p.28"
    ], src: "OKR Deck p.28" },
  { id: "ok_c3", group: "indicator", layer: "define", label: "③핵심결과\nBrainstorming",
    summary: "목표별 검증·추적 가능한 지표 Type + 60~70% 도전적 목표값 Pool.",
    detail: [
      "목표 달성을 무엇으로 알 수 있는가? 어떻게 측정하는가?",
      "유사 목표의 과거 달성결과 참고해 목표값 산정.",
      "핵심결과 Pool 작성.",
      "OKR Deck p.30"
    ], src: "OKR Deck p.30" },
  { id: "ok_c4", group: "indicator", layer: "define", label: "④핵심결과\n우선순위화",
    summary: "영향력·실현가능성으로 유형화해 목표별 3~5개 핵심결과 도출.",
    detail: [
      "목표 달성도에 미치는 영향력 기준.",
      "목표값 도달 실현가능성 기준.",
      "각 목표별 3~5개 KR 확정.",
      "OKR Deck p.32"
    ], src: "OKR Deck p.32" },
  { id: "ok_c5", group: "process", layer: "define", label: "⑤개인 OKR\n확정",
    summary: "목표주기·공개범위·연계목표·측정방법 결정 후 OKR 확정·점검.",
    detail: [
      "목표 주기, 공개 범위, 연계 목표, 측정 구성요소 결정.",
      "확정 Checklist로 잘 수립되었는지 점검.",
      "OKR Deck p.34"
    ], src: "OKR Deck p.34" },
  { id: "ok_checklist", group: "principle", layer: "define", label: "수립 점검\nChecklist",
    summary: "FAST 4축(집중·정렬·도전·추적) 항목별 OKR 수립 적정성 점검.",
    detail: [
      "Focus: 목표·핵심결과 우선순위가 명확한가?",
      "Align: 미션·상위/협력 조직 OKR과 연계되는가?",
      "Stretch: 충분히 도전적·영감을 주는가?",
      "Track&Update: 측정·추적 가능하고 구체적인가?",
      "OKR Deck p.36"
    ], src: "OKR Deck p.36" },
  { id: "ok_initiative", group: "objective", layer: "define", label: "Initiative\n설정",
    summary: "목표·핵심결과 달성을 위한 실행과제를 추가해 운영을 구체화.",
    detail: [
      "OKR 수립 후 달성을 위한 Initiative(실행 과제) 정의.",
      "실행 과정을 구체화해 효과적 운영.",
      "OKR Deck p.37"
    ], src: "OKR Deck p.37" },
  { id: "ok_confidence", group: "indicator", layer: "measure", label: "Confidence\nLevel",
    summary: "주차별 자신감 점수로 진척 추적, 60~70% 달성 가능한 도전 목표값.",
    detail: [
      "구글 OKR 운영표: 주차(w2~w10)별 Confidence Level 기록.",
      "최선을 다했을 때 60~70% 달성하는 도전적 목표값이 적정.",
      "100% 쉽게 달성 = 목표가 도전적이지 않다는 신호.",
      "OKR Deck p.22, p.30"
    ], src: "OKR Deck p.22,30" },

  /* ===== 2-A 보강: Alignment ===== */
  { id: "ok_align", group: "objective", layer: "define", label: "OKR\nAlignment",
    summary: "개인 업무를 조직 비전에 정렬 — 수직·수평 정렬과 투명성.",
    detail: [
      "수직 정렬: 팀장-팀원, 임원-관리자로 목표 연결.",
      "수평 정렬: 팀 내·협업 부서 간 경계를 넘는 연결.",
      "정렬을 가능하게 하는 핵심은 투명성(Transparency).",
      "OKR Deck p.17, p.42"
    ], src: "OKR Deck p.42" },
  { id: "ok_align_diff", group: "principle", layer: "define", label: "Alignment vs\nCascading",
    summary: "MBO의 기계적 Cascading과 달리 OKR은 자율·합의 기반 정렬.",
    detail: [
      "MBO Cascading: 상위 목표를 기계적·정량적으로 하향 분배.",
      "OKR Alignment: 개인이 상위 OKR에 기여하는 방식을 자율 설정.",
      "OKR Deck p.42~43"
    ], src: "OKR Deck p.43" },
  { id: "ok_align_opt", group: "objective", layer: "define", label: "직접·간접\nAlignment",
    summary: "Core OKR=직접 정렬 / Support OKR=자원·사람으로 간접 정렬.",
    detail: [
      "직접 Alignment: 재무성과를 직접 창출하는 Core OKR.",
      "간접 Alignment: 자원·사람으로 지원하는 Support OKR.",
      "정성 가치는 KR로 정량화해 정렬.",
      "OKR Deck p.49~52"
    ], src: "OKR Deck p.49~52" },

  /* ===== 2-A 보강: 운영·평가·변화관리 ===== */
  { id: "ok_weekly", group: "operation", layer: "measure", label: "Weekly\nBriefing",
    summary: "Start Meeting(월)·Review Briefing(금)으로 주간 점검·회고.",
    detail: [
      "Start: 주간 달성계획·핵심결과를 Kanban/Scrum에 사전 공유.",
      "Review: 진척도·달성 KR·이슈 리뷰 후 Next Step.",
      "OKR Deck p.20, 운영 Tool"
    ], src: "OKR Deck p.20" },
  { id: "ok_kanban", group: "operation", layer: "measure", label: "Kanban /\nScrum",
    summary: "할 일·진행·완료 보드로 OKR 진척을 가시화·추적.",
    detail: [
      "주간 계획·핵심결과를 보드에 사전 공유.",
      "진행 현황을 팀이 함께 확인.",
      "OKR Deck 운영 Tool"
    ], src: "OKR Deck p.20" },
  { id: "ok_retro", group: "operation", layer: "track", label: "회고\n(KPTA)",
    summary: "Keep·Problem·Try·Action으로 지속/보완/시작/중단 결정.",
    detail: [
      "Keep: 잘된 점 유지 / Problem: 문제 식별.",
      "Try·Action: 개선 시도와 다음 행동 정의.",
      "Track&Update 원칙의 지속/보완/시작/중단으로 연결.",
      "OKR Deck p.20"
    ], src: "OKR Deck p.20" },
  { id: "ok_eval_interp", group: "operation", layer: "review", label: "성과의\n해석",
    summary: "결과값이 아닌 난이도·대내외 이슈를 고려한 상대적 판단.",
    detail: [
      "목표 난이도(영향력·혁신성·복잡성·불확실성) 반영.",
      "환경·내부 이슈를 고려한 해석적 평가.",
      "BII 도전목표 70% 이상 달성 시 ‘달성’으로 판단.",
      "OKR Deck p.69"
    ], src: "OKR Deck p.69" },
  { id: "ok_talent", group: "operation", layer: "review", label: "인재 스냅샷\n· Talent Session",
    summary: "성과·역량·종합 정보로 다각적 인재 논의 + 평가오류 자가진단.",
    detail: [
      "성과곡선은 정규분포가 아닌 멱함수 — 핵심인재 소수.",
      "관대화·가혹화·중심화·연공 오류 자가진단.",
      "논의를 통한 객관성·공정성 향상.",
      "OKR Deck p.77~81"
    ], src: "OKR Deck p.77~81" },
  { id: "ok_changemgmt", group: "operation", layer: "common", label: "변화관리\n3단계",
    summary: "가치 정의 → Pioneer 적용·촉진 → 전파·확장으로 OKR 정착.",
    detail: [
      "Step1: 임원/CEO 변화의지·도전적 변화목표·장기투자.",
      "Step2: 소규모 Pioneer team 실행·문화 양성.",
      "Step3: 연속 Action Plan·역량향상·운영모델 확장.",
      "OKR Deck p.82~87"
    ], src: "OKR Deck p.82~87" },
  { id: "ok_transparency", group: "operation", layer: "common", label: "Transparency\n미팅",
    summary: "OKR을 전사 공개·공유해 Alignment를 연습하는 투명성 미팅.",
    detail: [
      "OKR을 투명하게 전사 공개.",
      "상호 Alignment를 연습·점검.",
      "행동강령 ‘Alignment 연습하기’의 실천 장치.",
      "OKR Deck p.92"
    ], src: "OKR Deck p.92" }
];
const TPL_OKR_EDGES = [
  { from: "root", to: "ok_define" }, { from: "root", to: "ok_fast" },
  { from: "ok_define", to: "ok_measure" }, { from: "ok_measure", to: "ok_review" },
  { from: "ok_review", to: "ok_track" }, { from: "ok_track", to: "ok_define", dashes: true },
  { from: "ok_define", to: "ok_obj" }, { from: "ok_define", to: "ok_pool" },
  { from: "ok_obj", to: "ok_kr" }, { from: "ok_pool", to: "ok_kr" },
  { from: "ok_obj", to: "ok_core" }, { from: "ok_obj", to: "ok_support" },
  { from: "ok_core", to: "ok_support", dashes: true },
  { from: "ok_fast", to: "ok_obj", dashes: true },
  { from: "ok_measure", to: "ok_checkin" }, { from: "ok_checkin", to: "ok_kr", dashes: true },
  { from: "ok_review", to: "ok_cfr" }, { from: "ok_review", to: "ok_calib" },
  { from: "ok_cfr", to: "ok_checkin", dashes: true },
  { from: "root", to: "ok_mindset" }, { from: "ok_mindset", to: "ok_cfr", dashes: true },

  /* 2-A 보강 엣지 — 이론·배경 */
  { from: "root", to: "ok_history" },
  { from: "ok_history", to: "ok_mbolimit" },
  { from: "ok_mbolimit", to: "ok_change" },
  { from: "ok_change", to: "ok_origin" },
  { from: "ok_origin", to: "root", dashes: true },
  { from: "root", to: "ok_newrules", dashes: true },
  { from: "ok_obj", to: "ok_bii" }, { from: "ok_bii", to: "ok_fast", dashes: true },

  /* OKR Canvas 5단계 흐름 */
  { from: "ok_define", to: "ok_canvas" },
  { from: "ok_canvas", to: "ok_c1" },
  { from: "ok_c1", to: "ok_c2" }, { from: "ok_c2", to: "ok_c3" },
  { from: "ok_c3", to: "ok_c4" }, { from: "ok_c4", to: "ok_c5" },
  { from: "ok_c1", to: "ok_obj", dashes: true },
  { from: "ok_c3", to: "ok_kr", dashes: true },
  { from: "ok_c5", to: "ok_checklist" }, { from: "ok_c5", to: "ok_initiative" },

  /* 측정·Confidence */
  { from: "ok_kr", to: "ok_confidence", rel: "measure" },
  { from: "ok_measure", to: "ok_confidence", dashes: true },

  /* Alignment */
  { from: "ok_obj", to: "ok_align", rel: "align" },
  { from: "ok_align", to: "ok_align_diff" },
  { from: "ok_align", to: "ok_align_opt" },
  { from: "ok_align_opt", to: "ok_core", rel: "align", dashes: true },
  { from: "ok_align_opt", to: "ok_support", rel: "align", dashes: true },

  /* 운영·추적 */
  { from: "ok_measure", to: "ok_weekly" }, { from: "ok_weekly", to: "ok_kanban" },
  { from: "ok_weekly", to: "ok_checkin", dashes: true },
  { from: "ok_track", to: "ok_retro" }, { from: "ok_retro", to: "ok_weekly", dashes: true },

  /* 리뷰·평가 */
  { from: "ok_review", to: "ok_eval_interp" }, { from: "ok_review", to: "ok_talent" },

  /* 변화관리 */
  { from: "root", to: "ok_changemgmt" }, { from: "ok_changemgmt", to: "ok_transparency" },
  { from: "ok_transparency", to: "ok_align", rel: "align", dashes: true },
  { from: "ok_mindset", to: "ok_transparency", dashes: true }
];

/* ============================================================
 *  템플릿 3 — MBO 기반 성과관리 (CSF→KPI / Cascading)
 *  (출처: PM Manual Masterbook — 목표설정서·Calibration)
 * ============================================================ */
const TPL_MBO_NODES = [
  { id: "root", group: "core", layer: "plan", label: "MBO 기반\n성과관리",
    summary: "공동의 목표를 설정·측정·평가하는 목표에 의한 경영(Management By Objectives).",
    detail: [
      "지시 수행을 넘어 스스로 문제를 찾고 해결해 성과 창출.",
      "핵심: 목표설정서 → CSF/KPI 도출 → 목표수준·가중치 → 평가 → 보상연계.",
      "'자율·협의' 원칙 기반(Top-down 일방 부과의 통제 한계 보완)."
    ] },

  { id: "mb_plan", group: "process", layer: "plan", label: "목표수립\n· 목표설정서",
    summary: "개인 목표설정서(경영성과 평가서) 작성 — KPI·목표수준·가중치 확정.",
    detail: [
      "직무내용 Review → 역할책임 → CSF → KPI → 목표수준/가중치.",
      "목표 검토회의로 Alignment 점검 후 서명·확정.",
      "산출물: 목표설정서 확정본."
    ] },
  { id: "mb_exec", group: "process", layer: "exec", label: "실행·중간점검",
    summary: "Milestone 진행 점검과 Mid-year Review로 부진 항목 보완.",
    detail: [
      "달성도·부진원인·지원필요사항 점검.",
      "Resource 재배분·Milestone 조정.",
      "통상 7월 중간점검."
    ] },
  { id: "mb_eval", group: "process", layer: "eval", label: "평가",
    summary: "자기평가 → 상사평가 → Calibration → 결과 확정.",
    detail: [
      "실적 집계·평점(자기평가).",
      "타당성 검토·정성평가(상사평가).",
      "Calibration Meeting으로 1·2차 평가자 조정."
    ] },
  { id: "mb_fb", group: "process", layer: "fb", label: "피드백·보상",
    summary: "Feedback Note로 결과·성과급 근거 공유, 차년도 개선점 협의.",
    detail: [
      "조직성과·개인성과·성과급 지급률 코멘트.",
      "미달성 KPI·Gap 항목 중심 논의.",
      "차기 목표 고려사항으로 연결."
    ] },

  { id: "mb_cascade", group: "indicator", layer: "plan", label: "Cascading\n(Top-down)",
    summary: "전사 목표 → 하위조직 핵심성공요소 기준으로 목표 배분.",
    detail: [
      "Span of Control·영향도 감안.",
      "상위 KPI와 개인 KPI 연계성 확보.",
      "Cascading Matrix로 역할 정도 가시화."
    ] },
  { id: "mb_csf", group: "objective", layer: "plan", label: "CSF 도출",
    summary: "Main Task를 성공시키는 핵심성공요인 정의.",
    detail: [
      "Process/Function Charting 또는 Customer Mapping으로 도출.",
      "CSF별 측정 가능한 KPI를 매칭.",
      "예) 기존고객 유지·신규창출."
    ] },
  { id: "mb_pool", group: "indicator", layer: "plan", label: "KPI Pool",
    summary: "CSF에서 도출된 측정지표 후보군 (재무·전략·인재).",
    detail: [
      "Value Driver Tree로 재무 KPI 도출.",
      "전략체계도·Key Driver로 전략 KPI 도출.",
      "도출 후 7대 기준으로 검증."
    ] },
  { id: "mb_select", group: "indicator", layer: "plan", label: "KPI 선정\n7대 기준",
    summary: "Strategic·Measurable·Controllable·Easy-target·Action·Knowable·Balanced.",
    detail: [
      "최소 3개 이상 적용(전략연계·측정·통제·목표설정 용이성).",
      "재무/전략/인재 Balance 점검.",
      "변별력 유지 가능한 적정 항목 수."
    ] },
  { id: "mb_target", group: "objective", layer: "plan", label: "목표수준\n설정",
    summary: "KPI별 계획(100)·Threshold(90)·Cap(120)과 전년도 실적 설정.",
    detail: [
      "Target Level = (당해 Target − 전년 실적) / 전년 실적.",
      "도전적이되 달성가능(SMART).",
      "특별요인을 평가 고려요소로 명시."
    ] },
  { id: "mb_weight", group: "objective", layer: "plan", label: "가중치\n부여",
    summary: "Impact·전략적 중요도에 따라 가중치 배분(육성 항목 ≥5%).",
    detail: [
      "재무/전략/인재 카테고리 Balance.",
      "변별력 유지 가능한 배분.",
      "개발 항목 최소 5% 권장."
    ] },

  { id: "mb_calib", group: "operation", layer: "eval", label: "Calibration\nMeeting",
    summary: "1·2차 평가자가 평가 결과를 조정해 공정성 확보.",
    detail: [
      "성과의 해석: 난이도·대내외 이슈 고려.",
      "관대화·가혹화·중심화 오류 점검.",
      "인재 스냅샷·Talent Session 연계."
    ] },
  { id: "mb_reward", group: "operation", layer: "fb", label: "보상 연계",
    summary: "평가 결과를 성과급·연봉 조정에 연계.",
    detail: [
      "조직성과·개인성과 기반 지급률 산정.",
      "보상 Calibration 시뮬레이션.",
      "Feedback Note로 근거 공유."
    ] },
  { id: "mb_smart", group: "principle", layer: "plan", label: "SMART 원칙",
    summary: "Specific·Measurable·Achievable·Realistic·Time-bound.",
    detail: [
      "목표 검토회의 Checklist 핵심 기준.",
      "측정 가능한 동사·기한 명시.",
      "KPI와 연관된 3~5개 목표.",
      "PM Manual Appendix 2"
    ], src: "PM Manual p.30" },

  /* ===== 2-B 보강: 1.목표수립 세부 (2~3월) ===== */
  { id: "mb_p11", group: "process", layer: "plan", label: "1.1 지침\n수립·안내",
    summary: "연간 MBO 운영계획·지침 수립, Top Team 보고 후 자회사/BG 설명회.",
    detail: [
      "재무/전략 목표 지침은 FA/VM과 협의.",
      "지주부문 지침을 자회사/BG 상황에 맞게 조정해 운영계획 수립.",
      "중역/팀장 대상 목표수립 지침·평가자 Activity Guide 설명회.",
      "PM Manual p.8~9"
    ], src: "PM Manual p.8~9" },
  { id: "mb_p12", group: "process", layer: "plan", label: "1.2 자기\n목표 수립",
    summary: "사업계획·상위목표·핵심고유업무 Review → 역할책임 → CSF → 자기목표설정서.",
    detail: [
      "재무/전략/인재 KPI 및 목표수준(Cap/Threshold)·가중치 설정.",
      "중역 전략목표는 별도 전략MBO 계획서·추진과제 Milestone 작성.",
      "자기 목표설정서를 상위 조직장/BG HR에 송부.",
      "PM Manual p.10"
    ], src: "PM Manual p.10" },
  { id: "mb_p13", group: "process", layer: "plan", label: "1.3 목표\n검토 회의",
    summary: "목표설정서·Cascading Matrix 기반 검토회의로 Review·개선방향 협의.",
    detail: [
      "피평가자별 자기목표 발표, 수립 결과 Review.",
      "필요 자료: 목표설정서, Cascading Matrix, LRP/AOP 확정안.",
      "협의 내용 반영해 목표설정서 수정 후 송부.",
      "PM Manual p.11"
    ], src: "PM Manual p.11" },
  { id: "mb_p14", group: "process", layer: "plan", label: "1.4 검토\n· Feedback",
    summary: "기능별(FA/VM/HR) 목표 검토·Feedback, HR Overall Review.",
    detail: [
      "FA: 재무KPI, VM(전략팀): 전략KPI, HR: 인재KPI 검토.",
      "HR Monitoring Tool로 Cascading 비율·가중치 Balance·Target 적정성 Review.",
      "Feedback Point 정리.",
      "PM Manual p.12"
    ], src: "PM Manual p.12" },
  { id: "mb_p15", group: "process", layer: "plan", label: "1.5 목표\n확정·서명",
    summary: "최종 수정본에 1·2차 평가자 서명으로 목표 Confirm·취합.",
    detail: [
      "1차 평가자가 피평가자 서명본 Review 후 서명.",
      "2차 평가자 최종 Review·서명으로 목표 Confirm.",
      "목표수립 진행결과 Summary를 지주부문 HR에 Report.",
      "PM Manual p.13"
    ], src: "PM Manual p.13" },

  /* ===== 2-B 보강: 2.Mid-year Review (7월) ===== */
  { id: "mb_m21", group: "process", layer: "exec", label: "2.1 Mid-year\n준비",
    summary: "Review 일정·Guide 수립, 본인 중간점검 양식 작성·취합.",
    detail: [
      "2분기 QBR과 일정 중복 없도록 계획 수립.",
      "평가항목별 본인 중간 실적 집계·중간점검 양식 정리.",
      "면담 대상자별 일정 Arrange·주요 Point 사전 정리.",
      "PM Manual p.14~15"
    ], src: "PM Manual p.14~15" },
  { id: "mb_m22", group: "process", layer: "exec", label: "2.2 중간점검\n면담",
    summary: "평가자–피평가자 1:1로 달성도·부진원인·지원필요 협의.",
    detail: [
      "피평가자가 달성도·부진원인·지원필요사항 설명.",
      "부진 항목 개선방향, Resource(인력/예산) Allocation, Milestone 조정.",
      "PM Manual p.16"
    ], src: "PM Manual p.16" },
  { id: "mb_m23", group: "process", layer: "exec", label: "2.3 결과\n정리·취합",
    summary: "면담 결과를 양식에 정리·취합 후 BG장/CEO 보고.",
    detail: [
      "현 수준 평가자 의견·주요 협의내용 기록.",
      "진행 경과·달성도·주요 Issue 요약 정리.",
      "PM Manual p.17"
    ], src: "PM Manual p.17" },

  /* ===== 2-B 보강: 3.평가 (12~1월) ===== */
  { id: "mb_e31", group: "process", layer: "eval", label: "3.1 평가\n지침·안내",
    summary: "평가/Feedback 일정·Guide 운영계획 수립, 중역/팀장 Training.",
    detail: [
      "재무/전략 KPI 평가 Guide는 FA/VM과 협의.",
      "MBO 실적 취합 위해 유관팀(FA/전략) 운영계획 공유.",
      "PM Manual p.18~19"
    ], src: "PM Manual p.18~19" },
  { id: "mb_e32", group: "process", layer: "eval", label: "3.2 자기\n평가",
    summary: "목표설정서 기준 실적 집계·항목별 점수·가중치 평점 산정.",
    detail: [
      "평가항목별 실적자료 집계(유관팀 협조).",
      "달성 근거·부진 원인 등 평가 의견 작성.",
      "직속상사에게 자기평가서 송부.",
      "PM Manual p.20"
    ], src: "PM Manual p.20" },
  { id: "mb_e33", group: "process", layer: "eval", label: "3.3 상사\n평가",
    summary: "자기평가 검토 후 타당성 기반 정량·정성 평점·근거 작성.",
    detail: [
      "실적자료 정확성·신뢰성, 자기평가 타당성 검토.",
      "항목별 점수·가중치 평점 + 정성평가 점수·근거.",
      "PM Manual p.21"
    ], src: "PM Manual p.21" },
  { id: "mb_e34", group: "process", layer: "eval", label: "3.4\nCalibration",
    summary: "HR Review Report·Guideline 기반 1·2차 평가자 조정 미팅.",
    detail: [
      "취합 상사평가 검토·HR Review Report 작성.",
      "차상위자 항목별 평가·근거 타당성 Review, 필요 시 재평가 요청.",
      "Calibration Meeting으로 평가결과 확정 지원.",
      "PM Manual p.22"
    ], src: "PM Manual p.22" },
  { id: "mb_e35", group: "process", layer: "eval", label: "3.5 결과\n확정·등급",
    summary: "조정 결과 반영해 평가점수 확정, 등급별 인원비율 Guide 준수.",
    detail: [
      "Calibration 결과 반영 평가점수 확정.",
      "부문별 평가등급 인원비율 Guide 준수해 등급 부여.",
      "BG장/CEO 보고, 지주부문 HR 전달.",
      "PM Manual p.23"
    ], src: "PM Manual p.23" },

  /* ===== 2-B 보강: 4.Feedback (1월) ===== */
  { id: "mb_f41", group: "process", layer: "fb", label: "4.1 Feedback\n준비·Note",
    summary: "확정 평가결과 재송부, Feedback Note 작성.",
    detail: [
      "전 과정 종합 검토(피평가자 활동·외부요인·평가자 지원).",
      "Feedback Note: 조직성과·개인성과·성과급 지급률·주요 Comment.",
      "PM Manual p.24"
    ], src: "PM Manual p.24" },
  { id: "mb_f42", group: "process", layer: "fb", label: "4.2 Feedback\nMeeting",
    summary: "1:1 면담으로 평가결과·성과급 근거 설명, Gap·미달 KPI 논의.",
    detail: [
      "평가결과·성과급 지급률 산정 근거 설명.",
      "자기평가 Gap 큰 항목·미달성 KPI 중심 상세 논의.",
      "차년도 목표 고려사항·개선 필요사항 협의.",
      "PM Manual p.25~26"
    ], src: "PM Manual p.25~26" },
  { id: "mb_f43", group: "process", layer: "fb", label: "4.3 결과\n정리",
    summary: "면담 결과 종합 정리 후 Report·CEO 보고.",
    detail: [
      "피평가자별 점수·면담 실시여부·특이사항 정리.",
      "진행 수준 Report를 지주부문 HR 송부.",
      "PM Manual p.27"
    ], src: "PM Manual p.27" },

  /* ===== 2-B 보강: 이해관계자 R&R · 핵심 산출물 ===== */
  { id: "mb_rnr", group: "context", layer: "plan", label: "이해관계자\nR&R",
    summary: "지주/BG/자회사 HR · 1·2차 평가자 · 피평가자의 역할 분담.",
    detail: [
      "지주부문 HR: 그룹 지침·종합 보고. BG/자회사 HR: 운영·취합.",
      "1차 평가자: 직속 Review·서명 / 2차 평가자: Confirm.",
      "피평가자: 자기목표·자기평가 작성.",
      "PM Manual p.8,14,18,24"
    ], src: "PM Manual p.8,18" },
  { id: "mb_doc_goal", group: "objective", layer: "plan", label: "자기목표\n설정서",
    summary: "경영성과 평가서 — 재무/전략/인재 KPI·계획/Threshold/Cap·가중치.",
    detail: [
      "구분·항목·계획(100)·Threshold(90)·Cap(120)·전년실적·특별요인·가중치.",
      "목표수립과 평가의 기준 문서.",
      "PM Manual p.30 Appendix"
    ], src: "PM Manual p.30" },
  { id: "mb_doc_matrix", group: "indicator", layer: "plan", label: "Cascading\nMatrix",
    summary: "팀 KPI 대비 개인 역할 정도(전체/일부)를 가시화하는 Alignment 도구.",
    detail: [
      "상위 KPI와 개인 KPI 연계성 점검.",
      "목표 검토회의 필수 자료.",
      "PM Manual p.11"
    ], src: "PM Manual p.11" },
  { id: "mb_doc_strat", group: "indicator", layer: "plan", label: "전략 MBO\n계획서·Milestone",
    summary: "중역 전략목표의 별도 계획서·추진과제 Milestone Template.",
    detail: [
      "전략과제 성공의 정의·Action Plan·Milestone.",
      "중역 목표수립 시 자기목표설정서와 함께 작성.",
      "PM Manual p.10"
    ], src: "PM Manual p.10" },
  { id: "mb_calib_report", group: "operation", layer: "eval", label: "HR Review\nReport",
    summary: "Calibration용 평가결과 검토 리포트·Guideline.",
    detail: [
      "취합 상사평가 결과를 검토해 작성.",
      "Calibrator에게 HR 검토의견·Guideline 전달.",
      "PM Manual p.22"
    ], src: "PM Manual p.22" }
];
const TPL_MBO_EDGES = [
  { from: "root", to: "mb_plan" },
  { from: "mb_plan", to: "mb_exec" }, { from: "mb_exec", to: "mb_eval" },
  { from: "mb_eval", to: "mb_fb" }, { from: "mb_fb", to: "mb_plan", dashes: true },
  { from: "mb_plan", to: "mb_cascade" }, { from: "mb_cascade", to: "mb_csf" },
  { from: "mb_csf", to: "mb_pool" }, { from: "mb_pool", to: "mb_select" },
  { from: "mb_select", to: "mb_target" }, { from: "mb_target", to: "mb_weight" },
  { from: "mb_target", to: "mb_smart", dashes: true },
  { from: "mb_eval", to: "mb_calib" }, { from: "mb_calib", to: "mb_reward" },
  { from: "mb_fb", to: "mb_reward" },
  { from: "mb_weight", to: "mb_plan", dashes: true },

  /* 2-B 보강 엣지 — 프로세스 세부 흐름 */
  { from: "root", to: "mb_rnr" }, { from: "mb_rnr", to: "mb_plan", dashes: true },
  { from: "mb_plan", to: "mb_p11" },
  { from: "mb_p11", to: "mb_p12" }, { from: "mb_p12", to: "mb_p13" },
  { from: "mb_p13", to: "mb_p14" }, { from: "mb_p14", to: "mb_p15" },
  { from: "mb_p12", to: "mb_doc_goal" }, { from: "mb_p12", to: "mb_csf", dashes: true },
  { from: "mb_p12", to: "mb_doc_strat", dashes: true },
  { from: "mb_p13", to: "mb_doc_matrix" },
  { from: "mb_doc_matrix", to: "mb_cascade", rel: "cascade", dashes: true },
  { from: "mb_doc_goal", to: "mb_target", rel: "measure", dashes: true },

  { from: "mb_exec", to: "mb_m21" }, { from: "mb_m21", to: "mb_m22" }, { from: "mb_m22", to: "mb_m23" },

  { from: "mb_eval", to: "mb_e31" }, { from: "mb_e31", to: "mb_e32" },
  { from: "mb_e32", to: "mb_e33" }, { from: "mb_e33", to: "mb_e34" }, { from: "mb_e34", to: "mb_e35" },
  { from: "mb_e34", to: "mb_calib_report" }, { from: "mb_calib_report", to: "mb_calib", dashes: true },

  { from: "mb_fb", to: "mb_f41" }, { from: "mb_f41", to: "mb_f42" }, { from: "mb_f42", to: "mb_f43" },
  { from: "mb_f42", to: "mb_reward", dashes: true }
];

/* ============================================================
 *  템플릿 4 — 역량/육성 기반 성과관리 (Competency & Development)
 *  (육성형 평가제도 — 진단·육성·평가·배치)
 * ============================================================ */
const TPL_COMP_NODES = [
  { id: "root", group: "core", layer: "diag", label: "역량·육성 기반\n성과관리",
    summary: "역량 진단 → 육성(개발) → 평가 → 배치로 이어지는 사람 중심 육성형 성과관리.",
    detail: [
      "결과 통제가 아닌 개인 성장·잠재력을 조직 성과로 연결.",
      "역량모델 기반 진단·다면평가·IDP·코칭으로 미래 성과 창출.",
      "구글식 육성형 평가제도(상시 피드백·다면 피드백)와 동일 맥락."
    ] },

  { id: "cp_model", group: "context", layer: "diag", label: "역량 모델",
    summary: "공통역량·리더십역량·직무역량 체계 — 진단의 기준.",
    detail: [
      "공통역량: 전 구성원 공통 행동기준.",
      "리더십역량: 관리자/리더 대상.",
      "직무역량: 직무별 전문 역량 정의."
    ] },
  { id: "cp_diag", group: "process", layer: "diag", label: "① 역량 진단\n· 다면평가",
    summary: "360도(자기·상사·동료·부하) 다면평가로 역량 수준을 진단.",
    detail: [
      "온라인 기반 다면 피드백.",
      "행동지표(BARS) 기준 평정.",
      "진단 결과 → 역량 프로파일 산출."
    ] },
  { id: "cp_gap", group: "indicator", layer: "diag", label: "역량 Gap\n분석",
    summary: "요구 역량 대비 현재 수준의 격차를 도출해 개발 우선순위 결정.",
    detail: [
      "직무·직급별 기대 수준과 비교.",
      "강점/개발필요 영역 식별.",
      "개발 우선순위(High Impact) 선정."
    ] },

  { id: "cp_idp", group: "develop", layer: "develop", label: "② IDP\n개인개발계획",
    summary: "Gap 기반 개인개발계획(Individual Development Plan) 수립.",
    detail: [
      "개발 목표·방법·기한을 SMART하게 설정.",
      "70-20-10(경험·관계·교육) 기반 설계.",
      "리더와 합의 후 분기 점검."
    ] },
  { id: "cp_learn", group: "develop", layer: "develop", label: "교육·학습\n(70-20-10)",
    summary: "경험학습 70 · 관계학습 20 · 교육 10 비율의 학습 활동.",
    detail: [
      "70: 도전 과제·직무 경험(Stretch Assignment).",
      "20: 코칭·멘토링·피드백.",
      "10: 집합/온라인 교육·자격."
    ] },
  { id: "cp_coach", group: "develop", layer: "develop", label: "코칭·멘토링",
    summary: "상시 1:1 코칭과 멘토링으로 행동 변화·성장을 촉진.",
    detail: [
      "AD-FIT 코칭(Assess·Define·Focus·Implement·Take-away).",
      "성장 마인드(Growth Mindset) 강화.",
      "CFR(대화·피드백·인정)과 연계."
    ] },
  { id: "cp_cdp", group: "develop", layer: "develop", label: "경력개발\nCDP",
    summary: "Career Development Path — 중장기 경력 경로 설계.",
    detail: [
      "직무 전문가/관리자 트랙 선택.",
      "직무 순환(Job Rotation) 계획.",
      "승계(Succession) 후보 풀과 연계."
    ] },

  { id: "cp_eval", group: "evaluate", layer: "eval", label: "③ 역량 평가",
    summary: "성과(업적) 평가와 분리/연계된 역량 평가 — 행동·잠재력 평가.",
    detail: [
      "행동지표 기반 역량 발휘도 평가.",
      "업적평가와 가중치 결합(예: 업적 70 / 역량 30).",
      "육성 관점의 정성 피드백 포함."
    ] },
  { id: "cp_review", group: "evaluate", layer: "eval", label: "피드백·리뷰",
    summary: "상시 피드백·종합 리뷰로 성장 과정을 공유.",
    detail: [
      "정기 1:1 + 상시 피드백.",
      "강점 강화·개발영역 합의.",
      "차기 IDP로 연결."
    ] },

  { id: "cp_talent", group: "operation", layer: "place", label: "④ 인재 스냅샷\n· Talent Session",
    summary: "성과·역량 9-Block으로 핵심인재를 식별하고 배치·승계 논의.",
    detail: [
      "성과(X)·역량/잠재력(Y) 9-Block 매핑.",
      "핵심인재(HiPo)·승계 후보 식별.",
      "평가 오류 자가진단으로 객관성 확보."
    ] },
  { id: "cp_place", group: "operation", layer: "place", label: "배치·승계",
    summary: "Talent Session 결과를 배치·승계·보상에 연계.",
    detail: [
      "Succession Plan(승계 계획) 갱신.",
      "직무 재배치·승진 검토.",
      "차기 역량 진단으로 순환."
    ] },
  { id: "cp_smart", group: "principle", layer: "develop", label: "BII · 성장원칙",
    summary: "Build·Improve·Innovate 방향으로 도전적 육성 목표 설정.",
    detail: [
      "Build/Improve/Innovate 중 개발 방향 선택.",
      "도전 목표 70% 달성 시 '성장했다' 판단.",
      "성장 마인드 기반 자기주도 학습.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },

  /* ===== 2-C 보강: 진단 ===== */
  { id: "cp_common", group: "context", layer: "diag", label: "공통역량",
    summary: "전 구성원 공통 행동기준 — 인재상·핵심가치 기반.",
    detail: [
      "조직 전체가 공유하는 행동기준.",
      "인재상·핵심가치에서 도출.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },
  { id: "cp_leader", group: "context", layer: "diag", label: "리더십\n역량",
    summary: "관리자·리더 대상 역량 — 조직·사람·성과 관리.",
    detail: [
      "팀/조직을 이끄는 리더 대상.",
      "성과 코칭·의사결정·육성 역량 포함.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },
  { id: "cp_job", group: "context", layer: "diag", label: "직무역량",
    summary: "직무별 전문 역량 — 직무 수행에 필요한 지식·기술.",
    detail: [
      "직무별로 정의된 전문 역량.",
      "직무기술서·직무분석 기반.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },
  { id: "cp_ac", group: "process", layer: "diag", label: "Assessment\nCenter",
    summary: "모의과제·시뮬레이션 기반 다면 역량 평가 기법.",
    detail: [
      "In-basket·역할연기·집단토의 등 모의과제로 행동 관찰.",
      "승진·핵심인재 선발 시 객관성 보강.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },
  { id: "cp_bars", group: "indicator", layer: "diag", label: "행동지표\n(BARS)",
    summary: "역량을 관찰 가능한 행동 수준으로 정의한 평정 기준.",
    detail: [
      "Behaviorally Anchored Rating Scale.",
      "역량 발휘 수준을 행동 사례로 척도화.",
      "진단·평가의 공통 기준.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },

  /* ===== 2-C 보강: 육성 ===== */
  { id: "cp_ojt", group: "develop", layer: "develop", label: "교육·OJT",
    summary: "집합·온라인 교육과 현업 OJT(10%)로 지식·기술 습득.",
    detail: [
      "70-20-10 중 ‘10’ 교육 영역.",
      "집합/온라인 과정·자격·OJT.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },
  { id: "cp_exp", group: "develop", layer: "develop", label: "경험학습\n(Stretch)",
    summary: "도전 과제·직무 경험(70%)으로 실전 역량 개발.",
    detail: [
      "70-20-10 중 ‘70’ 경험 영역.",
      "Stretch Assignment·프로젝트·직무 확대.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },

  /* ===== 2-C 보강: 평가 ===== */
  { id: "cp_matrix", group: "evaluate", layer: "eval", label: "성과×역량\n매트릭스",
    summary: "업적(성과)과 역량 2축으로 인재를 위치화하는 평가 매트릭스.",
    detail: [
      "X축 성과·Y축 역량/잠재력.",
      "업적평가와 역량평가를 결합해 종합 판단.",
      "9-Block·Talent Session으로 연결.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },

  /* ===== 2-C 보강: 배치·승계 ===== */
  { id: "cp_9box", group: "operation", layer: "place", label: "9-Box\nGrid",
    summary: "성과·잠재력 9분면으로 핵심인재·개발대상 식별.",
    detail: [
      "성과(저·중·고)×잠재력(저·중·고) 9분면.",
      "우상단=핵심인재(HiPo), 좌하단=개발 집중.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },
  { id: "cp_pool", group: "operation", layer: "place", label: "핵심인재\nPool",
    summary: "HiPo·차세대 리더 후보군을 별도 관리·집중 육성.",
    detail: [
      "9-Box 상위 인재를 Pool로 관리.",
      "맞춤 육성·경력경로·리텐션 적용.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },
  { id: "cp_succession", group: "operation", layer: "place", label: "승계계획\n(Succession)",
    summary: "핵심 포지션별 승계 후보·준비도를 관리하는 계획.",
    detail: [
      "핵심 포지션별 Ready Now/Later 후보 식별.",
      "후보별 개발 계획과 연계.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" },
  { id: "cp_move", group: "operation", layer: "place", label: "배치·이동\n(Rotation)",
    summary: "직무 재배치·순환(Job Rotation)으로 경험 폭 확대.",
    detail: [
      "Talent Session 결과를 배치·승진·이동에 반영.",
      "Job Rotation으로 다직무 경험 축적.",
      "기획회의 · 공통 HR 프레임워크"
    ], src: "기획회의" }
];
const TPL_COMP_EDGES = [
  { from: "root", to: "cp_model" }, { from: "cp_model", to: "cp_diag" },
  { from: "cp_diag", to: "cp_gap" }, { from: "cp_gap", to: "cp_idp" },
  { from: "cp_idp", to: "cp_learn" }, { from: "cp_idp", to: "cp_coach" },
  { from: "cp_idp", to: "cp_cdp" }, { from: "cp_coach", to: "cp_smart", dashes: true },
  { from: "cp_learn", to: "cp_eval" }, { from: "cp_coach", to: "cp_eval", dashes: true },
  { from: "cp_eval", to: "cp_review" }, { from: "cp_review", to: "cp_talent" },
  { from: "cp_talent", to: "cp_place" }, { from: "cp_place", to: "cp_model", dashes: true },
  { from: "cp_review", to: "cp_idp", dashes: true },

  /* 2-C 보강 엣지 */
  { from: "cp_model", to: "cp_common" }, { from: "cp_model", to: "cp_leader" }, { from: "cp_model", to: "cp_job" },
  { from: "cp_diag", to: "cp_ac", dashes: true }, { from: "cp_diag", to: "cp_bars" },
  { from: "cp_bars", to: "cp_eval", dashes: true },
  { from: "cp_idp", to: "cp_ojt" }, { from: "cp_idp", to: "cp_exp" },
  { from: "cp_eval", to: "cp_matrix", rel: "measure" }, { from: "cp_matrix", to: "cp_talent", dashes: true },
  { from: "cp_talent", to: "cp_9box" }, { from: "cp_9box", to: "cp_pool" }, { from: "cp_talent", to: "cp_pool", dashes: true },
  { from: "cp_place", to: "cp_succession" }, { from: "cp_place", to: "cp_move" },
  { from: "cp_pool", to: "cp_succession", dashes: true }
];

/* ============================================================
 *  템플릿 5 — 프로세스별 상세 (데이터/맥락/액티비티)
 * ============================================================ */
const TPL_PROCESS_DETAIL_NODES = [
  { id: "root", group: "core", layer: "common", label: "프로세스별 상세\n(Data·Context·Activity)",
    summary: "E2E 성과관리 4단계별 필요 데이터, 맥락, 내용, 운영 액티비티를 정의합니다.",
    detail: [
      "각 단계(목표수립, 체크인, 평가, 피드백)에서 요구되는 실무적 기반을 상세화.",
      "Data: 시스템/현황 데이터 기반, Content: 채워야 할 실질적 내용, Context: 목적/배경적 맥락, Activity: 실제 일어나는 활동."
    ] },

  /* 1단계: 목표수립 */
  { id: "pd_p1", group: "process", layer: "p1", label: "1. 목표수립",
    summary: "조직 목표와 개인 직무를 연계하여 당해 성과 목표를 수립.",
    detail: ["조직과 개인의 정렬(Alignment)을 확보하는 출발점."] },
  { id: "pd_p1_data", group: "data", layer: "p1", label: "Data\n(데이터)",
    summary: "목표수립을 위해 요구되는 기초 데이터.",
    detail: [
      "직무기술서(Job Description) 및 역할 프로파일.",
      "전년도 평가 결과 및 미달성 KPI 현황.",
      "상위 조직(본부/팀)의 당해 목표 및 경영계획 데이터."
    ] },
  { id: "pd_p1_content", group: "content", layer: "p1", label: "Content\n(내용)",
    summary: "목표설정서에 실질적으로 담겨야 할 내용.",
    detail: [
      "당해 핵심성공요인(CSF) 및 핵심성과지표(KPI) 정의.",
      "KPI별 목표수준(Target, Threshold, Cap) 및 가중치 배분.",
      "개인개발계획(IDP) 및 육성 목표 연계안."
    ] },
  { id: "pd_p1_context", group: "context", layer: "p1", label: "Context\n(맥락)",
    summary: "목표수립의 배경적/전략적 맥락.",
    detail: [
      "전사 비전 및 경영전략과의 수직적 정렬(Vertical Alignment).",
      "유관/협업 부서와의 수평적 정렬(Horizontal Alignment).",
      "왜 이 목표가 중요한지에 대한 리더-팀원 간 공감대 형성."
    ] },
  { id: "pd_p1_activity", group: "activity", layer: "p1", label: "Activity\n(액티비티)",
    summary: "목표수립 단계의 주요 운영 활동.",
    detail: [
      "KPI Pool 검토 및 7대 적정성(SMART) 기준 점검.",
      "목표 검토회의(1:1 미팅)를 통한 목표 난이도 및 가중치 협의.",
      "1, 2차 평가자 목표 확정 및 서명(Sign-off)."
    ] },

  /* 2단계: Mid-year Review */
  { id: "pd_p2", group: "process", layer: "p2", label: "2. Mid-year\nReview",
    summary: "연중/반기 중간 점검을 통한 진행 상황 확인 및 목표 보완.",
    detail: ["목표 달성을 위한 리소스 재배분 및 코칭."] },
  { id: "pd_p2_data", group: "data", layer: "p2", label: "Data\n(데이터)",
    summary: "중간점검을 위해 요구되는 진척 데이터.",
    detail: [
      "상반기 KPI 달성률 및 실적 집계 데이터.",
      "프로젝트 마일스톤 진척도 및 예산 집행 현황.",
      "수시 피드백/체크인 이력 텍스트 데이터."
    ] },
  { id: "pd_p2_content", group: "content", layer: "p2", label: "Content\n(내용)",
    summary: "리뷰 면담에서 다루어야 할 실질적 내용.",
    detail: [
      "부진 KPI의 원인 분석 및 병목(Bottleneck) 요인 식별.",
      "하반기 Catch-up을 위한 실행 계획(Action Plan).",
      "필요한 추가 지원 사항(인력, 예산, 권한 등)."
    ] },
  { id: "pd_p2_context", group: "context", layer: "p2", label: "Context\n(맥락)",
    summary: "중간점검 시 고려해야 할 환경적 변화 맥락.",
    detail: [
      "대내외 비즈니스 환경 변화에 따른 목표 타당성 재검토.",
      "목표 우선순위 변경 여부 및 전략적 Pivot 필요성.",
      "팀원의 업무 피로도 및 동기부여 상태."
    ] },
  { id: "pd_p2_activity", group: "activity", layer: "p2", label: "Activity\n(액티비티)",
    summary: "Mid-year Review 주요 운영 활동.",
    detail: [
      "피평가자의 중간 점검 양식 자가 작성.",
      "리더-팀원 1:1 중간 리뷰 면담 및 코칭(AD-FIT).",
      "환경 변화에 따른 목표 재설정(필요 시) 및 리소스 재조정."
    ] },

  /* 3단계: 평가 */
  { id: "pd_p3", group: "process", layer: "p3", label: "3. 평가",
    summary: "연간 성과에 대한 종합적 판단 및 등급 확정.",
    detail: ["객관성과 수용성을 확보하기 위한 평가 과정."] },
  { id: "pd_p3_data", group: "data", layer: "p3", label: "Data\n(데이터)",
    summary: "평가 시 요구되는 실적 기반 데이터.",
    detail: [
      "연간 KPI 최종 실적 및 달성률 데이터.",
      "다면평가(360도 평가) 결과 및 동료 피드백 종합.",
      "조직 전체의 등급 분포 및 가이드라인 데이터."
    ] },
  { id: "pd_p3_content", group: "content", layer: "p3", label: "Content\n(내용)",
    summary: "평가 과정에서 다루어지는 핵심 내용.",
    detail: [
      "자기평가서(실적 증빙 및 정성적 성과 기술).",
      "상사평가서(항목별 평점 및 정성평가 코멘트).",
      "Calibration(등급 조정)을 위한 인재 스냅샷 및 평가 근거."
    ] },
  { id: "pd_p3_context", group: "context", layer: "p3", label: "Context\n(맥락)",
    summary: "성과의 단순 수치를 넘어선 해석적 맥락.",
    detail: [
      "목표의 난이도(도전성, 복잡성) 및 기여도.",
      "통제 불가능한 외부 요인(시장 변동 등)의 영향.",
      "단기 성과와 장기적 역량 성장 간의 균형(Trade-off)."
    ] },
  { id: "pd_p3_activity", group: "activity", layer: "p3", label: "Activity\n(액티비티)",
    summary: "평가 단계의 주요 운영 활동.",
    detail: [
      "자기평가 실시 및 증빙 자료 제출.",
      "1차/2차 평가자의 평가 및 타당성 검토.",
      "평가자 간 Calibration Meeting을 통한 최종 등급 조정(평가 오류 최소화)."
    ] },

  /* 4단계: Feedback */
  { id: "pd_p4", group: "process", layer: "p4", label: "4. Feedback",
    summary: "평가 결과 공유 및 차기 성장을 위한 피드백.",
    detail: ["단순 통보가 아닌 인정과 성장을 위한 대화."] },
  { id: "pd_p4_data", group: "data", layer: "p4", label: "Data\n(데이터)",
    summary: "피드백 면담을 위해 필요한 데이터.",
    detail: [
      "최종 확정 평가 등급 및 개인/조직 성과급 산정 데이터.",
      "역량 Gap 분석 결과 및 강점/약점 데이터.",
      "과거 피드백 이력 및 행동 변화 트래킹 지표."
    ] },
  { id: "pd_p4_content", group: "content", layer: "p4", label: "Content\n(내용)",
    summary: "피드백 면담에서 전달 및 기록될 내용.",
    detail: [
      "Feedback Note(최종 결과 통보 및 종합 코멘트).",
      "우수 성과에 대한 구체적인 인정(Recognition) 사항.",
      "개선 필요 영역 및 차년도 개발 포커스."
    ] },
  { id: "pd_p4_context", group: "context", layer: "p4", label: "Context\n(맥락)",
    summary: "수용성을 높이기 위한 소통적 맥락.",
    detail: [
      "평가 결과와 보상(연봉/성과급) 연계의 논리적 배경 설명.",
      "조직의 기대 수준과 개인의 성취 수준 간의 간극 인식.",
      "심리적 안전감이 보장된 건설적인 피드백 환경 조성."
    ] },
  { id: "pd_p4_activity", group: "activity", layer: "p4", label: "Activity\n(액티비티)",
    summary: "피드백 단계의 주요 운영 활동.",
    detail: [
      "평가 결과 및 보상 내역 개별 통보.",
      "1:1 공식 피드백 면담(결과 설명 및 이의제기 절차 안내).",
      "차년도 목표 수립(IDP 연계)을 위한 사전 방향성 논의."
    ] }
];

const TPL_PROCESS_DETAIL_EDGES = [
  /* root -> 4단계 */
  { from: "root", to: "pd_p1" },
  { from: "root", to: "pd_p2" },
  { from: "root", to: "pd_p3" },
  { from: "root", to: "pd_p4" },

  /* 흐름 연결 */
  { from: "pd_p1", to: "pd_p2" },
  { from: "pd_p2", to: "pd_p3" },
  { from: "pd_p3", to: "pd_p4" },
  { from: "pd_p4", to: "pd_p1", dashes: true },

  /* 1. 목표수립 하위 */
  { from: "pd_p1", to: "pd_p1_data" },
  { from: "pd_p1", to: "pd_p1_content" },
  { from: "pd_p1", to: "pd_p1_context" },
  { from: "pd_p1", to: "pd_p1_activity" },

  /* 2. Mid-year Review 하위 */
  { from: "pd_p2", to: "pd_p2_data" },
  { from: "pd_p2", to: "pd_p2_content" },
  { from: "pd_p2", to: "pd_p2_context" },
  { from: "pd_p2", to: "pd_p2_activity" },

  /* 3. 평가 하위 */
  { from: "pd_p3", to: "pd_p3_data" },
  { from: "pd_p3", to: "pd_p3_content" },
  { from: "pd_p3", to: "pd_p3_context" },
  { from: "pd_p3", to: "pd_p3_activity" },

  /* 4. Feedback 하위 */
  { from: "pd_p4", to: "pd_p4_data" },
  { from: "pd_p4", to: "pd_p4_content" },
  { from: "pd_p4", to: "pd_p4_context" },
  { from: "pd_p4", to: "pd_p4_activity" }
];

/* ============================================================
 *  프로세스 템플릿 레지스트리
 * ============================================================ */
const PROCESS_TEMPLATES = {
  e2e: {
    name: "E2E 통합 (성과관리 + HR AI 아키텍처)",
    desc: "목표수립→체크인→평가→피드백 + HR AI 4-Layer 통합 전체 맵.",
    layers: {
      pm: { label: "성과관리" },
      l1: { label: "Layer 1 · 인터페이스" },
      l2: { label: "Layer 2 · 오케스트레이션" },
      l3: { label: "Layer 3 · 보안·API" },
      l4: { label: "Layer 4 · 데이터" }
    },
    groupLayer: {
      core: "pm", process: "pm", objective: "pm", context: "pm",
      indicator: "pm", principle: "pm", operation: "pm",
      layer1: "l1", layer2: "l2", layer3: "l3", layer4: "l4"
    },
    nodes: TPL_E2E_NODES, edges: TPL_E2E_EDGES
  },

  okr: {
    name: "OKR 기반 성과관리",
    desc: "Define→Measuring→Reviewing→Track&Update 상시 순환형.",
    layers: {
      common: { label: "공통·원칙" },
      define: { label: "목표수립(Define)" },
      measure: { label: "측정(Measuring)" },
      review: { label: "리뷰(Reviewing)" },
      track: { label: "추적(Track&Update)" }
    },
    groupLayer: { core: "common", principle: "common" },
    nodes: TPL_OKR_NODES, edges: TPL_OKR_EDGES
  },

  mbo: {
    name: "MBO 기반 성과관리",
    desc: "목표설정서·CSF→KPI·Cascading·Calibration 중심.",
    layers: {
      plan: { label: "목표수립" },
      exec: { label: "실행·점검" },
      eval: { label: "평가" },
      fb: { label: "피드백·보상" }
    },
    groupLayer: {
      core: "plan", process: "plan", objective: "plan",
      indicator: "plan", principle: "plan", operation: "eval", context: "plan"
    },
    nodes: TPL_MBO_NODES, edges: TPL_MBO_EDGES
  },

  competency: {
    name: "역량·육성 기반 성과관리",
    desc: "역량 진단→육성(IDP/코칭)→평가→배치·승계 육성형.",
    layers: {
      diag: { label: "진단" },
      develop: { label: "육성" },
      eval: { label: "평가" },
      place: { label: "배치·승계" }
    },
    groupLayer: {
      core: "diag", context: "diag", process: "diag", indicator: "diag",
      develop: "develop", evaluate: "eval", operation: "place", principle: "develop"
    },
    nodes: TPL_COMP_NODES, edges: TPL_COMP_EDGES
  },

  process_detail: {
    name: "프로세스별 상세 (데이터/맥락/액티비티)",
    desc: "4단계 프로세스별 Data, Content, Context, Activity 심층 맵.",
    layers: {
      common: { label: "공통" },
      p1: { label: "1. 목표수립" },
      p2: { label: "2. 중간점검" },
      p3: { label: "3. 평가" },
      p4: { label: "4. 피드백" }
    },
    groupLayer: {
      core: "common", process: "common",
      data: "common", content: "common", context: "common", activity: "common"
    },
    nodes: TPL_PROCESS_DETAIL_NODES, edges: TPL_PROCESS_DETAIL_EDGES
  }
};

const DEFAULT_TEMPLATE = "e2e";

/* 하위 호환 — 기존 코드/내보내기가 참조하던 전역 */
const NODES = PROCESS_TEMPLATES[DEFAULT_TEMPLATE].nodes;
const EDGES = PROCESS_TEMPLATES[DEFAULT_TEMPLATE].edges;
