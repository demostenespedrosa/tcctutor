import * as React from "react";
import { useState } from "react";
import { useStore, Project, PhaseStatus } from "../../store";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Badge, Input, Textarea, Label } from "../ui/Input";
import { Button } from "../ui/Button";
import { LayoutDashboard, Inbox, Search, LogOut, CheckCircle2, XCircle, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectDetailsView } from "./ProjectDetailsView";

export function ProfessorWorkspace() {
  const { logout } = useStore();
  const [tab, setTab] = useState<'DASHBOARD' | 'INBOX'>('DASHBOARD');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (selectedProjectId) {
    return <ProjectDetailsView projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-400" />
            TCC Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Professor View</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setTab('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${tab === 'DASHBOARD' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Visão Panóptica
          </button>
          <button 
            onClick={() => setTab('INBOX')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors relative ${tab === 'INBOX' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Inbox className="w-5 h-5" /> Esteira de Aprovação
            <InboxBadge />
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <LogOut className="w-5 h-5" /> Sair do Sistema
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full p-8">
        <div className="max-w-6xl mx-auto">
          {tab === 'DASHBOARD' ? <DashboardView onSelect={setSelectedProjectId} /> : <InboxView />}
        </div>
      </main>
    </div>
  );
}

function InboxBadge() {
  const projects = useStore((state) => state.projects);
  const pendingCount = Object.values(projects).flatMap(p => Object.values(p.phases || {})).filter((ph: any) => ph.status === 'PENDING').length;
  if (!pendingCount) return null;
  return (
    <span className="absolute right-4 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
      {pendingCount}
    </span>
  );
}

function DashboardView({ onSelect }: { onSelect: (id: string) => void }) {
  const projectsRecord = useStore((state) => state.projects);
  const projects = Object.values(projectsRecord);
  const [search, setSearch] = useState("");

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.students.join(' ').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Panóptica</h1>
          <p className="text-slate-500 mt-1">Acompanhe o ritmo e saúde de todos os grupos de TCC.</p>
        </div>
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input 
            placeholder="Buscar grupo ou aluno..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 space-y-4">
        {filtered.map(project => (
          <ProjectRow key={project.id} project={project} onSelect={() => onSelect(project.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            Nenhum projeto encontrado.
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectRow({ project, onSelect }: { project: Project; onSelect: () => void; key?: React.Key }) {
  // Calc Docs
  const approvedPhases = Object.values(project.phases || {}).filter((p: any) => p.status === 'APPROVED').length;
  const docProgress = (approvedPhases / 4) * 100;

  // Calc Kanban
  const totalCards = project.kanban?.length || 0;
  const doneCards = (project.kanban || []).filter(c => c.status === 'DONE').length;
  const blockedCards = (project.kanban || []).filter(c => c.status === 'BLOCKED').length;
  const codeProgress = totalCards > 0 ? (doneCards / totalCards) * 100 : 0;

  return (
    <Card className="hover:border-blue-200 transition-colors">
      <CardContent className="p-5 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-slate-900">{project.name}</h3>
            {blockedCards > 0 && <Badge variant="destructive" className="flex gap-1 py-0"><AlertCircle className="w-3 h-3"/> {blockedCards} Impedimento(s)</Badge>}
          </div>
          <p className="text-sm text-slate-500 mb-4">{project.students.join(', ')}</p>
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Última interação: {formatDistanceToNow(project.lastInteraction, { addSuffix: true, locale: ptBR })}
          </div>
        </div>

        <div className="w-full md:w-56 shrink-0 space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-600">Documentação (Fases)</span>
            <span className="text-slate-900">{docProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${docProgress}%` }} />
          </div>
        </div>

        <div className="w-full md:w-56 shrink-0 space-y-1.5 flex flex-col justify-center">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-600">Código (Kanban)</span>
            <span className="text-slate-900">{totalCards > 0 ? `${doneCards}/${totalCards}` : 'N/A'}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${codeProgress}%` }} />
          </div>
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={onSelect}>Detalhes do Projeto</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InboxView() {
  const projects = useStore((state) => state.projects);
  const evaluatePhase = useStore((state) => state.evaluatePhase);
  const [selectedTask, setSelectedTask] = useState<{ projectId: string, phaseNum: 1 | 2 | 3 | 4 } | null>(null);
  const [feedback, setFeedback] = useState("");

  const pendingTasks: { project: Project, phaseNum: 1 | 2 | 3 | 4, phaseData: any }[] = [];
  Object.values(projects).forEach(p => {
    Object.entries(p.phases).forEach(([numStr, phase]) => {
      if (phase.status === 'PENDING') {
        pendingTasks.push({ project: p, phaseNum: parseInt(numStr) as any, phaseData: phase.data });
      }
    });
  });

  const handleEvaluate = (approved: boolean) => {
    if (selectedTask) {
      evaluatePhase(selectedTask.projectId, selectedTask.phaseNum, approved, feedback);
      setSelectedTask(null);
      setFeedback("");
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-100px)] animate-in fade-in duration-500">
      {/* List */}
      <div className="w-1/3 flex flex-col gap-3 overflow-y-auto pr-2">
         <h2 className="text-xl font-bold text-slate-900 mb-2">Itens para Aprovação</h2>
         {pendingTasks.length === 0 && <p className="text-slate-500 italic">Nenhuma pendência na esteira.</p>}
         {pendingTasks.map((t, idx) => {
            const isSelected = selectedTask?.projectId === t.project.id && selectedTask?.phaseNum === t.phaseNum;
            return (
              <Card 
                key={idx} 
                className={`cursor-pointer transition-colors ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'hover:border-slate-300'}`}
                onClick={() => { setSelectedTask({ projectId: t.project.id, phaseNum: t.phaseNum }); setFeedback(""); }}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{t.project.name}</h4>
                    <p className="text-xs text-slate-500">Fase {t.phaseNum}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </CardContent>
              </Card>
            )
         })}
      </div>

      {/* Detail/Action Panel */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {selectedTask ? (
          <AnimatePresence mode="wait">
            <motion.div key={`${selectedTask.projectId}-${selectedTask.phaseNum}`} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="flex flex-col h-full">
              {(() => {
                const project = projects[selectedTask.projectId];
                const phase = project.phases[selectedTask.phaseNum];
                const phaseTitles = { 1:'Fase 1: Escopo Básico', 2:'Fase 2: Requisitos Funcionais', 3:'Fase 3: Modelagem', 4:'Fase 4: Tecnologias' };
                
                return (
                  <>
                    <div className="p-6 border-b border-slate-100 shrink-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
                          <p className="text-sm text-slate-500 mt-1">{phaseTitles[selectedTask.phaseNum]} • {project.students.join(', ')}</p>
                        </div>
                        <Badge variant="warning">Aguardando Avaliação</Badge>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
                       {selectedTask.phaseNum === 3 && (
                         <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-4">
                           <AlertCircle className="w-5 h-5 shrink-0" />
                           <div>
                             <h4 className="font-bold text-sm">Geração de Kanban - Automação Ativa</h4>
                             <p className="text-sm">Os Requisitos Funcionais desta fase serão extraídos e se tornarão automaticamente Cards na coluna de Backlog do Kanban da equipe quando você clicar em "Aprovar".</p>
                           </div>
                         </div>
                       )}

                       <div className="space-y-6">
                         {Object.keys(phase.data || {}).map((key) => {
                           const value = phase.data[key];
                           if (Array.isArray(value)) {
                             return (
                               <div key={key} className="bg-white p-6 rounded-xl border border-slate-200">
                                 <h3 className="text-lg font-bold text-slate-800 mb-4 capitalize">{key}</h3>
                                 <div className="space-y-4">
                                   {value.map((item, i) => (
                                     <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                                       <span className="text-xs font-mono font-bold text-blue-600 mb-2 block">Item #{i + 1}</span>
                                       {Object.entries(item).filter(([k]) => k !== 'id').map(([k, v]) => (
                                         <div key={k}>
                                           <span className="text-[11px] font-bold text-slate-400 uppercase">{k}</span>
                                           <div className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{String(v)}</div>
                                         </div>
                                       ))}
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             );
                           }
                           
                           return (
                             <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col">
                               <span className="text-[11px] font-bold text-slate-400 uppercase mb-1">{key}</span>
                               <span className="text-sm font-medium text-slate-800 whitespace-pre-wrap">{String(value)}</span>
                             </div>
                           );
                         })}
                       </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 shrink-0 bg-white space-y-4">
                       <div>
                         <Label>Feedback (Opcional se aprovado, Obrigatório se rejeitado)</Label>
                         <Textarea 
                           className="mt-1.5 min-h-[100px]"
                           placeholder="Descreva o que precisa ser melhorado ou deixe um elogio..." 
                           value={feedback} onChange={(e) => setFeedback(e.target.value)} 
                         />
                       </div>
                       <div className="flex gap-4">
                         <Button onClick={() => handleEvaluate(false)} disabled={!feedback.trim()} variant="destructive" className="flex-1">
                           <XCircle className="w-4 h-4 mr-2" /> Rejeitar e Devolver
                         </Button>
                         <Button onClick={() => handleEvaluate(true)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                           <CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar e Desbloquear Próxima Fase
                         </Button>
                       </div>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
            <Inbox className="w-16 h-16 opacity-20" />
            <p>Selecione um item na lista de pendências para analisar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
