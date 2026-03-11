'use client';

import { useState, useRef } from "react";

/* ─── TAILWIND via CDN injected globally ─────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body,#root{height:100%;font-family:'Plus Jakarta Sans',sans-serif;background:#f1f5f9;}
    ::-webkit-scrollbar{width:5px;height:5px;}
    ::-webkit-scrollbar-track{background:#f1f5f9;}
    ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
    input,textarea,select{font-family:'Plus Jakarta Sans',sans-serif;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .fade-up{animation:fadeUp .35s ease forwards}
    .slide-in{animation:slideIn .3s ease forwards}
  `}</style>
);

/* ─── DESIGN TOKENS ──────────────────────────────────────────────── */
const T = {
  // Blues - primary palette
  b900:"#0f172a", b800:"#1e293b", b700:"#334155", b600:"#475569",
  b400:"#94a3b8", b200:"#e2e8f0", b100:"#f1f5f9", b50:"#f8fafc",
  // Accent - Indigo
  ind:"#4f46e5", ind2:"#4338ca", indBg:"#eef2ff", indBorder:"#c7d2fe",
  // Status colors
  gathering:"#7c3aed", gatheringBg:"#f5f3ff", gatheringBorder:"#ddd6fe",
  inprog:"#0284c7",  inprogBg:"#f0f9ff",  inprogBorder:"#bae6fd",
  review:"#d97706",  reviewBg:"#fffbeb",   reviewBorder:"#fde68a",
  done:"#059669",    doneBg:"#ecfdf5",     doneBorder:"#a7f3d0",
  hold:"#dc2626",    holdBg:"#fef2f2",     holdBorder:"#fecaca",
  // Priority
  high:"#dc2626", highBg:"#fef2f2", highBorder:"#fecaca",
  med:"#d97706",  medBg:"#fffbeb",  medBorder:"#fde68a",
  low:"#059669",  lowBg:"#ecfdf5",  lowBorder:"#a7f3d0",
};

const MONO = "'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', sans-serif";

/* ─── STATUS & PRIORITY MAPS ─────────────────────────────────────── */
const STATUS = {
  gathering: { label:"Req. Gathering", color:T.gathering, bg:T.gatheringBg, border:T.gatheringBorder, dot:"#7c3aed", icon:"📋" },
  inprog:    { label:"In Progress",    color:T.inprog,    bg:T.inprogBg,    border:T.inprogBorder,    dot:"#0284c7", icon:"⚡" },
  review:    { label:"Under Review",   color:T.review,    bg:T.reviewBg,    border:T.reviewBorder,    dot:"#d97706", icon:"🔍" },
  done:      { label:"Completed",      color:T.done,      bg:T.doneBg,      border:T.doneBorder,      dot:"#059669", icon:"✅" },
  hold:      { label:"On Hold",        color:T.hold,      bg:T.holdBg,      border:T.holdBorder,      dot:"#dc2626", icon:"⏸" },
};
const PRIORITY = {
  high:   { label:"High",   color:T.high, bg:T.highBg, border:T.highBorder, icon:"▲" },
  medium: { label:"Medium", color:T.med,  bg:T.medBg,  border:T.medBorder,  icon:"◆" },
  low:    { label:"Low",    color:T.low,  bg:T.lowBg,  border:T.lowBorder,  icon:"▽" },
};
const ROLES = ["Admin","Manager","Employee"];
const ROLE_COLORS = { Admin:"#4f46e5", Manager:"#0284c7", Employee:"#059669" };
const CLIENT_COLORS = ["#4f46e5","#0284c7","#059669","#d97706","#dc2626","#7c3aed","#0891b2","#db2777"];

/* ─── AUTO STATUS: Compute project status from its tasks ─────────── */
const computeProjectStatus = (tasks) => {
  if (!tasks || tasks.length === 0) return 'gathering';
  const statuses = tasks.map(t => t.status);
  if (statuses.every(s => s === 'done'))    return 'done';
  if (statuses.some(s => s === 'hold'))     return 'hold';
  if (statuses.some(s => s === 'review'))   return 'review';
  if (statuses.some(s => s === 'inprog'))   return 'inprog';
  return 'gathering';
};

/* ─── SEED DATA ──────────────────────────────────────────────────── */
const mkReq = (id,title,desc,priority,due,files=[],notes="") =>
  ({id,title,desc,priority,due,files,notes,createdAt:new Date().toISOString().slice(0,10)});

const INIT_CLIENTS = [
  {
    id:1, name:"Lixil Window Systems", company:"Lixil Pvt Ltd", email:"contact@lixil.in",
    phone:"+91 98765 43210", industry:"Manufacturing", color:"#4f46e5",
    projects:[
      {
        id:"p1", name:"HR Audit FY2025", description:"Full HR compliance and payroll audit",
        status:"inprog", priority:"high", startDate:"2025-01-15", dueDate:"2025-03-31",
        assignedTo:"Priya Sharma", role:"Manager", budget:"₹2,50,000",
        tasks:[
          {
            id:"t1", title:"Policy Documentation Review",
            description:"Review and document all HR policies including POSH, leave, and recruitment.",
            status:"done", priority:"high", dueDate:"2025-02-15", assignedTo:"Rajan Verma",
            createdAt:"2025-01-16",
            requirements:[
              mkReq("r1","Organization Chart","Upload the latest org chart with reporting hierarchy","high","2025-02-05",["OrgChart_2024.pdf"],"Include all departments"),
              mkReq("r2","HR Policy Documents","All existing HR policies in any format","medium","2025-02-08",["HR_Policy_v3.docx","Leave_Policy.pdf"],"Version history preferred"),
              mkReq("r3","POSH Committee List","Names and contact of ICC members","high","2025-02-06",[],"Include meeting minutes if available"),
            ]
          },
          {
            id:"t2", title:"Recruitment Process Audit",
            description:"Verify hiring compliance, MRF process, background checks, and offer letters.",
            status:"inprog", priority:"high", dueDate:"2025-03-01", assignedTo:"Sneha Gupta",
            createdAt:"2025-01-20",
            requirements:[
              mkReq("r4","Manpower Requisition Forms","Sample MRF forms for last 6 months","medium","2025-02-20",[],"At least 10 samples needed"),
              mkReq("r5","Offer Letters Samples","Last 10 offer letters issued","low","2025-02-22",["OfferLetter_Sample.pdf"],"Redact salaries if needed"),
            ]
          },
          {
            id:"t3", title:"Payroll Compliance Check",
            description:"Match payroll output with bank statements, verify PF/ESI deductions.",
            status:"gathering", priority:"medium", dueDate:"2025-03-15", assignedTo:"Deepak Joshi",
            createdAt:"2025-01-25",
            requirements:[]
          },
        ]
      },
      {
        id:"p2", name:"Finance Audit Q1", description:"AP/AR and bank reconciliation review",
        status:"gathering", priority:"medium", startDate:"2025-02-01", dueDate:"2025-04-30",
        assignedTo:"Kavita Singh", role:"Employee", budget:"₹1,80,000",
        tasks:[
          {
            id:"t4", title:"Bank Reconciliation Review",
            description:"Reconcile all bank accounts for Q1 FY2025.",
            status:"gathering", priority:"medium", dueDate:"2025-03-10", assignedTo:"Kavita Singh",
            createdAt:"2025-02-02",
            requirements:[
              mkReq("r6","Bank Statements","Q1 bank statements for all accounts","high","2025-02-25",[],"All active accounts"),
            ]
          }
        ]
      }
    ]
  },
  {
    id:2, name:"TechVentures India", company:"TechVentures Pvt Ltd", email:"ops@techventures.in",
    phone:"+91 91234 56789", industry:"Technology", color:"#059669",
    projects:[
      {
        id:"p3", name:"IT Systems Audit", description:"ERP and cybersecurity compliance review",
        status:"review", priority:"high", startDate:"2025-02-10", dueDate:"2025-05-15",
        assignedTo:"Mohit Agarwal", role:"Manager", budget:"₹3,20,000",
        tasks:[
          {
            id:"t5", title:"Cybersecurity Assessment",
            description:"ISO 27001 compliance check and vulnerability assessment.",
            status:"review", priority:"high", dueDate:"2025-04-01", assignedTo:"Neha Patel",
            createdAt:"2025-02-11",
            requirements:[
              mkReq("r7","Network Diagram","Current IT infrastructure diagram","high","2025-03-01",["Network_Diagram.png"],"Include cloud assets"),
              mkReq("r8","Access Control Policy","User access management policy","high","2025-03-05",[],""),
            ]
          }
        ]
      }
    ]
  },
  {
    id:3, name:"Sunrise Retail Group", company:"Sunrise Retail Ltd", email:"cfo@sunriseretail.com",
    phone:"+91 88899 77766", industry:"Retail", color:"#d97706",
    projects:[
      {
        id:"p4", name:"Inventory Audit", description:"Physical verification of stock across 3 warehouses",
        status:"hold", priority:"low", startDate:"2025-03-01", dueDate:"2025-06-30",
        assignedTo:"Rahul Tiwari", role:"Employee", budget:"₹95,000",
        tasks:[]
      }
    ]
  }
];

const INIT_EMPLOYEES = [
  {id:1,name:"Priya Sharma",role:"Manager",email:"priya@firm.com",initials:"PS",color:"#4f46e5"},
  {id:2,name:"Rajan Verma",role:"Employee",email:"rajan@firm.com",initials:"RV",color:"#0284c7"},
  {id:3,name:"Sneha Gupta",role:"Manager",email:"sneha@firm.com",initials:"SG",color:"#059669"},
  {id:4,name:"Deepak Joshi",role:"Employee",email:"deepak@firm.com",initials:"DJ",color:"#d97706"},
  {id:5,name:"Kavita Singh",role:"Employee",email:"kavita@firm.com",initials:"KS",color:"#7c3aed"},
  {id:6,name:"Mohit Agarwal",role:"Manager",email:"mohit@firm.com",initials:"MA",color:"#0891b2"},
  {id:7,name:"Neha Patel",role:"Employee",email:"neha@firm.com",initials:"NP",color:"#db2777"},
  {id:8,name:"Rahul Tiwari",role:"Employee",email:"rahul@firm.com",initials:"RT",color:"#dc2626"},
];

/* ─── TINY HELPERS ───────────────────────────────────────────────── */
const fileIcon = n => ({pdf:"📄",xlsx:"📊",xls:"📊",docx:"📝",doc:"📝",jpg:"🖼",jpeg:"🖼",png:"🖼",ppt:"📋",pptx:"📋"}[n?.split('.').pop()?.toLowerCase()]||"📎");
const initials = name => name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||"?";
const today = () => new Date().toISOString().slice(0,10);
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';

/* ─── REUSABLE UI ────────────────────────────────────────────────── */
const Avatar = ({name,color,size=32}) => (
  <div title={name} style={{width:size,height:size,borderRadius:'50%',background:color||"#4f46e5",display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.36,fontWeight:700,color:'#fff',flexShrink:0,fontFamily:MONO}}>
    {initials(name)}
  </div>
);
const Badge = ({map,val,small}) => {
  const m = map[val]; if(!m) return null;
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:small?'2px 8px':'4px 10px',borderRadius:20,fontSize:small?10:11.5,fontWeight:600,fontFamily:MONO,background:m.bg,color:m.color,border:`1px solid ${m.border}`,whiteSpace:'nowrap'}}>{m.icon||m.label?.slice(0,1)} {m.label}</span>;
};
const Pill = ({children,color,bg,border}) => (
  <span style={{display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,fontFamily:MONO,background:bg||"#f1f5f9",color:color||"#475569",border:`1px solid ${border||"#e2e8f0"}`,whiteSpace:'nowrap'}}>{children}</span>
);
const Input = ({label,value,onChange,placeholder,type="text",required}) => (
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    {label&&<label style={{fontSize:11,fontWeight:700,fontFamily:MONO,color:T.b600,textTransform:'uppercase',letterSpacing:'0.6px'}}>{label}{required&&<span style={{color:T.high,marginLeft:2}}>*</span>}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{background:'#fff',border:`1.5px solid ${T.b200}`,borderRadius:8,padding:'9px 13px',color:T.b900,fontSize:13.5,fontFamily:SANS,outline:'none',transition:'border .2s',width:'100%'}}
      onFocus={e=>e.target.style.borderColor=T.ind} onBlur={e=>e.target.style.borderColor=T.b200}/>
  </div>
);
const Textarea = ({label,value,onChange,placeholder,rows=3}) => (
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    {label&&<label style={{fontSize:11,fontWeight:700,fontFamily:MONO,color:T.b600,textTransform:'uppercase',letterSpacing:'0.6px'}}>{label}</label>}
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{background:'#fff',border:`1.5px solid ${T.b200}`,borderRadius:8,padding:'9px 13px',color:T.b900,fontSize:13.5,fontFamily:SANS,outline:'none',resize:'vertical',lineHeight:1.6,transition:'border .2s',width:'100%'}}
      onFocus={e=>e.target.style.borderColor=T.ind} onBlur={e=>e.target.style.borderColor=T.b200}/>
  </div>
);
const Select = ({label,value,onChange,options}) => (
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    {label&&<label style={{fontSize:11,fontWeight:700,fontFamily:MONO,color:T.b600,textTransform:'uppercase',letterSpacing:'0.6px'}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{background:'#fff',border:`1.5px solid ${T.b200}`,borderRadius:8,padding:'9px 13px',color:T.b900,fontSize:13.5,fontFamily:SANS,outline:'none',cursor:'pointer',appearance:'none',backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 12px center',width:'100%'}}>
      {options.map(([v,l])=><option key={v} value={v}>{l}</option>)}
    </select>
  </div>
);
const Btn = ({children,onClick,variant='primary',size='md',style:sx={}}) => {
  const styles = {
    primary:{background:T.ind,color:'#fff',border:'none',boxShadow:`0 2px 8px ${T.ind}44`},
    secondary:{background:'#fff',color:T.b700,border:`1.5px solid ${T.b200}`},
    ghost:{background:'transparent',color:T.b600,border:`1.5px solid ${T.b200}`},
    danger:{background:'#fef2f2',color:T.high,border:`1.5px solid ${T.highBorder}`},
    success:{background:T.doneBg,color:T.done,border:`1.5px solid ${T.doneBorder}`},
  };
  const sizes = {sm:{padding:'5px 12px',fontSize:12},md:{padding:'9px 18px',fontSize:13.5},lg:{padding:'12px 24px',fontSize:15}};
  return <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:7,borderRadius:9,fontWeight:600,cursor:'pointer',fontFamily:SANS,transition:'all .18s',...styles[variant],...sizes[size],...sx}}>{children}</button>;
};
const Card = ({children,style:sx={},...rest}) => (
  <div style={{background:'#fff',border:`1px solid ${T.b200}`,borderRadius:14,boxShadow:'0 1px 4px rgba(0,0,0,0.05)',...sx}} {...rest}>{children}</div>
);
const Divider = () => <div style={{height:1,background:T.b200,margin:'4px 0'}}/>;

/* ─── TOAST ──────────────────────────────────────────────────────── */
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = (msg,type='success') => {
    const id=Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  };
  return {toasts,show};
};
const ToastList = ({toasts}) => (
  <div style={{position:'fixed',bottom:24,right:24,zIndex:9999,display:'flex',flexDirection:'column',gap:8}}>
    {toasts.map(t=>(
      <div key={t.id} className="slide-in" style={{background:t.type==='error'?T.holdBg:'#fff',border:`1px solid ${t.type==='error'?T.holdBorder:T.b200}`,borderLeft:`4px solid ${t.type==='error'?T.high:T.done}`,borderRadius:10,padding:'12px 16px',fontSize:13,color:T.b900,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',maxWidth:340,minWidth:240}}>
        <span>{t.type==='error'?'❌':'✅'}</span><span>{t.msg}</span>
      </div>
    ))}
  </div>
);

/* ─── MODAL WRAPPER ──────────────────────────────────────────────── */
const Modal = ({open,onClose,title,children,width=540}) => {
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)',padding:20}}>
      <div onClick={e=>e.stopPropagation()} className="fade-up" style={{background:'#fff',borderRadius:18,width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.18)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:`1px solid ${T.b200}`}}>
          <div style={{fontSize:17,fontWeight:800,color:T.b900}}>{title}</div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.b200}`,background:T.b100,cursor:'pointer',fontSize:16,color:T.b600,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ─── SIDEBAR ────────────────────────────────────────────────────── */
const Sidebar = ({view,setView,clients,selectedClientId,onSelectClient}) => {
  const allTasks = clients.flatMap(c=>c.projects.flatMap(p=>p.tasks));
  const gatheringCount = allTasks.filter(t=>t.status==='gathering').length;

  const navItem = (id,icon,label,badge=null) => {
    const active = view===id && !selectedClientId;
    return (
      <div key={id} onClick={()=>{setView(id);onSelectClient(null);}}
        style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px',borderRadius:9,cursor:'pointer',
          color:active?T.ind:T.b600, fontSize:13.5, fontWeight:active?700:500,
          background:active?T.indBg:'transparent',
          border:active?`1px solid ${T.indBorder}`:'1px solid transparent',
          marginBottom:3,transition:'all .15s'}}
        onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.b100;}}
        onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent';}}>
        <span style={{fontSize:15}}>{icon}</span>
        <span style={{flex:1}}>{label}</span>
        {badge&&<span style={{background:T.ind,color:'#fff',fontSize:10,fontWeight:700,fontFamily:MONO,padding:'2px 7px',borderRadius:10}}>{badge}</span>}
      </div>
    );
  };

  return (
    <aside style={{width:256,minWidth:256,background:'#ffffff',borderRight:`1px solid ${T.b200}`,display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden'}}>
      {/* Logo */}
      <div style={{padding:'20px 20px 14px',borderBottom:`1px solid ${T.b200}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#fff',fontFamily:MONO,flexShrink:0}}>CF</div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:T.b900,letterSpacing:'-0.3px'}}>ClientFlow</div>
            <div style={{fontSize:9.5,color:T.b400,fontFamily:MONO,letterSpacing:'1px',textTransform:'uppercase',marginTop:1}}>Task Management</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{padding:'12px 12px 8px',borderBottom:`1px solid ${T.b200}`}}>
        {navItem('dashboard','⬡','Dashboard')}
        {navItem('clients','👥','All Clients')}
        {navItem('mytasks','◎','My Tasks', gatheringCount||null)}
      </nav>

      {/* Clients list */}
      <div style={{flex:1,overflowY:'auto',padding:'12px 12px'}}>
        <div style={{fontSize:10,fontFamily:MONO,letterSpacing:'1.5px',textTransform:'uppercase',color:T.b400,padding:'0 8px 8px',fontWeight:600}}>Clients</div>
        {clients.map(c=>{
          const active = selectedClientId===c.id;
          const taskCount = c.projects.flatMap(p=>p.tasks).length;
          return (
            <div key={c.id} onClick={()=>{onSelectClient(c.id);setView('client');}}
              style={{display:'flex',alignItems:'center',gap:9,padding:'8px 11px',borderRadius:9,cursor:'pointer',marginBottom:3,
                background:active?T.indBg:'transparent',
                border:active?`1px solid ${T.indBorder}`:'1px solid transparent',transition:'all .15s'}}
              onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.b100;}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent';}}>
              <div style={{width:28,height:28,borderRadius:8,background:c.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0,fontFamily:MONO}}>{initials(c.name)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:active?T.ind:T.b700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.name}</div>
                <div style={{fontSize:10.5,color:T.b400,fontFamily:MONO}}>{c.projects.length} proj · {taskCount} tasks</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User card */}
      <div style={{padding:12,borderTop:`1px solid ${T.b200}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:T.b100,borderRadius:10,border:`1px solid ${T.b200}`}}>
          <Avatar name="Admin User" color="#4f46e5" size={30}/>
          <div>
            <div style={{fontSize:12.5,fontWeight:700,color:T.b900}}>Admin User</div>
            <div style={{fontSize:10.5,color:T.ind,fontFamily:MONO}}>● Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ─── STAT CARD ──────────────────────────────────────────────────── */
const StatCard = ({icon,value,label,sub,accent}) => (
  <Card style={{padding:20,position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:-12,right:-12,width:64,height:64,borderRadius:'50%',background:accent,opacity:.08}}/>
    <div style={{fontSize:22,marginBottom:10}}>{icon}</div>
    <div style={{fontSize:28,fontWeight:800,color:T.b900,fontFamily:MONO,lineHeight:1}}>{value}</div>
    <div style={{fontSize:12.5,color:T.b600,marginTop:6,fontWeight:500}}>{label}</div>
    {sub&&<div style={{fontSize:11,color:accent,marginTop:5,fontWeight:600,fontFamily:MONO}}>{sub}</div>}
  </Card>
);

/* ─── REQUIREMENTS PANEL ─────────────────────────────────────────── */
const RequirementsPanel = ({task,onUpdate,onExport,show,toast}) => {
  const [showAddReq,setShowAddReq] = useState(false);
  const [newReq,setNewReq] = useState({title:'',desc:'',priority:'medium',due:'',notes:'',files:[]});
  const [editingId,setEditingId] = useState(null);
  const fileRef = useRef();

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files).map(f=>f.name);
    setNewReq(r=>({...r,files:[...r.files,...files]}));
    e.target.value='';
  };

  const saveReq = () => {
    if(!newReq.title.trim()){toast('Title is required','error');return;}
    const req = {...newReq, id:'r'+Date.now(), createdAt:today()};
    onUpdate({...task, requirements:[...task.requirements, req]});
    setNewReq({title:'',desc:'',priority:'medium',due:'',notes:'',files:[]});
    setShowAddReq(false);
    toast('Requirement added successfully');
  };

  const deleteReq = (rid) => {
    onUpdate({...task, requirements:task.requirements.filter(r=>r.id!==rid)});
    toast('Requirement removed');
  };

  const updateReqField = (rid,field,val) => {
    onUpdate({...task, requirements:task.requirements.map(r=>r.id===rid?{...r,[field]:val}:r)});
  };

  if(!show) return null;

  const reqsByPriority = ['high','medium','low'].flatMap(p=>task.requirements.filter(r=>r.priority===p));

  return (
    <div style={{display:'flex',flexDirection:'column',gap:0}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',background:T.indBg,borderTop:`1px solid ${T.b200}`,borderBottom:`1px solid ${T.indBorder}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:16}}>📋</span>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:T.ind}}>Client Requirements</div>
            <div style={{fontSize:11,color:T.b600,fontFamily:MONO}}>{task.requirements.length} requirements collected</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <Btn size="sm" variant="success" onClick={()=>onExport(task)}>⬒ Export Excel</Btn>
          <Btn size="sm" variant="primary" onClick={()=>setShowAddReq(true)}>＋ Add Requirement</Btn>
        </div>
      </div>

      {/* Requirements list */}
      <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:12,maxHeight:480,overflowY:'auto',background:'#fafbfc'}}>
        {reqsByPriority.length === 0 && (
          <div style={{textAlign:'center',padding:'40px 20px',color:T.b400}}>
            <div style={{fontSize:40,marginBottom:10,opacity:.4}}>📋</div>
            <div style={{fontSize:14,fontWeight:600,color:T.b600,marginBottom:4}}>No requirements yet</div>
            <div style={{fontSize:12.5,color:T.b400}}>Click &quot;Add Requirement&quot; to start collecting client requirements</div>
          </div>
        )}
        {reqsByPriority.map((req,i)=>(
          <div key={req.id} className="fade-up" style={{background:'#fff',border:`1px solid ${T.b200}`,borderRadius:12,padding:'14px 16px',borderLeft:`4px solid ${PRIORITY[req.priority]?.color||T.b400}`,boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,fontFamily:MONO,color:T.b400}}>REQ-{String(i+1).padStart(2,'0')}</span>
                  <Badge map={PRIORITY} val={req.priority} small/>
                  {req.due&&<span style={{fontSize:11,color:T.b400,fontFamily:MONO}}>📅 {fmtDate(req.due)}</span>}
                </div>
                {editingId===req.id
                  ? <input autoFocus value={req.title} onChange={e=>updateReqField(req.id,'title',e.target.value)}
                      onBlur={()=>setEditingId(null)} onKeyDown={e=>e.key==='Enter'&&setEditingId(null)}
                      style={{width:'100%',border:`2px solid ${T.ind}`,borderRadius:7,padding:'4px 10px',fontSize:14,fontWeight:700,fontFamily:SANS,outline:'none',color:T.b900}}/>
                  : <div onClick={()=>setEditingId(req.id)} style={{fontSize:14,fontWeight:700,color:T.b900,cursor:'text',padding:'2px 4px',borderRadius:5,border:'1px solid transparent',transition:'all .15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.border=`1px dashed ${T.ind}`;e.currentTarget.style.background=T.indBg;}}
                      onMouseLeave={e=>{e.currentTarget.style.border='1px solid transparent';e.currentTarget.style.background='transparent';}}>
                      {req.title} <span style={{fontSize:10,color:T.b400}}>✏</span>
                    </div>
                }
              </div>
              <button onClick={()=>deleteReq(req.id)} style={{width:26,height:26,borderRadius:6,border:`1px solid ${T.highBorder}`,background:T.highBg,cursor:'pointer',fontSize:12,color:T.high,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
            </div>
            {req.desc&&<div style={{fontSize:12.5,color:T.b600,lineHeight:1.55,marginBottom:10,paddingLeft:4,borderLeft:`2px solid ${T.b200}`}}>{req.desc}</div>}
            {req.notes&&<div style={{fontSize:12,color:T.b400,fontStyle:'italic',marginBottom:10}}>💬 {req.notes}</div>}
            {req.files.length>0&&(
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {req.files.map((f,fi)=>(
                  <span key={fi} style={{display:'inline-flex',alignItems:'center',gap:5,background:T.indBg,color:T.ind,border:`1px solid ${T.indBorder}`,borderRadius:6,fontSize:11,padding:'3px 9px',fontFamily:MONO}}>
                    {fileIcon(f)} {f.length>18?f.slice(0,18)+'…':f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Requirement Inline Form */}
      {showAddReq&&(
        <div style={{padding:'16px 20px',background:'#fff',borderTop:`1px solid ${T.b200}`}}>
          <div style={{fontSize:14,fontWeight:700,color:T.b900,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
            <span>📝</span> New Requirement
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div style={{gridColumn:'1/-1'}}><Input label="Requirement Title *" value={newReq.title} onChange={v=>setNewReq(r=>({...r,title:v}))} placeholder="e.g. Upload org chart, Provide policy docs…" required/></div>
            <Textarea label="Description" value={newReq.desc} onChange={v=>setNewReq(r=>({...r,desc:v}))} placeholder="Describe what exactly is needed from the client…" rows={2}/>
            <Textarea label="Internal Notes" value={newReq.notes} onChange={v=>setNewReq(r=>({...r,notes:v}))} placeholder="Notes for your team…" rows={2}/>
            <Select label="Priority" value={newReq.priority} onChange={v=>setNewReq(r=>({...r,priority:v}))} options={[['high','▲ High'],['medium','◆ Medium'],['low','▽ Low']]}/>
            <Input label="Client Due Date" value={newReq.due} onChange={v=>setNewReq(r=>({...r,due:v}))} type="date"/>
          </div>
          {/* File upload */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,fontFamily:MONO,color:T.b600,textTransform:'uppercase',letterSpacing:'0.6px',display:'block',marginBottom:6}}>Attach Files / Documents</label>
            <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:`2px dashed ${T.indBorder}`,borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:T.indBg,gap:6}}>
              <span style={{fontSize:24}}>📎</span>
              <span style={{fontSize:13,color:T.ind,fontWeight:600}}>Click to attach files</span>
              <span style={{fontSize:11,color:T.b400}}>PDF, Excel, Word, Images, any format</span>
              <input type="file" multiple ref={fileRef} onChange={handleAddFiles} style={{display:'none'}}/>
            </label>
            {newReq.files.length>0&&(
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
                {newReq.files.map((f,i)=>(
                  <span key={i} style={{display:'inline-flex',alignItems:'center',gap:6,background:T.indBg,color:T.ind,border:`1px solid ${T.indBorder}`,borderRadius:6,fontSize:11.5,padding:'4px 10px',fontFamily:MONO}}>
                    {fileIcon(f)}{f.length>20?f.slice(0,20)+'…':f}
                    <span onClick={()=>setNewReq(r=>({...r,files:r.files.filter((_,j)=>j!==i)}))} style={{cursor:'pointer',color:T.high,fontWeight:700}}>✕</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{display:'flex',gap:10}}>
            <Btn variant="primary" onClick={saveReq} style={{flex:1}}>✓ Save Requirement</Btn>
            <Btn variant="ghost" onClick={()=>{setShowAddReq(false);setNewReq({title:'',desc:'',priority:'medium',due:'',notes:'',files:[]});}}>Cancel</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── TASK CARD ──────────────────────────────────────────────────── */
const TaskCard = ({task,onOpen,onStatusChange}) => {
  const st = STATUS[task.status];
  const pr = PRIORITY[task.priority];
  const reqDone = task.requirements.filter(r=>r.files.length>0||r.desc).length;
  const reqTotal = task.requirements.length;
  const pct = reqTotal ? Math.round(reqDone/reqTotal*100) : 0;
  return (
    <Card style={{padding:0,overflow:'hidden',cursor:'pointer',transition:'all .2s'}}
      onClick={()=>onOpen(task)}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 24px rgba(79,70,229,0.12)';e.currentTarget.style.borderColor=T.indBorder;e.currentTarget.style.transform='translateY(-2px)';}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)';e.currentTarget.style.borderColor=T.b200;e.currentTarget.style.transform='none';}}>
      <div style={{height:3,background:`linear-gradient(90deg,${pr?.color||T.b400},${pr?.color||T.b400}88)`}}/>
      <div style={{padding:'14px 16px'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:700,color:T.b900,lineHeight:1.35,flex:1}}>{task.title}</div>
          <select value={task.status} onChange={e=>{e.stopPropagation();onStatusChange(task.id,e.target.value);}}
            onClick={e=>e.stopPropagation()}
            style={{background:st?.bg,color:st?.color,border:`1px solid ${st?.border}`,borderRadius:20,padding:'3px 8px',fontSize:10.5,fontFamily:MONO,fontWeight:600,cursor:'pointer',outline:'none',flexShrink:0}}>
            {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>
        {task.description&&<div style={{fontSize:12.5,color:T.b600,lineHeight:1.5,marginBottom:12}}>{task.description.length>90?task.description.slice(0,90)+'…':task.description}</div>}
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12,flexWrap:'wrap'}}>
          <Badge map={PRIORITY} val={task.priority} small/>
          {task.dueDate&&<Pill color={T.b600}>📅 {fmtDate(task.dueDate)}</Pill>}
        </div>
        {/* Requirement progress */}
        {reqTotal>0&&(
          <div style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:T.b400,marginBottom:4,fontFamily:MONO}}>
              <span>Requirements</span><span>{reqDone}/{reqTotal} collected</span>
            </div>
            <div style={{height:4,background:T.b200,borderRadius:2,overflow:'hidden'}}>
              <div style={{height:'100%',background:`linear-gradient(90deg,${T.ind},#7c3aed)`,width:`${pct}%`,borderRadius:2,transition:'width .4s'}}/>
            </div>
          </div>
        )}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <Avatar name={task.assignedTo} color={INIT_EMPLOYEES.find(e=>e.name===task.assignedTo)?.color||T.ind} size={24}/>
            <span style={{fontSize:12,color:T.b600,fontWeight:500}}>{task.assignedTo}</span>
          </div>
          <span style={{fontSize:11.5,fontFamily:MONO,color:T.b400,background:T.indBg,border:`1px solid ${T.indBorder}`,borderRadius:6,padding:'2px 8px'}}>{reqTotal} req</span>
        </div>
      </div>
    </Card>
  );
};

/* ─── TASK DETAIL DRAWER ─────────────────────────────────────────── */
const TaskDrawer = ({task,onClose,onUpdateTask,onExport,employees,toast}) => {
  const [activeTab,setActiveTab] = useState('overview');
  const [editField,setEditField] = useState(null);
  const [form,setForm] = useState(task?{...task}:null);

  if(!task||!form) return null;
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=()=>{onUpdateTask(form);toast('Task updated');};

  const st = STATUS[form.status];
  const pr = PRIORITY[form.priority];

  const TABS = [{id:'overview',label:'Overview'},{id:'requirements',label:`Requirements (${form.requirements.length})`},{id:'files',label:'Files'}];

  const allFiles = form.requirements.flatMap(r=>r.files.map(f=>({file:f,reqTitle:r.title,reqId:r.id})));

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.4)',zIndex:300,backdropFilter:'blur(3px)'}}/>
      <div className="slide-in" style={{position:'fixed',right:0,top:0,bottom:0,width:620,background:'#fff',borderLeft:`1px solid ${T.b200}`,zIndex:301,display:'flex',flexDirection:'column',boxShadow:'-16px 0 60px rgba(0,0,0,0.12)'}}>
        {/* Header */}
        <div style={{padding:'20px 24px',borderBottom:`1px solid ${T.b200}`,flexShrink:0,background:T.b900}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontFamily:MONO,fontWeight:600,color:'rgba(255,255,255,0.4)',background:'rgba(255,255,255,0.08)',padding:'2px 9px',borderRadius:20}}>TASK</span>
                <Badge map={STATUS} val={form.status} small/>
                <Badge map={PRIORITY} val={form.priority} small/>
              </div>
              <div style={{fontSize:18,fontWeight:800,color:'#f8fafc',lineHeight:1.3}}>{form.title}</div>
            </div>
            <button onClick={()=>{save();onClose();}} style={{width:34,height:34,borderRadius:9,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.08)',cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:17,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Avatar name={form.assignedTo} color={INIT_EMPLOYEES.find(e=>e.name===form.assignedTo)?.color} size={26}/>
            <span style={{fontSize:12.5,color:'rgba(255,255,255,0.6)',fontWeight:500}}>{form.assignedTo}</span>
            {form.dueDate&&<span style={{fontSize:12,fontFamily:MONO,color:'rgba(255,255,255,0.4)',marginLeft:'auto'}}>📅 {fmtDate(form.dueDate)}</span>}
          </div>
        </div>
        {/* Tabs */}
        <div style={{display:'flex',borderBottom:`1px solid ${T.b200}`,flexShrink:0,background:'#fff'}}>
          {TABS.map(tab=>(
            <div key={tab.id} onClick={()=>setActiveTab(tab.id)}
              style={{padding:'12px 20px',fontSize:13,fontWeight:600,cursor:'pointer',color:activeTab===tab.id?T.ind:T.b600,borderBottom:activeTab===tab.id?`2px solid ${T.ind}`:'2px solid transparent',transition:'all .15s',background:'#fff'}}>
              {tab.label}
            </div>
          ))}
        </div>
        {/* Body */}
        <div style={{flex:1,overflowY:'auto'}}>
          {activeTab==='overview'&&(
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:18}}>
              <Card style={{padding:'16px 18px'}}>
                <div style={{fontSize:11,fontWeight:700,fontFamily:MONO,color:T.b400,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:8}}>Description</div>
                <Textarea value={form.description} onChange={v=>set('description',v)} placeholder="Task description…" rows={3}/>
              </Card>
              <Card style={{padding:'16px 18px'}}>
                <div style={{fontSize:11,fontWeight:700,fontFamily:MONO,color:T.b400,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:12}}>Task Details</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <Select label="Status" value={form.status} onChange={v=>set('status',v)} options={Object.entries(STATUS).map(([k,v])=>([k,`${v.icon} ${v.label}`]))}/>
                  <Select label="Priority" value={form.priority} onChange={v=>set('priority',v)} options={[['high','▲ High'],['medium','◆ Medium'],['low','▽ Low']]}/>
                  <Select label="Assigned To" value={form.assignedTo} onChange={v=>set('assignedTo',v)} options={INIT_EMPLOYEES.map(e=>([e.name,`${e.name} (${e.role})`]))}/>
                  <Input label="Due Date" value={form.dueDate} onChange={v=>set('dueDate',v)} type="date"/>
                </div>
              </Card>
              <div style={{display:'flex',gap:10}}>
                <Btn variant="primary" onClick={save} style={{flex:1}}>✓ Save Changes</Btn>
                <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
              </div>
            </div>
          )}
          {activeTab==='requirements'&&(
            <RequirementsPanel task={form} show={true}
              onUpdate={updated=>{setForm(updated);onUpdateTask(updated);}}
              onExport={onExport} toast={toast}/>
          )}
          {activeTab==='files'&&(
            <div style={{padding:24}}>
              <div style={{fontSize:14,fontWeight:700,color:T.b900,marginBottom:16}}>All Attached Files <span style={{fontSize:12,color:T.b400,fontWeight:500,fontFamily:MONO}}>({allFiles.length} files)</span></div>
              {allFiles.length===0&&<div style={{textAlign:'center',padding:40,color:T.b400}}><div style={{fontSize:36,marginBottom:8,opacity:.4}}>📁</div><div style={{fontSize:13}}>No files attached yet</div></div>}
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {allFiles.map((f,i)=>(
                  <Card key={i} style={{padding:'11px 14px',display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:20}}>{fileIcon(f.file)}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.b900}}>{f.file}</div>
                      <div style={{fontSize:11,color:T.b400,fontFamily:MONO}}>From: {f.reqTitle}</div>
                    </div>
                    <span style={{fontSize:11,color:T.ind,background:T.indBg,border:`1px solid ${T.indBorder}`,borderRadius:6,padding:'2px 8px',fontFamily:MONO,cursor:'pointer'}}>⬇ Download</span>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ─── ADD CLIENT MODAL ───────────────────────────────────────────── */
const AddClientModal = ({open,onClose,onAdd}) => {
  const [form,setForm] = useState({name:'',company:'',email:'',phone:'',industry:''});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=()=>{
    if(!form.name.trim()){return;}
    onAdd({...form,id:Date.now(),color:CLIENT_COLORS[Math.floor(Math.random()*CLIENT_COLORS.length)],projects:[]});
    onClose();setForm({name:'',company:'',email:'',phone:'',industry:''});
  };
  return (
    <Modal open={open} onClose={onClose} title="➕ Add New Client">
      <div style={{padding:24,display:'flex',flexDirection:'column',gap:14}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Input label="Client Name *" value={form.name} onChange={v=>set('name',v)} placeholder="e.g. Lixil Window Systems" required/>
          <Input label="Company" value={form.company} onChange={v=>set('company',v)} placeholder="Full company name"/>
          <Input label="Email" value={form.email} onChange={v=>set('email',v)} placeholder="contact@company.com" type="email"/>
          <Input label="Phone" value={form.phone} onChange={v=>set('phone',v)} placeholder="+91 98765 43210"/>
          <div style={{gridColumn:'1/-1'}}>
            <Select label="Industry" value={form.industry} onChange={v=>set('industry',v)} options={[['','— Select Industry —'],['Manufacturing','Manufacturing'],['Technology','Technology'],['Retail','Retail'],['Finance','Finance'],['Healthcare','Healthcare'],['Real Estate','Real Estate'],['Other','Other']]}/>
          </div>
        </div>
      </div>
      <div style={{padding:'0 24px 24px',display:'flex',gap:10,justifyContent:'flex-end'}}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>Create Client →</Btn>
      </div>
    </Modal>
  );
};

/* ─── ADD PROJECT / TASK MODALS ──────────────────────────────────── */
const AddProjectModal = ({open,onClose,onAdd,employees}) => {
  const [form,setForm] = useState({name:'',description:'',priority:'medium',startDate:'',dueDate:'',assignedTo:'',role:'Manager',budget:''});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=()=>{
    if(!form.name.trim()) return;
    onAdd({...form,id:'p'+Date.now(),status:'gathering',tasks:[]});
    onClose();setForm({name:'',description:'',priority:'medium',startDate:'',dueDate:'',assignedTo:'',role:'Manager',budget:''});
  };
  return (
    <Modal open={open} onClose={onClose} title="📁 New Project">
      <div style={{padding:24,display:'flex',flexDirection:'column',gap:12}}>
        <Input label="Project Name *" value={form.name} onChange={v=>set('name',v)} placeholder="e.g. HR Audit FY2025" required/>
        <Textarea label="Description" value={form.description} onChange={v=>set('description',v)} placeholder="Project scope and objectives…" rows={2}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Select label="Priority" value={form.priority} onChange={v=>set('priority',v)} options={[['high','▲ High'],['medium','◆ Medium'],['low','▽ Low']]}/>
          <Input label="Budget" value={form.budget} onChange={v=>set('budget',v)} placeholder="₹2,50,000"/>
          <Input label="Start Date" value={form.startDate} onChange={v=>set('startDate',v)} type="date"/>
          <Input label="Due Date" value={form.dueDate} onChange={v=>set('dueDate',v)} type="date"/>
          <Select label="Assign To" value={form.assignedTo} onChange={v=>set('assignedTo',v)} options={[['','— Select —'],...employees.map(e=>([e.name,`${e.name} (${e.role})`]))]}/>
          <Select label="Role" value={form.role} onChange={v=>set('role',v)} options={ROLES.map(r=>([r,r]))}/>
        </div>
      </div>
      <div style={{padding:'0 24px 24px',display:'flex',gap:10,justifyContent:'flex-end'}}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>Create Project →</Btn>
      </div>
    </Modal>
  );
};

const AddTaskModal = ({open,onClose,onAdd,employees}) => {
  const [form,setForm] = useState({title:'',description:'',priority:'medium',dueDate:'',assignedTo:''});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=()=>{
    if(!form.title.trim()) return;
    onAdd({...form,id:'t'+Date.now(),status:'gathering',requirements:[],createdAt:today()});
    onClose();setForm({title:'',description:'',priority:'medium',dueDate:'',assignedTo:''});
  };
  return (
    <Modal open={open} onClose={onClose} title="✅ New Task">
      <div style={{padding:24,display:'flex',flexDirection:'column',gap:12}}>
        <Input label="Task Title *" value={form.title} onChange={v=>set('title',v)} placeholder="e.g. Policy Documentation Review" required/>
        <Textarea label="Description" value={form.description} onChange={v=>set('description',v)} placeholder="What needs to be done…" rows={3}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Select label="Priority" value={form.priority} onChange={v=>set('priority',v)} options={[['high','▲ High'],['medium','◆ Medium'],['low','▽ Low']]}/>
          <Input label="Due Date" value={form.dueDate} onChange={v=>set('dueDate',v)} type="date"/>
          <div style={{gridColumn:'1/-1'}}>
            <Select label="Assign To" value={form.assignedTo} onChange={v=>set('assignedTo',v)} options={[['','— Select Employee —'],...employees.map(e=>([e.name,`${e.name} (${e.role})`]))]}/>
          </div>
        </div>
      </div>
      <div style={{padding:'0 24px 24px',display:'flex',gap:10,justifyContent:'flex-end'}}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>Create Task →</Btn>
      </div>
    </Modal>
  );
};

/* ─── EXPORT TO CSV ──────────────────────────────────────────────── */
const exportTaskRequirements = (task, clientName, projectName) => {
  let csv = `ClientFlow - Requirements Export\n`;
  csv += `Client: ${clientName}\nProject: ${projectName}\nTask: ${task.title}\nExported: ${new Date().toLocaleString()}\n\n`;
  csv += `"Req No","Title","Description","Priority","Due Date","Internal Notes","Files Attached","Created At"\n`;
  task.requirements.forEach((r,i)=>{
    csv += `"REQ-${String(i+1).padStart(2,'0')}","${r.title.replace(/"/g,'""')}","${(r.desc||'').replace(/"/g,'""')}","${r.priority}","${r.due||''}","${(r.notes||'').replace(/"/g,'""')}","${r.files.join('; ')}","${r.createdAt}"\n`;
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download = `Requirements_${task.title.replace(/ /g,'_')}.csv`;
  a.click(); URL.revokeObjectURL(a.href);
};

/* ─── MAIN APP ───────────────────────────────────────────────────── */
export default function ClientFlow() {
  const [clients, setClients] = useState(INIT_CLIENTS);
  const [employees] = useState(INIT_EMPLOYEES);
  const [view, setView] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [openTask, setOpenTask] = useState(null);
  const [modals, setModals] = useState({addClient:false,addProject:false,addTask:false});
  const {toasts,show:toast} = useToast();

  const openModal  = k => setModals(m=>({...m,[k]:true}));
  const closeModal = k => setModals(m=>({...m,[k]:false}));

  const selectedClient  = clients.find(c=>c.id===selectedClientId);
  const selectedProject = selectedClient?.projects.find(p=>p.id===selectedProjectId);

  /* mutations */
  const updateClients = fn => setClients(fn);

  const addClient = (client) => { updateClients(cs=>[client,...cs]); toast('Client added!'); };

  const addProject = (proj) => {
    updateClients(cs=>cs.map(c=>c.id===selectedClientId?{...c,projects:[proj,...c.projects]}:c));
    toast('Project created!'); closeModal('addProject');
  };

  const addTask = (task) => {
    updateClients(cs=>cs.map(c=>c.id===selectedClientId?{...c,projects:c.projects.map(p=>p.id===selectedProjectId?{...p,tasks:[task,...p.tasks]}:p)}:c));
    toast('Task created!'); closeModal('addTask');
  };

  const updateTask = (updatedTask) => {
    updateClients(cs=>cs.map(c=>({...c,projects:c.projects.map(p=>({...p,tasks:p.tasks.map(t=>t.id===updatedTask.id?updatedTask:t)}))})));
    if(openTask?.id===updatedTask.id) setOpenTask(updatedTask);
  };

  const changeTaskStatus = (taskId, status) => {
    updateClients(cs=>cs.map(c=>({...c,projects:c.projects.map(p=>({...p,tasks:p.tasks.map(t=>t.id===taskId?{...t,status}:t)}))})));
  };

  /* derived stats */
  const allTasks = clients.flatMap(c=>c.projects.flatMap(p=>p.tasks));
  const allReqs  = allTasks.flatMap(t=>t.requirements);
  const byStatus = k => allTasks.filter(t=>t.status===k).length;

  const topbarStyle = {
    display:'flex',alignItems:'center',gap:14,padding:'14px 24px',
    borderBottom:`1px solid ${T.b200}`,background:'#fff',flexShrink:0,
    boxShadow:'0 1px 3px rgba(0,0,0,0.04)'
  };

  /* ── DASHBOARD ── */
  const DashboardView = () => (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      <div style={topbarStyle}>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:800,color:T.b900}}>Dashboard <span style={{color:T.ind,fontWeight:400,fontSize:16}}>Overview</span></div>
          <div style={{fontSize:12,color:T.b400,marginTop:2,fontFamily:MONO}}>{clients.length} clients · {allTasks.length} tasks · {allReqs.length} requirements</div>
        </div>
        <Btn variant="primary" onClick={()=>openModal('addClient')}>＋ Add Client</Btn>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'24px'}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:28}}>
          <StatCard icon="👥" value={clients.length} label="Total Clients" sub={`${clients.flatMap(c=>c.projects).length} projects`} accent={T.ind}/>
          <StatCard icon="📋" value={byStatus('gathering')} label="Req. Gathering" sub="Collecting data" accent={T.gathering}/>
          <StatCard icon="⚡" value={byStatus('inprog')} label="In Progress" sub="Active work" accent={T.inprog}/>
          <StatCard icon="🔍" value={byStatus('review')} label="Under Review" sub="Needs approval" accent={T.review}/>
          <StatCard icon="✅" value={byStatus('done')} label="Completed" sub="All done" accent={T.done}/>
        </div>

        {/* Clients grid */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:800,color:T.b900}}>All Clients</div>
          <Btn size="sm" variant="ghost" onClick={()=>setView('clients')} style={{color:T.b600,borderColor:T.b200}}>View All →</Btn>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
          {clients.map(c=>{
            const tasks=c.projects.flatMap(p=>p.tasks);
            const done=tasks.filter(t=>t.status==='done').length;
            const pct=tasks.length?Math.round(done/tasks.length*100):0;
            const reqs=tasks.flatMap(t=>t.requirements).length;
            return (
              <div key={c.id}
                style={{background:'#fff',border:`1px solid ${T.b200}`,borderRadius:14,overflow:'hidden',cursor:'pointer',transition:'all .2s',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}
                onClick={()=>{setSelectedClientId(c.id);setView('client');}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.borderColor=c.color+'55';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor=T.b200;}}>
                <div style={{height:4,background:`linear-gradient(90deg,${c.color},${c.color}88)`}}/>
                <div style={{padding:18}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                    <div style={{width:44,height:44,borderRadius:12,background:c.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:800,color:'#fff',fontFamily:MONO,flexShrink:0}}>{initials(c.name)}</div>
                    <div>
                      <div style={{fontSize:15,fontWeight:800,color:T.b900}}>{c.name}</div>
                      <div style={{fontSize:12,color:T.b400}}>{c.company} · {c.industry}</div>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
                    {[{v:c.projects.length,l:'Projects'},{v:tasks.length,l:'Tasks'},{v:reqs,l:'Requirements'}].map(({v,l})=>(
                      <div key={l} style={{textAlign:'center',background:'#f8fafc',borderRadius:9,padding:'8px 4px',border:`1px solid ${T.b200}`}}>
                        <div style={{fontSize:18,fontWeight:800,color:T.b900,fontFamily:MONO}}>{v}</div>
                        <div style={{fontSize:10.5,color:T.b400,fontWeight:500}}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{flex:1,height:5,background:T.b200,borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',background:`linear-gradient(90deg,${c.color},${c.color}cc)`,width:`${pct}%`,borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:12,fontFamily:MONO,fontWeight:700,color:c.color,minWidth:36}}>{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Tasks */}
        <div style={{marginTop:32}}>
          <div style={{fontSize:16,fontWeight:800,color:T.b900,marginBottom:16}}>Recent Tasks — Requirement Gathering</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {allTasks.filter(t=>t.status==='gathering').slice(0,5).map(t=>{
              const client=clients.find(c=>c.projects.some(p=>p.tasks.some(tt=>tt.id===t.id)));
              return (
                <div key={t.id}
                  style={{background:'#fff',border:`1px solid ${T.b200}`,borderRadius:12,padding:'12px 16px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',transition:'all .15s'}}
                  onClick={()=>setOpenTask(t)}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=T.indBorder}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=T.b200}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:STATUS.gathering.dot,flexShrink:0,animation:'pulse 2s infinite'}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13.5,fontWeight:700,color:T.b900}}>{t.title}</div>
                    <div style={{fontSize:11.5,color:T.b400,fontFamily:MONO}}>{client?.name} · {t.requirements.length} req collected</div>
                  </div>
                  <Badge map={PRIORITY} val={t.priority} small/>
                  <Avatar name={t.assignedTo} color={INIT_EMPLOYEES.find(e=>e.name===t.assignedTo)?.color} size={26}/>
                </div>
              );
            })}
            {allTasks.filter(t=>t.status==='gathering').length===0&&(
              <div style={{textAlign:'center',padding:32,color:T.b400,background:'#fff',borderRadius:14,border:`1px solid ${T.b200}`}}>
                <div style={{fontSize:28,marginBottom:8,opacity:.4}}>✅</div>
                <div style={{fontSize:13}}>No tasks in requirement gathering phase</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── CLIENT VIEW ── */
  const ClientView = () => {
    if(!selectedClient) return null;
    const totalTasks=selectedClient.projects.flatMap(p=>p.tasks);
    return (
      <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
        <div style={topbarStyle}>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:T.b400,fontFamily:MONO}}>
            <span onClick={()=>{setView('dashboard');setSelectedClientId(null);}} style={{color:T.ind,cursor:'pointer'}}>Dashboard</span>
            <span>/</span>
            <span onClick={()=>{setView('clients');setSelectedClientId(null);}} style={{color:T.ind,cursor:'pointer'}}>All Clients</span>
            <span>/</span><span style={{color:T.b900,fontWeight:600}}>{selectedClient.name}</span>
          </div>
          <div style={{display:'flex',gap:8,marginLeft:'auto'}}>
            <Btn variant="ghost" size="sm" onClick={()=>openModal('addProject')} style={{color:T.b600,borderColor:T.b200}}>＋ Add Project</Btn>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:24}}>
          {/* Client header */}
          <Card style={{padding:24,marginBottom:24,background:`linear-gradient(135deg,${T.b900},${T.b800})`,border:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:56,height:56,borderRadius:14,background:selectedClient.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,color:'#fff',fontFamily:MONO}}>{initials(selectedClient.name)}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:22,fontWeight:800,color:'#f8fafc'}}>{selectedClient.name}</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:3}}>{selectedClient.company} · {selectedClient.industry}</div>
                <div style={{display:'flex',gap:16,marginTop:8}}>
                  {[['📧',selectedClient.email],['📞',selectedClient.phone]].map(([icon,val])=>val&&(
                    <span key={val} style={{fontSize:12,color:'rgba(255,255,255,0.45)',display:'flex',alignItems:'center',gap:5}}>{icon}{val}</span>
                  ))}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,textAlign:'center'}}>
                {[{v:selectedClient.projects.length,l:'Projects'},{v:totalTasks.length,l:'Tasks'},{v:totalTasks.flatMap(t=>t.requirements).length,l:'Requirements'}].map(({v,l})=>(
                  <div key={l} style={{background:'rgba(255,255,255,0.07)',borderRadius:10,padding:'10px 16px'}}>
                    <div style={{fontSize:22,fontWeight:800,color:'#f8fafc',fontFamily:MONO}}>{v}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Projects */}
          {selectedClient.projects.map(proj=>{
            const isOpen = selectedProjectId===proj.id;
            const derivedStatus = computeProjectStatus(proj.tasks);
            const st = STATUS[derivedStatus];
            // Progress bar from tasks
            const doneTasks = proj.tasks.filter(t=>t.status==='done').length;
            const totalTsk  = proj.tasks.length;
            const pct = totalTsk ? Math.round(doneTasks/totalTsk*100) : 0;
            return (
              <Card key={proj.id} style={{marginBottom:16,overflow:'hidden'}}>
                <div style={{padding:'14px 20px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:isOpen?T.indBg:'#fff',borderBottom:isOpen?`1px solid ${T.indBorder}`:'none',transition:'all .15s'}}
                  onClick={()=>setSelectedProjectId(isOpen?null:proj.id)}>
                  <div style={{width:36,height:36,borderRadius:9,background:isOpen?T.ind:(T.b200),display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:isOpen?'#fff':(T.b400),transition:'all .2s',flexShrink:0}}>📁</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:800,color:isOpen?T.ind:(T.b900)}}>{proj.name}</div>
                    <div style={{fontSize:12,color:T.b400,marginTop:2,fontFamily:MONO}}>{proj.tasks.length} tasks · Due {fmtDate(proj.dueDate)}</div>
                  </div>
                  {/* AUTO-COMPUTED status badge */}
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0}}>
                    <Badge map={STATUS} val={derivedStatus} small/>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:72,height:4,background:T.b200,borderRadius:2,overflow:'hidden'}}>
                        <div style={{height:'100%',background:st?.color||T.ind,width:`${pct}%`,borderRadius:2,transition:'width .5s'}}/>
                      </div>
                      <span style={{fontSize:10.5,fontFamily:MONO,fontWeight:600,color:st?.color||T.b400,minWidth:28}}>{pct}%</span>
                    </div>
                  </div>
                  <Badge map={PRIORITY} val={proj.priority} small/>
                  {proj.budget&&<Pill color={T.done} bg={T.doneBg} border={T.doneBorder}>{proj.budget}</Pill>}
                  <span style={{fontSize:18,color:T.b400,transition:'transform .2s',transform:isOpen?'rotate(90deg)':'none',flexShrink:0}}>›</span>
                </div>
                {isOpen&&(
                  <div className="fade-up" style={{padding:'16px 20px',background:'#fafbfc'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                      <div style={{fontSize:13,color:T.b400}}>{proj.description}</div>
                      <Btn size="sm" variant="primary" onClick={()=>openModal('addTask')}>＋ Add Task</Btn>
                    </div>
                    {proj.tasks.length===0&&(
                      <div style={{textAlign:'center',padding:'32px',color:T.b400,background:T.b100,borderRadius:12,border:`1px solid ${T.b200}`}}>
                        <div style={{fontSize:28,marginBottom:8,opacity:.4}}>📝</div>
                        <div style={{fontSize:13}}>No tasks yet. Add the first task for this project.</div>
                      </div>
                    )}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
                      {proj.tasks.map(task=>(
                        <TaskCard key={task.id} task={task}
                          onOpen={t=>{setOpenTask(t);}}
                          onStatusChange={(id,status)=>{changeTaskStatus(id,status);toast(`Status updated to ${STATUS[status]?.label}`);}}/>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
          {selectedClient.projects.length===0&&(
            <div style={{textAlign:'center',padding:48,color:T.b400,background:'#fff',borderRadius:14,border:`2px dashed ${T.b200}`}}>
              <div style={{fontSize:36,marginBottom:10,opacity:.3}}>📁</div>
              <div style={{fontSize:15,fontWeight:700,color:T.b600,marginBottom:4}}>No Projects Yet</div>
              <div style={{fontSize:13,marginBottom:16}}>Create the first project for {selectedClient.name}</div>
              <Btn variant="primary" onClick={()=>openModal('addProject')}>＋ Create First Project</Btn>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── ALL CLIENTS VIEW ── */
  const AllClientsView = () => {
    const [search,setSearch] = useState('');
    const filtered = clients.filter(c=>
      c.name.toLowerCase().includes(search.toLowerCase())||
      c.company.toLowerCase().includes(search.toLowerCase())||
      (c.industry||'').toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
        <div style={topbarStyle}>
          <div style={{flex:1}}>
            <div style={{fontSize:20,fontWeight:800,color:T.b900}}>All <span style={{color:T.ind}}>Clients</span></div>
            <div style={{fontSize:12,color:T.b400,marginTop:2,fontFamily:MONO}}>{clients.length} clients · {clients.flatMap(c=>c.projects).length} projects total</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f1f5f9',border:`1px solid ${T.b200}`,borderRadius:9,padding:'7px 13px'}}>
            <span style={{color:T.b400,fontSize:15}}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients…"
              style={{background:'none',border:'none',outline:'none',color:T.b900,fontSize:13,fontFamily:SANS,width:160}}/>
          </div>
          <Btn variant="primary" onClick={()=>openModal('addClient')}>＋ Add Client</Btn>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:24}}>
          {filtered.length===0&&(
            <div style={{textAlign:'center',padding:60,color:T.b400}}>
              <div style={{fontSize:40,marginBottom:10,opacity:.3}}>👥</div>
              <div style={{fontSize:15,fontWeight:700,color:T.b600,marginBottom:4}}>No clients found</div>
              <div style={{fontSize:13}}>Try a different search or add a new client</div>
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:18}}>
            {filtered.map(c=>{
              const tasks   = c.projects.flatMap(p=>p.tasks);
              const done    = tasks.filter(t=>t.status==='done').length;
              const pct     = tasks.length ? Math.round(done/tasks.length*100) : 0;
              const reqs    = tasks.flatMap(t=>t.requirements).length;
              const projStatus = c.projects.map(p=>computeProjectStatus(p.tasks));
              const onHold  = projStatus.filter(s=>s==='hold').length;
              const inProg  = projStatus.filter(s=>s==='inprog'||s==='review').length;
              const allDone = projStatus.length>0 && projStatus.every(s=>s==='done');
              const overallColor = allDone ? T.done : onHold>0 ? T.hold : inProg>0 ? T.inprog : T.gathering;
              const overallLabel = allDone ? 'All Done' : onHold>0 ? 'On Hold' : inProg>0 ? 'Active' : 'Gathering';
              return (
                <div key={c.id}
                  style={{background:'#fff',border:`1px solid ${T.b200}`,borderRadius:16,overflow:'hidden',cursor:'pointer',transition:'all .25s',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}
                  onClick={()=>{setSelectedClientId(c.id);setView('client');}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)';e.currentTarget.style.borderColor=c.color+'66';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)';e.currentTarget.style.borderColor=T.b200;}}>
                  {/* Color top bar */}
                  <div style={{height:5,background:`linear-gradient(90deg,${c.color},${c.color}88)`}}/>
                  <div style={{padding:20}}>
                    {/* Header */}
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                      <div style={{width:48,height:48,borderRadius:13,background:c.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#fff',fontFamily:MONO,flexShrink:0}}>{initials(c.name)}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:16,fontWeight:800,color:T.b900,marginBottom:2}}>{c.name}</div>
                        <div style={{fontSize:12,color:T.b400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.company}</div>
                      </div>
                      {/* Overall status pill */}
                      <div style={{background:`${overallColor}18`,color:overallColor,border:`1px solid ${overallColor}44`,borderRadius:20,padding:'4px 11px',fontSize:11,fontWeight:700,fontFamily:MONO,flexShrink:0}}>{overallLabel}</div>
                    </div>
                    {/* Industry tag */}
                    {c.industry&&<div style={{marginBottom:14}}>
                      <Pill color={T.b600} bg={T.b100} border={T.b200}>🏢 {c.industry}</Pill>
                    </div>}
                    {/* Stats grid */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:16}}>
                      {[{v:c.projects.length,l:'Projects',icon:'📁'},{v:tasks.length,l:'Tasks',icon:'✅'},{v:reqs,l:'Requirements',icon:'📋'}].map(({v,l,icon})=>(
                        <div key={l} style={{textAlign:'center',background:'#f8fafc',borderRadius:10,padding:'10px 6px',border:`1px solid ${T.b200}`}}>
                          <div style={{fontSize:8,marginBottom:3,opacity:.6}}>{icon}</div>
                          <div style={{fontSize:20,fontWeight:800,color:T.b900,fontFamily:MONO,lineHeight:1}}>{v}</div>
                          <div style={{fontSize:10,color:T.b400,marginTop:3,fontWeight:500}}>{l}</div>
                        </div>
                      ))}
                    </div>
                    {/* Per-project status strip */}
                    {c.projects.length>0&&(
                      <div style={{marginBottom:14}}>
                        <div style={{fontSize:10.5,color:T.b400,fontFamily:MONO,marginBottom:6,fontWeight:600}}>PROJECTS STATUS</div>
                        <div style={{display:'flex',flexDirection:'column',gap:5}}>
                          {c.projects.map(p=>{
                            const ps = computeProjectStatus(p.tasks);
                            const psSt = STATUS[ps];
                            const psDone = p.tasks.filter(t=>t.status==='done').length;
                            const psPct  = p.tasks.length ? Math.round(psDone/p.tasks.length*100) : 0;
                            return (
                              <div key={p.id} style={{display:'flex',alignItems:'center',gap:8}}>
                                <span style={{fontSize:11.5,color:T.b700,fontWeight:500,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:130}}>{p.name}</span>
                                <div style={{width:50,height:4,background:T.b200,borderRadius:2,overflow:'hidden',flexShrink:0}}>
                                  <div style={{height:'100%',background:psSt?.color||T.ind,width:`${psPct}%`,borderRadius:2}}/>
                                </div>
                                <span style={{fontSize:9.5,color:psSt?.color,fontFamily:MONO,fontWeight:700,minWidth:24,textAlign:'right'}}>{psPct}%</span>
                                <span style={{width:8,height:8,borderRadius:'50%',background:psSt?.color,flexShrink:0,display:'inline-block'}}/>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {/* Overall progress bar */}
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{flex:1,height:6,background:T.b200,borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',background:`linear-gradient(90deg,${c.color},${c.color}cc)`,width:`${pct}%`,borderRadius:3,transition:'width .5s'}}/>
                      </div>
                      <span style={{fontSize:12,fontFamily:MONO,fontWeight:800,color:c.color,minWidth:36}}>{pct}%</span>
                    </div>
                    {/* Contact */}
                    <div style={{display:'flex',gap:14,marginTop:12,paddingTop:12,borderTop:`1px solid ${T.b200}`}}>
                      {c.email&&<span style={{fontSize:11,color:T.b400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>📧 {c.email}</span>}
                      {c.phone&&<span style={{fontSize:11,color:T.b400,flexShrink:0}}>📞 {c.phone}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /* ── MY TASKS VIEW ── */
  const MyTasksView = () => {
    const gathering = allTasks.filter(t=>t.status==='gathering');
    const inprog    = allTasks.filter(t=>t.status==='inprog');
    return (
      <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
        <div style={topbarStyle}>
          <div style={{flex:1,fontSize:20,fontWeight:800,color:T.b900}}>My Tasks <span style={{color:T.ind,fontWeight:400,fontSize:16}}>— Requirement Gathering</span></div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:24}}>
          {[{label:'📋 Pending Requirements',tasks:gathering,color:T.gathering},{label:'⚡ In Progress',tasks:inprog,color:T.inprog}].map(({label,tasks,color})=>(
            <div key={label} style={{marginBottom:28}}>
              <div style={{fontSize:14,fontWeight:800,color:T.b900,marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
                {label}<span style={{fontSize:12,background:`${color}22`,color,border:`1px solid ${color}44`,borderRadius:20,padding:'2px 10px',fontFamily:MONO,fontWeight:600}}>{tasks.length}</span>
              </div>
              {tasks.length===0&&<div style={{fontSize:13,color:T.b400,padding:'20px',background:'#fff',borderRadius:12,border:`1px solid ${T.b200}`,textAlign:'center'}}>No tasks in this status</div>}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
                {tasks.map(t=>{
                  const client=clients.find(c=>c.projects.some(p=>p.tasks.some(tt=>tt.id===t.id)));
                  return <TaskCard key={t.id} task={{...t,_clientName:client?.name}} onOpen={setOpenTask} onStatusChange={(id,status)=>{changeTaskStatus(id,status);toast(`Status → ${STATUS[status]?.label}`);}}/>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getTaskContext = (taskId) => {
    for(const c of clients) for(const p of c.projects) for(const t of p.tasks) if(t.id===taskId) return {client:c,project:p};
    return {};
  };

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:T.b100,fontFamily:SANS}}>
      <GlobalStyles/>
      <Sidebar view={view} setView={setView} clients={clients} selectedClientId={selectedClientId}
        onSelectClient={id=>{setSelectedClientId(id);if(id)setView('client');}}/>

      <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {view==='dashboard' && !selectedClientId && <DashboardView/>}
        {view==='clients'   && !selectedClientId && <AllClientsView/>}
        {view==='mytasks'   && !selectedClientId && <MyTasksView/>}
        {(view==='client'   &&  selectedClientId) && <ClientView/>}
        {selectedClientId   && view!=='client'   && <ClientView/>}
      </main>

      {/* Task Detail Drawer */}
      {openTask&&(()=>{
        const ctx = getTaskContext(openTask.id);
        return <TaskDrawer task={openTask} employees={employees} toast={toast}
          onClose={()=>setOpenTask(null)}
          onUpdateTask={updateTask}
          onExport={t=>{ exportTaskRequirements(t, ctx.client?.name||'', ctx.project?.name||''); toast('Requirements exported to Excel!'); }}/>;
      })()}

      {/* Modals */}
      <AddClientModal  open={modals.addClient}  onClose={()=>closeModal('addClient')}  onAdd={c=>{addClient(c);closeModal('addClient');}}/>
      <AddProjectModal open={modals.addProject} onClose={()=>closeModal('addProject')} onAdd={addProject} employees={employees}/>
      <AddTaskModal    open={modals.addTask}    onClose={()=>closeModal('addTask')}    onAdd={addTask}    employees={employees}/>
      <ToastList toasts={toasts}/>
    </div>
  );
}
