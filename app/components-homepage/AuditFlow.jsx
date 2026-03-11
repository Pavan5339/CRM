'use client';

import { useState, useCallback } from "react";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body,#root{height:100%;font-family:'Sora',sans-serif;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:#f1f5f9;}
  ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}
  input[type=date]::-webkit-calendar-picker-indicator{opacity:0.5;cursor:pointer;}
  `}</style>
);

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg:      "#f8fafc",
  bg2:     "#f1f5f9",
  surface: "#ffffff",
  surface2:"#f8fafc",
  border:  "#e2e8f0",
  border2: "#cbd5e1",
  teal:    "#0d9488",
  teal2:   "#0f766e",
  tealBg:  "#f0fdfa",
  tealBorder:"#99f6e4",
  amber:   "#d97706",
  amberBg: "#fffbeb",
  amberBorder:"#fde68a",
  red:     "#dc2626",
  redBg:   "#fef2f2",
  redBorder:"#fecaca",
  blue:    "#2563eb",
  blueBg:  "#eff6ff",
  blueBorder:"#bfdbfe",
  green:   "#16a34a",
  greenBg: "#f0fdf4",
  greenBorder:"#bbf7d0",
  purple:  "#7c3aed",
  text1:   "#0f172a",
  text2:   "#475569",
  text3:   "#94a3b8",
  sidebar: "#ffffff",
  sidebarBorder:"#e2e8f0",
  sidebarText:"#64748b",
  sidebarActive:"#f0fdfa",
  sidebarActiveText:"#0d9488",
  sidebarSectionLabel:"#94a3b8",
  sidebarUserBg:"#f8fafc",
};

const AVATAR_COLORS = ['#2563eb','#0d9488','#d97706','#dc2626','#7c3aed','#16a34a','#db2777','#0891b2','#ea580c','#4338ca'];
const MONO = "'JetBrains Mono', monospace";

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const INIT_MEMBERS = [
  {id:1,name:'Anil Mehta',role:'Admin',email:'anil.mehta@lixil.com',initials:'AM'},
  {id:2,name:'Priya Sharma',role:'Auditor',email:'priya.sharma@lixil.com',initials:'PS'},
  {id:3,name:'Rajan Verma',role:'Auditor',email:'rajan.verma@lixil.com',initials:'RV'},
  {id:4,name:'Sneha Gupta',role:'Reviewer',email:'sneha.gupta@lixil.com',initials:'SG'},
  {id:5,name:'Deepak Joshi',role:'Auditor',email:'deepak.joshi@lixil.com',initials:'DJ'},
  {id:6,name:'Kavita Singh',role:'Auditor',email:'kavita.singh@lixil.com',initials:'KS'},
  {id:7,name:'Mohit Agarwal',role:'Reviewer',email:'mohit.agarwal@lixil.com',initials:'MA'},
  {id:8,name:'Neha Patel',role:'Auditor',email:'neha.patel@lixil.com',initials:'NP'},
  {id:9,name:'Rahul Tiwari',role:'Auditor',email:'rahul.tiwari@lixil.com',initials:'RT'},
  {id:10,name:'Sunita Rao',role:'Reviewer',email:'sunita.rao@lixil.com',initials:'SR'},
];

const mkStep = (id,step,status,aqc,risk,assignee,due,obs='',docs=[],comments=[]) =>
  ({id,step,status,aqc,risk,assignee,due,obs,docs,comments});

const INIT_PROJECTS = [
  {
    id:1,name:'HR Audit — FY2025',unit:'Lixil Window Systems Private Limited',
    type:'hr',icon:'👤',status:'active',start:'2025-01-15',end:'2025-03-31',lead:1,
    desc:'Comprehensive audit of HR policies, recruitment, payroll, and compliance.',
    procedures:[
      {id:'p1',name:'Policies & Procedures',desc:'Review whether HR policies are documented, approved by management',steps:[
        mkStep('1.1','Obtain copy of organization chart and review for appropriate delegation and segregation of duties.','done','pass','medium',2,'2025-02-10','Organization chart obtained. Delegation matrix reviewed — minor gaps in segregation noted.',[],[{author:'Priya Sharma',initials:'PS',time:'2 days ago',text:'Chart was last updated in Dec 2024. Will request latest version.'}]),
        mkStep('1.2','Verify whether POSH Internal Committee Constitution (ICC) is constituted as per law and meetings/complaints records maintained.','done','pass','high',3,'2025-02-12','ICC constituted. 4 meetings held in FY2024. Minutes available.',[],[]),
        mkStep('1.3','Check whether whistleblower / grievance redressal mechanism exists and complaints are tracked and resolved.','progress','review','high',2,'2025-02-20','',[],[]),
        mkStep('1.4','Verify whether HR policies are approved by the Board / Senior Management and documented with version control.','done','pass','medium',4,'2025-02-15','Policies board-approved. Version control maintained.',[],[]),
        mkStep('1.5','Formal induction process, code of conduct/ethics, Consequence management, implementation and communication not defined.','todo','pending','high',null,'2025-02-28','',[],[]),
        mkStep('1.6','Obtain copy of leave, recruitment, payroll, POSH & grievance handling policies and their periodic review process.','done','pass','low',5,'2025-02-10','All policies obtained and reviewed.',[],[]),
        mkStep('1.7','Verify that HR policies are properly communicated to employees, acknowledged through signed declarations, and periodically reviewed.','progress','pending','medium',6,'2025-02-25','',[],[]),
        mkStep('1.8','Assess whether implementation of policies is effective by testing sample transactions and comparing actual practice with documented procedures.','todo','pending','high',null,'2025-03-05','',[],[]),
      ]},
      {id:'p2',name:'Recruitment Process',desc:'Verify hiring is conducted against approved manpower plans',steps:[
        mkStep('2.1','Check whether Manpower budget is approved and monitoring for the same.','done','pass','medium',3,'2025-02-18','Budget approved by MD. Monthly tracking done.',[],[]),
        mkStep('2.2','Verify recruitment is based on an approved Manpower Requisition form.','done','pass','medium',2,'2025-02-18','MRF process followed for all roles.',[],[]),
        mkStep('2.3','Verify whether job description and job specification laid down to ensure no ambiguity.','progress','review','low',7,'2025-02-22','',[],[]),
        mkStep('2.4','Check whether referral schemes in existence and compliance to the same.','todo','pending','low',null,'2025-03-01','',[],[]),
        mkStep('2.5','Confirm hiring is within approved salary band and deviations are authorized.','done','pass','high',4,'2025-02-20','3 deviations found — all authorized by HR Head.',[],[]),
        mkStep('2.6','Review compliance with defined interview process and documentation.','progress','pending','medium',8,'2025-02-28','',[],[]),
        mkStep('2.7','Verify whether reference checks of candidates done.','todo','pending','medium',null,'2025-03-05','',[],[]),
        mkStep('2.8','Verify whether offer letters and appointment letters are issued and acknowledged by employees.','done','pass','low',9,'2025-02-15','All sampled employees have signed copies on file.',[],[]),
        mkStep('2.9','Verify whether joining documents are obtained (PAN, Aadhar, Bank details, etc.)','done','pass','medium',5,'2025-02-15','Documents collected for all joiners tested.',[],[]),
        mkStep('2.10','Check whether probation confirmation process is defined and documented.','progress','review','medium',6,'2025-03-01','',[],[]),
        mkStep('2.11','Verify payments to recruitment agencies and whether in accordance with contract.','todo','pending','high',null,'2025-03-10','',[],[]),
      ]},
      {id:'p3',name:'Payroll & Compensation',desc:'Review payroll processes, salary revisions, statutory compliance',steps:[
        mkStep('3.1','Match actual salary payments (bank transfer) with approved payroll output file and investigate discrepancies.','progress','pending','high',10,'2025-03-05','',[],[]),
        mkStep('3.2','Verify salary revision approvals and increments authorized.','todo','pending','high',null,'2025-03-10','',[],[]),
        mkStep('3.3','Check statutory deductions (PF, ESI, TDS) are correctly computed and deposited on time.','todo','pending','high',null,'2025-03-12','',[],[]),
        mkStep('3.4','Verify leave encashment calculations and approvals.','todo','pending','medium',null,'2025-03-15','',[],[]),
      ]},
    ]
  },
  {
    id:2,name:'Finance & Accounts — FY2025',unit:'Lixil Window Systems Pvt Ltd',
    type:'fin',icon:'💰',status:'active',start:'2025-01-20',end:'2025-04-15',lead:4,
    desc:'Review of financial controls, AP/AR, bank reconciliations, and expense management.',
    procedures:[
      {id:'f1',name:'Accounts Payable',desc:'Review vendor payments and invoice processing',steps:[
        mkStep('F1.1','Review vendor invoice processing and 3-way match (PO, GRN, Invoice).','done','pass','high',7,'2025-02-20','Process followed for all tested invoices.',[],[]),
        mkStep('F1.2','Verify vendor master data changes are authorized.','progress','review','high',4,'2025-02-25','',[],[]),
      ]},
    ]
  },
  {
    id:3,name:'Inventory Management — Q1 2025',unit:'Lixil Manufacturing Unit',
    type:'inv',icon:'📦',status:'review',start:'2025-02-01',end:'2025-04-30',lead:7,
    desc:'Physical verification, stock reconciliation and warehouse controls.',
    procedures:[
      {id:'i1',name:'Stock Verification',desc:'Physical count and reconciliation',steps:[
        mkStep('I1.1','Conduct physical stock count and reconcile with system records.','done','pass','high',8,'2025-03-01','Physical count matches within 0.5% variance.',[],[]),
        mkStep('I1.2','Review slow-moving and obsolete inventory provisions.','progress','pending','medium',9,'2025-03-10','',[],[]),
      ]},
    ]
  },
  {
    id:4,name:'Billing & Collections — FY2025',unit:'Lixil Sales Division',
    type:'bil',icon:'🧾',status:'active',start:'2025-02-10',end:'2025-05-15',lead:10,
    desc:'Revenue recognition, customer billing accuracy, and collections monitoring.',
    procedures:[
      {id:'b1',name:'Billing Accuracy',desc:'Verify billing matches contracts and approvals',steps:[
        mkStep('B1.1','Test sample customer invoices against contracts and price lists.','todo','pending','high',null,'2025-03-15','',[],[]),
        mkStep('B1.2','Verify credit notes are properly authorized.','todo','pending','medium',null,'2025-03-20','',[],[]),
      ]},
    ]
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function calcProgress(p) {
  const all = p.procedures.flatMap(pr=>pr.steps);
  if(!all.length) return 0;
  return Math.round(all.filter(s=>s.status==='done').length/all.length*100);
}
function avatarColor(id){ return AVATAR_COLORS[(id-1)%AVATAR_COLORS.length]; }
function fileIcon(name){ const e=name.split('.').pop().toLowerCase(); return {pdf:'📄',xlsx:'📊',xls:'📊',docx:'📝',doc:'📝',jpg:'🖼',jpeg:'🖼',png:'🖼',ppt:'📋',pptx:'📋'}[e]||'📎'; }

// ─── BADGE COMPONENTS ─────────────────────────────────────────────────────────
const STATUS_MAP = {
  todo:     {label:'Not Started', bg:C.bg2,       color:C.text3,  border:C.border,      dot:'#94a3b8'},
  progress: {label:'In Progress', bg:C.amberBg,   color:C.amber,  border:C.amberBorder, dot:C.amber},
  done:     {label:'Done',        bg:C.greenBg,   color:C.green,  border:C.greenBorder, dot:C.green},
};
const AQC_MAP = {
  pending: {label:'— Pending', bg:C.bg2,     color:C.text3,  border:C.border},
  pass:    {label:'✓ Pass',    bg:C.greenBg, color:C.green,  border:C.greenBorder},
  review:  {label:'⚠ Review',  bg:C.amberBg, color:C.amber,  border:C.amberBorder},
  fail:    {label:'✕ Fail',    bg:C.redBg,   color:C.red,    border:C.redBorder},
};
const RISK_MAP = {
  high:   {label:'▲ High', bg:C.redBg,   color:C.red,   border:C.redBorder},
  medium: {label:'◆ Med',  bg:C.amberBg, color:C.amber, border:C.amberBorder},
  low:    {label:'▽ Low',  bg:C.tealBg,  color:C.teal,  border:C.tealBorder},
};
const TYPE_COLORS = {
  hr:  {accent:C.teal,  bg:C.tealBg,  border:C.tealBorder},
  fin: {accent:C.amber, bg:C.amberBg, border:C.amberBorder},
  inv: {accent:C.blue,  bg:C.blueBg,  border:C.blueBorder},
  bil: {accent:C.red,   bg:C.redBg,   border:C.redBorder},
  it:  {accent:C.purple,bg:'#f5f3ff',border:'#ddd6fe'},
  ops: {accent:C.text2, bg:C.bg2,     border:C.border},
};

const Badge = ({map,val,small}) => {
  const m = map[val]||map[Object.keys(map)[0]];
  return <span style={{display:'inline-flex',alignItems:'center',padding:small?'2px 7px':'3px 9px',borderRadius:20,fontSize:small?10:11,fontWeight:600,fontFamily:MONO,background:m.bg,color:m.color,border:`1px solid ${m.border}`,whiteSpace:'nowrap'}}>{m.label}</span>;
};

const Avatar = ({member,size=28}) => (
  <div title={member.name} style={{width:size,height:size,borderRadius:'50%',background:avatarColor(member.id),display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.38,fontWeight:700,color:'#fff',flexShrink:0}}>{member.initials}</div>
);

const CardSelect = ({options,val,onSelect,mapObj,cols=3}) => (
  <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:7}}>
    {options.map(k=>{
      const m=mapObj[k];
      const sel=val===k;
      return (
        <button key={k} onClick={()=>onSelect(k)} style={{
          padding:'9px 8px', borderRadius:9, fontSize:12, fontWeight:600,
          fontFamily:MONO, cursor:'pointer', textAlign:'center',
          border: sel ? `2px solid ${m.border}` : `1.5px solid ${C.border}`,
          color: sel ? m.color : C.text3,
          background: sel ? m.bg : '#fff',
          boxShadow: sel ? `0 2px 8px ${m.border}55` : 'none',
          transform: sel ? 'translateY(-1px)' : 'none',
          transition:'all .18s'
        }}>
          {m.label}
        </button>
      );
    })}
  </div>
);

const Btn = ({children,onClick,primary,small,style={}}) => (
  <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:6,padding:small?'6px 12px':'9px 16px',borderRadius:8,fontSize:small?12:13,fontWeight:600,cursor:'pointer',border:primary?'none':`1px solid ${C.border2}`,background:primary?C.teal:'transparent',color:primary?'#fff':C.text2,fontFamily:'Sora,sans-serif',transition:'all .15s',...style}}>{children}</button>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
const TOAST_ICONS = {success:'✅',error:'❌',info:'ℹ️'};
function useToast(){
  const [toasts,setToasts] = useState([]);
  const show = useCallback((type,msg)=>{
    const id = Date.now();
    setToasts(t=>[...t,{id,type,msg}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200);
  },[]);
  return {toasts,show};
}
const ToastContainer = ({toasts}) => (
  <div style={{position:'fixed',bottom:24,right:24,zIndex:999,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none'}}>
    {toasts.map(t=>(
      <div key={t.id} style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:10,padding:'11px 16px',fontSize:13,color:C.text1,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 24px rgba(0,0,0,0.1)',maxWidth:320,animation:'slideUp .3s ease'}}>
        <span>{TOAST_ICONS[t.type]}</span><span>{t.msg}</span>
      </div>
    ))}
    <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
  </div>
);

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {section:'Workspace',items:[
    {id:'dashboard',icon:'⬡',label:'Dashboard'},
    {id:'my-tasks',icon:'◎',label:'My Tasks'},
  ]},
  {section:'Reports',items:[
    {id:'export-excel',icon:'⬒',label:'Export Excel',action:true},
    {id:'export-pdf',icon:'⬓',label:'Export PDF',action:true},
  ]},
  {section:'Admin',items:[
    {id:'team',icon:'◈',label:'Team Members'},
  ]},
];

const Sidebar = ({activeView,setView,projectCount,onExcelExport,onPdfExport}) => {
  const handleNav=(id)=>{
    if(id==='export-excel'){onExcelExport();return;}
    if(id==='export-pdf'){onPdfExport();return;}
    setView(id);
  };
  return (
    <aside style={{width:240,minWidth:240,background:C.sidebar,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',boxShadow:'1px 0 4px rgba(0,0,0,0.04)'}}>
      {/* Logo */}
      <div style={{padding:'22px 20px 18px',borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,background:'linear-gradient(135deg,#0d9488,#0f766e)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#fff',fontFamily:MONO}}>AF</div>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:C.text1,letterSpacing:'-0.3px'}}>AuditFlow</div>
            <div style={{fontSize:10,color:C.text3,fontFamily:MONO,letterSpacing:'1px',textTransform:'uppercase',marginTop:2}}>Lixil Internal Audit</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{flex:1,padding:'14px 10px',overflowY:'auto'}}>
        {NAV_ITEMS.map(section=>(
          <div key={section.section}>
            <div style={{fontSize:10,fontFamily:MONO,letterSpacing:'1.5px',textTransform:'uppercase',color:C.text3,padding:'12px 10px 6px',fontWeight:600}}>{section.section}</div>
            {section.items.map(item=>{
              const isActive = activeView===item.id;
              return (
                <div key={item.id} onClick={()=>handleNav(item.id)}
                  onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=C.bg2;}}
                  onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background='transparent';}}
                  style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:8,cursor:'pointer',color:isActive?C.teal:C.text2,fontSize:13.5,fontWeight:isActive?600:500,background:isActive?C.tealBg:'transparent',border:isActive?`1px solid ${C.tealBorder}`:'1px solid transparent',marginBottom:2,transition:'all .15s'}}>
                  <span style={{width:16,textAlign:'center',fontSize:13,color:isActive?C.teal:C.text3}}>{item.icon}</span>
                  {item.label}
                  {item.id==='dashboard'&&<span style={{marginLeft:'auto',background:C.teal,color:'#fff',fontSize:10,fontWeight:700,fontFamily:MONO,padding:'2px 6px',borderRadius:10}}>{projectCount}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      {/* User */}
      <div style={{padding:14,borderTop:`1px solid ${C.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:C.bg2,borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#2563eb,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff'}}>AM</div>
          <div>
            <div style={{fontSize:12.5,fontWeight:600,color:C.text1}}>Admin User</div>
            <div style={{fontSize:10.5,color:C.teal,fontFamily:MONO}}>● Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({icon,value,label,change,changeType,accent}) => (
  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:20,position:'relative',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
    <div style={{position:'absolute',top:-10,right:-10,width:60,height:60,borderRadius:'50%',background:accent,opacity:0.08}}/>
    <div style={{fontSize:22,marginBottom:10}}>{icon}</div>
    <div style={{fontSize:30,fontWeight:800,fontFamily:MONO,color:C.text1,lineHeight:1}}>{value}</div>
    <div style={{fontSize:12,color:C.text2,marginTop:6,fontWeight:500}}>{label}</div>
    <div style={{fontSize:11,fontFamily:MONO,marginTop:7,color:changeType==='up'?C.green:C.amber}}>{change}</div>
  </div>
);

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
const ProjectCard = ({project,members,onClick}) => {
  const prog = calcProgress(project);
  const tc = TYPE_COLORS[project.type]||TYPE_COLORS.hr;
  const allSteps = project.procedures.flatMap(pr=>pr.steps);
  const assigneeIds = [...new Set(allSteps.map(s=>s.assignee).filter(Boolean))].slice(0,4);
  const statusBadge = {active:{bg:C.tealBg,color:C.teal,border:C.tealBorder,label:'Active'},review:{bg:C.amberBg,color:C.amber,border:C.amberBorder,label:'Under Review'},closed:{bg:C.bg2,color:C.text3,border:C.border,label:'Closed'}};
  const sb = statusBadge[project.status]||statusBadge.active;
  return (
    <div onClick={onClick} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:22,cursor:'pointer',position:'relative',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.04)',transition:'all .2s'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${tc.accent},${tc.accent}aa)`,borderRadius:'14px 14px 0 0'}}/>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
        <div style={{width:42,height:42,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,background:tc.bg,border:`1px solid ${tc.border}`}}>{project.icon}</div>
        <span style={{fontSize:10.5,fontFamily:MONO,padding:'4px 10px',borderRadius:20,fontWeight:600,background:sb.bg,color:sb.color,border:`1px solid ${sb.border}`}}>{sb.label}</span>
      </div>
      <div style={{fontSize:15,fontWeight:700,color:C.text1,marginBottom:5}}>{project.name}</div>
      <div style={{fontSize:12.5,color:C.text2,lineHeight:1.5}}>{project.desc}</div>
      <div style={{marginTop:16,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
          <div style={{flex:1,height:5,background:C.bg2,borderRadius:3,overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:3,background:`linear-gradient(90deg,${tc.accent},${tc.accent}cc)`,width:`${prog}%`,transition:'width .5s ease'}}/>
          </div>
          <span style={{fontSize:12,fontFamily:MONO,fontWeight:600,color:C.text2,minWidth:32,textAlign:'right'}}>{prog}%</span>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex'}}>
            {assigneeIds.map((mid,i)=>{const m=members.find(t=>t.id===mid);return m?<div key={mid} title={m.name} style={{width:24,height:24,borderRadius:'50%',background:avatarColor(m.id),border:`2px solid ${C.surface}`,marginLeft:i?-6:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff'}}>{m.initials}</div>:null;})}
          </div>
          <span style={{fontSize:11,color:C.text3,fontFamily:MONO}}>{allSteps.filter(s=>s.status==='done').length}/{allSteps.length} steps</span>
        </div>
      </div>
    </div>
  );
};

// ─── TABLE VIEW ───────────────────────────────────────────────────────────────
const TableView = ({project,members,onOpenTask,onAddStep,onDeleteStep,onRenameProcedure}) => {
  const [editingProc,setEditingProc] = useState(null);   // null | {pi, field}
  const [editingName,setEditingName] = useState('');
  const [editingDesc,setEditingDesc] = useState('');
  const th = {background:C.bg2,padding:'10px 14px',textAlign:'left',fontSize:10.5,fontWeight:600,fontFamily:MONO,letterSpacing:'0.5px',textTransform:'uppercase',color:C.text3,borderBottom:`2px solid ${C.border2}`,whiteSpace:'nowrap',position:'sticky',top:0,zIndex:10};
  const td = {padding:'11px 14px',borderBottom:`1px solid ${C.border}`,verticalAlign:'middle',fontSize:13};

  const startEditName=(pi,name)=>{setEditingProc({pi,field:'name'});setEditingName(name);};
  const startEditDesc=(pi,desc)=>{setEditingProc({pi,field:'desc'});setEditingDesc(desc);};
  const commitName=(pi)=>{if(editingName.trim())onRenameProcedure(pi,{name:editingName.trim()});setEditingProc(null);};
  const commitDesc=(pi)=>{onRenameProcedure(pi,{desc:editingDesc});setEditingProc(null);};

  const editingField=(pi,field)=>editingProc&&editingProc.pi===pi&&editingProc.field===field;

  const inlineInput=(val,onChange,onCommit,onCancel,bold=false)=>(
    <input autoFocus value={val} onChange={e=>onChange(e.target.value)}
      onBlur={onCommit} onKeyDown={e=>{if(e.key==='Enter')onCommit();if(e.key==='Escape')onCancel();}}
      style={{background:'#fff',border:`2px solid ${C.teal}`,borderRadius:7,padding:'3px 10px',
        fontSize:bold?13.5:12,fontWeight:bold?700:400,fontStyle:bold?'normal':'italic',
        color:C.text1,outline:'none',fontFamily:'Sora,sans-serif',minWidth:bold?200:160}}/>
  );

  return (
    <div style={{overflowX:'auto',flex:1}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr>
            {['Ref','Audit Step','Status','AQC','Risk','Assigned To','Due Date','Documents','Actions'].map(h=>(
              <th key={h} style={{...th,minWidth:h==='Audit Step'?280:h==='Documents'?130:undefined}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {project.procedures.map((proc,pi)=>{
            const done=proc.steps.filter(s=>s.status==='done').length;
            const pct = proc.steps.length ? Math.round(done/proc.steps.length*100) : 0;
            return [
              <tr key={proc.id} style={{background:'linear-gradient(90deg,#f0fdfa,#f8fafc)'}}>
                <td colSpan={9} style={{...td,borderLeft:`4px solid ${C.teal}`,padding:'10px 14px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                    <span style={{fontSize:13,color:C.teal,fontWeight:700,fontFamily:MONO,background:C.tealBg,border:`1px solid ${C.tealBorder}`,borderRadius:6,padding:'2px 8px',flexShrink:0}}>§{pi+1}</span>

                    {/* Editable Name */}
                    {editingField(pi,'name')
                      ? inlineInput(editingName,setEditingName,()=>commitName(pi),()=>setEditingProc(null),true)
                      : <span onClick={()=>startEditName(pi,proc.name)} title="Click to edit name"
                          style={{fontSize:13.5,fontWeight:700,color:C.text1,cursor:'text',padding:'3px 7px',borderRadius:6,border:'1px solid transparent',transition:'all .15s',display:'flex',alignItems:'center',gap:5}}
                          onMouseEnter={e=>{e.currentTarget.style.border=`1px dashed ${C.teal}`;e.currentTarget.style.background='#fff';}}
                          onMouseLeave={e=>{e.currentTarget.style.border='1px solid transparent';e.currentTarget.style.background='transparent';}}>
                          {proc.name}<span style={{fontSize:10,color:C.text3}}>✏</span>
                        </span>
                    }

                    <span style={{color:C.text3,fontSize:12}}>—</span>

                    {/* Editable Description */}
                    {editingField(pi,'desc')
                      ? inlineInput(editingDesc,setEditingDesc,()=>commitDesc(pi),()=>setEditingProc(null),false)
                      : <span onClick={()=>startEditDesc(pi,proc.desc||'')} title="Click to edit description"
                          style={{fontSize:11.5,color:C.text3,fontStyle:'italic',cursor:'text',padding:'3px 7px',borderRadius:6,border:'1px solid transparent',transition:'all .15s',display:'flex',alignItems:'center',gap:5}}
                          onMouseEnter={e=>{e.currentTarget.style.border=`1px dashed ${C.border2}`;e.currentTarget.style.background='#fff';e.currentTarget.style.color=C.text2;}}
                          onMouseLeave={e=>{e.currentTarget.style.border='1px solid transparent';e.currentTarget.style.background='transparent';e.currentTarget.style.color=C.text3;}}>
                          {proc.desc||<span style={{color:C.border2}}>Add description…</span>}<span style={{fontSize:10,opacity:.6}}>✏</span>
                        </span>
                    }

                    <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:60,height:4,background:C.border2,borderRadius:2,overflow:'hidden'}}>
                          <div style={{height:'100%',background:C.teal,width:`${pct}%`,borderRadius:2,transition:'width .4s'}}/>
                        </div>
                        <span style={{fontFamily:MONO,fontSize:10.5,color:C.teal,fontWeight:600}}>{done}/{proc.steps.length}</span>
                      </div>
                      <button onClick={()=>onAddStep(pi)} style={{background:C.teal,border:'none',color:'#fff',padding:'4px 12px',borderRadius:6,fontSize:11,cursor:'pointer',fontFamily:'Sora,sans-serif',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>＋ Step</button>
                    </div>
                  </div>
                </td>
              </tr>,
              ...proc.steps.map((s,si)=>{
                const m = s.assignee ? members.find(t=>t.id===s.assignee) : null;
                return (
                  <tr key={s.id} onClick={()=>onOpenTask(pi,si)} style={{cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background=C.bg2} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{...td,fontFamily:MONO,fontSize:11.5,color:C.text3,fontWeight:600}}>{s.id}</td>
                    <td style={{...td,color:C.text1,lineHeight:1.5,maxWidth:300}}>{s.step}</td>
                    <td style={td}><Badge map={STATUS_MAP} val={s.status}/></td>
                    <td style={td}><Badge map={AQC_MAP} val={s.aqc}/></td>
                    <td style={td}><Badge map={RISK_MAP} val={s.risk}/></td>
                    <td style={td}>
                      {m
                        ? <div style={{display:'flex',alignItems:'center',gap:7}}><Avatar member={m} size={26}/><span style={{fontSize:12,color:C.text2}}>{m.name}</span></div>
                        : <span style={{fontSize:12,color:C.text3}}>— Unassigned</span>}
                    </td>
                    <td style={{...td,fontFamily:MONO,fontSize:11.5,color:C.text3}}>{s.due||'—'}</td>
                    <td style={td}>
                      {s.docs.length
                        ? s.docs.map((d,i)=><span key={i} style={{display:'inline-flex',alignItems:'center',gap:3,background:C.blueBg,color:C.blue,border:`1px solid ${C.blueBorder}`,borderRadius:5,fontSize:10,padding:'2px 6px',fontFamily:MONO,marginRight:3}}>📎 {d.name.length>12?d.name.substring(0,12)+'…':d.name}</span>)
                        : <span style={{fontSize:12,color:C.text3}}>—</span>}
                    </td>
                    <td style={td} onClick={e=>e.stopPropagation()}>
                      <div style={{display:'flex',gap:5}}>
                        <button onClick={()=>onOpenTask(pi,si)} title="Edit" style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:13,color:C.text3,display:'flex',alignItems:'center',justifyContent:'center'}}>✏</button>
                        <button onClick={()=>onDeleteStep(pi,si)} title="Delete" style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.redBorder}`,background:C.redBg,cursor:'pointer',fontSize:13,color:C.red,display:'flex',alignItems:'center',justifyContent:'center'}}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ];
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── KANBAN VIEW ──────────────────────────────────────────────────────────────
const KanbanView = ({project,members,onOpenTask}) => {
  const COLS = [
    {key:'todo',label:'Not Started',color:'#94a3b8'},
    {key:'progress',label:'In Progress',color:C.amber},
    {key:'done',label:'Done',color:C.green},
  ];
  const allSteps = project.procedures.flatMap((proc,pi)=>proc.steps.map((s,si)=>({...s,procName:proc.name,pi,si})));
  return (
    <div style={{display:'flex',gap:16,padding:'20px 24px',overflowX:'auto',flex:1,alignItems:'flex-start'}}>
      {COLS.map(col=>{
        const cards = allSteps.filter(s=>s.status===col.key);
        return (
          <div key={col.key} style={{minWidth:270,maxWidth:270,display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:'10px 10px 0 0',borderBottom:`2px solid ${col.color}`}}>
              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12.5,fontWeight:700,color:C.text1}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:col.color}}/>
                {col.label}
              </div>
              <span style={{fontFamily:MONO,fontSize:11,color:C.text3,background:C.bg2,padding:'2px 7px',borderRadius:10}}>{cards.length}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8,background:C.bg2,border:`1px solid ${C.border}`,borderTop:'none',borderRadius:'0 0 10px 10px',padding:10,minHeight:100}}>
              {cards.length ? cards.map(s=>{
                const m = s.assignee ? members.find(t=>t.id===s.assignee) : null;
                return (
                  <div key={s.id} onClick={()=>onOpenTask(s.pi,s.si)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:14,cursor:'pointer',transition:'all .2s',boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.teal} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <div style={{fontFamily:MONO,fontSize:10,color:C.text3,marginBottom:5}}>{s.procName} · {s.id}</div>
                    <div style={{fontSize:12.5,color:C.text1,lineHeight:1.4,marginBottom:10}}>{s.step.length>90?s.step.substring(0,90)+'…':s.step}</div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <Badge map={RISK_MAP} val={s.risk} small/>
                      {m ? <Avatar member={m} size={22}/> : <span style={{fontSize:11,color:C.text3}}>—</span>}
                    </div>
                  </div>
                );
              }) : <div style={{textAlign:'center',color:C.text3,fontSize:12,padding:20}}>No items</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── TASK DRAWER ──────────────────────────────────────────────────────────────
const TaskDrawer = ({open,task,procName,members,onClose,onSave}) => {
  const [form,setForm] = useState(null);
  const [commentText,setCommentText] = useState('');

  useState(()=>{if(task)setForm({...task,docs:[...(task.docs||[])],comments:[...(task.comments||[])]});},[task]);
  if(!open||!task) return null;
  const ft = form || task;
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const inputStyle = {background:'#fff',border:`1px solid ${C.border2}`,borderRadius:9,padding:'10px 14px',color:C.text1,fontSize:13.5,fontFamily:'Sora,sans-serif',outline:'none',width:'100%',transition:'border .2s'};
  const labelStyle = {fontSize:10.5,fontWeight:700,fontFamily:MONO,color:C.text3,textTransform:'uppercase',letterSpacing:'0.8px',display:'block',marginBottom:8};

  const handleSave = () => { onSave(ft); setForm(null); };
  const addComment = () => {
    if(!commentText.trim()) return;
    setForm(f=>({...f,comments:[...(f.comments||[]),{author:'Admin User',initials:'AM',time:'Just now',text:commentText.trim()}]}));
    setCommentText('');
  };

  // Assigned member preview
  const assignedMember = ft.assignee ? members.find(m=>m.id===ft.assignee) : null;

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.35)',zIndex:100,backdropFilter:'blur(3px)'}}/>
      <div style={{position:'fixed',right:0,top:0,bottom:0,width:580,background:C.bg,borderLeft:`1px solid ${C.border}`,zIndex:101,overflowY:'auto',display:'flex',flexDirection:'column',boxShadow:'-12px 0 50px rgba(0,0,0,0.12)'}}>

        {/* Header */}
        <div style={{padding:'22px 26px',borderBottom:`1px solid ${C.border}`,flexShrink:0,display:'flex',alignItems:'flex-start',gap:14,background:'#fff'}}>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
              <span style={{fontFamily:MONO,fontSize:11,color:'#fff',fontWeight:700,background:C.teal,padding:'3px 9px',borderRadius:20}}>{ft.id}</span>
              <span style={{fontFamily:MONO,fontSize:11,color:C.text3}}>{procName}</span>
            </div>
            <div style={{fontSize:16,fontWeight:700,color:C.text1,lineHeight:1.4}}>{ft.step}</div>
          </div>
          <button onClick={onClose} style={{width:33,height:33,borderRadius:9,border:`1px solid ${C.border}`,background:C.bg2,cursor:'pointer',color:C.text2,fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
        </div>

        {/* Body */}
        <div style={{padding:'22px 26px',flex:1,display:'flex',flexDirection:'column',gap:20,overflowY:'auto'}}>

          {/* Step Description */}
          <div style={{background:'#fff',borderRadius:12,border:`1px solid ${C.border}`,padding:'16px 18px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <label style={labelStyle}>Audit Step Description</label>
            <textarea value={ft.step} onChange={e=>set('step',e.target.value)} style={{...inputStyle,resize:'vertical',minHeight:72,lineHeight:1.6,border:`1px solid ${C.border}`}}/>
          </div>

          {/* STATUS + RISK block */}
          <div style={{background:'#fff',borderRadius:12,border:`1px solid ${C.border}`,padding:'18px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
              <div>
                <label style={labelStyle}>Status</label>
                <CardSelect options={['todo','progress','done']} val={ft.status} onSelect={v=>set('status',v)} mapObj={STATUS_MAP} cols={1}/>
              </div>
              <div>
                <label style={labelStyle}>Risk Rating</label>
                <CardSelect options={['high','medium','low']} val={ft.risk} onSelect={v=>set('risk',v)} mapObj={RISK_MAP} cols={1}/>
              </div>
            </div>

            <div style={{marginTop:18,paddingTop:18,borderTop:`1px solid ${C.border}`}}>
              <label style={labelStyle}>AQC — Audit Quality Check</label>
              <CardSelect options={['pending','pass','review','fail']} val={ft.aqc} onSelect={v=>set('aqc',v)} mapObj={AQC_MAP} cols={4}/>
            </div>

            {/* Assigned To + Due Date */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:18,paddingTop:18,borderTop:`1px solid ${C.border}`}}>
              <div>
                <label style={labelStyle}>Assigned To</label>
                {assignedMember && (
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,background:C.bg2,borderRadius:8,padding:'7px 10px',border:`1px solid ${C.border}`}}>
                    <div style={{width:24,height:24,borderRadius:'50%',background:avatarColor(assignedMember.id),display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff',flexShrink:0}}>{assignedMember.initials}</div>
                    <span style={{fontSize:12,fontWeight:600,color:C.text1}}>{assignedMember.name}</span>
                    <span style={{fontSize:10,color:C.text3,fontFamily:MONO,marginLeft:'auto'}}>{assignedMember.role}</span>
                  </div>
                )}
                <select value={ft.assignee||''} onChange={e=>set('assignee',parseInt(e.target.value)||null)} style={{...inputStyle,appearance:'none',cursor:'pointer',fontSize:13,padding:'9px 13px'}}>
                  <option value=''>— Unassigned —</option>
                  {members.map(m=><option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Due Date</label>
                <input type='date' value={ft.due||''} onChange={e=>set('due',e.target.value)} style={inputStyle}/>
                {ft.due && (
                  <div style={{marginTop:6,fontSize:11,color:C.text3,fontFamily:MONO,display:'flex',alignItems:'center',gap:5}}>
                    📅 {new Date(ft.due).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observations */}
          <div style={{background:'#fff',borderRadius:12,border:`1px solid ${C.border}`,padding:'16px 18px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <label style={labelStyle}>Observations / Findings</label>
            <textarea value={ft.obs||''} onChange={e=>set('obs',e.target.value)} placeholder='Enter your audit observations, findings, and notes here...' style={{...inputStyle,resize:'vertical',minHeight:100,lineHeight:1.6,border:`1px solid ${C.border}`}}/>
          </div>

          {/* Files */}
          <div style={{background:'#fff',borderRadius:12,border:`1px solid ${C.border}`,padding:'16px 18px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <label style={labelStyle}>Documents Required / Attached</label>
            <label style={{display:'block',border:`2px dashed ${C.tealBorder}`,borderRadius:10,padding:'20px',textAlign:'center',cursor:'pointer',transition:'all .2s',background:C.tealBg}} onMouseEnter={e=>{e.currentTarget.style.background=C.tealBg;e.currentTarget.style.borderColor=C.teal;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.tealBorder;}}>
              <div style={{width:40,height:40,borderRadius:10,background:'#fff',border:`1px solid ${C.tealBorder}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,margin:'0 auto 10px'}}>📎</div>
              <div style={{fontSize:13,color:C.teal,fontWeight:600}}>Click to attach documents</div>
              <div style={{fontSize:11.5,color:C.text3,marginTop:4}}>PDF, Excel, Word, Images supported</div>
              <input type='file' multiple style={{display:'none'}} onChange={e=>{
                const newDocs = Array.from(e.target.files).map(f=>({name:f.name,size:(f.size/1024).toFixed(1)+'KB'}));
                set('docs',[...ft.docs,...newDocs]); e.target.value='';
              }}/>
            </label>
            {ft.docs.length>0&&<div style={{marginTop:10,display:'flex',flexDirection:'column',gap:6}}>
              {ft.docs.map((d,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:9,padding:'9px 13px'}}>
                  <span style={{fontSize:16}}>{fileIcon(d.name)}</span>
                  <span style={{fontSize:12.5,color:C.text1,flex:1,fontWeight:500}}>{d.name}</span>
                  <span style={{fontSize:10.5,color:C.text3,fontFamily:MONO,background:C.bg2,padding:'2px 7px',borderRadius:5}}>{d.size}</span>
                  <span onClick={()=>set('docs',ft.docs.filter((_,j)=>j!==i))} style={{cursor:'pointer',color:C.red,fontSize:14,width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,background:C.redBg}}>✕</span>
                </div>
              ))}
            </div>}
          </div>

          {/* Comments */}
          <div style={{background:'#fff',borderRadius:12,border:`1px solid ${C.border}`,padding:'16px 18px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <label style={labelStyle}>Comments</label>
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:14}}>
              {(ft.comments||[]).length===0&&<div style={{fontSize:12.5,color:C.text3,padding:'12px 0',textAlign:'center',borderBottom:`1px dashed ${C.border}`}}>No comments yet. Be the first!</div>}
              {(ft.comments||[]).map((c,i)=>(
                <div key={i} style={{display:'flex',gap:10}}>
                  <div style={{width:30,height:30,borderRadius:'50%',background:AVATAR_COLORS[Math.abs((c.author||'').charCodeAt(0)-65)%AVATAR_COLORS.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0,marginTop:2}}>{c.initials}</div>
                  <div style={{flex:1,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                      <span style={{fontSize:12.5,fontWeight:700,color:C.text1}}>{c.author}</span>
                      <span style={{fontSize:10.5,color:C.text3,fontFamily:MONO}}>{c.time}</span>
                    </div>
                    <div style={{fontSize:13,color:C.text2,lineHeight:1.55}}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
              <textarea value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder='Add a comment...' rows={2} style={{...inputStyle,flex:1,resize:'none',border:`1px solid ${C.border}`}}/>
              <button onClick={addComment} style={{background:C.teal,color:'#fff',border:'none',padding:'10px 16px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Sora,sans-serif',flexShrink:0,boxShadow:`0 2px 8px ${C.teal}44`}}>↑ Send</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:'16px 26px',borderTop:`1px solid ${C.border}`,display:'flex',gap:10,flexShrink:0,background:'#fff'}}>
          <button onClick={handleSave} style={{flex:1,background:C.teal,color:'#fff',border:'none',padding:'11px 16px',borderRadius:9,fontSize:13.5,fontWeight:700,cursor:'pointer',fontFamily:'Sora,sans-serif',boxShadow:`0 3px 14px ${C.teal}44`,letterSpacing:'-0.2px'}}>✓ Save Changes</button>
          <button onClick={onClose} style={{background:'#fff',color:C.text2,border:`1px solid ${C.border2}`,padding:'11px 18px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Sora,sans-serif'}}>Cancel</button>
        </div>
      </div>
    </>
  );
};

// ─── NEW PROJECT MODAL ────────────────────────────────────────────────────────
const NewProjectModal = ({open,members,onClose,onCreate}) => {
  const [form,setForm] = useState({name:'',unit:'',type:'hr',status:'active',start:'',end:'',lead:'',desc:''});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const inputStyle={background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8,padding:'9px 13px',color:C.text1,fontSize:13.5,fontFamily:'Sora,sans-serif',outline:'none',width:'100%'};
  const labelStyle={fontSize:11,fontWeight:600,fontFamily:MONO,color:C.text3,textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:6};
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,width:540,maxHeight:'85vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
        <div style={{padding:'22px 24px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:18,fontWeight:700,color:C.text1}}>New Audit Project</div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:16,color:C.text2,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
        <div style={{padding:24,display:'flex',flexDirection:'column',gap:14}}>
          <div><label style={labelStyle}>Project Name</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder='e.g. HR Audit — Q1 2025' style={inputStyle}/></div>
          <div><label style={labelStyle}>Unit / Entity</label><input value={form.unit} onChange={e=>set('unit',e.target.value)} placeholder='e.g. Lixil Window Systems Private Limited' style={inputStyle}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div><label style={labelStyle}>Audit Type</label>
              <select value={form.type} onChange={e=>set('type',e.target.value)} style={{...inputStyle,appearance:'none',cursor:'pointer'}}>
                {[['hr','👤 Human Resources'],['fin','💰 Finance & Accounts'],['inv','📦 Inventory Management'],['bil','🧾 Billing & Collection'],['it','💻 IT & Systems'],['ops','⚙️ Operations']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e=>set('status',e.target.value)} style={{...inputStyle,appearance:'none',cursor:'pointer'}}>
                <option value='active'>Active</option><option value='review'>Under Review</option><option value='closed'>Closed</option>
              </select>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div><label style={labelStyle}>Start Date</label><input type='date' value={form.start} onChange={e=>set('start',e.target.value)} style={inputStyle}/></div>
            <div><label style={labelStyle}>End Date</label><input type='date' value={form.end} onChange={e=>set('end',e.target.value)} style={inputStyle}/></div>
          </div>
          <div><label style={labelStyle}>Lead Auditor</label>
            <select value={form.lead} onChange={e=>set('lead',e.target.value)} style={{...inputStyle,appearance:'none',cursor:'pointer'}}>
              <option value=''>— Select Lead —</option>
              {members.filter(m=>m.role==='Admin'||m.role==='Reviewer').map(m=><option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Description</label>
            <textarea value={form.desc} onChange={e=>set('desc',e.target.value)} placeholder='Brief description of audit scope...' rows={2} style={{...inputStyle,resize:'vertical',lineHeight:1.5}}/></div>
        </div>
        <div style={{padding:'0 24px 24px',display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{background:'transparent',color:C.text2,border:`1px solid ${C.border2}`,padding:'9px 16px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Sora,sans-serif'}}>Cancel</button>
          <button onClick={()=>onCreate(form)} style={{background:C.teal,color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Sora,sans-serif'}}>Create Project →</button>
        </div>
      </div>
    </div>
  );
};

// ─── ADD MEMBER MODAL ─────────────────────────────────────────────────────────
const AddMemberModal = ({open,onClose,onAdd}) => {
  const [form,setForm] = useState({name:'',role:'Auditor',email:''});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const inputStyle={background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8,padding:'9px 13px',color:C.text1,fontSize:13.5,fontFamily:'Sora,sans-serif',outline:'none',width:'100%'};
  const labelStyle={fontSize:11,fontWeight:600,fontFamily:MONO,color:C.text3,textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:6};
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,width:440,boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
        <div style={{padding:'22px 24px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:18,fontWeight:700,color:C.text1}}>Add Team Member</div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:16,color:C.text2}}>✕</button>
        </div>
        <div style={{padding:24,display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div><label style={labelStyle}>Full Name</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder='e.g. Priya Sharma' style={inputStyle}/></div>
            <div><label style={labelStyle}>Role</label>
              <select value={form.role} onChange={e=>set('role',e.target.value)} style={{...inputStyle,appearance:'none',cursor:'pointer'}}>
                <option>Admin</option><option>Auditor</option><option>Reviewer</option>
              </select>
            </div>
          </div>
          <div><label style={labelStyle}>Email</label><input type='email' value={form.email} onChange={e=>set('email',e.target.value)} placeholder='email@lixil.com' style={inputStyle}/></div>
        </div>
        <div style={{padding:'0 24px 24px',display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{background:'transparent',color:C.text2,border:`1px solid ${C.border2}`,padding:'9px 16px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Sora,sans-serif'}}>Cancel</button>
          <button onClick={()=>onAdd(form)} style={{background:C.teal,color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Sora,sans-serif'}}>Add Member</button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function AuditFlow() {
  const [view,setView] = useState('dashboard');
  const [projects,setProjects] = useState(INIT_PROJECTS);
  const [members,setMembers] = useState(INIT_MEMBERS);
  const [currentProjId,setCurrentProjId] = useState(null);
  const [activeTab,setActiveTab] = useState('table');
  const [drawerOpen,setDrawerOpen] = useState(false);
  const [drawerTask,setDrawerTask] = useState(null);
  const [drawerProcIdx,setDrawerProcIdx] = useState(null);
  const [drawerStepIdx,setDrawerStepIdx] = useState(null);
  const [newProjModal,setNewProjModal] = useState(false);
  const [addMemberModal,setAddMemberModal] = useState(false);
  const [search,setSearch] = useState('');
  const {toasts,show:showToast} = useToast();

  const currentProj = projects.find(p=>p.id===currentProjId);

  const openProject = (id) => { setCurrentProjId(id); setView('project'); setActiveTab('table'); };

  const openTask = (pi,si) => {
    const s = currentProj.procedures[pi].steps[si];
    setDrawerProcIdx(pi); setDrawerStepIdx(si);
    setDrawerTask({...s,docs:[...(s.docs||[])],comments:[...(s.comments||[])]});
    setDrawerOpen(true);
  };

  const saveTask = (updated) => {
    setProjects(ps=>ps.map(p=>{
      if(p.id!==currentProjId) return p;
      const procs = p.procedures.map((proc,pi)=>{
        if(pi!==drawerProcIdx) return proc;
        return {...proc,steps:proc.steps.map((s,si)=>si===drawerStepIdx?{...s,...updated}:s)};
      });
      return {...p,procedures:procs};
    }));
    setDrawerOpen(false);
    showToast('success','Task saved successfully');
  };

  const addStep = (pi) => {
    setProjects(ps=>ps.map(p=>{
      if(p.id!==currentProjId) return p;
      const proc = p.procedures[pi];
      const parts = (proc.steps.length ? proc.steps[proc.steps.length-1].id : pi+1+'.0').split('.');
      const newId = parts[0]+'.'+(parseInt(parts[1]||0)+1);
      const newStep = mkStep(newId,'New audit step — click to edit','todo','pending','medium',null,'','','','');
      const procs = p.procedures.map((pr,i)=>i===pi?{...pr,steps:[...pr.steps,{...newStep,docs:[],comments:[]}]}:pr);
      return {...p,procedures:procs};
    }));
    showToast('info','New step added — click to edit');
  };

  const deleteStep = (pi,si) => {
    if(!window.confirm('Delete this audit step?')) return;
    setProjects(ps=>ps.map(p=>{
      if(p.id!==currentProjId) return p;
      const procs = p.procedures.map((proc,i)=>i===pi?{...proc,steps:proc.steps.filter((_,j)=>j!==si)}:proc);
      return {...p,procedures:procs};
    }));
    showToast('success','Step deleted');
  };

  const createProject = (form) => {
    if(!form.name||!form.unit){showToast('error','Name and unit are required');return;}
    const icons = {hr:'👤',fin:'💰',inv:'📦',bil:'🧾',it:'💻',ops:'⚙️'};
    setProjects(ps=>[{id:Date.now(),name:form.name,unit:form.unit,type:form.type,icon:icons[form.type]||'📋',status:form.status,start:form.start,end:form.end,lead:parseInt(form.lead)||null,desc:form.desc,procedures:[]},...ps]);
    setNewProjModal(false);
    showToast('success','Project created successfully');
  };

  const addMember = (form) => {
    if(!form.name){showToast('error','Name is required');return;}
    const initials = form.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
    setMembers(ms=>[...ms,{id:ms.length+1,name:form.name,role:form.role,email:form.email,initials}]);
    setAddMemberModal(false);
    showToast('success',`${form.name} added to team`);
  };

  const exportCurrentProject = () => {
    if(!currentProj) return;
    let csv='Ref,Audit Step,Status,AQC,Risk,Assigned To,Due Date,Observations\n';
    currentProj.procedures.forEach(proc=>{
      csv+=`"PROCEDURE: ${proc.name}",,,,,,,,\n`;
      proc.steps.forEach(s=>{
        const m=s.assignee?members.find(t=>t.id===s.assignee):null;
        csv+=`"${s.id}","${s.step.replace(/"/g,'""')}","${s.status}","${s.aqc}","${s.risk}","${m?m.name:'Unassigned'}","${s.due||''}","${(s.obs||'').replace(/"/g,'""')}"\n`;
      });
    });
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download=`${currentProj.name.replace(/ /g,'_')}_Audit.csv`;
    a.click();
    showToast('success','Export downloaded');
  };

  const filteredProjects = projects.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.unit.toLowerCase().includes(search.toLowerCase()));
  const allSteps = projects.flatMap(p=>p.procedures.flatMap(pr=>pr.steps));
  const inProgress = allSteps.filter(s=>s.status==='progress').length;
  const done = allSteps.filter(s=>s.status==='done').length;

  const topbarStyle={display:'flex',alignItems:'center',gap:14,padding:'14px 24px',borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0,boxShadow:'0 1px 3px rgba(0,0,0,0.04)'};

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:C.bg,fontFamily:'Sora,sans-serif'}}>
      <FontLink/>
      <Sidebar activeView={view} setView={setView} projectCount={projects.length} onExcelExport={()=>showToast('info','Excel export started')} onPdfExport={()=>showToast('info','PDF export started')}/>

      <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* ── DASHBOARD ── */}
        {view==='dashboard'&&(
          <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
            <div style={topbarStyle}>
              <div style={{fontSize:19,fontWeight:700,color:C.text1,flex:1}}>Dashboard <span style={{color:C.teal}}>Overview</span></div>
              <div style={{display:'flex',alignItems:'center',gap:8,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:'7px 12px'}}>
                <span style={{color:C.text3,fontSize:14}}>⌕</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search projects...' style={{background:'none',border:'none',outline:'none',color:C.text1,fontSize:13,fontFamily:'Sora,sans-serif',width:150}}/>
              </div>
              <Btn primary onClick={()=>setNewProjModal(true)}>＋ New Project</Btn>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'22px 24px'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
                <StatCard icon='📋' value={projects.length} label='Total Projects' change='↑ 2 this month' changeType='up' accent={C.teal}/>
                <StatCard icon='⏳' value={inProgress} label='Steps In Progress' change='12 due this week' changeType='warn' accent={C.amber}/>
                <StatCard icon='🎯' value={done} label='Steps Completed' change='↑ Good progress' changeType='up' accent={C.green}/>
                <StatCard icon='👥' value={members.length} label='Team Members' change='All active' changeType='up' accent={C.blue}/>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div style={{fontSize:15,fontWeight:700,color:C.text1}}>Active Audit Projects</div>
                <Btn small>View all →</Btn>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>
                {filteredProjects.map(p=><ProjectCard key={p.id} project={p} members={members} onClick={()=>openProject(p.id)}/>)}
              </div>
            </div>
          </div>
        )}

        {/* ── PROJECT DETAIL ── */}
        {view==='project'&&currentProj&&(
          <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
            {/* Detail Header */}
            <div style={{padding:'18px 24px',borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:C.text3,marginBottom:10,fontFamily:MONO}}>
                <span onClick={()=>setView('dashboard')} style={{color:C.teal,cursor:'pointer'}}>Dashboard</span>
                <span>/</span><span>Projects</span><span>/</span>
                <span style={{color:C.text2}}>{currentProj.name}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:46,height:46,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,background:(TYPE_COLORS[currentProj.type]||TYPE_COLORS.hr).bg,border:`1px solid ${(TYPE_COLORS[currentProj.type]||TYPE_COLORS.hr).border}`}}>{currentProj.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:20,fontWeight:800,color:C.text1,letterSpacing:'-0.4px'}}>{currentProj.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:14,marginTop:5}}>
                    {[['📅',currentProj.start],['🏢',currentProj.unit],['📊',`${calcProgress(currentProj)}% Complete`]].map(([icon,val])=>(
                      <span key={val} style={{fontSize:12,color:C.text2,display:'flex',alignItems:'center',gap:4}}>{icon} {val}</span>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <Btn small onClick={()=>{
                    setProjects(ps=>ps.map(p=>{
                      if(p.id!==currentProjId) return p;
                      const num=p.procedures.length+1;
                      return {...p,procedures:[...p.procedures,{id:'proc'+Date.now(),name:`Procedure ${num}`,desc:'New procedure',steps:[{...mkStep(`${num}.1`,'New audit step — click to edit','todo','pending','medium',null,'',''),docs:[],comments:[]}]}]};
                    }));
                    showToast('success','Procedure added');
                  }}>＋ Add Procedure</Btn>
                  <Btn small primary onClick={exportCurrentProject}>⬒ Export</Btn>
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div style={{display:'flex',gap:2,padding:'12px 24px 0',borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0}}>
              {[['table','⊞ Table View'],['kanban','⊟ Kanban Board']].map(([k,l])=>(
                <div key={k} onClick={()=>setActiveTab(k)} style={{padding:'8px 16px',borderRadius:'8px 8px 0 0',fontSize:13,fontWeight:600,cursor:'pointer',color:activeTab===k?C.teal:C.text3,background:activeTab===k?C.bg:'transparent',border:activeTab===k?`1px solid ${C.border}`:'1px solid transparent',borderBottom:activeTab===k?`1px solid ${C.bg}`:'1px solid transparent',position:'relative',top:1,transition:'all .15s'}}>{l}</div>
              ))}
            </div>
            {/* Content */}
            <div style={{flex:1,overflow:'auto',background:C.bg}}>
              {activeTab==='table'&&<TableView project={currentProj} members={members} onOpenTask={openTask} onAddStep={addStep} onDeleteStep={deleteStep} onRenameProcedure={(pi,updates)=>{
                setProjects(ps=>ps.map(p=>{
                  if(p.id!==currentProjId) return p;
                  return {...p,procedures:p.procedures.map((pr,i)=>i===pi?{...pr,...updates}:pr)};
                }));
              }}/>}
              {activeTab==='kanban'&&<KanbanView project={currentProj} members={members} onOpenTask={openTask}/>}
            </div>
          </div>
        )}

        {/* ── TEAM ── */}
        {view==='team'&&(
          <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
            <div style={topbarStyle}>
              <div style={{fontSize:19,fontWeight:700,color:C.text1,flex:1}}>Team <span style={{color:C.teal}}>Members</span></div>
              <Btn primary onClick={()=>setAddMemberModal(true)}>＋ Add Member</Btn>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'22px 24px'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                {members.map(m=>{
                  const tasks=projects.flatMap(p=>p.procedures.flatMap(pr=>pr.steps)).filter(s=>s.assignee===m.id);
                  const doneCount=tasks.filter(s=>s.status==='done').length;
                  const pct=tasks.length?Math.round(doneCount/tasks.length*100):0;
                  const roleColor={Admin:C.teal,Auditor:C.blue,Reviewer:C.amber}[m.role]||C.text2;
                  return (
                    <div key={m.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:20,boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                        <Avatar member={m} size={44}/>
                        <div>
                          <div style={{fontSize:15,fontWeight:700,color:C.text1}}>{m.name}</div>
                          <div style={{fontSize:11.5,color:roleColor,fontFamily:MONO}}>{m.role}</div>
                        </div>
                      </div>
                      <div style={{fontSize:12,color:C.text3,marginBottom:12}}>{m.email}</div>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5}}>
                        <div style={{flex:1,height:5,background:C.bg2,borderRadius:3,overflow:'hidden'}}>
                          <div style={{height:'100%',background:`linear-gradient(90deg,${C.teal},${C.teal2})`,width:`${pct}%`,borderRadius:3}}/>
                        </div>
                        <span style={{fontSize:12,fontFamily:MONO,fontWeight:600,color:C.text2}}>{pct}%</span>
                      </div>
                      <div style={{fontSize:11,color:C.text3,fontFamily:MONO}}>{doneCount}/{tasks.length} tasks completed</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── MY TASKS ── */}
        {view==='my-tasks'&&(
          <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
            <div style={topbarStyle}>
              <div style={{fontSize:19,fontWeight:700,color:C.text1,flex:1}}>Tasks <span style={{color:C.teal}}>Assigned to Me</span></div>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {(()=>{
                const myTasks=[];
                projects.forEach(p=>p.procedures.forEach((proc,pi)=>proc.steps.forEach((s,si)=>{if(s.assignee===1)myTasks.push({p,proc,s,pi,si});})));
                if(!myTasks.length) return <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:60,color:C.text3,gap:12}}><div style={{fontSize:48,opacity:.4}}>📭</div><div style={{fontSize:14}}>No tasks assigned to you</div></div>;
                const th={background:C.bg2,padding:'10px 14px',textAlign:'left',fontSize:10.5,fontWeight:600,fontFamily:MONO,letterSpacing:'0.5px',textTransform:'uppercase',color:C.text3,borderBottom:`2px solid ${C.border2}`,position:'sticky',top:0,zIndex:10};
                const td={padding:'11px 14px',borderBottom:`1px solid ${C.border}`,verticalAlign:'middle',fontSize:13};
                return <table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Project','Ref','Step','Status','AQC','Due Date',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{myTasks.map(({p,proc,s,pi,si})=>(
                  <tr key={s.id} onClick={()=>{openProject(p.id);setTimeout(()=>openTask(pi,si),100);}} style={{cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background=C.bg2} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{...td,color:C.teal,fontSize:12}}>{p.icon} {p.name}</td>
                    <td style={{...td,fontFamily:MONO,fontSize:11.5,color:C.text3}}>{s.id}</td>
                    <td style={{...td,maxWidth:260,color:C.text1}}>{s.step.substring(0,80)}{s.step.length>80?'…':''}</td>
                    <td style={td}><Badge map={STATUS_MAP} val={s.status}/></td>
                    <td style={td}><Badge map={AQC_MAP} val={s.aqc}/></td>
                    <td style={{...td,fontFamily:MONO,fontSize:11.5,color:C.text3}}>{s.due||'—'}</td>
                    <td style={td}><button onClick={e=>{e.stopPropagation();openProject(p.id);setTimeout(()=>openTask(pi,si),100);}} style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:13,color:C.text3}}>✏</button></td>
                  </tr>
                ))}</tbody></table>;
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Drawer */}
      {currentProj&&<TaskDrawer
        open={drawerOpen}
        task={drawerTask}
        procName={currentProj.procedures[drawerProcIdx]?.name||''}
        members={members}
        onClose={()=>setDrawerOpen(false)}
        onSave={saveTask}
      />}

      {/* Modals */}
      <NewProjectModal open={newProjModal} members={members} onClose={()=>setNewProjModal(false)} onCreate={createProject}/>
      <AddMemberModal open={addMemberModal} onClose={()=>setAddMemberModal(false)} onAdd={addMember}/>
      <ToastContainer toasts={toasts}/>
    </div>
  );
}
