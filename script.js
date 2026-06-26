/* ===================================================
   E2E 성과관리 · HR 아키텍처 마인드맵 — 로직
   라이브러리: vis-network (CDN)
   의존: data.js (GROUPS, NODES, EDGES)

   기능:
     1) CRUD(노드 추가/수정/삭제) + 그룹 필터 고도화
     2) 화면 정리(물리 재안정화) / 계층형 레이아웃
     3) Focus/Highlight (이웃만 선명, 나머지 반투명)
     4) Layer 1~4 HR 아키텍처 데이터 표시
   편집 내용은 localStorage에 저장되며 'data.js 내보내기'로 파일화 가능.
   =================================================== */

var LS_KEY = "mm_data_v2";

// ---------- 0. 작업 데이터 로드 (localStorage 우선) ----------
function clone(o) { return JSON.parse(JSON.stringify(o)); }

function loadLS() {
  try {
    var raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function saveLS() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ nodes: rawNodes, edges: rawEdges }));
  } catch (e) { /* 용량 초과 등 무시 */ }
}

var saved = loadLS();
var rawNodes = saved && saved.nodes ? saved.nodes : clone(NODES);
var rawEdges = saved && saved.edges ? saved.edges : clone(EDGES);

// 엣지 id 보장
var edgeSeq = 0;
rawEdges.forEach(function (e) { if (!e.id) e.id = "e" + (edgeSeq++); });

function newEdgeId() { return "ed" + Date.now().toString(36) + Math.floor(Math.random() * 1e4); }
function newNodeId() { return "u" + Date.now().toString(36) + Math.floor(Math.random() * 1e4); }

// ---------- 1. 색상 헬퍼 ----------
function shade(hex, pct) {
  var f = parseInt(hex.slice(1), 16),
      t = pct < 0 ? 0 : 255, p = Math.abs(pct) / 100,
      R = f >> 16, G = (f >> 8) & 0xff, B = f & 0xff;
  return "#" + (0x1000000 +
    (Math.round((t - R) * p) + R) * 0x10000 +
    (Math.round((t - G) * p) + G) * 0x100 +
    (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

// ---------- 2. vis 객체 변환 ----------
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
    color: {
      background: c,
      border: shade(c, -18),
      highlight: { background: shade(c, 12), border: shade(c, -25) },
      hover: { background: shade(c, 8), border: shade(c, -25) }
    },
    font: {
      color: "#ffffff",
      size: isRoot ? 20 : 14,
      face: "Pretendard, Segoe UI, Malgun Gothic, sans-serif"
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
    id: e.id, from: e.from, to: e.to, dashes: !!e.dashes,
    width: e.dashes ? 1 : 2,
    color: edgeBaseColor(e),
    smooth: { enabled: true, type: "cubicBezier", roundness: 0.55 }
  };
}

// ---------- 3. 네트워크 생성 ----------
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
  interaction: { hover: true, tooltipDelay: 150, navigationButtons: false, keyboard: false },
  physics: freePhysics,
  nodes: { shadow: { enabled: true, size: 8, x: 0, y: 3, color: "rgba(15,23,42,.18)" } },
  edges: { arrows: { to: { enabled: false } } }
};

var network = new vis.Network(container, { nodes: visNodes, edges: visEdges }, options);

network.once("stabilizationIterationsDone", function () {
  network.setOptions({ physics: false });
});

// ---------- 4. nodeMap ----------
var nodeMap = {};
function rebuildMap() { nodeMap = {}; rawNodes.forEach(function (n) { nodeMap[n.id] = n; }); }
rebuildMap();

// ---------- 5. Focus / Highlight (요구사항 3) ----------
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
  var keep = {}; keep[id] = 1;
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

// ---------- 6. 사이드 패널 ----------
var panel = document.getElementById("sidepanel");
var currentId = null;

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
}

function closePanel() {
  panel.classList.add("closed");
  document.getElementById("panelActions").style.display = "none";
  currentId = null;
}

function focusNode(id) {
  if (!nodeMap[id]) return;
  network.selectNodes([id]);
  network.focus(id, { scale: 1.05, animation: { duration: 500, easingFunction: "easeInOutQuad" } });
  highlightNode(id);
  openPanel(id);
}

document.getElementById("panelClose").onclick = function () {
  closePanel(); network.unselectAll(); clearDim();
};

network.on("click", function (params) {
  if (params.nodes.length) {
    var id = params.nodes[0];
    highlightNode(id);
    openPanel(id);
  } else if (params.edges.length) {
    highlightEdge(params.edges[0]);
  } else {
    clearDim(); closePanel();
  }
});

// ---------- 7. 그룹 필터 (요구사항 1) ----------
var activeGroups = {};
Object.keys(GROUPS).forEach(function (k) { activeGroups[k] = true; });

var chipWrap = document.getElementById("filterChips");

function buildChips() {
  chipWrap.innerHTML = "";
  var counts = {};
  rawNodes.forEach(function (n) { counts[n.group] = (counts[n.group] || 0) + 1; });
  Object.keys(GROUPS).forEach(function (k) {
    var g = GROUPS[k];
    var chip = document.createElement("span");
    chip.className = "chip" + (activeGroups[k] ? "" : " off");
    chip.innerHTML = '<span class="dot" style="background:' + g.color + '"></span>' +
                     g.label + '<span class="cnt">' + (counts[k] || 0) + '</span>';
    chip.onclick = function () {
      activeGroups[k] = !activeGroups[k];
      chip.classList.toggle("off", !activeGroups[k]);
      applyFilter();
    };
    chipWrap.appendChild(chip);
  });
}

function applyFilter() {
  clearDim();
  var visible = {};
  visNodes.update(rawNodes.map(function (n) {
    var show = !!activeGroups[n.group];
    visible[n.id] = show;
    return { id: n.id, hidden: !show };
  }));
  visEdges.update(rawEdges.map(function (e) {
    return { id: e.id, hidden: !(visible[e.from] && visible[e.to]) };
  }));
}

document.getElementById("btnAll").onclick = function () {
  Object.keys(GROUPS).forEach(function (k) { activeGroups[k] = true; });
  buildChips(); applyFilter();
};
document.getElementById("btnNone").onclick = function () {
  Object.keys(GROUPS).forEach(function (k) { activeGroups[k] = false; });
  buildChips(); applyFilter();
};

// ---------- 8. 검색 ----------
document.getElementById("searchBox").addEventListener("keyup", function (ev) {
  var q = this.value.trim().toLowerCase();
  if (ev.key === "Enter" && q) {
    var hit = rawNodes.find(function (n) {
      return ((n.label || "") + " " + (n.summary || "")).toLowerCase().indexOf(q) >= 0 && activeGroups[n.group];
    });
    if (hit) focusNode(hit.id);
    else toast("검색 결과 없음 (필터 켜짐 여부 확인)");
  }
});

// ---------- 9. 레이아웃 (요구사항 2) ----------
var hierOn = false;
var btnHier = document.getElementById("btnHier");

function tidy() {
  hierOn = false;
  btnHier.classList.remove("active");
  network.setOptions({ layout: { hierarchical: { enabled: false } }, physics: freePhysics });
  network.stabilize(220);
  network.once("stabilizationIterationsDone", function () {
    network.setOptions({ physics: false });
    network.fit({ animation: { duration: 600 } });
  });
  toast("화면 정리 완료");
}

function toggleHier() {
  hierOn = !hierOn;
  if (hierOn) {
    network.setOptions({
      physics: false,
      layout: { hierarchical: { enabled: true, direction: "UD", sortMethod: "directed",
                                levelSeparation: 130, nodeSpacing: 150, treeSpacing: 200, blockShifting: true, edgeMinimization: true } }
    });
    btnHier.classList.add("active");
    network.fit({ animation: { duration: 600 } });
    toast("계층형 레이아웃");
  } else {
    network.setOptions({ layout: { hierarchical: { enabled: false } } });
    btnHier.classList.remove("active");
    tidy();
  }
}

document.getElementById("btnTidy").onclick = tidy;
btnHier.onclick = toggleHier;
document.getElementById("btnFit").onclick = function () {
  clearDim(); network.fit({ animation: { duration: 600 } });
};

// ---------- 10. CRUD 모달 (요구사항 1) ----------
var modal = document.getElementById("modal");
var fLabel = document.getElementById("fLabel");
var fGroup = document.getElementById("fGroup");
var fSummary = document.getElementById("fSummary");
var fDetail = document.getElementById("fDetail");
var fConnect = document.getElementById("fConnect");
var connectRow = document.getElementById("connectRow");
var fDelete = document.getElementById("fDelete");
var modalMode = "add";
var editId = null;

function fillGroupSelect() {
  fGroup.innerHTML = "";
  Object.keys(GROUPS).forEach(function (k) {
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
  fGroup.value = currentId && nodeMap[currentId] ? nodeMap[currentId].group : Object.keys(GROUPS)[0];
  if (currentId) fConnect.value = currentId;  // 현재 선택 노드와 연결 기본값
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
      var ed = { id: newEdgeId(), from: conn, to: id };
      rawEdges.push(ed);
      visEdges.add(makeVisEdge(ed));
    }
    rebuildMap(); saveLS(); buildChips(); applyFilter();
    closeModal();
    toast("노드 추가됨");
    setTimeout(function () { focusNode(id); }, 60);
  } else {
    var n = nodeMap[editId]; if (!n) { closeModal(); return; }
    n.label = label; n.group = group; n.summary = summary; n.detail = detail;
    visNodes.update(makeVisNode(n));
    rebuildMap(); saveLS(); buildChips(); applyFilter();
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

  rebuildMap(); saveLS(); buildChips(); applyFilter();
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

// ---------- 11. 내보내기 / 복원 ----------
function download(name, text) {
  var blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}

document.getElementById("btnExport").onclick = function () {
  var ng = JSON.stringify(GROUPS, null, 2);
  var nn = JSON.stringify(rawNodes.map(function (n) {
    return { id: n.id, group: n.group, label: n.label, summary: n.summary || "", detail: n.detail || [] };
  }), null, 2);
  var ne = JSON.stringify(rawEdges.map(function (e) {
    var o = { from: e.from, to: e.to }; if (e.dashes) o.dashes = true; return o;
  }), null, 2);
  var text = "/* 자동 생성된 data.js — 마인드맵 편집 결과 */\n\n" +
             "const GROUPS = " + ng + ";\n\n" +
             "const NODES = " + nn + ";\n\n" +
             "const EDGES = " + ne + ";\n";
  download("data.js", text);
  toast("data.js 내보냄 — 다운로드 폴더 확인");
};

document.getElementById("btnRestore").onclick = function () {
  if (!confirm("브라우저에 저장된 편집 내용을 지우고 원본 data.js로 되돌릴까요?")) return;
  try { localStorage.removeItem(LS_KEY); } catch (e) {}
  location.reload();
};

// ---------- 12. 토스트 ----------
var toastTimer = null;
function toast(msg) {
  var t = document.getElementById("toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.add("hidden"); }, 2200);
}

// ---------- 13. 초기화 ----------
buildChips();
applyFilter();
window.addEventListener("load", function () {
  setTimeout(function () { network.fit({ animation: { duration: 700 } }); }, 400);
});
