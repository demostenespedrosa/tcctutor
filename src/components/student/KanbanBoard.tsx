import * as React from "react";
import { useState } from "react";
import { useStore, KanbanCard } from "../../store";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Input";
import { AlertCircle, GripVertical } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { motion, AnimatePresence } from "motion/react";

const COLUMNS: { id: KanbanCard['status'], label: string }[] = [
  { id: 'BACKLOG', label: 'Backlog' },
  { id: 'TODO', label: 'A Fazer' },
  { id: 'IN_PROGRESS', label: 'Em Andamento' },
  { id: 'BLOCKED', label: 'Impedimento' },
  { id: 'DONE', label: 'Concluído' }
];

export function KanbanBoard({ projectId }: { projectId: string }) {
  const project = useStore((state) => state.projects[projectId]);
  const moveCard = useStore((state) => state.moveCard);
  const [draggingCard, setDraggingCard] = useState<string | null>(null);
  const [blockingCardId, setBlockingCardId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('cardId', cardId);
    setDraggingCard(cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: KanbanCard['status']) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    setDraggingCard(null);

    if (cardId) {
      const card = (project.kanban || []).find(c => c.id === cardId);
      if (card && card.status !== status) {
        if (status === 'BLOCKED') {
          // Open block reason modal
          setBlockingCardId(cardId);
          setBlockReason("");
        } else {
          moveCard(projectId, cardId, status);
        }
      }
    }
  };

  const confirmBlock = () => {
    if (blockingCardId) {
      moveCard(projectId, blockingCardId, 'BLOCKED', blockReason);
      setBlockingCardId(null);
    }
  };

  const hasKanbanUnlocked = project?.phases?.[3]?.status === 'APPROVED';

  if (!hasKanbanUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 text-center space-y-5 h-[500px]">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2 shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-200/50 animate-pulse"></div>
          <AlertCircle className="w-10 h-10 text-slate-400 relative z-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">O Motor está Desligado!</h3>
        <p className="text-slate-500 max-w-md text-base">
          O Kanban não é criado do zero. Ele surge magicamente a partir dos <strong>Requisitos Funcionais</strong> aprovados na Fase 03.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] min-h-[500px] animate-in fade-in duration-500 snap-x">
        {COLUMNS.map(col => (
          <div 
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex flex-col w-[320px] shrink-0 bg-slate-200/40 rounded-2xl p-4 border border-slate-200/60 shadow-sm snap-center"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{col.label}</h3>
              <Badge variant="secondary" className="bg-white text-slate-600 font-bold shadow-sm">{(project.kanban || []).filter(c => c.status === col.id).length}</Badge>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
              {(project.kanban || []).filter(c => c.status === col.id).map(card => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  onDragEnd={() => setDraggingCard(null)}
                  className={`bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all group ${draggingCard === card.id ? 'opacity-50 scale-95' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5 cursor-grab transition-colors" />
                    <div className="flex-1">
                      <h4 className="font-bold text-[13px] text-slate-800 leading-tight mb-1.5">{card.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed whitespace-pre-line truncate max-h-12 overflow-hidden">{card.description}</p>
                    </div>
                  </div>
                  {card.status === 'BLOCKED' && card.blockReason && (
                    <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 font-medium flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span className="leading-tight">{card.blockReason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {blockingCardId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 p-8 w-full max-w-md"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Relatar Impedimento</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Algo travou o desenvolvimento? Informe o motivo abaixo. Esse cartão ficará marcado de vermelho e o seu professor será notificado.
              </p>
              <Input
                autoFocus
                placeholder="Ex: API não retorna Cross-Origin"
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                className="mb-8 h-12 bg-slate-50"
              />
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button variant="ghost" className="h-11 px-6 rounded-xl hover:bg-slate-100" onClick={() => setBlockingCardId(null)}>Cancelar</Button>
                <Button onClick={confirmBlock} disabled={!blockReason.trim()} variant="destructive" className="h-11 px-6 rounded-xl shadow-lg shadow-red-500/20">
                  Bloquear Tarefa
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
