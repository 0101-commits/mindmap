# -*- coding: utf-8 -*-
"""embed.json → self-contained 인터랙티브 HTML (Artifact용)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = open(os.path.join(HERE, 'embed.json'), encoding='utf-8').read()

TPL = r"""<title>성과관리·평가 E2E AI Agent — 레이어드 마인드맵</title>
<meta name="description" content="OKR+MBO 통합 성과관리·평가 프로세스를 레이어(프로세스·세부활동·HR Domain Knowledge)·주체 접근·AI Agent 아키텍처로 구조화한 기획 탐색기.">
<style>
:root{
  --canvas:#F6F7F9; --surface:#FFFFFF; --surface-2:#FBFCFD;
  --ink:#16202B; --ink-soft:#51606E; --ink-faint:#8A97A4;
  --hair:#E2E6EB; --hair-soft:#EDF0F3;
  --teal:#0E7C6B; --teal-deep:#0A5B4F; --teal-tint:#E1F0ED;
  --slate:#3E5C8A; --slate-tint:#E6ECF5;
  --amber:#C77A12; --amber-tint:#F7ECD8;
  --violet:#6D5BD0; --violet-tint:#EBE7FA;
  --rose:#C2476A; --rose-tint:#F8E4EA;
  --hil:#B4541E; --hil-tint:#FBE8DC;
  --r-sm:6px; --r:10px; --r-lg:16px;
  --shadow:0 1px 2px rgba(22,32,43,.04),0 6px 24px rgba(22,32,43,.06);
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  --kr:'Pretendard','Pretendard Variable','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',system-ui,-apple-system,sans-serif;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--canvas);color:var(--ink);font-family:var(--kr);
  font-size:15px;line-height:1.55;word-break:keep-all;-webkit-font-smoothing:antialiased}
h1,h2,h3{margin:0;text-wrap:balance;letter-spacing:-.01em;font-weight:800}
.wrap{max-width:1240px;margin:0 auto;padding:0 24px}
.tnum{font-variant-numeric:tabular-nums}

/* masthead */
header{background:linear-gradient(180deg,#0B2E2A 0%,#0E3B36 100%);color:#EAF3F1;padding:34px 0 30px}
.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7FB8AE;font-weight:700}
header h1{font-size:30px;line-height:1.18;margin:10px 0 8px;color:#fff;max-width:24ch}
.purpose{color:#B8D6CF;font-size:14.5px;max-width:70ch;margin:0}
.stats{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.stat{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
  border-radius:var(--r);padding:10px 14px;min-width:96px}
.stat b{display:block;font-size:22px;font-weight:800;color:#fff}
.stat span{font-size:11.5px;color:#9FC6BE;letter-spacing:.02em}

/* tabs */
.tabbar{position:sticky;top:0;z-index:30;background:rgba(246,247,249,.92);
  backdrop-filter:blur(8px);border-bottom:1px solid var(--hair)}
.tabs{display:flex;gap:4px;padding:10px 0}
.tab{appearance:none;border:1px solid transparent;background:transparent;font-family:inherit;
  font-size:14px;font-weight:700;color:var(--ink-soft);padding:9px 16px;border-radius:var(--r);
  cursor:pointer;display:flex;align-items:center;gap:8px}
.tab .n{font:600 11px/1 var(--mono);background:var(--hair);color:var(--ink-soft);
  padding:3px 6px;border-radius:5px}
.tab[aria-selected=true]{background:var(--ink);color:#fff}
.tab[aria-selected=true] .n{background:rgba(255,255,255,.18);color:#fff}
.tab:focus-visible{outline:2px solid var(--teal);outline-offset:2px}

main{padding:24px 0 80px}
.view{display:none}.view.on{display:block}
.viewhead{margin-bottom:16px}
.viewhead h2{font-size:19px}
.viewhead p{margin:5px 0 0;color:var(--ink-soft);font-size:13.5px;max-width:78ch}

/* filters */
.filters{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;margin:4px 0 20px;
  padding:14px 16px;background:var(--surface);border:1px solid var(--hair);border-radius:var(--r);box-shadow:var(--shadow)}
.fgroup{display:flex;flex-direction:column;gap:7px}
.flabel{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint)}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{appearance:none;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer;
  border:1px solid var(--hair);background:var(--surface);color:var(--ink-soft);
  padding:5px 11px;border-radius:100px;display:inline-flex;align-items:center;gap:6px}
.chip .dot{width:8px;height:8px;border-radius:50%}
.chip[aria-pressed=true]{border-color:var(--ink);background:var(--ink);color:#fff}
.chip:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.search{font-family:inherit;font-size:13.5px;border:1px solid var(--hair);border-radius:var(--r);
  padding:8px 12px;width:230px;background:var(--surface);color:var(--ink)}
.search:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 3px var(--teal-tint)}

/* phase columns */
.flow{display:flex;gap:14px;overflow-x:auto;padding-bottom:12px}
.col{flex:0 0 268px;min-width:268px;background:var(--surface-2);border:1px solid var(--hair);
  border-radius:var(--r-lg);display:flex;flex-direction:column;max-height:none}
.col.cross{background:#F3F1FA;border-color:#E2DCF4}
.colhead{padding:13px 14px;border-bottom:1px solid var(--hair)}
.colhead .kind{font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint)}
.colhead h3{font-size:15px;margin-top:3px;display:flex;align-items:center;gap:8px}
.colhead .note{font-size:11.5px;color:var(--ink-soft);margin-top:6px;line-height:1.45}
.colbody{padding:10px;display:flex;flex-direction:column;gap:8px}
.card{text-align:left;width:100%;font-family:inherit;cursor:pointer;background:var(--surface);
  border:1px solid var(--hair);border-left:3px solid var(--slate);border-radius:var(--r-sm);
  padding:10px 11px;display:flex;flex-direction:column;gap:7px}
.card:hover{border-color:var(--slate);box-shadow:var(--shadow)}
.card:focus-visible{outline:2px solid var(--teal);outline-offset:1px}
.card.dim{opacity:.28;filter:saturate(.4)}
.card .t{font-size:13.5px;font-weight:700;line-height:1.32}
.card .meta{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
.badge{font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:5px;letter-spacing:.02em}
.b-okr{background:var(--teal-tint);color:var(--teal-deep)}
.b-mbo{background:var(--slate-tint);color:var(--slate)}
.b-both{background:var(--amber-tint);color:var(--amber)}
.owner{font-size:10.5px;font-weight:600;color:var(--ink-soft);display:inline-flex;align-items:center;gap:5px}
.owner .dot{width:8px;height:8px;border-radius:50%}
.hil{font-size:10.5px;font-weight:700;color:var(--hil);background:var(--hil-tint);padding:2px 7px;border-radius:5px}
.kcount{margin-left:auto;font:600 11px/1 var(--mono);color:var(--ink-faint)}

/* access matrix */
.matrix-wrap{overflow-x:auto;border:1px solid var(--hair);border-radius:var(--r-lg);background:var(--surface);box-shadow:var(--shadow)}
table.matrix{border-collapse:collapse;width:100%;min-width:760px}
table.matrix th,table.matrix td{text-align:left;vertical-align:top;padding:14px 16px;border-bottom:1px solid var(--hair-soft)}
table.matrix thead th{background:var(--surface-2);font-size:12px;letter-spacing:.04em;color:var(--ink-soft);position:sticky;top:0}
table.matrix tbody th{width:210px;border-right:1px solid var(--hair-soft)}
.actorname{font-weight:800;font-size:14.5px;display:flex;align-items:center;gap:8px}
.kindtag{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:2px 7px;border-radius:5px}
.k-human{background:var(--amber-tint);color:var(--amber)}
.k-ai{background:var(--teal-tint);color:var(--teal-deep)}
.k-infra{background:var(--violet-tint);color:var(--violet)}
.subroles{font-size:11.5px;color:var(--ink-faint);margin-top:6px;line-height:1.5}
.cell-mode{font-weight:700;font-size:13px}
.cell-detail{font-size:12.5px;color:var(--ink-soft);margin-top:3px;line-height:1.45}

/* agent architecture */
.arch{display:flex;flex-direction:column;gap:18px}
.orch{background:var(--ink);color:#fff;border-radius:var(--r-lg);padding:18px 20px}
.orch h3{color:#fff;font-size:16px}
.orch p{margin:7px 0 0;color:#B9C4CF;font-size:13px;max-width:90ch}
.orch .flowline{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}
.pill{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#fff;
  font-size:12px;font-weight:600;padding:5px 11px;border-radius:100px}
.mgr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.mgr{text-align:left;font-family:inherit;cursor:pointer;background:var(--surface);border:1px solid var(--hair);
  border-top:3px solid var(--teal);border-radius:var(--r);padding:14px;display:flex;flex-direction:column;gap:8px}
.mgr.cross{border-top-color:var(--violet)}
.mgr:hover{box-shadow:var(--shadow)}
.mgr:focus-visible{outline:2px solid var(--teal);outline-offset:1px}
.mgr[aria-pressed=true]{background:var(--teal-tint);border-color:var(--teal)}
.mgr.cross[aria-pressed=true]{background:var(--violet-tint);border-color:var(--violet)}
.mgr h3{font-size:14.5px}
.mgr .c{font:700 12px/1 var(--mono);color:var(--ink-soft)}
.mgr .note{font-size:11.5px;color:var(--ink-soft);line-height:1.45}
.sa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:10px;margin-top:6px}
.sa{text-align:left;font-family:inherit;cursor:pointer;background:var(--surface);border:1px solid var(--hair);
  border-radius:var(--r);padding:12px 13px;display:flex;flex-direction:column;gap:9px}
.sa:hover{border-color:var(--slate);box-shadow:var(--shadow)}
.sa:focus-visible{outline:2px solid var(--teal);outline-offset:1px}
.sa .t{font-weight:700;font-size:13.5px;line-height:1.3}
.toolrow{display:flex;gap:6px;flex-wrap:wrap}
.tool{font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;display:inline-flex;gap:5px;align-items:center}
.t-data{background:var(--amber-tint);color:var(--amber)}
.t-ctx{background:var(--violet-tint);color:var(--violet)}
.t-prin{background:var(--rose-tint);color:var(--rose)}
.t-gate{background:var(--hil-tint);color:var(--hil)}
.sectionlabel{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint);margin:6px 0}

/* drawer */
.scrim{position:fixed;inset:0;background:rgba(15,25,33,.34);opacity:0;pointer-events:none;transition:opacity .2s;z-index:40}
.scrim.on{opacity:1;pointer-events:auto}
.drawer{position:fixed;top:0;right:0;height:100%;width:min(460px,94vw);background:var(--surface);
  box-shadow:-12px 0 40px rgba(22,32,43,.18);transform:translateX(100%);transition:transform .24s cubic-bezier(.4,0,.2,1);
  z-index:41;display:flex;flex-direction:column}
.drawer.on{transform:none}
.dhead{padding:18px 20px 14px;border-bottom:1px solid var(--hair);position:relative}
.dhead .layerline{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.dhead h3{font-size:18px;margin:6px 30px 0 0;line-height:1.28}
.dclose{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:8px;border:1px solid var(--hair);
  background:var(--surface);cursor:pointer;font-size:17px;color:var(--ink-soft);line-height:1}
.dclose:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.dbody{padding:18px 20px;overflow-y:auto;display:flex;flex-direction:column;gap:18px}
.dbody p.sum{margin:0;font-size:14px;color:var(--ink);line-height:1.6}
.kv{display:grid;grid-template-columns:92px 1fr;gap:7px 12px;font-size:13px}
.kv dt{color:var(--ink-faint);font-weight:600}
.kv dd{margin:0;font-weight:600}
.kgroup h4{font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;margin:0 0 8px;color:var(--ink-faint)}
.klist{display:flex;flex-wrap:wrap;gap:6px}
.kitem{font-size:12px;font-weight:600;padding:4px 9px;border-radius:6px;line-height:1.35}
.empty{font-size:12.5px;color:var(--ink-faint);font-style:italic}
.connlist{display:flex;flex-direction:column;gap:6px}
.conn{font-size:12.5px;display:flex;gap:8px;align-items:baseline}
.conn .rel{font:700 10.5px/1.4 var(--mono);color:var(--ink-faint);min-width:84px;text-transform:uppercase}
footer{border-top:1px solid var(--hair);color:var(--ink-faint);font-size:12px;padding:22px 0 40px}
footer code{font-family:var(--mono);font-size:11.5px;background:var(--hair-soft);padding:1px 5px;border-radius:4px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
@media(max-width:640px){header h1{font-size:24px}.search{width:100%}}
</style>

<header><div class="wrap">
  <div class="eyebrow">HCG · 성과관리·평가 E2E · OKR+MBO 통합</div>
  <h1>성과평가 AI Agent 레이어드 마인드맵</h1>
  <p class="purpose" id="purpose"></p>
  <div class="stats" id="stats"></div>
</div></header>

<div class="tabbar"><div class="wrap"><div class="tabs" role="tablist" id="tabs">
  <button class="tab" role="tab" aria-selected="true" data-v="layer">레이어 모델 <span class="n" id="n-layer"></span></button>
  <button class="tab" role="tab" aria-selected="false" data-v="access">주체 × 레이어 접근 <span class="n">15</span></button>
  <button class="tab" role="tab" aria-selected="false" data-v="arch">AI Agent 아키텍처 <span class="n" id="n-arch"></span></button>
</div></div></div>

<main class="wrap">
  <!-- VIEW 1 -->
  <section class="view on" id="v-layer">
    <div class="viewhead"><h2>레이어 모델 — 프로세스 · 세부활동 · HR Domain Knowledge</h2>
      <p>4개 코어 단계(목표수립→실행·점검→평가→피드백)와 2개 횡단(정렬·연계, 변화관리)에 세부활동을 배치. 카드를 누르면 해당 활동이 필요로 하는 Data·맥락·원칙과 연결을 펼칩니다. <strong>OKR/MBO는 통합 진행</strong>하며 방식 차이는 단계 설명·뱃지로 표기.</p></div>
    <div class="filters">
      <div class="fgroup"><span class="flabel">레이어 (강조)</span><div class="chips" id="f-layer"></div></div>
      <div class="fgroup"><span class="flabel">출처</span><div class="chips" id="f-origin"></div></div>
      <div class="fgroup"><span class="flabel">AI 실행 주체</span><div class="chips" id="f-owner"></div></div>
      <div class="fgroup"><span class="flabel">검색</span><input class="search" id="search" placeholder="활동·키워드 검색…" type="search"></div>
    </div>
    <div class="flow" id="flow"></div>
  </section>

  <!-- VIEW 2 -->
  <section class="view" id="v-access">
    <div class="viewhead"><h2>주체별 레이어 접근 방식</h2>
      <p>각 주체(사람 User · AI Agent · AI Manager · AI Sub-agent · AI Assistant/DB)가 세 레이어에 어떻게 접근하는지의 책임 모델. Human-in-loop 게이트는 레이어 모델·아키텍처 뷰에서 활동별로 확인.</p></div>
    <div class="matrix-wrap"><table class="matrix" id="matrix"></table></div>
  </section>

  <!-- VIEW 3 -->
  <section class="view" id="v-arch">
    <div class="viewhead"><h2>AI Agent 아키텍처 (마인드맵 자동 도출)</h2>
      <p>레이어 데이터에서 도출한 4계층 구성. Orchestrator가 단계별 Manager를 호출하고, Manager가 활동별 Sub-agent를 조정하며, Sub-agent는 Assistant/DB의 지식(Data·맥락·원칙)을 도구로 호출합니다. Manager를 누르면 소속 Sub-agent가 펼쳐집니다.</p></div>
    <div class="arch" id="arch"></div>
  </section>
</main>

<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-hidden="true" aria-label="상세">
  <div class="dhead"><div class="layerline" id="d-layer"></div><h3 id="d-title"></h3>
    <button class="dclose" id="dclose" aria-label="닫기">✕</button></div>
  <div class="dbody" id="d-body"></div>
</aside>

<footer><div class="wrap">
  생성물: <code>enhanced_mindmap.json</code> (354 노드 · 485 엣지) + <code>agent_spec.json</code> (Manager 6 · Sub-agent 35) 자동 도출 ·
  레이어드 마인드맵 탐색기.
</div></footer>

<script id="data" type="application/json">__DATA__</script>
<script>
const D=JSON.parse(document.getElementById('data').textContent);
const byId=Object.fromEntries(D.nodes.map(n=>[n.id,n]));
const LAYER={L1_process:{l:'프로세스',c:'var(--teal)'},L2_activity:{l:'세부활동',c:'var(--slate)'},
  L3_data:{l:'Data',c:'var(--amber)'},L3_context:{l:'맥락',c:'var(--violet)'},
  L3_principle:{l:'원칙',c:'var(--rose)'},actor_ref:{l:'주체참조',c:'var(--ink-faint)'}};
const OWNER={user:{l:'User',c:'var(--amber)'},ai_agent:{l:'AI Agent',c:'var(--ink)'},
  ai_manager:{l:'AI Manager',c:'var(--teal)'},ai_subagent:{l:'AI Sub-agent',c:'var(--slate)'},
  ai_assistant:{l:'AI Assistant',c:'var(--violet)'}};
const ORIGIN={OKR:'b-okr',MBO:'b-mbo',both:'b-both'};
const esc=s=>(s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

// outgoing edges index
const OUT={};D.edges.forEach(e=>{(OUT[e.from]=OUT[e.from]||[]).push(e)});
const IN={};D.edges.forEach(e=>{(IN[e.to]=IN[e.to]||[]).push(e)});

/* ---- masthead ---- */
document.getElementById('purpose').textContent=D.meta.purpose;
const c=D.meta.counts;
const STAT=[['노드',c.nodes],['엣지',c.edges],['단계',c.by_layer.L1_process],
  ['세부활동',c.by_layer.L2_activity],['Sub-agent',D.agent.subagents.length],
  ['Human gate',D.agent.orchestrator.human_gate_total]];
document.getElementById('stats').innerHTML=STAT.map(([s,b])=>
  `<div class="stat"><b class="tnum">${b}</b><span>${s}</span></div>`).join('');
document.getElementById('n-layer').textContent=D.nodes.filter(n=>n.layer==='L2_activity'&&n.kind==='activity').length;
document.getElementById('n-arch').textContent=D.agent.subagents.length;

/* ---- tabs ---- */
const tabs=[...document.querySelectorAll('.tab')];
tabs.forEach(t=>t.onclick=()=>{
  tabs.forEach(x=>x.setAttribute('aria-selected',x===t));
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
  document.getElementById('v-'+t.dataset.v).classList.add('on');
});

/* ---- filters state ---- */
const F={layer:new Set(),origin:new Set(),owner:new Set(),q:''};
function mkChips(elId,items,key,withDot){
  document.getElementById(elId).innerHTML=items.map(([id,label,col])=>
    `<button class="chip" aria-pressed="false" data-id="${id}">${withDot?`<span class="dot" style="background:${col}"></span>`:''}${label}</button>`).join('');
  document.querySelectorAll(`#${elId} .chip`).forEach(ch=>ch.onclick=()=>{
    const on=ch.getAttribute('aria-pressed')==='true';ch.setAttribute('aria-pressed',!on);
    on?F[key].delete(ch.dataset.id):F[key].add(ch.dataset.id);renderFlow();});
}
mkChips('f-layer',[['L1_process','프로세스','var(--teal)'],['L2_activity','세부활동','var(--slate)'],
  ['L3_data','Data','var(--amber)'],['L3_context','맥락','var(--violet)'],['L3_principle','원칙','var(--rose)']],'layer',true);
mkChips('f-origin',[['OKR','OKR'],['MBO','MBO']],'origin',false);
mkChips('f-owner',[['ai_manager','Manager','var(--teal)'],['ai_subagent','Sub-agent','var(--slate)'],
  ['ai_assistant','Assistant','var(--violet)']],'owner',true);
document.getElementById('search').oninput=e=>{F.q=e.target.value.trim().toLowerCase();renderFlow();};

/* ---- knowledge of an activity (via parent-tree descendants + edges) ---- */
const KIDS={};D.nodes.forEach(n=>{if(n.parent){(KIDS[n.parent]=KIDS[n.parent]||[]).push(n.id)}});
function descend(root){const out=[],st=[...(KIDS[root]||[])];while(st.length){const x=st.pop();out.push(x);(KIDS[x]||[]).forEach(k=>st.push(k))}return out;}
function knowledgeOf(id){
  const scope=[id,...descend(id).filter(d=>byId[d]&&byId[d].layer==='L2_activity')];
  const k={data:[],context:[],principle:[]},seen=new Set();
  scope.forEach(s=>(OUT[s]||[]).forEach(e=>{
    if(seen.has(e.type+e.to))return;
    if(e.type==='requires_data'){k.data.push(e.to);seen.add(e.type+e.to)}
    else if(e.type==='interpreted_by'){k.context.push(e.to);seen.add(e.type+e.to)}
    else if(e.type==='governed_by'){k.principle.push(e.to);seen.add(e.type+e.to)}}));
  return k;
}
function matchFilter(n){
  if(F.origin.size&&!F.origin.has(n.origin))return false;
  if(F.owner.size&&!F.owner.has(n.ai_owner))return false;
  if(F.q){const hay=(n.label+' '+(n.summary||'')+' '+(n.hr_actor||'')).toLowerCase();if(!hay.includes(F.q))return false;}
  return true;
}
function layerHit(n){ // 레이어 강조: 활동 자체가 해당 레이어이거나, 그 지식에 해당 레이어 포함
  if(!F.layer.size)return true;
  if(F.layer.has(n.layer))return true;
  const k=knowledgeOf(n.id);
  if(F.layer.has('L3_data')&&k.data.length)return true;
  if(F.layer.has('L3_context')&&k.context.length)return true;
  if(F.layer.has('L3_principle')&&k.principle.length)return true;
  if(F.layer.has('L1_process'))return true;
  return false;
}

/* ---- VIEW 1 render ---- */
function renderFlow(){
  const flow=document.getElementById('flow');
  flow.innerHTML=D.phases.map(p=>{
    const acts=D.nodes.filter(n=>n.layer==='L2_activity'&&n.kind==='activity'&&n.phase===p.id);
    const cards=acts.map(a=>{
      const k=knowledgeOf(a.id),kc=k.data.length+k.context.length+k.principle.length;
      const pass=matchFilter(a), hit=layerHit(a);
      const dim=(!pass||!hit)?' dim':'';
      const ow=OWNER[a.ai_owner]||{l:a.ai_owner,c:'var(--ink-faint)'};
      return `<button class="card${dim}" data-id="${a.id}" style="border-left-color:${LAYER[a.layer].c}">
        <span class="t">${esc(a.label)}</span>
        <span class="meta">
          <span class="badge ${ORIGIN[a.origin]||'b-mbo'}">${a.origin}</span>
          <span class="owner"><span class="dot" style="background:${ow.c}"></span>${ow.l}</span>
          ${a.human_in_loop?'<span class="hil">Human gate</span>':''}
          <span class="kcount" title="연결 지식 수">◆${kc}</span>
        </span></button>`;}).join('')||'<p class="empty" style="padding:8px">활동 없음</p>';
    return `<div class="col${p.kind==='cross'?' cross':''}">
      <div class="colhead"><div class="kind">${p.kind==='core'?'코어 단계':'횡단'}</div>
        <h3>${esc(p.label)}</h3>
        ${p.okr_mbo_note?`<div class="note">${esc(p.okr_mbo_note)}</div>`:''}</div>
      <div class="colbody">${cards}</div></div>`;}).join('');
  flow.querySelectorAll('.card').forEach(b=>b.onclick=()=>openNode(b.dataset.id));
}

/* ---- drawer ---- */
const scrim=document.getElementById('scrim'),drawer=document.getElementById('drawer');
function closeDrawer(){drawer.classList.remove('on');scrim.classList.remove('on');drawer.setAttribute('aria-hidden','true');}
document.getElementById('dclose').onclick=closeDrawer;scrim.onclick=closeDrawer;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});
function klist(ids,cls){return ids.length?`<div class="klist">${ids.map(i=>
  `<span class="kitem ${cls}" style="background:${cls==='t-data'?'var(--amber-tint)':cls==='t-ctx'?'var(--violet-tint)':'var(--rose-tint)'};color:${cls==='t-data'?'var(--amber)':cls==='t-ctx'?'var(--violet)':'var(--rose)'}">${esc(byId[i]?byId[i].label:i)}</span>`).join('')}</div>`
  :'<span class="empty">연결 없음</span>';}
function openNode(id){
  const n=byId[id];if(!n)return;
  document.getElementById('d-layer').innerHTML=`<span style="color:${LAYER[n.layer].c}">●</span> ${LAYER[n.layer].l} · ${esc((D.phases.find(p=>p.id===n.phase)||{}).label||n.phase||'')}`;
  document.getElementById('d-title').textContent=n.label;
  const k=knowledgeOf(n.id);
  const ow=OWNER[n.ai_owner]||{l:n.ai_owner};
  const flowEdges=(OUT[id]||[]).filter(e=>['precede','produces','align','cascade','feedback','support','measure'].includes(e.type));
  document.getElementById('d-body').innerHTML=`
    <p class="sum">${esc(n.summary)}</p>
    <dl class="kv">
      <dt>출처</dt><dd>${n.origin}</dd>
      <dt>AI 실행</dt><dd>${ow.l}</dd>
      <dt>Human gate</dt><dd>${n.human_in_loop?'<span style="color:var(--hil)">필요 (승인·결정·서명)</span>':'—'}</dd>
      <dt>관련 직급</dt><dd>${(n.user_subroles||[]).join(', ')||'—'}</dd>
      <dt>현행 주체</dt><dd>${esc(n.hr_actor)||'—'}</dd>
    </dl>
    <div class="kgroup"><h4>◆ 필요 Data</h4>${klist(k.data,'t-data')}</div>
    <div class="kgroup"><h4>◆ 맥락 (해석)</h4>${klist(k.context,'t-ctx')}</div>
    <div class="kgroup"><h4>◆ 원칙 (기준)</h4>${klist(k.principle,'t-prin')}</div>
    ${flowEdges.length?`<div class="kgroup"><h4>흐름·연결</h4><div class="connlist">${flowEdges.map(e=>
      `<div class="conn"><span class="rel">${e.type}</span><span>${esc(byId[e.to]?byId[e.to].label:e.to)}</span></div>`).join('')}</div></div>`:''}`;
  drawer.classList.add('on');scrim.classList.add('on');drawer.setAttribute('aria-hidden','false');
}

/* ---- VIEW 2 matrix ---- */
(function(){
  const layers=[['L1_process','프로세스'],['L2_activity','세부활동'],['L3_knowledge','HR Domain Knowledge']];
  let h=`<thead><tr><th>주체 \\ 레이어</th>${layers.map(l=>`<th>${l[1]}</th>`).join('')}</tr></thead><tbody>`;
  D.actors.forEach(a=>{
    const kc=a.kind==='human'?'k-human':a.kind==='ai'?'k-ai':'k-infra';
    h+=`<tr><th><div class="actorname">${esc(a.label)}<span class="kindtag ${kc}">${a.kind}</span></div>
      <div class="subroles">${a.subroles?esc(a.subroles.join(' · ')):esc(a.responsibility.slice(0,70))+'…'}</div></th>`;
    layers.forEach(l=>{const m=a.layer_access[l[0]];h+=`<td><div class="cell-mode">${esc(m.split('—')[0])}</div>${m.includes('—')?`<div class="cell-detail">${esc(m.split('—').slice(1).join('—').trim())}</div>`:''}</td>`;});
    h+='</tr>';
  });
  document.getElementById('matrix').innerHTML=h+'</tbody>';
})();

/* ---- VIEW 3 architecture ---- */
let openMgr=null;
function renderArch(){
  const o=D.agent.orchestrator,ac=D.agent.assistant_counts;
  const arch=document.getElementById('arch');
  let h=`<div class="orch"><h3>● AI Agent (Orchestrator)</h3>
    <p>${esc(o.responsibility)}</p>
    <div class="flowline">${o.flow.map(id=>`<span class="pill">${esc((D.phases.find(p=>p.id===id)||{}).label||id)}</span>`).join('<span style="color:#6f8">→</span>')}
      ${o.cross_cutting.map(id=>`<span class="pill" style="background:rgba(109,91,208,.25)">⤫ ${esc((D.phases.find(p=>p.id===id)||{}).label||id)}</span>`).join('')}</div></div>`;
  h+=`<div><div class="sectionlabel">AI Manager — 단계 책임 (${D.agent.managers.length})</div><div class="mgr-grid" id="mgrs"></div></div>`;
  h+=`<div id="sa-zone"></div>`;
  h+=`<div class="orch" style="background:var(--violet)"><h3>● AI Assistant / DB / Infra — 지식 계층</h3>
    <p style="color:#E7E2FA">Sub-agent가 호출하는 HR Domain Knowledge 저장·검색·제공.</p>
    <div class="flowline"><span class="pill">Data ${ac.data}</span><span class="pill">맥락 ${ac.context}</span><span class="pill">원칙 ${ac.principle}</span></div></div>`;
  arch.innerHTML=h;
  document.getElementById('mgrs').innerHTML=D.agent.managers.map(m=>
    `<button class="mgr${m.kind==='cross'?' cross':''}" data-id="${m.id}" aria-pressed="${openMgr===m.id}">
      <h3>${esc(m.label)}</h3>
      <span class="c">Sub-agent ${m.subagent_count} · ${m.kind==='core'?'코어':'횡단'}</span>
      ${m.okr_mbo_note?`<span class="note">${esc(m.okr_mbo_note.slice(0,90))}…</span>`:''}</button>`).join('');
  document.querySelectorAll('.mgr').forEach(b=>b.onclick=()=>{openMgr=openMgr===b.dataset.id?null:b.dataset.id;renderArch();});
  const zone=document.getElementById('sa-zone');
  if(openMgr){
    const m=D.agent.managers.find(x=>x.id===openMgr);
    const sas=D.agent.subagents.filter(s=>m.manages_subagents.includes(s.id));
    zone.innerHTML=`<div class="sectionlabel">${esc(m.label)} → Sub-agent (${sas.length})</div>
      <div class="sa-grid">${sas.map(s=>{
        const t=s.tools;
        return `<button class="sa" data-sa="${s.id}">
          <span class="t">${esc(s.label)}</span>
          <span class="toolrow">
            <span class="tool t-data">◆Data ${t.data.length}</span>
            <span class="tool t-ctx">◆맥락 ${t.context.length}</span>
            <span class="tool t-prin">◆원칙 ${t.principle.length}</span>
            ${s.human_in_loop_gates.length?`<span class="tool t-gate">⚑ Gate ${s.human_in_loop_gates.length}</span>`:''}
          </span></button>`;}).join('')}</div>`;
    zone.querySelectorAll('.sa').forEach(b=>b.onclick=()=>openSA(b.dataset.sa));
    zone.scrollIntoView({behavior:'smooth',block:'nearest'});
  }else zone.innerHTML='';
}
function openSA(id){
  const s=D.agent.subagents.find(x=>x.id===id);if(!s)return;
  document.getElementById('d-layer').innerHTML=`<span style="color:var(--slate)">●</span> AI Sub-agent · ${esc(s.phase_label||'')}`;
  document.getElementById('d-title').textContent=s.label;
  const tl=(arr,cls,c)=>arr.length?`<div class="klist">${arr.map(x=>`<span class="kitem" style="background:${c[0]};color:${c[1]}">${esc(x)}</span>`).join('')}</div>`:'<span class="empty">연결 없음</span>';
  document.getElementById('d-body').innerHTML=`
    <dl class="kv">
      <dt>출처</dt><dd>${s.origin}</dd>
      <dt>실행 활동</dt><dd>${s.executes.length}건</dd>
      <dt>Human gate</dt><dd>${s.human_in_loop_gates.length?'<span style="color:var(--hil)">'+s.human_in_loop_gates.length+'건</span>':'—'}</dd>
      <dt>관련 직급</dt><dd>${(s.human_roles||[]).join(', ')||'—'}</dd>
    </dl>
    <div class="kgroup"><h4>◆ 도구: Data</h4>${tl(s.tools.data,'',['var(--amber-tint)','var(--amber)'])}</div>
    <div class="kgroup"><h4>◆ 도구: 맥락</h4>${tl(s.tools.context,'',['var(--violet-tint)','var(--violet)'])}</div>
    <div class="kgroup"><h4>◆ 도구: 원칙</h4>${tl(s.tools.principle,'',['var(--rose-tint)','var(--rose)'])}</div>
    <div class="kgroup"><h4>산출물</h4>${tl(s.produces,'',['var(--teal-tint)','var(--teal-deep)'])}</div>
    ${s.human_in_loop_gates.length?`<div class="kgroup"><h4>⚑ Human-in-loop 게이트</h4><div class="connlist">${s.human_in_loop_gates.map(g=>`<div class="conn"><span class="rel" style="color:var(--hil)">승인</span><span>${esc(g.label)}</span></div>`).join('')}</div></div>`:''}
    <div class="kgroup"><h4>실행 단위</h4><div class="connlist">${s.executes.map(e=>`<div class="conn"><span class="rel">${e.kind}</span><span>${esc(e.label)}</span></div>`).join('')}</div></div>`;
  drawer.classList.add('on');scrim.classList.add('on');drawer.setAttribute('aria-hidden','false');
}

renderFlow();renderArch();
</script>"""

out = TPL.replace('__DATA__', DATA)
outp = os.path.join(HERE, 'mindmap_app.html')
open(outp, 'w', encoding='utf-8').write(out)
print('written', outp, len(out), 'bytes')
