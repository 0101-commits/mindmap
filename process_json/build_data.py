# -*- coding: utf-8 -*-
"""unified_process.json -> ../data.js (mindmap v3/v4 format)."""
import json, io

d = json.load(open('unified_process.json', encoding='utf-8'))
phases = d['unified_phases']
nodes = d['nodes']
meta = d['meta']

UP2LAYER = {
    'u.goal': 'goal', 'u.check': 'check', 'u.eval': 'eval', 'u.fb': 'fb',
    'x.align': 'align', 'x.change': 'change', 'core': 'core',
}
TYPE2GROUP = {
    'phase': 'phase', 'concept': 'concept', 'activity': 'activity',
    'task': 'task', 'output': 'output', 'data': 'data',
    'role': 'role', 'principle': 'principle',
}
CIRCLED = {0: '①', 1: '②', 2: '③', 3: '④', 4: '⑤', 5: '⑥'}
SRCTAG = {'OKR': 'OKR Manual', 'PM(MBO)': 'PM Manual(MBO)'}


def esc(s):
    if s is None:
        return ''
    return (str(s).replace('\\', '\\\\').replace('"', '\\"')
            .replace('\n', '\\n').replace('\r', ''))


def jlist(items):
    return '[' + ', '.join('"' + esc(x) + '"' for x in items) + ']'


def detail_lines(n):
    out = []
    if n.get('actor'):
        out.append('담당: ' + n['actor'])
    if n.get('timing'):
        out.append('시기: ' + n['timing'])
    if n.get('inputs'):
        out.append('투입(input): ' + ', '.join(n['inputs']))
    if n.get('outputs'):
        out.append('산출(output): ' + ', '.join(n['outputs']))
    if n.get('keywords'):
        out.append('키워드: ' + ', '.join(n['keywords']))
    src_grp = SRCTAG.get(n.get('source'), n.get('source') or '')
    if src_grp:
        out.append('출처체계: ' + src_grp)
    return out


backbone = []
backbone.append({
    'id': 'root', 'group': 'core', 'layer': 'core',
    'label': '통합\\n성과관리\\n프로세스',
    'summary': meta['title'],
    'detail': ['OKR Manual(108p) + PM Manual MBO(180p) 통합 프로세스 맵.',
               '6대 통합단계: 목표수립 → 실행·점검 → 평가 → 피드백 (+ 정렬·연계 / 변화·문화 횡단).',
               '총 ' + str(meta['unit_count']) + '개 프로세스 단위(phase>activity>task>output/data) + 개념·역할·원칙.'],
    'src': ' · '.join(meta['sources']),
})
for i, p in enumerate(phases):
    backbone.append({
        'id': p['id'],
        'group': 'process',
        'layer': UP2LAYER.get(p['id'], 'core'),
        'label': CIRCLED[i] + ' ' + p['label'][3:].strip(),
        'summary': p['summary'],
        'detail': ['통합단계 코드: ' + p['label'],
                   '성격: ' + ('핵심 흐름(core)' if p['kind'] == 'core' else '횡단 지원(cross)'),
                   '매핑 원본: ' + ', '.join(p['maps'])],
        'src': '통합 프로세스',
    })

data_nodes = []
for n in nodes:
    data_nodes.append({
        'id': n['id'],
        'group': TYPE2GROUP.get(n['type'], 'concept'),
        'layer': UP2LAYER.get(n.get('uphase'), 'core'),
        'label': n['label'],
        'summary': n.get('summary') or '',
        'detail': detail_lines(n),
        'src': n.get('src') or '',
    })

all_nodes = backbone + data_nodes
node_ids = set(x['id'] for x in all_nodes)

REL_MAP = {'precede': 'precede', 'measure': 'measure', 'align': 'align',
           'feedback': 'feedback', 'cascade': 'cascade', 'support': 'support'}
edges = []
seen = set()


def add_edge(fr, to, rel=None, dashes=False):
    key = (fr, to, rel)
    if key in seen or fr == to:
        return
    if fr not in node_ids or to not in node_ids:
        return
    seen.add(key)
    edges.append({'from': fr, 'to': to, 'rel': rel, 'dashes': dashes})


for p in phases:
    add_edge('root', p['id'])
for n in nodes:
    if n['parent']:
        add_edge(n['parent'], n['id'])
    else:
        up = n.get('uphase')
        anchor = up if up in node_ids else 'root'
        add_edge(anchor, n['id'])
for n in nodes:
    for r in n.get('rel', []):
        rt = r.get('type')
        if rt == 'contain':
            continue
        rel = REL_MAP.get(rt)
        add_edge(n['id'], r['to'], rel=rel, dashes=(rt != 'precede'))

o = io.open('../data.js', 'w', encoding='utf-8')
w = o.write
w('/* ============================================================\n')
w(' *  통합 성과관리 프로세스 마인드맵 데이터 (v4 — unified_process)\n')
w(' *  출처: HCG OKR Manual Deck(108p) + PM Manual Masterbook MBO(180p)\n')
w(' *  생성: process_json/build_data.py  (원천: process_json/unified_process.json)\n')
w(' *\n')
w(' *  group(색상) = 노드 type / layer(필터축) = 통합단계(uphase)\n')
w(' *  rel: precede(선후) measure(측정) align(정렬) feedback(피드백) cascade(캐스케이딩) support(지원)\n')
w(' * ============================================================ */\n\n')

w('const GROUPS = {\n')
GROUPS = [
    ('core', '중심', '#1f2937'),
    ('process', '통합단계', '#356CB5'),
    ('phase', '세부단계', '#7c3aed'),
    ('concept', '개념', '#0891b2'),
    ('activity', '활동', '#2563eb'),
    ('task', '과업', '#4f46e5'),
    ('output', '산출물', '#059669'),
    ('data', '데이터', '#db2777'),
    ('role', '역할', '#d97706'),
    ('principle', '원칙', '#16a34a'),
]
for k, lab, col in GROUPS:
    w('  %-10s { label: "%s", color: "%s" },\n' % (k + ':', lab, col))
w('};\n\n')

w('const TPL_UNIFIED_NODES = [\n')
for n in all_nodes:
    w('  { id: "%s", group: "%s", layer: "%s", label: "%s",\n'
      % (esc(n['id']), n['group'], n['layer'], esc(n['label'])))
    w('    summary: "%s",\n' % esc(n['summary']))
    w('    detail: %s, src: "%s" },\n' % (jlist(n['detail']), esc(n['src'])))
w('];\n\n')

w('const TPL_UNIFIED_EDGES = [\n')
for e in edges:
    parts = ['from: "%s"' % esc(e['from']), 'to: "%s"' % esc(e['to'])]
    if e['rel']:
        parts.append('rel: "%s"' % e['rel'])
    if e['dashes']:
        parts.append('dashes: true')
    w('  { ' + ', '.join(parts) + ' },\n')
w('];\n\n')

w('const PROCESS_TEMPLATES = {\n')
w('  unified: {\n')
w('    name: "통합 성과관리 프로세스 (OKR + MBO)",\n')
w('    desc: "목표수립→실행·점검→평가→피드백 (+정렬·연계/변화·문화) 통합 맵.",\n')
w('    layers: {\n')
w('      core:   { label: "공통·중심" },\n')
w('      goal:   { label: "U1 목표수립" },\n')
w('      check:  { label: "U2 실행·점검" },\n')
w('      eval:   { label: "U3 평가" },\n')
w('      fb:     { label: "U4 피드백" },\n')
w('      align:  { label: "X1 정렬·연계" },\n')
w('      change: { label: "X2 변화·문화" }\n')
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
print('nodes=%d edges=%d' % (len(all_nodes), len(edges)))
