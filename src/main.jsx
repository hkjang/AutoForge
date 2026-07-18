import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, Boxes, ChevronDown, ChevronRight, CircleDollarSign, Clock3,
  Cpu, FileText, Gauge, GitBranch, Hexagon, Layers3, MoreHorizontal,
  Plus, Search, Settings, ShieldCheck, Sparkles, UserRound, Wind,
  Workflow, Zap, Bot, Check, X, Bell, PanelLeftClose, RotateCcw,
  Play, Pause, AlertTriangle, Thermometer, Car, BatteryCharging, Box,
  ArrowUpRight, SlidersHorizontal, Download, Command, Target
} from 'lucide-react';
import './styles.css';
import { AgentCenter, ArchitectureDesigner, BOMDashboard, ConceptLab, GovernanceCenter, MissionControl, OptimizationCenter, PlatformOps, RobotLab, TwinDashboard } from './ProductModules';
import { api } from './api';

const nav = [
  { label: '프로젝트 스튜디오', icon: Layers3, active: true },
  { label: '목표 및 루프', icon: Target },
  { label: '콘셉트 랩', icon: Sparkles },
  { label: '차량 아키텍처', icon: Boxes },
  { label: '시뮬레이션 허브', icon: Activity },
  { label: '최적화 센터', icon: Workflow },
  { label: '로봇 랩', icon: Bot, badge: 'BETA' },
  { label: '디지털 트윈', icon: Hexagon },
  { label: 'BOM 및 원가', icon: CircleDollarSign },
];

const agents = [
  { name: '수석 설계', task: '아키텍처 검토 완료', state: 'done' },
  { name: '패키징', task: '배터리 레이아웃 최적화', state: 'run' },
  { name: '공력', task: 'CFD 24/32 케이스', state: 'run' },
  { name: '제조·원가', task: '공급망 대안 분석', state: 'wait' },
];

function BrandMark() {
  return <div className="brand-mark"><i /><i /><i /></div>;
}

function Sidebar({ compact, onCompact, activeNav, setActiveNav }) {
  return <aside className={`sidebar ${compact ? 'compact' : ''}`}>
    <div className="brand"><BrandMark />{!compact && <div><strong>AUTOFORGE</strong><span>ROBOTICS</span></div>}</div>
    <button className="new-project" onClick={() => window.dispatchEvent(new CustomEvent('newproject'))}>
      <Plus size={17} />{!compact && <span>새 프로젝트</span>}
    </button>
    <nav>
      <span className="nav-label">{compact ? '•••' : 'WORKSPACE'}</span>
      {nav.map((n) => <button key={n.label} className={activeNav === n.label ? 'active' : ''} onClick={() => setActiveNav(n.label)} title={n.label}>
        <n.icon size={18}/>{!compact && <><span>{n.label}</span>{n.badge && <em>{n.badge}</em>}</>}
      </button>)}
      <span className="nav-label lower">{compact ? '•••' : 'MANAGE'}</span>
      <button className={activeNav === '에이전트 센터' ? 'active' : ''} onClick={() => setActiveNav('에이전트 센터')} title="에이전트 센터"><Cpu size={18}/>{!compact && <span>에이전트 센터</span>}</button>
      <button className={activeNav === '플랫폼 운영' ? 'active' : ''} onClick={() => setActiveNav('플랫폼 운영')} title="플랫폼 운영"><Workflow size={18}/>{!compact && <span>플랫폼 운영</span>}</button>
      <button className={activeNav === '규정 및 안전' ? 'active' : ''} onClick={() => setActiveNav('규정 및 안전')} title="규정 및 안전"><ShieldCheck size={18}/>{!compact && <span>규정 및 안전</span>}</button>
    </nav>
    <div className="side-bottom">
      <button onClick={onCompact}><PanelLeftClose size={18}/>{!compact && <span>사이드바 접기</span>}</button>
      <div className="profile"><span>JK</span>{!compact && <div><b>정우 김</b><small>Lead Engineer</small></div>} {!compact && <MoreHorizontal size={17}/>}</div>
    </div>
  </aside>
}

function Topbar({ projects, project, setProject, onSearch }) {
  return <header className="topbar">
    <label className="project-select"><span className="project-dot"/><select aria-label="활성 프로젝트" value={project?.id||''} onChange={e=>setProject(projects.find(x=>x.id===e.target.value))}>{projects.map(x=><option value={x.id} key={x.id}>{x.code} · {x.name}</option>)}</select><span className="version">v{project?.version||'—'}</span><ChevronDown size={15}/></label>
    <div className="top-actions">
      <button className="search" onClick={onSearch}><Search size={17}/><span>검색</span><kbd>⌘ K</kbd></button>
      <button className="icon-btn" aria-label="알림 열기"><Bell size={18}/><i /></button>
      <button className="icon-btn" aria-label="설정 열기"><Settings size={18}/></button>
      <div className="status"><span />시스템 정상</div>
    </div>
  </header>
}

function Metric({ icon: Icon, label, value, unit, delta, target }) {
  return <div className="metric">
    <div className="metric-head"><span><Icon size={15}/>{label}</span><em>{target}</em></div>
    <div className="metric-value">{value}<small>{unit}</small></div>
    <div className="meter"><i style={{ width: `${Math.min(100, delta)}%` }} /></div>
  </div>
}

function Hero({ onGenerate, design, project }) {
  const [view, setView] = useState('외관');
  return <section className="hero">
    <img src="/assets/urban-ev-concept.png" alt="AutoForge가 생성한 도심형 전기차 콘셉트" />
    <div className="hero-shade" />
    <div className="hero-content">
      <div className="eyebrow"><span>ACTIVE DESIGN</span><i />Iteration {String(design?.iteration||0).padStart(2,'0')}</div>
      <h1>{project?.name||'새 차량'}<br/><strong>{design?.name||'설계 기준선 대기'}</strong></h1>
      <p>{design?`${design.parameters?.length||'—'} mm · ${design.parameters?.wheelbase||'—'} mm wheelbase · ${design.status}`:'자연어 요구사항을 입력해 첫 설계를 생성하세요.'}</p>
      <div className="hero-actions">
        <button className="primary" onClick={onGenerate}><Sparkles size={17}/>AI 설계 계속하기</button>
        <button className="secondary"><RotateCcw size={16}/>변경 이력</button>
      </div>
    </div>
    <div className="view-control">{['외관','패키징','구조','공력'].map(v => <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v}</button>)}</div>
    <div className="hero-metrics">
      <Metric icon={Zap} label="예상 주행거리" value={design?.metrics?.range??'—'} unit="km" delta={design?.metrics?.range?Math.min(100,design.metrics.range/4.5):0} target="설계 산정" />
      <Metric icon={CircleDollarSign} label="제조 원가" value={design?.metrics?.cost??'—'} unit="백만원" delta={design?.metrics?.cost?Math.min(100,design.metrics.cost/30*100):0} target="목표 ≤ 30" />
      <Metric icon={Wind} label="공기저항 계수" value={design?.metrics?.cd??'—'} unit="Cd" delta={design?.metrics?.cd?Math.min(100,.25/design.metrics.cd*85):0} target="설계 산정" />
      <Metric icon={Gauge} label="공차 중량" value={design?.metrics?.weight?.toLocaleString?.()??'—'} unit="kg" delta={design?.metrics?.weight?Math.min(100,design.metrics.weight/1900*100):0} target="목표 ≤ 1,900" />
    </div>
  </section>
}

function AgentPanel({ running, agentItems=[] }) {
  const shown=agentItems.length?agentItems.map(a=>({name:a.name,task:a.status==='running'?'전문 도구 실행 중':`${a.role} · ${a.tools?.length||0} tools`,state:a.status==='running'?'run':a.status==='idle'?'wait':'done'})):agents,active=shown.filter(x=>x.state==='run').length;
  return <section className="panel agent-panel">
    <div className="panel-title"><div><span className="live-dot"/><h3>에이전트 워크플로</h3></div><button>전체 보기<ChevronRight size={15}/></button></div>
    <div className="agent-summary"><strong>{active}<small>/ {shown.length}</small></strong><span>에이전트 작업 중<br/><em>{running?'자율 설계 실행 중':'실행 대기'}</em></span><div className="radial">{running?'LIVE':'IDLE'}</div></div>
    <div className="agents">
      {shown.slice(0,6).map((a) => <div className="agent-row" key={a.name}>
        <span className={`agent-icon ${a.state}`} >{a.state === 'done' ? <Check size={13}/> : <Cpu size={13}/>}</span>
        <div><b>{a.name}</b><small>{a.task}</small></div>
        <span className={`state ${a.state}`}>{a.state === 'done' ? '완료' : a.state === 'run' ? '실행 중' : '대기'}</span>
      </div>)}
    </div>
  </section>
}

function CandidateCard({ c, selected, setSelected }) {
  return <button className={`candidate ${selected ? 'selected' : ''}`} onClick={() => setSelected(c.id)}>
    <div className="candidate-top"><span style={{ background: c.accent }}/><div><small>{c.id}</small><b>{c.name}</b></div>{selected && <em><Check size={12}/>선택됨</em>}</div>
    <div className="score"><strong>{c.score}</strong><span>종합 점수<br/><i>100점 만점</i></span></div>
    <div className="mini-metrics"><span><small>주행거리</small><b>{c.range} km</b></span><span><small>원가</small><b>{c.cost} M</b></span><span><small>Cd</small><b>{c.cd}</b></span></div>
  </button>
}

function CandidatePanel({ designs=[] }) {
  const normalized=designs.slice().reverse().slice(0,3).map((d,i)=>({id:d.id,name:d.name,range:d.metrics?.range??'—',cost:d.metrics?.cost??'—',cd:d.metrics?.cd??'—',weight:d.metrics?.weight??'—',score:d.score??d.metrics?.score??0,accent:['#b8f500','#66d8ff','#f4b86c'][i]})),[selected,setSelected]=useState('');useEffect(()=>{if(normalized[0]&&!normalized.some(x=>x.id===selected))setSelected(normalized[0].id)},[designs]);
  return <section className="panel candidate-panel">
    <div className="panel-title"><div><h3>설계 후보</h3><span className="count">{designs.length}</span></div><button>최신 3개 revision<ChevronRight size={15}/></button></div>
    <div className="candidate-grid">{normalized.length?normalized.map(c => <CandidateCard key={c.id} c={c} selected={selected === c.id} setSelected={setSelected}/>):<div className="empty-state small"><Layers3 size={24}/><span>아직 생성된 설계 후보가 없습니다.</span></div>}</div>
  </section>
}

function BottomBar({ notify, graph, projectId }) {
  const reqs=graph?.requirements||[],sims=graph?.simulations||[],pending=graph?.approvals?.filter(x=>x.status==='pending').length||0,changes=graph?.changes||[];
  const items = [
    ['요구사항', `${reqs.filter(x=>x.status==='pass').length} / ${reqs.length} 충족`,reqs.length?`${Math.round(reqs.filter(x=>x.status==='pass').length/reqs.length*100)}%`:'0%', '#b8f500'],
    ['시뮬레이션', `${sims.filter(x=>x.status==='complete').length}개 완료`, `${sims.filter(x=>x.status==='running').length} 실행 중`, '#66d8ff'],
    ['검토 필요', '승인 게이트', `${pending}건`, '#f4b86c'],
    ['최근 변경', changes[0]?.type||'변경 없음', changes[0]?.target||'—', '#d1a7ff'],
  ];
  return <section className="bottom-stats">{items.map(([a,b,c,color]) => <div key={a}><i style={{background: color}}/><span><small>{a}</small><b>{b}</b></span><em>{c}</em></div>)}<button onClick={() => {window.open(api.reportUrl(projectId),'_blank');notify('현재 프로젝트 설계 그래프 보고서를 생성했습니다')}}><FileText size={16}/>개발 보고서 생성</button></section>
}

function SimulationHub({ notify, projectId }) {
  const [filter, setFilter] = useState('전체');
  const [runs,setRuns]=useState([]),[designs,setDesigns]=useState([]),[designId,setDesignId]=useState(''),[selectedId,setSelectedId]=useState(''),[busy,setBusy]=useState(false);const meta={aero:['공력',Wind,'#66d8ff'],thermal:['열관리',Thermometer,'#f4b86c'],structure:['구조',Box,'#b8f500'],range:['주행',Car,'#d1a7ff']};const load=()=>Promise.all([api.simulations(projectId),api.graph(projectId)]).then(([items,g])=>{setDesigns(g.designs||[]);setDesignId(current=>g.designs?.some(x=>x.id===current)?current:g.designs?.at(-1)?.id||'');const mapped=items.map(s=>{const[label,icon,color]=meta[s.type]||[s.type,Activity,'#66d8ff'];return{...s,domain:s.type,type:label,icon,color,case:`${s.designId} · ${s.fidelity||'legacy'}`,eta:s.status==='complete'?'완료':'계산 중',state:s.status==='complete'?'완료':'실행 중'}});setRuns(mapped);setSelectedId(current=>mapped.some(x=>x.id===current)?current:mapped[0]?.id||'')}).catch(()=>{});useEffect(()=>{if(projectId){setRuns([]);setDesignId('');setSelectedId('');load()}},[projectId]);const runSuite=async()=>{if(!designId)return notify('먼저 이 프로젝트에서 설계 후보를 생성하세요');setBusy(true);try{for(const type of Object.keys(meta))await api.simulate(type,designId);await load();notify(`${designId} · 4개 물리 해석과 CSV 증거를 생성했습니다`)}catch(error){notify(`시뮬레이션 실패 · ${error.message}`)}finally{setBusy(false)}};
  const shown = filter === '전체' ? runs : runs.filter(s => s.type === filter);
  const selected=runs.find(x=>x.id===selectedId),metrics=selected?.result?Object.entries(selected.result).filter(([key,v])=>['string','number'].includes(typeof v)&&!['confidence','uncertaintyPercent'].includes(key)):[];
  return <div className="module-page sim-page">
    <section className="module-banner">
      <div><span>SIMULATION ORCHESTRATOR</span><h1>가상 검증을 한곳에서.</h1><p>설계 버전과 연결된 해석을 자동 실행하고, 결과 차이를 에이전트가 분석합니다.</p></div>
      <div className="sim-design-action"><select aria-label="해석 대상 설계" value={designId} onChange={e=>setDesignId(e.target.value)}>{designs.map(x=><option value={x.id} key={x.id}>{x.id} · {x.name}</option>)}</select><button className="primary" disabled={busy||!designId} onClick={runSuite}><Play size={16}/>{busy?'해석 실행 중…':'4종 물리 해석 실행'}</button></div>
    </section>
    <div className="sim-kpis">
      <div><small>전체 케이스</small><strong>{runs.length}</strong><em>현재 프로젝트</em></div>
      <div><small>완료</small><strong>{runs.filter(x=>x.status==='complete'||x.progress===100).length}</strong><em className="good">증거 저장됨</em></div>
      <div><small>실행 중</small><strong>{runs.filter(x=>x.status==='running').length}</strong><em>격리 worker</em></div>
      <div><small>불확실성 표시</small><strong>{runs.filter(x=>x.result?.uncertaintyPercent).length}</strong><em className="warn">ROM 모델</em></div>
    </div>
    <section className="sim-workspace">
      <div className="sim-main">
        <div className="section-toolbar"><div className="filter-tabs">{['전체','공력','열관리','구조','주행'].map(f => <button className={filter===f?'active':''} onClick={() => setFilter(f)} key={f}>{f}</button>)}</div><button className="outline"><SlidersHorizontal size={14}/>필터</button></div>
        <div className="sim-list">{shown.length?shown.map((s,i) => <button onClick={()=>setSelectedId(s.id)} className={`sim-row ${selectedId===s.id?'selected':''}`} key={s.id||`${s.name}-${i}`}>
          <span className="sim-type" style={{color:s.color,background:`${s.color}16`}}><s.icon size={18}/></span>
          <div className="sim-name"><small>{s.type}</small><b>{s.name}</b><span>{s.case}</span></div>
          <div className="progress-wrap"><span><i>{s.progress}%</i><em>{s.eta}</em></span><div><i style={{width:`${s.progress}%`,background:s.color}}/></div></div>
          <span className={`run-state ${s.progress===100?'complete':''}`}>{s.progress===100?<Check size={12}/>:<Activity size={12}/>} {s.progress===100?'완료':s.state}</span>
          <MoreHorizontal className="more" size={17}/>
        </button>):<div className="empty-state"><Activity size={28}/><b>해석 증거 없음</b><span>설계를 선택하고 4종 검증을 실행하세요.</span></div>}</div>
      </div>
      <aside className="sim-evidence-inspector">{selected?<><div className="insight-head"><ShieldCheck size={15}/><b>해석 증거 인스펙터</b><span>{selected.domain?.toUpperCase()}</span></div><div className="evidence-identity"><span>{selected.id}</span><b>{selected.name}</b><small>{selected.modelVersion||'legacy'} · {selected.fidelity||'unknown fidelity'}</small></div><div className="uncertainty-card"><div><small>모델 신뢰도</small><b>{selected.result?.confidence!=null?`${Math.round(selected.result.confidence*100)}%`:'—'}</b></div><div><small>불확실성</small><b>{selected.result?.uncertaintyPercent!=null?`±${selected.result.uncertaintyPercent}%`:'—'}</b></div></div><div className="evidence-metrics">{metrics.map(([key,value])=><span key={key}><small>{key}</small><b>{value}</b></span>)}</div><div className="assumption-list"><b>모델 가정</b>{selected.assumptions?.length?selected.assumptions.map(x=><span key={x}><Check size={10}/>{x}</span>):<small>기록된 가정 없음</small>}</div><div className="artifact-list"><b>콘텐츠 해시 아티팩트</b>{selected.artifactIds?.length?selected.artifactIds.map((id,i)=><button key={id} onClick={()=>api.downloadArtifact(id,`${selected.id}-${i+1}`).then(()=>notify(`${id.slice(0,8)} 아티팩트를 검증 후 다운로드했습니다`)).catch(e=>notify(`아티팩트 다운로드 실패 · ${e.message}`))}><Download size={11}/><span>{id}</span></button>):<small>연결된 아티팩트 없음</small>}</div></>:<div className="empty-state"><ShieldCheck size={28}/><span>검토할 해석을 선택하세요.</span></div>}</aside>
    </section>
    <div className="run-dock"><span><Activity size={15}/>{busy?'격리 물리 worker 실행 중':'시뮬레이션 증거 동기화됨'}</span><div><b>현재 검증 단계</b><em>{selected?.fidelity?.toUpperCase()||'NO EVIDENCE'}</em></div><button onClick={load}><RotateCcw size={15}/>증거 새로고침</button></div>
  </div>
}

const moduleData = {
  '콘셉트 랩': ['자연어·스케치로 디자인 탐색', '외관 테마', 'CMF 라이브러리', '실내 경험'],
  '차량 아키텍처': ['시스템과 공간을 하나의 설계 그래프로', '차체 구조', '배터리·구동계', 'E/E 아키텍처'],
  '최적화 센터': ['수천 개의 설계 조합에서 최적점 탐색', '파레토 프론티어', '목적함수', '제약조건'],
  '로봇 랩': ['가상 설계를 실제 검증으로 연결', '제작 셀', '시험 로봇', '계측 스트림'],
  '디지털 트윈': ['가상 모델과 실차 데이터의 지속적 동기화', '모델 보정', '센서 데이터', '상태 예측'],
  'BOM 및 원가': ['부품·공급망·제조원가의 실시간 연결', 'BOM 구조', '공급사', '대체 부품'],
  '에이전트 센터': ['전문 에이전트의 역할·도구·권한을 통제', '에이전트 런타임', 'MCP 도구 권한', '프롬프트 레지스트리'],
  '규정 및 안전': ['설계부터 릴리스까지 안전 기준을 강제', '승인 게이트', '인증 규정', '사이버 보안'],
};

function ModuleOverview({ name, notify }) {
  const data = moduleData[name] || moduleData['차량 아키텍처'];
  return <div className="module-page overview-page">
    <section className="module-banner"><div><span>AUTOFORGE MODULE</span><h1>{data[0]}</h1><p>URBAN E04 · Design Version 0.8과 실시간으로 연결되어 있습니다.</p></div><button className="primary" onClick={() => notify(`${name}에서 새 작업을 생성했습니다`)}><Plus size={16}/>새 작업</button></section>
    <div className="overview-grid">{data.slice(1).map((item,i) => <button className="overview-card" key={item} onClick={() => notify(`${item} 작업공간을 열었습니다`)}><span>{String(i+1).padStart(2,'0')}</span><div><Box size={22}/><h3>{item}</h3><p>{i===0?'현재 설계 버전에서 4개의 변경사항이 감지되었습니다.':i===1?'에이전트 분석 결과와 연결된 데이터를 확인합니다.':'승인된 기준과 최신 상태가 동기화되었습니다.'}</p></div><ArrowUpRight size={17}/></button>)}</div>
    <section className="activity-table"><div className="panel-title"><div><h3>최근 활동</h3></div><button>전체 이력<ChevronRight size={15}/></button></div>{['배터리 팩 높이 12mm 감소','전륜 서브프레임 소재 변경','요구사항 REQ-028 검증 완료','설계 버전 v0.8 생성'].map((x,i)=><div className="activity-row" key={x}><GitBranch size={15}/><span><b>{x}</b><small>{['패키징 에이전트','구조 에이전트','검증 에이전트','정우 김'][i]}</small></span><em>{['8분 전','24분 전','1시간 전','어제'][i]}</em></div>)}</section>
  </div>
}

function CommandPalette({ close, setActiveNav }) {
  const [query,setQuery]=useState('');
  const results=[...nav,{label:'에이전트 센터',icon:Cpu},{label:'플랫폼 운영',icon:Workflow},{label:'규정 및 안전',icon:ShieldCheck}].filter(n=>n.label.includes(query));
  useEffect(()=>{const key=e=>e.key==='Escape'&&close();window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
  return <div className="modal-backdrop command-backdrop" onMouseDown={close}><div className="command-palette" role="dialog" aria-modal="true" aria-label="빠른 이동" onMouseDown={e=>e.stopPropagation()}><div className="command-input"><Search size={18}/><input aria-label="메뉴, 프로젝트, 설계 버전 검색" autoFocus placeholder="메뉴, 프로젝트, 설계 버전 검색" value={query} onChange={e=>setQuery(e.target.value)}/><kbd>ESC</kbd></div><small>빠른 이동</small>{results.map(n=><button key={n.label} onClick={()=>{setActiveNav(n.label);close()}}><n.icon size={17}/><span>{n.label}</span><em>열기 ↵</em></button>)}</div></div>
}

function GenerateModal({ close, start }) {
  const [text, setText] = useState('4인승 도심형 전기차. 전장 4m 이하, 주행거리 400km 이상, 제조원가 3천만원 이하.');
  return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={e => e.stopPropagation()}>
    <div className="modal-head"><div><span><Sparkles size={16}/>AUTOFORGE AGENT</span><h2 id="new-design-title">어떤 차량을 설계할까요?</h2></div><button onClick={close} aria-label="새 설계 창 닫기"><X size={19}/></button></div>
    <label>설계 요구사항</label>
    <textarea aria-labelledby="new-design-title" value={text} onChange={e => setText(e.target.value)} autoFocus />
    <div className="chips"><button>+ 성능 목표</button><button>+ 패키징</button><button>+ 안전 규정</button><button>+ 제조 지역</button></div>
    <div className="modal-note"><ShieldCheck size={17}/><span>안전·제조 관련 결정은 승인 게이트를 거칩니다.</span></div>
    <div className="modal-actions"><button onClick={close}>취소</button><button className="primary" onClick={() => start(text)}><Sparkles size={16}/>12개 에이전트 시작</button></div>
  </div></div>
}

function NewProjectModal({close,create}){const[name,setName]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(false);const submit=async e=>{e.preventDefault();setBusy(true);try{await create({name,code});close()}finally{setBusy(false)}};return <div className="modal-backdrop" onMouseDown={close}><form className="modal project-modal" onSubmit={submit} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span><Layers3 size={16}/>PROJECT GOVERNANCE</span><h2>새 차량 프로젝트</h2></div><button type="button" onClick={close} aria-label="새 프로젝트 창 닫기"><X size={19}/></button></div><label>프로젝트 이름<input value={name} onChange={e=>setName(e.target.value)} placeholder="예: Compact Delivery EV" required/></label><label>프로젝트 코드<input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="예: DELIVERY V01" required/></label><div className="modal-note"><ShieldCheck size={17}/><span>새 프로젝트는 현재 조직에 격리되며 독립된 요구사항·설계·증거 계보를 가집니다.</span></div><div className="modal-actions"><button type="button" onClick={close}>취소</button><button className="primary" disabled={busy}><Plus size={16}/>{busy?'생성 중…':'프로젝트 생성'}</button></div></form></div>}

function LoginScreen({ onLogin }) {
  const [email,setEmail]=useState('lead@autoforge.local'),[password,setPassword]=useState('autoforge-demo'),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{const result=await api.login(email,password);onLogin(result.user)}catch{setError('이메일 또는 비밀번호를 확인하세요.')}finally{setBusy(false)}};
  return <div className="login-screen"><div className="login-visual"><BrandMark/><span>AUTONOMOUS VEHICLE ENGINEERING OS</span><h1>아이디어를<br/>검증된 자동차로.</h1><p>설계, 시뮬레이션, 로봇 시험을 하나의 폐쇄 루프로 연결합니다.</p><div className="login-grid"/></div><form className="login-card" onSubmit={submit}><div className="brand"><BrandMark/><div><strong>AUTOFORGE</strong><span>ROBOTICS</span></div></div><span className="login-label">SECURE WORKSPACE</span><h2>워크스페이스 로그인</h2><p>조직 계정으로 엔지니어링 환경에 접속하세요.</p><label>이메일<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>비밀번호<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="login-error"><AlertTriangle size={14}/>{error}</div>}<button className="primary" disabled={busy}>{busy?'인증 중…':'안전하게 로그인'}</button><small><ShieldCheck size={13}/>세션과 모든 변경은 감사 로그에 기록됩니다.</small></form></div>
}

function App() {
  const [authState,setAuthState]=useState('checking');
  const [compact, setCompact] = useState(false);
  const [activeNav, setActiveNav] = useState('프로젝트 스튜디오');
  const [projects,setProjects]=useState([]),[project,setProject]=useState(null),[projectGraph,setProjectGraph]=useState(null),[agentItems,setAgentItems]=useState([]),[projectModal,setProjectModal]=useState(false);
  const [modal, setModal] = useState(false);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState('');
  const [command, setCommand] = useState(false);
  useEffect(() => { const fn = () => setProjectModal(true); window.addEventListener('newproject', fn); return () => window.removeEventListener('newproject', fn); }, []);
  useEffect(()=>{api.health().then(async h=>{if(!h.authRequired)return setAuthState('ready');try{await api.me();setAuthState('ready')}catch{localStorage.removeItem('autoforge_token');setAuthState('login')}}).catch(()=>setAuthState('ready'))},[]);
  useEffect(()=>{if(authState!=='ready')return;Promise.all([api.projects(),api.agents()]).then(([p,a])=>{setProjects(p);setAgentItems(a);setProject(current=>current&&p.some(x=>x.id===current.id)?current:p[0]||null)}).catch(()=>{})},[authState]);
  useEffect(()=>{if(!project)return setProjectGraph(null);api.graph(project.id).then(setProjectGraph).catch(()=>setProjectGraph(null))},[project]);
  useEffect(() => { const fn = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCommand(true); } }; window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn); }, []);
  const notify = message => { setToast(message); setTimeout(() => setToast(''), 3500); };
  const moduleScreen = () => {
    const projectId=project?.id;
    if (activeNav === '목표 및 루프') return <MissionControl notify={notify} projectId={projectId}/>;
    if (activeNav === '규정 및 안전') return <GovernanceCenter notify={notify} projectId={projectId}/>;
    if (activeNav === '에이전트 센터') return <AgentCenter notify={notify}/>;
    if (activeNav === '플랫폼 운영') return <PlatformOps notify={notify}/>;
    if (activeNav === '콘셉트 랩') return <ConceptLab notify={notify} projectId={projectId}/>;
    if (activeNav === '차량 아키텍처') return <ArchitectureDesigner notify={notify} projectId={projectId}/>;
    if (activeNav === '시뮬레이션 허브') return <SimulationHub notify={notify} projectId={projectId}/>;
    if (activeNav === '최적화 센터') return <OptimizationCenter notify={notify} projectId={projectId}/>;
    if (activeNav === '로봇 랩') return <RobotLab notify={notify} projectId={projectId}/>;
    if (activeNav === '디지털 트윈') return <TwinDashboard notify={notify} projectId={projectId}/>;
    if (activeNav === 'BOM 및 원가') return <BOMDashboard notify={notify} projectId={projectId}/>;
    return <ModuleOverview name={activeNav} notify={notify}/>;
  };
  const start = async text => {if(!project)return notify('먼저 프로젝트를 생성하세요');setModal(false);setRunning(true);try{const run=await api.startRun(text,project.id);notify(`설계 루프 ${run.id.slice(0,8)} 시작 · ${project.code}`);let close=()=>{};close=api.subscribeRun(run.id,(event,type)=>{if(type==='job'&&event.type==='job.completed')setToast(`${event.type.replace('job.','')} · 엔지니어링 작업 완료`);if(type==='run'&&['complete','failed','blocked','needs_review'].includes(event.status)){setRunning(false);api.graph(project.id).then(setProjectGraph);notify(event.status==='complete'?'자율 설계 루프가 모든 검증 단계를 완료했습니다':event.status==='needs_review'?'최적화 정체 · 전문가 검토로 이관했습니다':`설계 루프 ${event.status}`);close();}})}catch{setRunning(false);notify('설계 루프 시작 조건과 API 서버를 확인하세요')}};
  const createProject=async body=>{try{const created=await api.createProject(body);setProjects(x=>[...x,created]);setProject(created);setActiveNav('프로젝트 스튜디오');notify(`${created.code} 프로젝트를 생성했습니다`)}catch(e){notify(`프로젝트 생성 실패 · ${e.message}`);throw e}};
  if(authState==='checking')return <div className="auth-loading"><BrandMark/><span>보안 워크스페이스 확인 중</span></div>;
  if(authState==='login')return <LoginScreen onLogin={()=>setAuthState('ready')}/>;
  return <div className="app">
    <Sidebar compact={compact} onCompact={() => setCompact(!compact)} activeNav={activeNav} setActiveNav={setActiveNav}/>
    <main className="workspace">
      <Topbar projects={projects} project={project} setProject={setProject} onSearch={() => setCommand(true)}/>
      <div className="content">
        <div className="page-intro"><div><span>PROJECT STUDIO</span><h2>{activeNav}</h2></div><div className="updated"><Clock3 size={14}/>마지막 저장 2분 전</div></div>
        {activeNav === '프로젝트 스튜디오' ? <><Hero project={project} design={projectGraph?.designs?.at(-1)} onGenerate={() => setModal(true)}/><div className="lower-grid"><AgentPanel running={running} agentItems={agentItems}/><CandidatePanel designs={projectGraph?.designs||[]}/></div><BottomBar notify={notify} graph={projectGraph} projectId={project?.id}/></> : moduleScreen()}
      </div>
    </main>
    {modal && <GenerateModal close={() => setModal(false)} start={start}/>}
    {projectModal&&<NewProjectModal close={()=>setProjectModal(false)} create={createProject}/>}
    {command && <CommandPalette close={() => setCommand(false)} setActiveNav={setActiveNav}/>}
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />);
