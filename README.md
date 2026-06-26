# 개인 E2E 성과관리 · HR 아키텍처 마인드맵

순수 HTML/CSS/Vanilla JS 기반 인터랙티브 마인드맵. **빌드 과정 없이** `index.html`을 브라우저로 바로 열면 동작합니다 (vis-network는 CDN 로드, 인터넷 연결 필요).

GitHub Pages 호스팅: <https://0101-commits.github.io/mindmap/>

## 구성
| 파일 | 역할 |
|------|------|
| `index.html` | UI 뼈대 + 라이브러리·폰트 로드 + 메타/파비콘 |
| `style.css` | 디자인 · 사이드 패널 · 접근성 |
| `script.js` | 렌더링 · 필터 · 패널 · CRUD · 내보내기/가져오기 · 딥링크 |
| `data.js` | 4개 프로세스 템플릿의 노드/엣지 데이터 |

## 콘텐츠 (출처)
HCG **OKR Manual Deck**(108p) + **PM Manual(Masterbook)**(180p) + 기획회의(개인 E2E 성과관리·1단계 목표수립)를 결합. 각 노드 패널 하단에 **📄 출처** 배지로 근거 페이지를 표기합니다.

4개 프로세스 템플릿(상단 *프로세스 종류* 드롭다운으로 전환):

| 템플릿 | 내용 | 노드 수 |
|--------|------|:---:|
| **E2E 통합** | 목표수립→체크인→평가→피드백 + CSF→KPI + HR AI 4-Layer 아키텍처 | 65 |
| **OKR** | History·MBO한계·OKR Canvas 5단계·FAST·Alignment·CFR·변화관리 | 40 |
| **MBO** | 1.목표수립 → 2.Mid-year → 3.평가 → 4.Feedback 세부 Activity·산출물 | 35 |
| **역량·육성** | 진단(역량모델·BARS) → 육성(IDP·70:20:10) → 평가 → 배치·승계(9-Box) | 25 |

## 주요 기능
- **2축 필터(AND)**: 그룹(기능) ∩ Layer 교집합. 칩 클릭=표시/숨김, 더블클릭/Shift+Enter=단독 보기.
- **5가지 레이아웃**: 자유(물리) / 수직계층 / 수평계층 / Layer 그룹화 / 기능 군집.
- **검색**: 키워드 다중 매칭 → 결과 리스트 + 매칭 노드 일괄 하이라이트.
- **CRUD**: 노드 추가/수정/삭제, 연결선 실선·점선 토글(선 더블클릭).
- **색상 커스터마이징**: 그룹별 색상 Picker (노드·필터 즉시 반영).
- **History**: localStorage 스냅샷 저장·복원(최대 30개).
- **내보내기/가져오기**: `data.export.js`(JS) · JSON 내보내기/가져오기(검증) · 현재 화면 PNG.
- **URL 딥링크**: 템플릿·필터·선택 노드 상태를 `?tpl&g&l&node`로 공유·복원.

## 데이터 스키마 (`data.js`)
```
GROUPS = { key: { label, color } }
PROCESS_TEMPLATES = {
  tid: { name, desc, layers:{key:{label}}, groupLayer:{group:layer}, nodes, edges }
}
DEFAULT_TEMPLATE = "e2e"
```
- **노드**: `{ id, group, layer?, label, summary, detail[], src? }`
- **엣지**: `{ from, to, dashes?, label?, rel? }`
- **선택 필드**(미지정 시 기존 동작 유지):
  - `node.src` — 출처. 패널 하단 배지로 표시.
  - `edge.label` — 관계명. 엣지에 라벨 렌더.
  - `edge.rel` — 관계 유형 `contribute|cascade|measure|align`. 유형별 색/방향(화살표) 차등.

`localStorage` 키: `mm_v3_state` / `mm_v3_work_<tid>` / `mm_v3_history` (하위호환 유지).

## 외부 리소스 (고정 버전 + SRI)
| 리소스 | 버전 | 무결성 |
|--------|------|--------|
| vis-network | 10.1.0 (jsDelivr) | SHA-384 SRI + crossorigin |
| Pretendard | 1.3.9 (dynamic-subset) | SHA-384 SRI |

## 접근성
- 필터 칩 시맨틱 `<button>` + `aria-pressed` + 키보드(Enter/Space 토글, Shift+Enter 단독).
- `:focus-visible` 키보드 포커스 표시, `#network` `aria-label` + 스크린리더 설명.
- `prefers-reduced-motion` 존중(애니메이션 억제), 패널 태그 배경 명도 기반 글자색 자동 대비.

## 사용법
1. `index.html` 더블클릭 (또는 Pages URL 접속).
2. 노드 클릭 → 우측 상세 패널(요약·상세·출처·연결). 상단 칩 → 필터. 검색창 키워드 후 Enter.
3. 상단 우측 *정렬* 로 레이아웃 전환, 좌측 툴바로 편집·저장·내보내기.
