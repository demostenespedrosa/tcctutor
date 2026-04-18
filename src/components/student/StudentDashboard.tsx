import * as React from "react";
import { useState } from "react";
import { useStore } from "../../store";
import { GuidedTrail } from "./GuidedTrail";
import { KanbanBoard } from "./KanbanBoard";
import { LogOut, Copy, CheckCircle2 } from "lucide-react";

export function StudentDashboard() {
  const { currentUser, projects, logout } = useStore();
  const [tab, setTab] = useState<'TRAIL' | 'KANBAN'>('TRAIL');
  const [copied, setCopied] = useState(false);
  
  if (!currentUser?.projectId) return null;
  const project = projects[currentUser.projectId];
  
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white font-medium">
        Carregando informações do projeto...
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(project.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phaseStatus = (phaseNum: 1|2|3|4|5|6|7|8) => project.phases?.[phaseNum]?.status || 'LOCKED';
  
  const allPhases = [
    { num: "01", label: "Concepção & Negócio", n: 1 },
    { num: "02", label: "SAD P1: Atores", n: 2 },
    { num: "03", label: "SAD P2: Requisitos", n: 3 },
    { num: "04", label: "SAD P3: Arquitetura", n: 4 },
    { num: "05", label: "SAD P4: Componentes", n: 5 },
    { num: "06", label: "SAD P5: Infraestrutura", n: 6 },
    { num: "07", label: "Qualidade (QA)", n: 7 },
    { num: "08", label: "Docs de Entrega", n: 8 },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans text-slate-800">
      <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col p-6 shrink-0 z-10 overflow-y-auto hidden md:flex">
        <div className="font-extrabold text-xl text-blue-600 tracking-tight mb-10 flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
          TutorTCC
        </div>
        
        <nav className="mb-8">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-4">Documentação Progressiva</div>
          
          <div className="flex flex-col gap-0 relative">
            {allPhases.map((phase, idx) => {
              const num = phase.n as 1|2|3|4|5|6|7|8;
              const prevApproved = num === 1 || phaseStatus((num - 1) as 1|2|3|4|5|6|7|8) === 'APPROVED';
              return (
                <PhaseItem 
                  key={`phase-${num}`}
                  num={phase.num} 
                  label={phase.label} 
                  status={phaseStatus(num)} 
                  active={tab === 'TRAIL' && prevApproved} 
                  onClick={() => setTab('TRAIL')} 
                  hasLine={idx !== allPhases.length - 1} 
                />
              )
            })}
          </div>
        </nav>

        <nav className="mb-8">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-4">Execução</div>
          <div 
            className={`flex items-center gap-3 py-2.5 text-sm font-medium relative cursor-pointer ${tab === 'KANBAN' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setTab('KANBAN')}
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${tab === 'KANBAN' ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'}`}></div>
            Quadro Kanban
            {phaseStatus(3) !== 'APPROVED' && <span className="ml-auto px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded">Lock</span>}
          </div>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-slate-100">
           <button onClick={logout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 font-medium transition-colors">
             <LogOut className="w-4 h-4" /> Sair do Sistema
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 px-8 lg:px-12 flex items-center justify-between border-b border-slate-200/60 bg-white/50 backdrop-blur-md shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div>
            <h2 className="m-0 text-xl font-extrabold text-slate-800 tracking-tight">
              {project.name}
            </h2>
            <p className="text-xs text-slate-400 font-medium tracking-wide">TRILHA DO ESTUDANTE</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50">
              <div className="flex -space-x-2">
                {project.students.map((st, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] text-blue-700 font-bold uppercase ring-1 ring-slate-100 z-10" title={st}>
                    {st.substring(0,2)}
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={handleCopy}
              className="group flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all active:scale-95"
            >
              <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
                <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Token</span>
                <span className="text-sm font-mono font-bold tracking-wider">{project.token}</span>
              </div>
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 bg-[#f8fafc]">
          {tab === 'TRAIL' ? <GuidedTrail projectId={project.id} /> : <KanbanBoard projectId={project.id} />}
        </div>
      </main>
    </div>
  );
}

function PhaseItem({ num, label, status, active, onClick, hasLine }: { num: string, label: string, status: string, active: boolean, onClick: () => void, hasLine?: boolean, key?: React.Key }) {
   const isDone = status === 'APPROVED';
   const isActive = status === 'TODO' || status === 'PENDING' || status === 'REJECTED' || active;
   
   let dotClass = "bg-[#94a3b8]";
   if (isDone) dotClass = "bg-emerald-500";
   else if (isActive) dotClass = "bg-blue-600 ring-4 ring-blue-100";

   let textClass = "text-slate-500 hover:text-slate-700";
   if (isDone) textClass = "text-emerald-700";
   else if (isActive) textClass = "text-blue-700 font-bold bg-blue-50/80 -mx-3 px-3 rounded-lg shadow-sm";

   return (
     <div className={`flex items-start gap-4 py-3 text-[13px] relative group cursor-pointer transition-all ${textClass}`} onClick={onClick}>
       <div className={`w-3 h-3 rounded-full shrink-0 z-10 mt-1 shadow-sm transition-all duration-300 ${dotClass}`}></div>
       {hasLine && <div className={`absolute left-[5.5px] top-[26px] w-[2px] h-[calc(100%+0px)] transition-colors duration-500 ${isDone ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>}
       <span className="flex-1 leading-tight mt-0.5">{label}</span>
       {status === 'PENDING' && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase mt-0.5 shadow-sm">Push</span>}
     </div>
   )
}
