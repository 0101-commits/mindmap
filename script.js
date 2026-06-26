/* ===================================================
   개인 E2E 성과관리 마인드맵 — 렌더링 & 상호작용
   라이브러리: vis-network (CDN)
   의존: data.js (GROUPS, NODES, EDGES)
   =================================================== */

// ---------- 1. 노드/엣지를 vis 형식으로 변환 ----------
function buildNodes() {
  return NODES.map(function (n) {
    var c = GROUPS[n.group].color;
    var isRoot = n.group === "core";
    return {
      id: n.id,
      label: n.label,
      group: n.group,
      shape: isRoot ? "circle" : "box",
      color: {
        background: c,
        border: shade(c, -18),
        highlight: { background: shade(c, 12), border: shade(c, -25) },
        hover: { background: shade(c, 8), border: shade(c, -25) }
      },
      font: {
        color: "#ffffff",
        size: isRoot ? 20 : 14,
        face: "Pretendard, Segoe UI, Malgun Gothic, sans-serif",
        bold: { color: "#ffffff" },
        multi: false
      },
      borderWidth: 2,
      margin: isRoot ? 14 : 10,
      widthConstraint: isRoot ? 110 : { maximum: 150 },
      mass: isRoot ? 4 : (n.group === "process" ? 2.4 : 1.2)
    };
  });
}

function buildEdges() {
  return EDGES.map(function (e, i) {
    return {
      id: "e" + i,
      from: e.from,
      to: e.to,
      dashes: !!e.dashes,
      width: e.dashes ? 1 : 2,
      color: { color: e.dashes ? "#94a3b8" : "#cbd5e1", highlight: "#356CB5", opacity: e.dashes ? 0.7 : 1 },
      smooth: { enabled: true, type: "cubicBezier", roundness: 0.55 }
    };
  });
}

// 색상 밝기 조절 헬퍼
function shade(hex, pct) {
  var f = parseInt(hex.slice(1), 16),
      t = pct < 0 ? 0 : 255, p = Math.abs(pct) / 100,
      R = f >> 16, G = (f >> 8) & 0xff, B = f & 0xff;
  return "#" + (0x1000000 +
    (Math.round((t - R) * p) + R) * 0x10000 +
    (Math.round((t - G) * p) + G) * 0x100 +
    (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

// ---------- 2. 네트워크 생성 ----------
var allNodes = new vis.DataSet(buildNodes());
var allEdges = new vis.DataSet(buildEdges());
var container = document.getElementById("network");

var options = {
  layout: { improvedLayout: true },
  interaction: { hover: true, tooltipDelay: 120, navigationButtons: false, keyboard: false },
  physics: {
    solver: "forceAtlas2Based",
    forceAtlas2Based: { gravitationalConstant: -55, centralGravity: 0.012, springLength: 130, springConstant: 0.09, avoidOverlap: 0.6 },
    stabilization: { iterations: 220 },
    minVelocity: 0.6
  },
  nodes: { shadow: { enabled: true, size: 8, x: 0, y: 3, color: "rgba(15,23,42,.18)" } },
  edges: { arrows: { to: { enabled: false } } }
};

var network = new vis.Network(container, { nodes: allNodes, edges: allEdges }, options);

// 안정화 후 물리엔진 정지(드래그는 가능)
network.once("stabilizationIterationsDone", function () {
  network.setOptions({ physics: false });
});

// ---------- 3. 사이드 패널 ----------
var nodeMap = {};
NODES.forEach(function (n) { nodeMap[n.id] = n; });

var panel = document.getElementById("sidepanel");

function openPanel(id) {
  var n = nodeMap[id];
  if (!n) return;
  var g = GROUPS[n.group];

  var tag = document.getElementById("panelTag");
  tag.textContent = g.label;
  tag.style.background = g.color;

  document.getElementById("panelTitle").textContent = n.label.replace(/\n/g, " ");
  document.getElementById("panelSummary").textContent = n.summary || "";

  var ul = document.getElementById("panelDetail");
  ul.innerHTML = "";
  (n.detail || []).forEach(function (d) {
    var li = document.createElement("li");
    li.textContent = d;
    ul.appendChild(li);
  });

  // 연결 노드
  var related = [];
  EDGES.forEach(function (e) {
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
  } else {
    wrap.style.display = "none";
  }

  panel.classList.remove("closed");
}

function focusNode(id) {
  network.selectNodes([id]);
  network.focus(id, { scale: 1.1, animation: { duration: 500, easingFunction: "easeInOutQuad" } });
  openPanel(id);
}

document.getElementById("panelClose").onclick = function () {
  panel.classList.add("closed");
  network.unselectAll();
};

network.on("click", function (params) {
  if (params.nodes.length) {
    openPanel(params.nodes[0]);
  } else {
    panel.classList.add("closed");
  }
});

// ---------- 4. 그룹 필터 칩 ----------
var activeGroups = {};
Object.keys(GROUPS).forEach(function (k) { activeGroups[k] = true; });

var chipWrap = document.getElementById("filterChips");
Object.keys(GROUPS).forEach(function (k) {
  var g = GROUPS[k];
  var chip = document.createElement("span");
  chip.className = "chip";
  chip.dataset.group = k;
  chip.innerHTML = '<span class="dot" style="background:' + g.color + '"></span>' + g.label;
  chip.onclick = function () { toggleGroup(k, chip); };
  chipWrap.appendChild(chip);
});

function toggleGroup(k, chip) {
  activeGroups[k] = !activeGroups[k];
  chip.classList.toggle("off", !activeGroups[k]);
  applyFilter();
}

function applyFilter() {
  // 보이는 노드 id 집합
  var visible = {};
  NODES.forEach(function (n) {
    var show = activeGroups[n.group];
    visible[n.id] = show;
    allNodes.update({ id: n.id, hidden: !show });
  });
  // 엣지: 양쪽 노드가 보일 때만 표시
  EDGES.forEach(function (e, i) {
    var show = visible[e.from] && visible[e.to];
    allEdges.update({ id: "e" + i, hidden: !show });
  });
}

// 전체 / 초기화 버튼
document.getElementById("btnAll").onclick = function () {
  Object.keys(GROUPS).forEach(function (k) { activeGroups[k] = true; });
  document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("off"); });
  applyFilter();
};
document.getElementById("btnReset").onclick = function () {
  document.getElementById("btnAll").onclick();
  document.getElementById("searchBox").value = "";
  network.unselectAll();
  panel.classList.add("closed");
  network.fit({ animation: { duration: 600 } });
};

// ---------- 5. 검색 (강조 + 포커스) ----------
var searchBox = document.getElementById("searchBox");
searchBox.addEventListener("keyup", function (ev) {
  var q = this.value.trim().toLowerCase();
  if (ev.key === "Enter" && q) {
    var hit = NODES.find(function (n) {
      return (n.label + " " + (n.summary || "")).toLowerCase().indexOf(q) >= 0
             && activeGroups[n.group];
    });
    if (hit) focusNode(hit.id);
  }
});

// 초기 안내 살짝 열기
window.addEventListener("load", function () {
  setTimeout(function () { network.fit({ animation: { duration: 700 } }); }, 400);
});
