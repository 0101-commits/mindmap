/* ===================================================
   E2E 성과관리 · HR 아키텍처 마인드맵 — 로직 (v3)
   라이브러리: vis-network (CDN)
   의존: data.js (GROUPS, PROCESS_TEMPLATES, DEFAULT_TEMPLATE, NODES, EDGES)

   기능:
     1) 렌더링 최적화 — devicePixelRatio 적용 + 폰트 선명화
     2) Save / History — localStorage 스냅샷 저장·복원
     3) 연결선 스타일 — 실선/점선 선택·수정(dashes)
     4) 다각적 레이아웃 — 수직계층 / 수평계층 / Layer그룹화 / 기능군집
     5) 색상 커스터마이징 — 노드·필터 색상 Color Picker
     6) 다중 필터(AND) — 그룹 필터 ∩ Layer 필터
     7) 단독 보기(Isolate) — 조건 외 요소를 숨김(hidden)
     8) 프로세스 템플릿 — 종류 선택 드롭다운으로 트리 교체
   =================================================== */

/* ============================================================
   0. 저장소 키 / 유틸
   ============================================================ */
var LS_STATE   = "mm_v3_state";        // { tid }
var LS_WORK    = "mm_v3_work_";        // + tid → { nodes, edges, colors }
var LS_HISTORY = "mm_v3_history";      // [ { ts, tid, name, nodes, edges, colors } ]
var HISTORY_MAX = 30;

/* P1-2: 들어온 딥링크는 updateUrl()이 덮어쓰기 전에 캡처해 둔다 */
var INITIAL_SEARCH = location.search;

function clone(o) { return JSON.parse(JSON.stringify(o)); }

/* XSS 하드닝(P0-3): innerHTML 보간 시 사용 */
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function lsGet(k) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

function newEdgeId() { return "ed" + Date.now().toString(36) + Math.floor(Math.random() * 1e4); }
function newNodeId() { return "u" + Date.now().toString(36) + Math.floor(Math.random() * 1e4); }

/* ============================================================
   1. 상태 (현재 템플릿 / 작업 데이터)
   ============================================================ */
var tid = (lsGet(LS_STATE) || {}).tid;
if (!tid || !PROCESS_TEMPLATES[tid]) tid = DEFAULT_TEMPLATE;

var TPL = PROCESS_TEMPLATES[tid];
var rawNodes, rawEdges;

/* group → 기본 색상 백업(복원용) */
var GROUP_BASE_COLOR = {};
Object.keys(GROUPS).forEach(function (k) { GROUP_BASE_COLOR[k] = GROUPS[k].color; });

function applyColors(colors) {
  // 먼저 기본색으로 리셋 후 저장된 커스텀 색 적용
  Object.keys(GROUPS).forEach(function (k) { GROUPS[k].color = GROUP_BASE_COLOR[k]; });
  if (colors) Object.keys(colors).forEach(function (k) { if (GROUPS[k]) GROUPS[k].color = colors[k]; });
}

function loadTemplateData(id) {
  var t = PROCESS_TEMPLATES[id];
  var work = lsGet(LS_WORK + id);
  if (work && work.nodes && work.edges) {
    rawNodes = clone(work.nodes);
    rawEdges = clone(work.edges);
    applyColors(work.colors);
  } else {
    rawNodes = clone(t.nodes);
    rawEdges = clone(t.edges);
    applyColors(null);
  }
  // 엣지 id 보장
  var seq = 0;
  rawEdges.forEach(function (e) { if (!e.id) e.id = "e" + (seq++); });
}

loadTemplateData(tid);

/* 현재 색상 맵(커스텀 포함) */
function currentColors() {
  var c = {};
  Object.keys(GROUPS).forEach(function (k) { c[k] = GROUPS[k].color; });
  return c;
}

function saveWork() {
  lsSet(LS_WORK + tid, { nodes: rawNodes, edges: rawEdges, colors: currentColors() });
  lsSet(LS_STATE, { tid: tid });
}

/* ============================================================
   2. 색상 헬퍼 / vis 객체 변환
   ============================================================ */
function shade(hex, pct) {
  var f = parseInt(hex.slice(1), 16),
      t = pct < 0 ? 0 : 255, p = Math.abs(pct) / 100,
      R = f >> 16, G = (f >> 8) & 0xff, B = f & 0xff;
  return "#" + (0x1000000 +
    (Math.round((t - R) * p) + R) * 0x10000 +
    (Math.round((t - G) * p) + G) * 0x100 +
    (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

// 요구사항 1: 디바이스 픽셀 비율 — 폰트를 DPR 배수로 키워 렌더 후 축소 → 선명
var DPR = window.devicePixelRatio || 1;
function fontSize(base) { return Math.round(base * (DPR >= 2 ? 1.15 : 1)); }

function makeVisNode(n) {
  var grp = GROUPS[n.group] || { color: "#64748b" };
  var c = grp.color;
  var isRoot = n.id === "root";
  return {
    id: n.id,
    label: n.label,
    group: n.group,
    shape: isRoot ? "circle" : "box",
    opacity: 1,
    hidden: false,
    color: {
      background: c,
      border: shade(c, -18),
      highlight: { background: shade(c, 12), border: shade(c, -25) },
      hover: { background: shade(c, 8), border: shade(c, -25) }
    },
    font: {
      color: "#111827",                 // 글자색 검정(잉크)
      size: isRoot ? fontSize(20) : fontSize(14),
      face: "Pretendard, Segoe UI, Malgun Gothic, sans-serif",
      strokeWidth: 3,                    // 진한 배경에서도 가독 — 흰색 외곽선(halo)
      strokeColor: "#ffffff",
      multi: false
    },
    borderWidth: 2,
    margin: isRoot ? 14 : 10,
    widthConstraint: isRoot ? 110 : { maximum: 160 },
    mass: isRoot ? 4 : 1.3
  };
}

function edgeBaseColor(e) {
  return e.dashes ? { color: "#94a3b8", opacity: 0.7 } : { color: "#cbd5e1", opacity: 1 };
}
function makeVisEdge(e) {
  return {
    id: e.id, from: e.from, to: e.to, dashes: !!e.dashes, hidden: false,
    width: e.dashes ? 1 : 2,
    color: edgeBaseColor(e),
    smooth: { enabled: true, type: "cubicBezier", roundness: 0.55 }
  };
}

/* ============================================================
   3. 네트워크 생성
   ============================================================ */
var visNodes = new vis.DataSet(rawNodes.map(makeVisNode));
var visEdges = new vis.DataSet(rawEdges.map(makeVisEdge));
var container = document.getElementById("network");

var freePhysics = {
  enabled: true,
  solver: "forceAtlas2Based",
  forceAtlas2Based: { gravitationalConstant: -55, centralGravity: 0.012, springLength: 130, springConstant: 0.09, avoidOverlap: 0.6 },
  stabilization: { iterations: 220 },
  minVelocity: 0.6
};

var options = {
  layout: { improvedLayout: true, hierarchical: { enabled: false } },
  interaction: { hover: true, tooltipDelay: 150, navigationButtons: true, keyboard: false, hideEdgesOnZoom: false },
  physics: freePhysics,
  nodes: { shadow: { enabled: true, size: 8, x: 0, y: 3, color: "rgba(15,23,42,.18)" } },
  edges: { arrows: { to: { enabled: false } } }
};

var network = new vis.Network(container, { nodes: visNodes, edges: visEdges }, options);

network.once("stabilizationIterationsDone", function () {
  network.setOptions({ physics: false });
});

/* ---- 요구사항 1: 렌더링 최적화 (DPR + 선명도 보정) ----
   vis-network는 캔버스 backing store에 window.devicePixelRatio를 적용한다.
   줌/리사이즈 시 캔버스를 강제 redraw 하여 라벨이 흐려지지 않게 보정한다. */
function refreshDprAndRedraw() {
  DPR = window.devicePixelRatio || 1;
  if (network && network.redraw) network.redraw();
}
var zoomTimer = null;
network.on("zoom", function () {
  clearTimeout(zoomTimer);
  zoomTimer = setTimeout(refreshDprAndRedraw, 40);
});
var resizeTimer = null;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    refreshDprAndRedraw();
  }, 120);
});

/* ============================================================
   4. nodeMap / 레이어 헬퍼
   ============================================================ */
var nodeMap = {};
function rebuildMap() { nodeMap = {}; rawNodes.forEach(function (n) { nodeMap[n.id] = n; }); }
rebuildMap();

function nodeLayer(n) {
  return n.layer || (TPL.groupLayer && TPL.groupLayer[n.group]) || "_";
}

/* ============================================================
   5. Focus / Highlight (이웃 강조)
   ============================================================ */
var dimmed = false;

function applyDim(keepNodes, keepEdges) {
  var nu = rawNodes.map(function (n) {
    return { id: n.id, opacity: keepNodes.has(n.id) ? 1 : 0.15 };
  });
  var eu = rawEdges.map(function (e) {
    var on = keepEdges.has(e.id);
    return { id: e.id, color: on ? { color: "#356CB5", opacity: 1 } : { color: "#cbd5e1", opacity: 0.08 } };
  });
  visNodes.update(nu);
  visEdges.update(eu);
  dimmed = true;
}

function highlightNode(id) {
  var keepSet = new Set([id]);
  network.getConnectedNodes(id).forEach(function (n) { keepSet.add(n); });
  var keepE = new Set(network.getConnectedEdges(id));
  applyDim(keepSet, keepE);
}

function highlightEdge(edgeId) {
  var e = visEdges.get(edgeId);
  if (!e) return;
  applyDim(new Set([e.from, e.to]), new Set([edgeId]));
  var a = nodeMap[e.from], b = nodeMap[e.to];
  if (a && b) toast(a.label.replace(/\n/g, " ") + "  ↔  " + b.label.replace(/\n/g, " "));
}

function clearDim() {
  if (!dimmed) return;
  visNodes.update(rawNodes.map(function (n) { return { id: n.id, opacity: 1 }; }));
  visEdges.update(rawEdges.map(function (e) { return { id: e.id, color: edgeBaseColor(e) }; }));
  dimmed = false;
}

/* ============================================================
   6. 사이드 패널 (탭: 정보 / History / 색상)
   ============================================================ */
var panel = document.getElementById("sidepanel");
var currentId = null;

function setTab(name) {
  ["info", "history", "color"].forEach(function (t) {
    var btn = document.getElementById("tab-" + t);
    var sec = document.getElementById("pane-" + t);
    if (btn) btn.classList.toggle("active", t === name);
    if (sec) sec.style.display = (t === name) ? "block" : "none";
  });
}

function openPanelTab(name) {
  panel.classList.remove("closed");
  setTab(name);
  if (name === "history") renderHistory();
  if (name === "color") renderColorPicker();
}

function openPanel(id) {
  var n = nodeMap[id];
  if (!n) return;
  currentId = id;
  var g = GROUPS[n.group] || { label: "기타", color: "#64748b" };

  var tag = document.getElementById("panelTag");
  tag.textContent = g.label;
  tag.style.background = g.color;

  document.getElementById("panelTitle").textContent = n.label.replace(/\n/g, " ");
  document.getElementById("panelSummary").textContent = n.summary || "";
  document.getElementById("panelActions").style.display = "flex";

  var ul = document.getElementById("panelDetail");
  ul.innerHTML = "";
  (n.detail || []).forEach(function (d) {
    var li = document.createElement("li"); li.textContent = d; ul.appendChild(li);
  });

  var related = [];
  rawEdges.forEach(function (e) {
    if (e.from === id && related.indexOf(e.to) < 0) related.push(e.to);
    if (e.to === id && related.indexOf(e.from) < 0) related.push(e.from);
  });
  var wrap = document.getElementById("panelRelatedWrap");
  var box = document.getElementById("panelRelated");
  box.innerHTML = "";
  if (related.length) {
    wrap.style.display = "block";
    related.forEach(function (rid) {
      if (!nodeMap[rid]) return;
      var pill = document.createElement("span");
      pill.className = "related-pill";
      pill.textContent = nodeMap[rid].label.replace(/\n/g, " ");
      pill.onclick = function () { focusNode(rid); };
      box.appendChild(pill);
    });
  } else { wrap.style.display = "none"; }

  panel.classList.remove("closed");
  setTab("info");
  updateUrl();   // P1-2: 선택 노드 URL 반영
}

function closePanel() {
  panel.classList.add("closed");
  document.getElementById("panelActions").style.display = "none";
  currentId = null;
  updateUrl();   // P1-2
}

function focusNode(id) {
  if (!nodeMap[id]) return;
  network.selectNodes([id]);
  network.focus(id, { scale: 1.05, animation: { duration: 500, easingFunction: "easeInOutQuad" } });
  if (!isolateSet) highlightNode(id);
  openPanel(id);
}

document.getElementById("panelClose").onclick = function () {
  closePanel(); network.unselectAll(); clearDim();
};

network.on("click", function (params) {
  if (params.nodes.length) {
    var id = params.nodes[0];
    if (!isolateSet) highlightNode(id);
    openPanel(id);
  } else if (params.edges.length) {
    if (!isolateSet) highlightEdge(params.edges[0]);
  } else {
    clearDim(); closePanel();
  }
  var sr = document.getElementById("searchResults"); if (sr) sr.classList.add("hidden");
});

// 더블클릭: 노드 → 수정 / 엣지 → 선 스타일(실선·점선) 토글 (요구사항 3)
network.on("doubleClick", function (params) {
  if (params.nodes.length) {
    openModalEdit(params.nodes[0]);
  } else if (params.edges.length) {
    toggleEdgeDash(params.edges[0]);
  }
});

/* ============================================================
   7. 필터 — 그룹(기능) 축 + Layer 축 (요구사항 6: AND/교집합)
   ============================================================ */
var activeGroups = {};   // groupKey → bool
var activeLayers = {};   // layerKey → bool

function groupsInTemplate() {
  var seen = {}; var order = [];
  rawNodes.forEach(function (n) { if (!seen[n.group]) { seen[n.group] = 1; order.push(n.group); } });
  // GROUPS 정의 순서를 우선
  return Object.keys(GROUPS).filter(function (k) { return seen[k]; });
}
function layersInTemplate() {
  return Object.keys(TPL.layers || {});
}

function initFilters() {
  activeGroups = {}; activeLayers = {};
  groupsInTemplate().forEach(function (k) { activeGroups[k] = true; });
  layersInTemplate().forEach(function (k) { activeLayers[k] = true; });
}

var chipWrap = document.getElementById("filterChips");
var layerWrap = document.getElementById("layerChips");

/* 칩 1개 생성 — 시맨틱 <button>(P0-4) + DOM 조립(P0-3 XSS 안전).
   클릭/Enter/Space=토글, 더블클릭·Shift+Enter=단독 보기. */
function makeChip(opt) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "chip" + (opt.cls ? " " + opt.cls : "") + (opt.active ? "" : " off");
  btn.setAttribute("aria-pressed", opt.active ? "true" : "false");
  btn.title = "클릭/Enter=표시·숨김 · 더블클릭/Shift+Enter=단독 보기";
  if (opt.dotColor) {
    var dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = opt.dotColor;
    btn.appendChild(dot);
  }
  btn.appendChild(document.createTextNode(opt.label + " "));
  var cnt = document.createElement("span");
  cnt.className = "cnt";
  cnt.textContent = opt.count;
  btn.appendChild(cnt);

  btn.onclick = function () {
    if (isolateSet) exitIsolate(true);
    var on = opt.toggle();
    btn.classList.toggle("off", !on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    applyVisibility();
  };
  btn.ondblclick = function (e) { e.preventDefault(); opt.isolate(); };
  btn.addEventListener("keydown", function (e) {
    if (e.shiftKey && e.key === "Enter") { e.preventDefault(); opt.isolate(); }
  });
  return btn;
}

function buildChips() {
  // 그룹(기능) 칩
  chipWrap.innerHTML = "";
  var gCounts = {};
  rawNodes.forEach(function (n) { gCounts[n.group] = (gCounts[n.group] || 0) + 1; });
  groupsInTemplate().forEach(function (k) {
    var g = GROUPS[k];
    chipWrap.appendChild(makeChip({
      label: g.label, count: gCounts[k] || 0, dotColor: g.color, active: activeGroups[k],
      toggle: function () { activeGroups[k] = !activeGroups[k]; return activeGroups[k]; },
      isolate: function () { isolateBy(function (n) { return n.group === k; }, "그룹 단독: " + g.label); }
    }));
  });

  // Layer 칩
  layerWrap.innerHTML = "";
  var lays = layersInTemplate();
  var lCounts = {};
  rawNodes.forEach(function (n) { var L = nodeLayer(n); lCounts[L] = (lCounts[L] || 0) + 1; });
  lays.forEach(function (k) {
    var L = TPL.layers[k];
    layerWrap.appendChild(makeChip({
      label: L.label, count: lCounts[k] || 0, cls: "layer-chip", active: activeLayers[k],
      toggle: function () { activeLayers[k] = !activeLayers[k]; return activeLayers[k]; },
      isolate: function () { isolateBy(function (n) { return nodeLayer(n) === k; }, "Layer 단독: " + L.label); }
    }));
  });
}

/* 단일 가시성 계산: 필터(AND) + 단독보기 */
function isVisibleNode(n) {
  if (isolateSet) return isolateSet.has(n.id);
  var gOn = activeGroups[n.group] !== false;
  var lOn = activeLayers[nodeLayer(n)] !== false;
  return gOn && lOn;   // 요구사항 6: 그룹 ∩ Layer
}

function applyVisibility() {
  clearDim();
  var vis = {};
  visNodes.update(rawNodes.map(function (n) {
    var s = isVisibleNode(n); vis[n.id] = s;
    return { id: n.id, hidden: !s };
  }));
  visEdges.update(rawEdges.map(function (e) {
    return { id: e.id, hidden: !(vis[e.from] && vis[e.to]) };
  }));
  updateUrl();   // P1-2: 필터/가시성 변경 시 URL 동기화
}

document.getElementById("btnAll").onclick = function () {
  if (isolateSet) exitIsolate(true);
  groupsInTemplate().forEach(function (k) { activeGroups[k] = true; });
  layersInTemplate().forEach(function (k) { activeLayers[k] = true; });
  buildChips(); applyVisibility();
};
document.getElementById("btnNone").onclick = function () {
  if (isolateSet) exitIsolate(true);
  groupsInTemplate().forEach(function (k) { activeGroups[k] = false; });
  buildChips(); applyVisibility();
};

/* ============================================================
   8. 단독 보기 (요구사항 7) — 조건 외 요소 숨김
   ============================================================ */
var isolateSet = null;  // null=비활성 / Set(nodeId)=활성

var btnIsolateOff = document.getElementById("btnIsolateOff");

function isolateBy(pred, msg) {
  clearDim();
  isolateSet = new Set();
  rawNodes.forEach(function (n) { if (pred(n)) isolateSet.add(n.id); });
  if (isolateSet.size === 0) { isolateSet = null; toast("해당 조건의 노드 없음"); return; }
  applyVisibility();
  btnIsolateOff.style.display = "inline-block";
  network.fit({ animation: { duration: 500 } });
  toast("🎯 " + (msg || "단독 보기") + " (" + isolateSet.size + "개)");
}

function isolateNode(id) {
  if (!nodeMap[id]) return;
  var set = new Set([id]);
  network.getConnectedNodes(id).forEach(function (x) { set.add(x); });
  isolateBy(function (n) { return set.has(n.id); }, "노드 단독: " + nodeMap[id].label.replace(/\n/g, " "));
}

function exitIsolate(silent) {
  if (!isolateSet) return;
  isolateSet = null;
  btnIsolateOff.style.display = "none";
  applyVisibility();
  if (!silent) toast("단독 보기 해제");
}

btnIsolateOff.onclick = function () { exitIsolate(false); network.fit({ animation: { duration: 500 } }); };
document.getElementById("btnIsolateNode").onclick = function () { if (currentId) isolateNode(currentId); };

/* ============================================================
   9. 검색
   ============================================================ */
/* 매칭 노드 일괄 하이라이트 (P1-3) */
function highlightMany(idSet) {
  var keepE = new Set();
  rawEdges.forEach(function (e) { if (idSet.has(e.from) && idSet.has(e.to)) keepE.add(e.id); });
  applyDim(idSet, keepE);
}

function runSearch(raw) {
  var q = (raw || "").trim().toLowerCase();
  var box = document.getElementById("searchResults");
  box.innerHTML = ""; box.classList.add("hidden");
  if (!q) { clearDim(); return; }
  var hits = rawNodes.filter(function (n) {
    return ((n.label || "") + " " + (n.summary || "")).toLowerCase().indexOf(q) >= 0 && isVisibleNode(n);
  });
  if (hits.length === 0) { toast("검색 결과 없음 (필터/단독보기 확인)"); return; }

  // 매칭 일괄 강조
  highlightMany(new Set(hits.map(function (n) { return n.id; })));

  if (hits.length === 1) { focusNode(hits[0].id); return; }

  // 결과 리스트
  var head = document.createElement("div");
  head.className = "sr-head";
  head.textContent = "검색 결과 " + hits.length + "건 — 선택 시 이동";
  box.appendChild(head);
  hits.forEach(function (n) {
    var g = GROUPS[n.group] || { color: "#64748b" };
    var item = document.createElement("button");
    item.type = "button"; item.className = "sr-item"; item.setAttribute("role", "option");
    var dot = document.createElement("span"); dot.className = "sr-dot"; dot.style.background = g.color;
    item.appendChild(dot);
    item.appendChild(document.createTextNode(n.label.replace(/\n/g, " ")));
    item.onclick = function () { box.classList.add("hidden"); focusNode(n.id); };
    box.appendChild(item);
  });
  box.classList.remove("hidden");
  toast("🔍 " + hits.length + "건 매칭 (일괄 강조)");
}

document.getElementById("searchBox").addEventListener("keyup", function (ev) {
  if (ev.key === "Enter") runSearch(this.value);
  else if (ev.key === "Escape") document.getElementById("searchResults").classList.add("hidden");
});

/* ============================================================
   10. 레이아웃 (요구사항 4) — 4가지 + 자유배치
   ============================================================ */
var layoutBtns = ["btnFree", "btnVert", "btnHorz", "btnLayer", "btnCluster"];
function setActiveLayout(id) {
  layoutBtns.forEach(function (b) {
    var el = document.getElementById(b);
    if (el) el.classList.toggle("active", b === id);
  });
}

function fitAll() { clearDim(); network.fit({ animation: { duration: 600 } }); }

// 자유 배치(물리 재안정화)
function layoutFree() {
  setActiveLayout("btnFree");
  network.setOptions({ layout: { hierarchical: { enabled: false } }, physics: freePhysics });
  network.stabilize(220);
  network.once("stabilizationIterationsDone", function () {
    network.setOptions({ physics: false });
    fitAll();
  });
  toast("자유 배치 (물리)");
}

// ① 계층형 — 수직(Top-Down)
function layoutVertical() {
  setActiveLayout("btnVert");
  network.setOptions({
    physics: false,
    layout: { hierarchical: { enabled: true, direction: "UD", sortMethod: "directed",
      levelSeparation: 130, nodeSpacing: 150, treeSpacing: 210, blockShifting: true, edgeMinimization: true, parentCentralization: true } }
  });
  setTimeout(fitAll, 80);
  toast("계층형 · 수직 (Top-Down)");
}

// ② 계층형 — 수평(Left-Right)
function layoutHorizontal() {
  setActiveLayout("btnHorz");
  network.setOptions({
    physics: false,
    layout: { hierarchical: { enabled: true, direction: "LR", sortMethod: "directed",
      levelSeparation: 170, nodeSpacing: 110, treeSpacing: 200, blockShifting: true, edgeMinimization: true, parentCentralization: true } }
  });
  setTimeout(fitAll, 80);
  toast("계층형 · 수평 (Left-Right)");
}

// ③ Layer별 그룹화 — Layer 축으로 열(column) 정렬
function layoutByLayer() {
  setActiveLayout("btnLayer");
  network.setOptions({ physics: false, layout: { hierarchical: { enabled: false } } });
  var lays = layersInTemplate();
  if (lays.length === 0) lays = ["_"];
  var colGap = 360, rowGap = 90;
  var buckets = {};
  lays.forEach(function (k) { buckets[k] = []; });
  buckets["_"] = buckets["_"] || [];
  rawNodes.forEach(function (n) {
    var L = nodeLayer(n);
    if (!buckets[L]) buckets[L] = [];
    buckets[L].push(n.id);
  });
  Object.keys(buckets).forEach(function (L, ci) {
    var idx = lays.indexOf(L); if (idx < 0) idx = lays.length + ci;
    var x = idx * colGap - ((lays.length - 1) * colGap) / 2;
    var arr = buckets[L];
    var startY = -((arr.length - 1) * rowGap) / 2;
    arr.forEach(function (id, ri) {
      try { network.moveNode(id, x, startY + ri * rowGap); } catch (e) {}
    });
  });
  setTimeout(fitAll, 60);
  toast("Layer별 그룹화");
}

// ④ 기능별 군집화(Clustering) — 그룹을 방사형 클러스터로 배치
function layoutCluster() {
  setActiveLayout("btnCluster");
  network.setOptions({ physics: false, layout: { hierarchical: { enabled: false } } });
  var groups = groupsInTemplate();
  var R = Math.max(380, groups.length * 95);
  var byGroup = {};
  rawNodes.forEach(function (n) { (byGroup[n.group] = byGroup[n.group] || []).push(n.id); });
  groups.forEach(function (g, gi) {
    var ang = (gi / Math.max(1, groups.length)) * Math.PI * 2;
    var cx = Math.cos(ang) * R, cy = Math.sin(ang) * R;
    var arr = byGroup[g] || [];
    var r = Math.max(60, arr.length * 16);
    arr.forEach(function (id, ni) {
      if (arr.length === 1) { try { network.moveNode(id, cx, cy); } catch (e) {} return; }
      var a2 = (ni / arr.length) * Math.PI * 2;
      try { network.moveNode(id, cx + Math.cos(a2) * r, cy + Math.sin(a2) * r); } catch (e) {}
    });
  });
  setTimeout(fitAll, 60);
  toast("기능별 군집화 (Clustering)");
}

document.getElementById("btnFree").onclick = layoutFree;
document.getElementById("btnVert").onclick = layoutVertical;
document.getElementById("btnHorz").onclick = layoutHorizontal;
document.getElementById("btnLayer").onclick = layoutByLayer;
document.getElementById("btnCluster").onclick = layoutCluster;
document.getElementById("btnFit").onclick = fitAll;

/* ============================================================
   11. 연결선 스타일 토글 (요구사항 3)
   ============================================================ */
function toggleEdgeDash(edgeId) {
  var raw = rawEdges.find(function (e) { return e.id === edgeId; });
  if (!raw) return;
  raw.dashes = !raw.dashes;
  visEdges.update(makeVisEdge(raw));
  saveWork();
  toast(raw.dashes ? "점선으로 변경" : "실선으로 변경");
}

/* ============================================================
   12. CRUD 모달 (노드 + 연결선 스타일)
   ============================================================ */
var modal = document.getElementById("modal");
var fLabel = document.getElementById("fLabel");
var fGroup = document.getElementById("fGroup");
var fSummary = document.getElementById("fSummary");
var fDetail = document.getElementById("fDetail");
var fConnect = document.getElementById("fConnect");
var fEdgeStyle = document.getElementById("fEdgeStyle");
var connectRow = document.getElementById("connectRow");
var fDelete = document.getElementById("fDelete");
var modalMode = "add";
var editId = null;

function fillGroupSelect() {
  fGroup.innerHTML = "";
  groupsInTemplate().concat(Object.keys(GROUPS).filter(function (k) { return groupsInTemplate().indexOf(k) < 0; }))
    .forEach(function (k) {
      var o = document.createElement("option");
      o.value = k; o.textContent = GROUPS[k].label;
      fGroup.appendChild(o);
    });
}
function fillConnectSelect() {
  fConnect.innerHTML = '<option value="">— 연결 없음 —</option>';
  rawNodes.slice().sort(function (a, b) {
    return (a.label || "").localeCompare(b.label || "");
  }).forEach(function (n) {
    var o = document.createElement("option");
    o.value = n.id; o.textContent = n.label.replace(/\n/g, " ");
    fConnect.appendChild(o);
  });
}

function openModalAdd() {
  modalMode = "add"; editId = null;
  document.getElementById("modalTitle").textContent = "노드 추가";
  fillGroupSelect(); fillConnectSelect();
  fLabel.value = ""; fSummary.value = ""; fDetail.value = "";
  fGroup.value = currentId && nodeMap[currentId] ? nodeMap[currentId].group : groupsInTemplate()[0];
  if (currentId) fConnect.value = currentId;
  fEdgeStyle.value = "solid";
  connectRow.style.display = "block";
  fDelete.style.display = "none";
  modal.classList.remove("hidden");
  fLabel.focus();
}

function openModalEdit(id) {
  var n = nodeMap[id]; if (!n) return;
  modalMode = "edit"; editId = id;
  document.getElementById("modalTitle").textContent = "노드 수정";
  fillGroupSelect();
  fLabel.value = (n.label || "").replace(/\n/g, " ");
  fGroup.value = n.group;
  fSummary.value = n.summary || "";
  fDetail.value = (n.detail || []).join("\n");
  connectRow.style.display = "none";
  fDelete.style.display = "inline-block";
  modal.classList.remove("hidden");
  fLabel.focus();
}

function closeModal() { modal.classList.add("hidden"); }

function saveModal() {
  var label = fLabel.value.trim();
  var group = fGroup.value;
  if (!label) { toast("이름(라벨)을 입력하세요"); fLabel.focus(); return; }
  if (!GROUPS[group]) { toast("그룹을 선택하세요"); return; }
  var detail = fDetail.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
  var summary = fSummary.value.trim();

  if (modalMode === "add") {
    var id = newNodeId();
    var node = { id: id, group: group, label: label, summary: summary, detail: detail };
    rawNodes.push(node);
    visNodes.add(makeVisNode(node));
    var conn = fConnect.value;
    if (conn && nodeMap[conn]) {
      var ed = { id: newEdgeId(), from: conn, to: id, dashes: fEdgeStyle.value === "dashed" };
      rawEdges.push(ed);
      visEdges.add(makeVisEdge(ed));
    }
    rebuildMap(); initFilters(); saveWork(); buildChips(); applyVisibility();
    closeModal();
    toast("노드 추가됨");
    setTimeout(function () { focusNode(id); }, 60);
  } else {
    var n = nodeMap[editId]; if (!n) { closeModal(); return; }
    n.label = label; n.group = group; n.summary = summary; n.detail = detail;
    visNodes.update(makeVisNode(n));
    rebuildMap(); saveWork(); buildChips(); applyVisibility();
    closeModal();
    openPanel(editId);
    toast("수정됨");
  }
}

function deleteNode(id) {
  var n = nodeMap[id]; if (!n) return;
  var name = n.label.replace(/\n/g, " ");
  if (!confirm("'" + name + "' 노드를 삭제할까요?\n연결된 선도 함께 삭제됩니다.")) return;

  rawNodes = rawNodes.filter(function (x) { return x.id !== id; });
  var removeE = rawEdges.filter(function (e) { return e.from === id || e.to === id; });
  rawEdges = rawEdges.filter(function (e) { return e.from !== id && e.to !== id; });
  visNodes.remove(id);
  visEdges.remove(removeE.map(function (e) { return e.id; }));

  rebuildMap(); initFilters(); saveWork(); buildChips(); applyVisibility();
  clearDim(); closePanel();
  toast("삭제됨: " + name);
}

document.getElementById("btnAdd").onclick = openModalAdd;
document.getElementById("modalClose").onclick = closeModal;
document.getElementById("fCancel").onclick = closeModal;
document.getElementById("fSave").onclick = saveModal;
fDelete.onclick = function () { if (editId) { closeModal(); deleteNode(editId); } };
document.getElementById("btnEdit").onclick = function () { if (currentId) openModalEdit(currentId); };
document.getElementById("btnDel").onclick = function () { if (currentId) deleteNode(currentId); };
modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

/* ============================================================
   13. Save / History (요구사항 2)
   ============================================================ */
function tsLabel(d) {
  function p(x) { return (x < 10 ? "0" : "") + x; }
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
         " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}

function saveSnapshot() {
  saveWork();
  var hist = lsGet(LS_HISTORY) || [];
  var now = new Date();
  hist.unshift({
    ts: now.getTime(),
    label: tsLabel(now),
    tid: tid,
    tname: PROCESS_TEMPLATES[tid].name,
    nodes: clone(rawNodes),
    edges: clone(rawEdges),
    colors: currentColors(),
    count: rawNodes.length
  });
  if (hist.length > HISTORY_MAX) hist = hist.slice(0, HISTORY_MAX);
  lsSet(LS_HISTORY, hist);
  toast("💾 저장됨 — " + tsLabel(now));
  renderHistory();
}

function renderHistory() {
  var box = document.getElementById("historyList");
  if (!box) return;
  var hist = lsGet(LS_HISTORY) || [];
  box.innerHTML = "";
  if (hist.length === 0) {
    box.innerHTML = '<p class="empty-hint">저장된 내역이 없습니다. 상단 💾 저장을 눌러보세요.</p>';
    return;
  }
  hist.forEach(function (h, i) {
    var row = document.createElement("div");
    row.className = "history-item";
    row.innerHTML =
      '<div class="hi-main"><span class="hi-time">🕘 ' + escapeHtml(h.label) + '</span>' +
      '<span class="hi-meta">' + escapeHtml(h.tname || h.tid) + ' · ' + (h.count || (h.nodes ? h.nodes.length : 0)) + '개</span></div>' +
      '<button class="hi-del" title="삭제">×</button>';
    row.querySelector(".hi-main").onclick = function () { restoreSnapshot(i); };
    row.querySelector(".hi-del").onclick = function (e) {
      e.stopPropagation();
      var hh = lsGet(LS_HISTORY) || []; hh.splice(i, 1); lsSet(LS_HISTORY, hh); renderHistory();
    };
    box.appendChild(row);
  });
}

function restoreSnapshot(i) {
  var hist = lsGet(LS_HISTORY) || [];
  var h = hist[i]; if (!h) return;
  if (!confirm("이 시점(" + h.label + ")으로 맵을 복원할까요?\n현재 작업은 덮어쓰여집니다.")) return;
  // 템플릿이 다르면 전환
  if (h.tid && PROCESS_TEMPLATES[h.tid]) { tid = h.tid; TPL = PROCESS_TEMPLATES[tid]; var sel = document.getElementById("tplSelect"); if (sel) sel.value = tid; }
  rawNodes = clone(h.nodes);
  rawEdges = clone(h.edges);
  var seq = 0; rawEdges.forEach(function (e) { if (!e.id) e.id = "e" + (seq++); });
  applyColors(h.colors);
  reloadNetwork();
  toast("복원됨 — " + h.label);
}

document.getElementById("btnSave").onclick = saveSnapshot;
document.getElementById("tab-history").onclick = function () { openPanelTab("history"); };
document.getElementById("btnHistory").onclick = function () { openPanelTab("history"); };

/* ============================================================
   14. 색상 커스터마이징 (요구사항 5)
   ============================================================ */
function renderColorPicker() {
  var box = document.getElementById("colorList");
  if (!box) return;
  box.innerHTML = "";
  groupsInTemplate().forEach(function (k) {
    var g = GROUPS[k];
    var row = document.createElement("div");
    row.className = "color-row";
    row.innerHTML =
      '<span class="color-name"><span class="dot" style="background:' + escapeHtml(g.color) + '"></span>' + escapeHtml(g.label) + '</span>';
    var inp = document.createElement("input");
    inp.type = "color"; inp.value = toHex(g.color);
    inp.oninput = function () { setGroupColor(k, inp.value); row.querySelector(".dot").style.background = inp.value; };
    row.appendChild(inp);
    box.appendChild(row);
  });
}

function toHex(c) {
  if (/^#([0-9a-f]{6})$/i.test(c)) return c;
  if (/^#([0-9a-f]{3})$/i.test(c)) { return "#" + c.slice(1).split("").map(function (x) { return x + x; }).join(""); }
  return "#356cb5";
}

function setGroupColor(group, color) {
  GROUPS[group].color = color;
  // 해당 그룹 노드 즉시 갱신
  visNodes.update(rawNodes.filter(function (n) { return n.group === group; }).map(makeVisNode));
  // 필터 칩(노드+상단 필터 버튼 색상) 갱신
  buildChips();
  // 패널 태그 갱신
  if (currentId && nodeMap[currentId] && nodeMap[currentId].group === group) {
    var tag = document.getElementById("panelTag"); tag.style.background = color;
  }
  saveWork();
}

document.getElementById("tab-color").onclick = function () { openPanelTab("color"); };
document.getElementById("btnColor").onclick = function () { openPanelTab("color"); };
document.getElementById("tab-info").onclick = function () { setTab("info"); };
document.getElementById("btnColorReset").onclick = function () {
  if (!confirm("색상을 기본값으로 되돌릴까요?")) return;
  applyColors(null);
  visNodes.update(rawNodes.map(makeVisNode));
  buildChips(); renderColorPicker(); saveWork();
  toast("색상 초기화");
};

/* ============================================================
   15. 프로세스 템플릿 전환 (요구사항 8)
   ============================================================ */
function buildTemplateSelect() {
  var sel = document.getElementById("tplSelect");
  sel.innerHTML = "";
  Object.keys(PROCESS_TEMPLATES).forEach(function (k) {
    var o = document.createElement("option");
    o.value = k; o.textContent = PROCESS_TEMPLATES[k].name;
    sel.appendChild(o);
  });
  sel.value = tid;
  sel.onchange = function () { switchTemplate(sel.value); };
  document.getElementById("tplDesc").textContent = TPL.desc || "";
}

function switchTemplate(id) {
  if (!PROCESS_TEMPLATES[id]) return;
  tid = id;
  TPL = PROCESS_TEMPLATES[id];
  loadTemplateData(id);
  reloadNetwork();
  document.getElementById("tplDesc").textContent = TPL.desc || "";
  toast("템플릿 로드: " + TPL.name);
}

/* 데이터셋 전체 교체 후 UI 재구성 */
function reloadNetwork() {
  exitIsolate(true);
  rebuildMap();
  initFilters();
  visNodes.clear(); visEdges.clear();
  visNodes.add(rawNodes.map(makeVisNode));
  visEdges.add(rawEdges.map(makeVisEdge));
  buildChips();
  applyVisibility();
  closePanel();
  setActiveLayout("btnFree");
  network.setOptions({ layout: { hierarchical: { enabled: false } }, physics: freePhysics });
  network.stabilize(200);
  network.once("stabilizationIterationsDone", function () {
    network.setOptions({ physics: false });
    network.fit({ animation: { duration: 600 } });
  });
  saveWork();
}

/* ============================================================
   16. 내보내기 / 복원
   ============================================================ */
function download(name, text) {
  var blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}

document.getElementById("btnExport").onclick = function () {
  var ng = JSON.stringify(GROUPS, null, 2);
  var nn = JSON.stringify(rawNodes.map(function (n) {
    var o = { id: n.id, group: n.group };
    if (n.layer) o.layer = n.layer;
    o.label = n.label; o.summary = n.summary || ""; o.detail = n.detail || [];
    return o;
  }), null, 2);
  var ne = JSON.stringify(rawEdges.map(function (e) {
    var o = { from: e.from, to: e.to }; if (e.dashes) o.dashes = true; return o;
  }), null, 2);
  var text = "/* 자동 생성 data.js — 템플릿: " + TPL.name + " (" + tid + ") */\n\n" +
             "const GROUPS = " + ng + ";\n\n" +
             "const NODES = " + nn + ";\n\n" +
             "const EDGES = " + ne + ";\n";
  download("data.export.js", text);
  toast("data.export.js 내보냄 — 다운로드 폴더 확인");
};

/* --- P1-1: JSON 내보내기 (Import 왕복용 · 선택필드 src/label/rel 보존) --- */
function exportNode(n) {
  var o = { id: n.id, group: n.group };
  if (n.layer) o.layer = n.layer;
  o.label = n.label; o.summary = n.summary || ""; o.detail = n.detail || [];
  if (n.src) o.src = n.src;
  return o;
}
function exportEdge(e) {
  var o = { from: e.from, to: e.to };
  if (e.dashes) o.dashes = true;
  if (e.label) o.label = e.label;
  if (e.rel) o.rel = e.rel;
  return o;
}
function downloadText(name, text, mime) {
  var blob = new Blob([text], { type: (mime || "text/plain") + ";charset=utf-8" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}

document.getElementById("btnExportJson").onclick = function () {
  var payload = {
    tid: tid, name: TPL.name, colors: currentColors(),
    nodes: rawNodes.map(exportNode), edges: rawEdges.map(exportEdge)
  };
  downloadText("mindmap." + tid + ".json", JSON.stringify(payload, null, 2), "application/json");
  toast("JSON 내보냄 — mindmap." + tid + ".json");
};

/* --- P1-1: JSON 가져오기 (검증·실패 시 토스트, 현재 템플릿 교체) --- */
var importFileEl = document.getElementById("importFile");
document.getElementById("btnImport").onclick = function () { importFileEl.value = ""; importFileEl.click(); };
importFileEl.onchange = function () {
  var f = importFileEl.files && importFileEl.files[0];
  if (!f) return;
  var reader = new FileReader();
  reader.onload = function () {
    var data;
    try { data = JSON.parse(reader.result); }
    catch (e) { toast("가져오기 실패: JSON 파싱 오류"); return; }
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      toast("가져오기 실패: nodes/edges 배열이 필요합니다"); return;
    }
    var ids = {};
    for (var i = 0; i < data.nodes.length; i++) {
      var n = data.nodes[i];
      if (!n || !n.id || !n.group || !n.label) { toast("가져오기 실패: 노드 " + (i + 1) + "에 id/group/label 누락"); return; }
      ids[n.id] = true;
    }
    for (var j = 0; j < data.edges.length; j++) {
      var e = data.edges[j];
      if (!e || !ids[e.from] || !ids[e.to]) { toast("가져오기 실패: 엣지 " + (j + 1) + "의 from/to가 노드와 불일치"); return; }
    }
    if (!confirm("현재 템플릿(" + TPL.name + ")의 노드/엣지/색상을 가져온 데이터로 교체할까요?")) return;
    rawNodes = clone(data.nodes);
    rawEdges = clone(data.edges);
    var seq = 0; rawEdges.forEach(function (ed) { if (!ed.id) ed.id = "e" + (seq++); });
    applyColors(data.colors || null);
    reloadNetwork();
    toast("가져오기 완료 — " + rawNodes.length + "개 노드");
  };
  reader.readAsText(f, "utf-8");
};

/* --- P1-1: 현재 화면 PNG 내보내기 --- */
document.getElementById("btnPng").onclick = function () {
  var cv = container.getElementsByTagName("canvas")[0];
  if (!cv) { toast("캔버스를 찾지 못했습니다"); return; }
  try {
    var a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = "mindmap." + tid + ".png";
    a.click();
    toast("PNG 저장 — 현재 화면");
  } catch (e) { toast("PNG 내보내기 실패"); }
};

document.getElementById("btnRestore").onclick = function () {
  if (!confirm("현재 템플릿의 편집 내용을 지우고 원본으로 되돌릴까요?")) return;
  try { localStorage.removeItem(LS_WORK + tid); } catch (e) {}
  loadTemplateData(tid);
  reloadNetwork();
  toast("기본값 복원");
};

/* ============================================================
   17. 토스트
   ============================================================ */
var toastTimer = null;
function toast(msg) {
  var t = document.getElementById("toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.add("hidden"); }, 2200);
}

/* ============================================================
   17.5 URL 딥링크 (P1-2) — tpl / 활성 group·layer / 선택 노드
   ============================================================ */
function updateUrl() {
  try {
    var p = new URLSearchParams();
    p.set("tpl", tid);
    var allG = groupsInTemplate();
    var gs = allG.filter(function (k) { return activeGroups[k] !== false; });
    if (gs.length < allG.length) p.set("g", gs.join(","));     // 전체 ON이면 생략
    var allL = layersInTemplate();
    var ls = allL.filter(function (k) { return activeLayers[k] !== false; });
    if (ls.length < allL.length) p.set("l", ls.join(","));
    if (currentId) p.set("node", currentId);
    history.replaceState(null, "", location.pathname + "?" + p.toString());
  } catch (e) {}
}

function applyUrlState() {
  var p;
  try { p = new URLSearchParams(INITIAL_SEARCH); } catch (e) { return; }
  if (!p.toString()) return;
  var t = p.get("tpl");
  if (t && PROCESS_TEMPLATES[t] && t !== tid) {
    switchTemplate(t);
    var sel = document.getElementById("tplSelect"); if (sel) sel.value = t;
  }
  if (p.has("g")) {
    var gset = {}; (p.get("g") || "").split(",").filter(Boolean).forEach(function (k) { gset[k] = true; });
    groupsInTemplate().forEach(function (k) { activeGroups[k] = !!gset[k]; });
  }
  if (p.has("l")) {
    var lset = {}; (p.get("l") || "").split(",").filter(Boolean).forEach(function (k) { lset[k] = true; });
    layersInTemplate().forEach(function (k) { activeLayers[k] = !!lset[k]; });
  }
  buildChips(); applyVisibility();
  var nd = p.get("node");
  if (nd && nodeMap[nd]) setTimeout(function () { focusNode(nd); }, 500);
}

/* ============================================================
   18. 초기화
   ============================================================ */
initFilters();
buildTemplateSelect();
buildChips();
applyVisibility();
applyUrlState();   // P1-2: URL 상태 복원
setTab("info");
setActiveLayout("btnFree");
window.addEventListener("load", function () {
  setTimeout(function () { network.fit({ animation: { duration: 700 } }); }, 400);
});
