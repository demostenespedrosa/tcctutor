import * as React from "react";
import { useState } from "react";
import { useStore, KanbanCard } from "../../store";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ArrowLeft, Printer, Columns, FileText, AlertCircle } from "lucide-react";

export function ProjectDetailsView({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const project = useStore(state => state.projects[projectId]);
  const [tab, setTab] = useState<'DOCS' | 'KANBAN'>('DOCS');

  if (!project) return null;

  let progress = 10;
  for (let i = 1; i <= 8; i++) {
    if (project.phases?.[i as 1|2|3|4|5|6|7|8]?.status === 'APPROVED') progress += 11.25;
  }
  progress = Math.min(Math.round(progress), 100);

  const COLUMNS: { id: KanbanCard['status'], label: string }[] = [
    { id: 'BACKLOG', label: 'Backlog' },
    { id: 'TODO', label: 'A Fazer' },
    { id: 'IN_PROGRESS', label: 'Em Andamento' },
    { id: 'BLOCKED', label: 'Impedimento' },
    { id: 'DONE', label: 'Concluído' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 absolute inset-0 z-50 overflow-hidden">
       <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
             <Button variant="outline" size="sm" onClick={onBack} title="Voltar" className="w-fit">
                <ArrowLeft className="w-4 h-4" />
             </Button>
             <div>
                <h1 className="text-xl font-bold text-slate-800">{project.name}</h1>
                <p className="text-sm text-slate-500">Alunos: {project.students.join(", ")}</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-500">Progresso Geral</div>
                <div className="font-bold text-blue-600">{progress}%</div>
             </div>
             {tab === 'DOCS' && (
               <Button onClick={() => window.print()} className="gap-2">
                 <Printer className="w-4 h-4" /> Baixar PDF
               </Button>
             )}
          </div>
       </header>

       <div className="border-b border-slate-200 bg-white px-6 flex flex-wrap gap-x-6 gap-y-0 shrink-0 print:hidden">
          <button onClick={() => setTab('DOCS')} className={`py-4 font-semibold text-sm border-b-2 transition-colors ${tab === 'DOCS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
             <FileText className="w-4 h-4 inline-block mr-2" />
             Documento SAD (Visão Print)
          </button>
          <button onClick={() => setTab('KANBAN')} className={`py-4 font-semibold text-sm border-b-2 transition-colors ${tab === 'KANBAN' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
             <Columns className="w-4 h-4 inline-block mr-2" />
             Quadro Kanban
          </button>
       </div>

       <main className="flex-1 overflow-y-auto p-6 md:p-10 print:p-0 print:overflow-visible">
          {tab === 'KANBAN' && (
             <div className="flex gap-4 h-full print:hidden">
                {COLUMNS.map(col => (
                   <div key={col.id} className="w-80 shrink-0 bg-slate-100 rounded-xl p-4 flex flex-col border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-700 mb-4">{col.label} <span className="text-slate-400 font-normal ml-1">({project.kanban.filter(c => c.status === col.id).length})</span></h3>
                      <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-4">
                         {project.kanban.filter(c => c.status === col.id).map(card => (
                            <div key={card.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                               <div className="font-bold text-sm text-slate-800 mb-1">{card.title}</div>
                               <div className="text-xs text-slate-600 whitespace-pre-wrap">{card.description}</div>
                               {card.status === 'BLOCKED' && card.blockReason && (
                                 <div className="mt-3 bg-red-50 text-red-700 p-2 rounded text-xs border border-red-200 flex items-start gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    <span>{card.blockReason}</span>
                                 </div>
                               )}
                            </div>
                         ))}
                         {project.kanban.filter(c => c.status === col.id).length === 0 && (
                            <div className="text-xs font-medium text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 rounded-lg">Nada por aqui</div>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          )}

          {tab === 'DOCS' && (
             <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
                <div className="text-center mb-16">
                   <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{project.name}</h1>
                   <p className="text-lg text-slate-600">Documento de Arquitetura de Software (SAD)</p>
                   <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-x-8 gap-y-2">
                      <div className="text-sm"><span className="text-slate-400 mr-2">Desenvolvedores:</span> <span className="font-semibold">{project.students.join(", ")}</span></div>
                      <div className="text-sm"><span className="text-slate-400 mr-2">Progresso Atual:</span> <span className="font-semibold text-blue-600">{progress}%</span></div>
                   </div>
                </div>

                <div className="space-y-12">
                   {[1,2,3,4,5,6,7,8].map(num => {
                      const phase = project.phases?.[num as 1|2|3|4|5|6|7|8];
                      if (!phase || phase.status !== 'APPROVED') return null;

                      return (
                         <section key={num} className="break-inside-avoid print:mt-10">
                            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-100 pb-2 mb-6">
                               <span className="text-blue-500 mr-2">{num}.</span>
                               {getPhaseTitle(num)}
                            </h2>
                            <div className="space-y-6 flex flex-col">
                               {Object.entries(phase.data || {}).map(([key, value]) => {
                                  if (!value || (Array.isArray(value) && value.length === 0)) return null;

                                  if (Array.isArray(value)) {
                                     return (
                                        <div key={key} className="mb-6">
                                           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{formatKey(key)}</h3>
                                           <div className="space-y-3">
                                              {value.map((item: any, i: number) => (
                                                 <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200 print:border-slate-300 print:bg-transparent">
                                                    <div className="text-xs font-mono font-bold text-blue-600 mb-2">ITEM #{i + 1}</div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      {Object.entries(item).filter(([k]) => k !== 'id').map(([k, v]) => (
                                                         <div key={k} className={String(v).length > 60 ? 'md:col-span-2' : ''}>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{formatKey(k)}</span>
                                                            <div className="text-sm text-slate-800 whitespace-pre-wrap mt-0.5">{String(v)}</div>
                                                         </div>
                                                      ))}
                                                    </div>
                                                 </div>
                                              ))}
                                           </div>
                                        </div>
                                     );
                                  }

                                  return (
                                     <div key={key} className="mb-2 break-inside-avoid">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{formatKey(key)}</h3>
                                        <div className="text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">{String(value)}</div>
                                     </div>
                                  );
                               })}
                            </div>
                         </section>
                      );
                   })}
                   
                   {progress < 100 && (
                      <div className="mt-16 p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center print:hidden">
                         <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-6 h-6 text-slate-400" />
                         </div>
                         <h3 className="text-slate-600 font-medium">Documento em Construção</h3>
                         <p className="text-sm text-slate-400 mt-1">Mais seções aparecerão aqui conforme as etapas forem aprovadas.</p>
                      </div>
                   )}
                </div>
             </div>
          )}
       </main>
    </div>
  );
}

function getPhaseTitle(num: number) {
  const titles: Record<number, string> = {
    1: "Concepção e Modelo de Negócios",
    2: "Visão e Atores",
    3: "Engenharia de Requisitos",
    4: "Arquitetura e Banco de Dados",
    5: "UI/UX e Componentização",
    6: "Infraestrutura e Segurança",
    7: "Quality Assurance (QA) e Testes",
    8: "Documentação de Entrega"
  };
  return titles[num] || `Fase ${num}`;
}

function formatKey(k: string) {
   const keyMap: Record<string, string> = {
      name: "Nome", pitch: "Pitch Comercial", target: "Público-Alvo", problem: "Problema", solution: "Solução Proposta",
      moat: "Diferencial Competitivo", monetization: "Modelo de Monetização", executive: "Resumo Executivo",
      stakeholders: "Stakeholders", role: "Papel/Responsabilidade", funcionais: "Req. Funcionais",
      naoFuncionais: "Req. Não-Funcionais", businessRules: "Regras de Negócio", title: "Título do Item",
      priority: "Prioridade", description: "Descrição", category: "Categoria", metrics: "Restrição/Métrica",
      rule: "Regra Restritiva", front: "Frontend", back: "Backend", db: "Banco de Dados", flow: "UX/Fluxo de Informação",
      dictionary: "Dic. de Dados", table: "Tabela", fields: "Campos", sitemap: "Sitemap", components: "Componentes",
      comp: "Componente", pipeline: "Onde Hospedar", rbac: "Matriz RBAC", permissions: "Rotas/Permissões permitidas",
      tests: "Casos de Teste", scenario: "Cenário", result: "Resultado Esperado", status: "Situação",
      devManual: "Manual p/ Desenvolvedores", userManual: "Manual p/ Usuários Final", actor: "Ator"
   };
   return keyMap[k] || k;
}
