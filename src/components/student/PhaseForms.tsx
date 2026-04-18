import { useState } from "react";
import { useStore } from "../../store";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, Label, Textarea, Badge } from "../ui/Input";
import { AlertCircle, Lock, Plus, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PhaseStatus } from "../../store";

function StatusBadge({ status }: { status: PhaseStatus }) {
  if (status === 'APPROVED') return <Badge variant="success">Aprovado</Badge>;
  if (status === 'PENDING') return <Badge variant="warning">Avaliando</Badge>;
  if (status === 'REJECTED') return <Badge variant="destructive">Rejeitado</Badge>;
  if (status === 'LOCKED') return <Badge variant="secondary">Bloqueado</Badge>;
  return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Ativo</Badge>;
}

function SectionHead({ phase, title, subtitle }: { phase: any, title: string, subtitle: string }) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 m-0 mb-2">{title}</h1>
          <p className="text-sm text-slate-500 m-0">{subtitle}</p>
        </div>
        <StatusBadge status={phase.status} />
      </div>
      {phase.status === 'REJECTED' && phase.feedback && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-start gap-4 mt-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400"></div>
          <AlertCircle className="w-6 h-6 shrink-0 text-red-500 mt-0.5 ml-1" />
          <div>
            <h4 className="font-bold text-sm tracking-wide uppercase text-red-700/80 mb-1">Motivo da Rejeição:</h4>
            <p className="text-sm font-medium leading-relaxed">{phase.feedback}</p>
          </div>
        </div>
      )}
    </>
  )
}

function PhaseLocked({ title, description }: { title: string, description: string }) {
  return (
    <Card className="border border-slate-200/60 bg-slate-50/50 backdrop-blur-sm overflow-hidden relative group">
      <div className="absolute inset-y-0 left-0 w-1 bg-slate-200" />
      <CardHeader className="flex flex-row items-center justify-between p-6">
        <div>
          <CardTitle className="text-xl flex items-center gap-2 text-slate-400 font-medium">
            <Lock className="w-5 h-5" />
            {title}
          </CardTitle>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
        <Badge variant="secondary" className="bg-slate-200 text-slate-500">Bloqueado</Badge>
      </CardHeader>
    </Card>
  );
}

export function GenericPhaseForm({ 
  project, 
  phaseNum, 
  title, 
  subtitle,
  schema,
  onSubmit 
}: { 
  project: any, phaseNum: number, title: string, subtitle: string, schema: any[], onSubmit: (data: any) => void 
}) {
  const phase = project.phases?.[phaseNum] || { status: 'LOCKED', data: {} };
  if (phase.status === 'LOCKED') return <PhaseLocked title={title} description={subtitle} />;

  const isReadonly = phase.status === 'PENDING' || phase.status === 'APPROVED';
  const [data, setData] = useState<any>(phase.data || {});

  const updateArray = (key: string, index: number, field: string, val: string) => {
    const arr = [...(data[key] || [])];
    arr[index] = { ...arr[index], [field]: val };
    setData({ ...data, [key]: arr });
  };
  const addToArray = (key: string, initialItem: any) => {
    setData({ ...data, [key]: [...(data[key] || []), initialItem] });
  };
  const removeFromArray = (key: string, index: number) => {
    const arr = [...(data[key] || [])];
    arr.splice(index, 1);
    setData({ ...data, [key]: arr });
  };

  return (
    <Card className="animate-in fade-in duration-500 border border-slate-200 shadow-sm relative overflow-hidden">
      {phase.status === 'TODO' && <div className="absolute inset-y-0 left-0 w-1 bg-blue-500" />}
      {phase.status === 'PENDING' && <div className="absolute inset-y-0 left-0 w-1 bg-amber-500" />}
      {phase.status === 'APPROVED' && <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500" />}
      {phase.status === 'REJECTED' && <div className="absolute inset-y-0 left-0 w-1 bg-red-500" />}
      
      <CardContent className="p-8 pb-8 flex flex-col gap-6">
        <SectionHead phase={phase} title={`Fase 0${phaseNum}: ${title}`} subtitle={subtitle} />

        <div className="space-y-6">
          {schema.map((field, i) => {
            if (field.type === 'text') {
              return (
                <div key={i} className="space-y-3 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <Label className="text-slate-600 block">{field.label}</Label>
                  <Input 
                    placeholder={field.placeholder} value={data[field.key] || ''} 
                    onChange={e => setData({...data, [field.key]: e.target.value})} disabled={isReadonly}
                    className="max-w-2xl bg-white shadow-sm"
                  />
                </div>
              )
            }
            if (field.type === 'textarea') {
              return (
                <div key={i} className="space-y-3 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <Label className="text-slate-600 block">{field.label}</Label>
                  <Textarea 
                    placeholder={field.placeholder} value={data[field.key] || ''} 
                    onChange={e => setData({...data, [field.key]: e.target.value})} disabled={isReadonly}
                    className="max-w-4xl bg-white shadow-sm"
                  />
                </div>
              )
            }
            if (field.type === 'array') {
              const arr = data[field.key] || [];
              return (
                <div key={i} className="space-y-4 border border-slate-200/60 p-6 rounded-2xl bg-slate-50/50 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                    <Label className="text-base text-slate-800 font-extrabold tracking-tight">{field.label}</Label>
                    {!isReadonly && (
                      <Button variant="outline" size="sm" onClick={() => addToArray(field.key, field.initial)} className="bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm transition-all rounded-xl h-9 px-4 text-xs font-bold text-blue-600 border-blue-200">
                        <Plus className="w-4 h-4 mr-1.5" /> Adicionar Item
                      </Button>
                    )}
                  </div>
                  {arr.length === 0 && <p className="text-sm text-slate-500 italic relative z-10">Nenhum item adicionado à lista.</p>}
                  <div className="space-y-4 relative z-10 p-1">
                    <AnimatePresence>
                      {arr.map((item: any, idx: number) => (
                        <motion.div key={idx} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{opacity:0, scale:0.95}} className="bg-white p-5 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 relative grid grid-cols-1 md:grid-cols-2 gap-4 group">
                           <div className="absolute -left-3 -top-3 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white border border-blue-200">
                             {idx + 1}
                           </div>
                           {!isReadonly && (
                             <button onClick={() => removeFromArray(field.key, idx)} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-colors bg-white">
                               <Trash2 className="w-4 h-4"/>
                             </button>
                           )}
                           {field.subfields.map((sf: any, sIdx: number) => (
                             <div key={sIdx} className={`space-y-1.5 ${sf.fullLine ? 'md:col-span-2 mt-2' : ''} ${!sf.fullLine && sIdx === 0 && !isReadonly ? 'pr-8' : ''}`}>
                               <Label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{sf.label}</Label>
                               {sf.type === 'select' ? (
                                  <select 
                                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
                                    value={item[sf.key] || ''} onChange={e => updateArray(field.key, idx, sf.key, e.target.value)} disabled={isReadonly}
                                  >
                                    <option value="" disabled>Selecione...</option>
                                    {sf.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                               ) : sf.type === 'textarea' ? (
                                  <Textarea 
                                    className="shadow-sm bg-white min-h-[80px]"
                                    value={item[sf.key] || ''} onChange={e => updateArray(field.key, idx, sf.key, e.target.value)} disabled={isReadonly}
                                  />
                               ) : (
                                  <Input 
                                    className="shadow-sm bg-white"
                                    placeholder={sf.placeholder} value={item[sf.key] || ''} onChange={e => updateArray(field.key, idx, sf.key, e.target.value)} disabled={isReadonly}
                                  />
                               )}
                             </div>
                           ))}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )
            }
          })}
        </div>

        {!isReadonly && (
          <div className="flex justify-end mt-8 border-t border-slate-100 pt-6">
             <Button onClick={() => onSubmit(data)} className="w-full sm:w-auto h-12 px-8 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform text-[15px]">
               Enviar para Avaliação do Tutor <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
