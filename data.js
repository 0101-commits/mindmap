/* ============================================================
 *  개인 E2E 성과관리 마인드맵 데이터
 *  출처: [HCG]성과관리 OKR Manual Deck + PM Manual(Masterbook)
 *        + 기획회의(개인 E2E 성과관리 / 1단계 목표수립) 내용 결합
 *
 *  각 노드는 반드시 group 속성을 가진다.
 *  group 종류:
 *    core      중심 주제
 *    process   E2E 프로세스 단계
 *    objective 목표수립(1단계) 세부 활동
 *    context   맥락 (목표수립의 Input)
 *    indicator 지표 (CSF / KPI)
 *    principle 원칙 (SMART / FAST / BII)
 *    operation 운영 (체크인 / CFR / 회고 / 변화관리)
 * ============================================================ */

const GROUPS = {
  core:      { label: "중심",     color: "#1f2937" },
  process:   { label: "프로세스", color: "#356CB5" },
  objective: { label: "목표",     color: "#2563eb" },
  context:   { label: "맥락",     color: "#0891b2" },
  indicator: { label: "지표",     color: "#059669" },
  principle: { label: "원칙",     color: "#d97706" },
  operation: { label: "운영",     color: "#7c3aed" }
};

const NODES = [
  /* ---------- CORE ---------- */
  {
    id: "root", group: "core", label: "개인 E2E\n성과관리",
    title: "개인 단위의 End-to-End 성과관리 체계",
    summary: "목표수립 → 체크인(중간점검) → 평가 → 피드백으로 이어지는 개인 단위 End-to-End 성과관리 전체 흐름.",
    detail: [
      "조직 목표를 개인 목표로 연결하고, 그 달성 과정을 상시 점검·피드백하는 일련의 순환 체계.",
      "기존 MBO의 한계(통제·연단위·결과편중·형식화·평가도구화)를 보완하기 위해 OKR 원칙과 CSF/KPI 기반 목표수립을 결합.",
      "핵심 흐름: ① 목표수립 → ② Mid-year Review(체크인) → ③ 평가 → ④ Feedback → (차기 목표로 순환)."
    ]
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
    ]
  },
  {
    id: "p2", group: "process", label: "2단계\nMid-year Review\n(체크인)",
    summary: "평가자–피평가자 1:1 중간점검으로 목표 달성도를 점검하고 하반기 Catch-up 계획을 협의.",
    detail: [
      "시기: 통상 7월 (2분기 QBR과 연계).",
      "피평가자가 본인 중간점검 양식으로 달성도·부진원인·지원필요사항 설명.",
      "부진 항목 개선방향, Resource(인력/예산) 재배분, Milestone 조정 협의.",
      "OKR에서는 상시 '체크인(Check-in)' / Weekly Briefing으로 운영."
    ]
  },
  {
    id: "p3", group: "process", label: "3단계\n평가",
    summary: "자기평가 → 상사평가 → Calibration → 평가결과 확정·보상연계.",
    detail: [
      "시기: 통상 12~1월.",
      "자기평가(실적 집계·평점) → 상사평가(타당성 검토·정성평가) → Calibration Meeting(1·2차 평가자 조정).",
      "결과적 측정이 아닌 '성과의 해석': 목표 난이도·대내외 이슈를 고려한 상대적 판단.",
      "인재 스냅샷·Talent Session으로 객관성·공정성 보강."
    ]
  },
  {
    id: "p4", group: "process", label: "4단계\nFeedback",
    summary: "1:1 Feedback 면담으로 평가결과·성과급 근거를 공유하고 차년도 개선점을 협의.",
    detail: [
      "시기: 통상 1월.",
      "Feedback Note: 조직성과·개인성과·성과급 지급률·주요 코멘트.",
      "자기평가와 Gap 큰 항목, 미달성 KPI 중심으로 상세 논의.",
      "차기 목표 수립 시 고려사항으로 연결 → E2E 순환 완성."
    ]
  },

  /* ---------- OBJECTIVE (1단계 목표수립 세부) ---------- */
  {
    id: "o_job", group: "objective", label: "직무내용\nReview",
    summary: "사업계획·상위 조직장 목표·핵심 고유업무를 먼저 검토.",
    detail: [
      "Input: 사업계획, 상위 조직장의 목표 수립 결과, 핵심 고유업무.",
      "개인이 실제 책임지는 Main Task를 명확히 한다.",
      "이후 역할책임·CSF 도출의 출발점."
    ]
  },
  {
    id: "o_role", group: "objective", label: "역할책임\n정의",
    summary: "상위 조직장 목표 달성을 지원하기 위한 본인의 역할·책임을 정의.",
    detail: [
      "Cascading Matrix로 팀 KPI 대비 개인의 역할 정도(전체/일부 책임)를 가시화.",
      "주요 역할 → 개인 KPI로 연결되는 다리."
    ]
  },
  {
    id: "o_csf", group: "objective", label: "CSF 도출",
    summary: "핵심 고유업무별 핵심성공요인(Critical Success Factor)을 정의.",
    detail: [
      "Main Task를 성공적으로 수행하기 위한 기본적·핵심적 요건.",
      "Process/Function Charting 또는 Customer Mapping으로 도출.",
      "CSF → 성과 수준을 측정할 KPI로 연결."
    ]
  },
  {
    id: "o_kpi", group: "objective", label: "KPI 매칭",
    summary: "CSF별 성과수준을 측정할 KPI를 KPI Pool에서 선정.",
    detail: [
      "CSF에 대해 측정 가능한 KPI Pool을 구성.",
      "7대 적정성 기준(최소 3개 적용)으로 선정·검증.",
      "재무/전략/인재 KPI 균형 고려."
    ]
  },
  {
    id: "o_target", group: "objective", label: "목표수준\n설정",
    summary: "KPI별 계획(100)·Threshold(90)·Cap(120)과 전년도 실적을 설정.",
    detail: [
      "Target Level = (당해 Target − 전년도 실적) / 전년도 실적.",
      "도전적이되 달성가능(SMART)한 수준으로 설정.",
      "전년도 실적·특별요인을 평가 시 고려요소로 명시."
    ]
  },
  {
    id: "o_weight", group: "objective", label: "가중치\n부여",
    summary: "KPI 항목별 Impact·전략적 중요도에 따라 가중치 배분.",
    detail: [
      "변별력 유지 가능한 적정 항목 수.",
      "개발(육성) 항목 가중치 최소 5% 이상 권장.",
      "재무/전략/인재 카테고리 Balance 점검."
    ]
  },
  {
    id: "o_confirm", group: "objective", label: "목표 검토회의\n· 확정",
    summary: "상위자와 Alignment·Target·가중치 적정성을 협의 후 서명·확정.",
    detail: [
      "목표 검토 Checklist + Cascading Matrix 활용.",
      "1차/2차 평가자 서명으로 Confirm.",
      "산출물: 목표설정서 수정·확정본, 검토회의 결과 정리."
    ]
  },

  /* ---------- CONTEXT (맥락: 목표수립 Input) ---------- */
  {
    id: "c_job", group: "context", label: "직무내용\n맥락",
    summary: "개인 Job Description·고유 업무. 'Specific'한 목표의 근거.",
    detail: [
      "개인의 역할/책임·업무 특성에 맞게 재무/전략 KPI가 도출되었는지 점검.",
      "Process/Function Charting의 출발 Input."
    ]
  },
  {
    id: "c_strategy", group: "context", label: "전략 맥락",
    summary: "전사·BG 전략과제. 전략 KPI 도출의 근거.",
    detail: [
      "경영계획의 전략과제를 체계화·구체화(전략체계도).",
      "전략과제 달성에 영향을 주는 Key Driver → 예비 전략 KPI Pool.",
      "상위자 전략과제가 개인 전략 성과항목으로 배분되었는지 확인."
    ]
  },
  {
    id: "c_upper", group: "context", label: "상위지표\n맥락",
    summary: "상위 조직 KPI·목표. 개인 목표가 여기에 기여(Alignment)해야 함.",
    detail: [
      "개인 KPI가 상위자 KPI/목표와 연계성이 있는가?",
      "개인 목표의 합이 상위자 목표 수준에 미달하지 않아야 함.",
      "Cascading Method(Top-down)의 기준."
    ]
  },
  {
    id: "c_personal", group: "context", label: "개인 관점",
    summary: "개인 R&R·고객·산출물. Bottom-up 목표 발굴 관점.",
    detail: [
      "나의 주요 업무·산출물(성과)은 무엇인가?",
      "나의 고객은 누구이며 어떤 가치를 제공하는가? (Customer Mapping)",
      "성과 향상을 위해 가장 개선이 필요한 부분은?"
    ]
  },
  {
    id: "c_prev", group: "context", label: "전년도 수준",
    summary: "전년도 실적·달성도·가중치. 목표수준 산정의 기준선.",
    detail: [
      "전년도 KPI 달성도·목표수준과 올해 목표수준 비교.",
      "전년도 대비 도전적인지, 가중치가 부당하게 축소되지 않았는지 점검.",
      "제외된 KPI 중 전년도 달성도 낮은 항목 확인."
    ]
  },
  {
    id: "c_collab", group: "context", label: "협업 맥락",
    summary: "유관부서·협력조직과의 수평적 연결. Alignment의 한 축.",
    detail: [
      "협업 관계 조직 간 OKR 설정 시 섬세한 조정 필요.",
      "협업 조직 간 OKR Cycle 주기 일치 권장.",
      "Customer Mapping의 내부고객(지원부서·영업부 등)."
    ]
  },
  {
    id: "c_support", group: "context", label: "보조 맥락\n(Support)",
    summary: "재무성과를 간접 지원하는 직무. Support OKR로 정렬.",
    detail: [
      "Core OKR: 재무성과 직접 창출/기여 → 직접적 Alignment.",
      "Support OKR: 자원·사람으로 간접 지원 → 간접적 Alignment.",
      "정성적 가치를 KR로 정량화, 구체적 Initiative 설정."
    ]
  },

  /* ---------- INDICATOR (지표: CSF/KPI) ---------- */
  {
    id: "i_method", group: "indicator", label: "KPI 도출\n3대 방법",
    summary: "Cascading / Process·Function Charting / Customer Mapping.",
    detail: [
      "A. Cascading(Top-down): 상위 전략목표가 명확할 때.",
      "B. Process/Function Charting: 업무가 프로세스로 종결되는 조직.",
      "C. Customer Mapping: 대상 고객별 기대결과 중심(지원기능)."
    ]
  },
  {
    id: "i_cascading", group: "indicator", label: "Cascading\nMethod",
    summary: "전사 목표 → 하위조직 핵심성공요소 기준 목표 배분(Top-down).",
    detail: [
      "Span of Control·영향도를 감안해 목표 Cascading.",
      "재무 KPI는 Value Driver Tree로 Key Value Driver 도출."
    ]
  },
  {
    id: "i_vdt", group: "indicator", label: "Value\nDriver Tree",
    summary: "재무성과 증감 Driver 간 인과관계로 KPI Pool 도출.",
    detail: [
      "목표 + 달성방안으로 구성, MECE하게 점차 구체화.",
      "예) 수익향상 = 매출증대 + 비용감소 → 고객기반 확대 …",
      "재무/전략/운영 KPI 모두에 적용 가능."
    ]
  },
  {
    id: "i_process", group: "indicator", label: "Process/Function\nCharting",
    summary: "Biz Process → Main Task → CSF → KPI Pool 순으로 도출.",
    detail: [
      "Value Chain에서 주요 Biz Process/Main Function 도출.",
      "Step: Process정의 → 고유 핵심업무 → CSF 정의 → KPI 도출.",
      "예) 직접 수주·Dealer 관리 → 기존고객 유지/신규창출 → 신규 고객 매출액."
    ]
  },
  {
    id: "i_customer", group: "indicator", label: "Customer\nMapping",
    summary: "고객 Needs 기준으로 활동 결과를 정의해 KPI 도출.",
    detail: [
      "고객 List-up·Category화 → 주요 역할/활동 → CSF → KPI.",
      "내부고객(지원부서/영업부/팀원/협력업체) 포함.",
      "예) 소비자 만족도 향상 → 고객 Needs Survey 이행률."
    ]
  },
  {
    id: "i_csf", group: "indicator", label: "핵심성공요인\nCSF",
    summary: "Main Task를 성공시키는 핵심 요건. KPI의 직전 단계.",
    detail: [
      "예) '정확한 시장정보 조기 파악', '기존고객 유지·신규창출'.",
      "CSF별로 측정 가능한 KPI를 매칭한다."
    ]
  },
  {
    id: "i_pool", group: "indicator", label: "KPI Pool",
    summary: "CSF에서 도출된 측정지표 후보군.",
    detail: [
      "도출 후 7대 적정성 기준으로 선정·검증.",
      "재무·전략·인재 카테고리로 분류."
    ]
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
    ]
  },
  {
    id: "i_fin", group: "indicator", label: "재무 KPI",
    summary: "매출·EBIT·DSO 등 재무 목표. Core 직무에 직접 연계.",
    detail: ["VDT로 도출. 계획(100)/Threshold(90)/Cap(120)과 전년도 실적 명시."]
  },
  {
    id: "i_strat", group: "indicator", label: "전략 KPI",
    summary: "전략과제 달성도. 별도 전략MBO 계획서·Milestone 작성(중역).",
    detail: ["전략체계도·Key Driver 기반. 성공의 정의(중장기)·Action Plan 포함."]
  },
  {
    id: "i_people", group: "indicator", label: "인재 KPI",
    summary: "육성·조직역량 등 정성 가치. 정성가치를 KR로 정량화.",
    detail: ["개발 항목 가중치 최소 5% 이상 권장. HR이 Overall Review."]
  },

  /* ---------- PRINCIPLE (원칙) ---------- */
  {
    id: "pr_okr", group: "principle", label: "OKR 정의",
    summary: "Objective(목표) + Key Results(2~5개 핵심결과).",
    detail: [
      "Objective: 성취하고자 하는 것의 표현 — 간결·영감·도전적.",
      "Key Result: 진행과정을 측정하는 결과지표, 양적·측정가능.",
      "현상유지를 벗어나는 목표만이 진정한 목표."
    ]
  },
  {
    id: "pr_fast", group: "principle", label: "FAST 원칙",
    summary: "Focus·Align·Stretch·Track. OKR 4대 핵심원칙.",
    detail: [
      "Focus(집중과 전념): 우선순위 3~5개 목표·각 5개 이하 KR.",
      "Align(정렬과 연결): 수직·수평 정렬, 투명성.",
      "Stretch(도전적 목표): 능력의 한계를 넘는 목표.",
      "Track & Update(추적과 변용): 지속/보완/시작/중단."
    ]
  },
  {
    id: "pr_smart", group: "principle", label: "SMART 원칙",
    summary: "Specific·Measurable·Achievable·Realistic·Time-bound.",
    detail: [
      "목표 검토회의 Checklist의 핵심 기준.",
      "개인은 KPI와 연관된 3~5개 목표를 SMART하게 설정.",
      "측정 가능한 동사·기한 명시로 작성."
    ]
  },
  {
    id: "pr_bii", group: "principle", label: "BII",
    summary: "Build·Improve·Innovate. 도전적 목표의 방향.",
    detail: [
      "Build: 기존에 없던 것을 만들어내거나,",
      "Improve: 기존의 것을 발전시키거나,",
      "Innovate: 혁신을 통해 재창조.",
      "직무특성별 OKR 수립(Core/Support)의 기준."
    ]
  },

  /* ---------- OPERATION (운영) ---------- */
  {
    id: "op_checkin", group: "operation", label: "체크인 /\nMid-year Review",
    summary: "상시·중간 점검으로 진척을 확인하고 목표를 보완.",
    detail: [
      "공식 중간점검 면담(1:1) + 상시 체크인 병행.",
      "업무 진척도·달성 핵심결과·지원요청 3대 Agenda.",
      "성취/장애 시 회고로 지속·보완·중단 결정."
    ]
  },
  {
    id: "op_weekly", group: "operation", label: "Weekly\nBriefing",
    summary: "Start Meeting(월)·Review Briefing(금)으로 주간 점검·회고.",
    detail: [
      "Start: 주간 달성계획·핵심결과를 Kanban/Scrum에 사전 공유.",
      "Review: 진척도·달성 KR·이슈 리뷰 후 Next Step.",
      "KPTA 검토법으로 Self-Check 구조화."
    ]
  },
  {
    id: "op_cfr", group: "operation", label: "CFR",
    summary: "Conversation·Feedback·Recognition. OKR을 떠받치는 소통.",
    detail: [
      "OKR 프로세스를 성공적으로 운영하기 위한 뒷받침.",
      "Kudos(동료 감사)·360 피드백·배지로 인정 문화."
    ]
  },
  {
    id: "op_review", group: "operation", label: "종합리뷰\n· 회고노트",
    summary: "개인 종합리뷰 → 상위관리자 리뷰 → OKR 지향노트.",
    detail: [
      "FAST 4축 체크리스트로 자가 종합리뷰.",
      "차기 OKR 정교화를 위한 참고자료.",
      "지속/보완/중단 결정 가이드."
    ]
  },
  {
    id: "op_eval", group: "operation", label: "성과 해석",
    summary: "최종 결과가 아닌 난이도·이슈를 고려한 상대적 판단.",
    detail: [
      "목표 난이도(영향력·혁신성·복잡성·불확실성).",
      "환경 이슈(사회·시장·고객·경쟁사), 내부 이슈(전략·지원·권한·계약).",
      "BII 도전목표 70% 이상 달성 시 '달성했다' 판단."
    ]
  },
  {
    id: "op_talent", group: "operation", label: "인재 스냅샷\n· Talent Session",
    summary: "성과·역량·종합 정보로 다각적 인재 논의(평가 오류 점검).",
    detail: [
      "성과곡선은 정규분포가 아닌 '멱함수' — 핵심인재 소수.",
      "관대화·가혹화·중심화·연공 오류 자가진단.",
      "논의를 통한 객관성·공정성 향상."
    ]
  },
  {
    id: "op_change", group: "operation", label: "변화관리\n3단계",
    summary: "가치 정의 → 적용·촉진(Pioneer) → 전파·확장.",
    detail: [
      "Step1: 임원/CEO 변화의지·도전적 변화목표·장기투자.",
      "Step2: 소규모 Pioneer team 실행·문화 양성.",
      "Step3: 연속 Action Plan·역량향상·운영모델 확장·정착."
    ]
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
    ]
  }
];

const EDGES = [
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
  { from: "root", to: "pr_okr" },
  { from: "pr_okr", to: "pr_fast" },
  { from: "pr_okr", to: "pr_bii" },
  { from: "p1", to: "pr_smart", dashes: true },
  { from: "o_target", to: "pr_smart", dashes: true },
  { from: "pr_fast", to: "o_confirm", dashes: true },
  { from: "pr_bii", to: "i_strat", dashes: true },

  /* 운영 */
  { from: "root", to: "op_checkin" },
  { from: "p2", to: "op_checkin" },
  { from: "op_checkin", to: "op_weekly" },
  { from: "op_weekly", to: "op_cfr" },
  { from: "op_checkin", to: "op_review" },
  { from: "p3", to: "op_eval" },
  { from: "p3", to: "op_talent" },
  { from: "op_review", to: "p4", dashes: true },
  { from: "root", to: "op_change" },
  { from: "op_change", to: "op_action" },
  { from: "op_action", to: "op_cfr", dashes: true }
];
