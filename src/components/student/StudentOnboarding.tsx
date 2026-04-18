import { useState } from "react";
import { useStore } from "../../store";
import { Button } from "../ui/Button";
import { Input, Label } from "../ui/Input";
import { GraduationCap, LogIn, Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function StudentOnboarding() {
  const [mode, setMode] = useState<'CHOICE' | 'CREATE' | 'JOIN'>('CHOICE');
  const currentUser = useStore((state) => state.currentUser);
  const createProject = useStore((state) => state.createProject);
  const joinProject = useStore((state) => state.joinProject);

  const [projName, setProjName] = useState('');
  const [token, setToken] = useState('');

  const handleCreate = () => {
    if (projName && currentUser) {
      createProject(projName, currentUser.name);
    }
  };

  const handleJoin = () => {
    if (token && currentUser) {
      joinProject(token.toUpperCase(), currentUser.name);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-6">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 overflow-hidden"
      >
        <div className="px-10 pt-12 pb-8 border-b border-slate-100 text-center">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 transform rotate-3">
            <GraduationCap className="w-10 h-10 text-white -rotate-3" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Qual a sua trilha?</h1>
          <p className="text-slate-500 mt-3 text-lg max-w-md mx-auto">
            Comece um novo TCC do zero ou junte-se ao projeto da sua equipe via código único.
          </p>
        </div>

        <div className="p-10 bg-slate-50/50">
          <AnimatePresence mode="wait">
            {mode === 'CHOICE' && (
              <motion.div 
                key="choice"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <button 
                  onClick={() => setMode('CREATE')}
                  className="group relative flex flex-col p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Fundar Projeto</h3>
                  <p className="text-sm text-slate-500 mb-8">Criar um novo repositório de TCC e convidar minha equipe.</p>
                  <div className="mt-auto flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    Começar Nova Ideia <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                <button 
                  onClick={() => setMode('JOIN')}
                  className="group relative flex flex-col p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <LogIn className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Entrar na Equipe</h3>
                  <p className="text-sm text-slate-500 mb-8">Já tenho o código (Token) gerado pelo líder do meu grupo.</p>
                  <div className="mt-auto flex items-center text-slate-600 group-hover:text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    Inserir Token <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              </motion.div>
            )}

            {mode === 'CREATE' && (
              <motion.div key="create" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto">
                <div className="space-y-3 mb-8">
                  <Label className="text-sm font-bold text-slate-700">Qual o Nome do Sistema?</Label>
                  <Input 
                    autoFocus
                    className="h-14 text-lg bg-white"
                    placeholder="Ex: TCC Tutor Plataforma" 
                    value={projName} 
                    onChange={e => setProjName(e.target.value)} 
                  />
                  <p className="text-xs text-slate-500">Pode ser alterado depois nas configurações do projeto.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" className="h-12 px-6" onClick={() => setMode('CHOICE')}>← Voltar</Button>
                  <Button className="h-12 flex-1 text-base shadow-lg shadow-blue-500/20" onClick={handleCreate} disabled={!projName}>Fundar Projeto</Button>
                </div>
              </motion.div>
            )}

            {mode === 'JOIN' && (
              <motion.div key="join" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto">
                <div className="space-y-3 mb-8">
                  <Label className="text-sm font-bold text-slate-700">Token de Acesso</Label>
                  <Input 
                    autoFocus
                    className="h-16 uppercase tracking-[0.5em] font-mono text-center text-2xl bg-white"
                    placeholder="ABX123" 
                    value={token} 
                    maxLength={6}
                    onChange={e => setToken(e.target.value)} 
                  />
                  <p className="text-xs text-slate-500 text-center">O token possui exatos 6 caracteres alfanuméricos.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" className="h-12 px-6" onClick={() => setMode('CHOICE')}>← Voltar</Button>
                  <Button className="h-12 flex-1 text-base shadow-lg shadow-blue-500/20" onClick={handleJoin} disabled={token.length < 6}>Entrar no Grupo</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
