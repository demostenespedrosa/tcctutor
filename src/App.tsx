import React, { useState, useEffect } from "react";
import { useStore, Role } from "./store";
import { StudentOnboarding } from "./components/student/StudentOnboarding";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { ProfessorWorkspace } from "./components/professor/ProfessorWorkspace";
import { Button } from "./components/ui/Button";
import { Input, Label } from "./components/ui/Input";
import { GraduationCap, LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";
import { FirebaseSync } from "./components/FirebaseSync";

function LoginScreen() {
  const loginEmail = useStore((state) => state.loginEmail);
  const signupEmail = useStore((state) => state.signupEmail);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        if (!email.trim() || !password.trim()) throw new Error("Preencha e-mail e senha");
        await loginEmail(email.trim(), password);
      } else {
        if (!name.trim() || !email.trim() || !password.trim()) throw new Error("Preencha todos os campos");
        await signupEmail(name.trim(), email.trim(), password, 'STUDENT');
      }
    } catch (err: any) {
      alert("Erro na Autenticação: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 pb-6 bg-blue-600 text-white text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TCC Tutor</h1>
          <p className="text-blue-200 mt-2 text-sm">Plataforma de Gestão Ágil e Tutoria Assíncrona</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
          {!isLogin && (
             <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-3 rounded-lg flex items-start gap-2">
               <span className="shrink-0 mt-0.5">ℹ️</span>
               <p>
                 Novas contas são criadas como <b>Aluno</b> por padrão. Para privilégios de Professor, é necessária autorização manual do administrador.
               </p>
             </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Ex: João da Silva" 
                autoFocus={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="exemplo@faculdade.edu.br" 
              autoFocus={isLogin}
            />
          </div>

          <div className="space-y-2">
            <Label>Senha</Label>
            <Input 
              type="password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />
          </div>

          <div className="pt-2">
             <Button 
               type="submit"
               className="w-full h-12 text-base" 
               disabled={loading}
             >
               {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
             </Button>
          </div>

          <p className="text-sm text-center text-slate-500 mt-4 px-4">
            {isLogin ? "Não possui conta? " : "Já possui conta? "}
            <button 
              type="button"
              className="text-blue-600 font-semibold hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Cadastre-se" : "Faça Login"}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

function MainApp() {
  const currentUser = useStore((state) => state.currentUser);
  const authReady = useStore((state) => state.authReady);

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Carregando Sessão...</div>;
  }

  if (!currentUser) return <LoginScreen />;

  if (currentUser.role === 'PROFESSOR') return <ProfessorWorkspace />;

  return (
    <>
      {currentUser.projectId ? <StudentDashboard /> : <StudentOnboarding />}
    </>
  );
}

export default function App() {
  return (
    <FirebaseSync>
      <MainApp />
    </FirebaseSync>
  );
}
