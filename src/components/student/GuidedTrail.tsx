import { useStore } from "../../store";
import { GenericPhaseForm } from "./PhaseForms";
import { motion } from "motion/react";

export function GuidedTrail({ projectId }: { projectId: string }) {
  const project = useStore((state) => state.projects[projectId]);
  const submitPhase = useStore((state) => state.submitPhase);

  let progress = 10;
  for (let i = 1; i <= 8; i++) {
    if (project.phases?.[i as 1|2|3|4|5|6|7|8]?.status === 'APPROVED') progress += 11.25;
  }
  progress = Math.min(Math.round(progress), 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
        <div>
          <div className="text-sm font-bold tracking-widest uppercase text-blue-600 mb-1">Maturidade do TCC</div>
          <div className="text-5xl font-extrabold text-slate-900 tracking-tighter">{progress}<span className="text-2xl text-slate-400 ml-1">%</span></div>
        </div>
        <div className="flex-1 max-w-xl w-full">
           <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 px-1">
             <span>Concepção</span>
             <span>MVP</span>
             <span>Defesa</span>
           </div>
           <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner w-full relative">
             <motion.div 
               className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
               initial={{ width: '0%' }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 1.5, type: "spring", bounce: 0.1 }}
             />
           </div>
        </div>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 md:before:ml-8 before:-translate-x-px before:h-full before:w-[3px] before:bg-gradient-to-b before:from-blue-100 before:via-blue-200 before:to-slate-100 before:rounded-full">
        
        <GenericPhaseForm 
          project={project} phaseNum={1} 
          title="Concepção e Modelo de Negócios" 
          subtitle="Valide se a ideia para de pé como produto comercial."
          schema={[
            { type: 'text', key: 'name', label: 'Nome do Produto', placeholder: 'Ex: FinManager 3000' },
            { type: 'textarea', key: 'pitch', label: 'Pitch Comercial', placeholder: 'Descreva em uma frase o que o sistema é e o valor que ele entrega.' },
            { type: 'text', key: 'target', label: 'Público-Alvo', placeholder: 'Quem vai comprar ou usar o sistema?' },
            { type: 'textarea', key: 'problem', label: 'Problema a ser resolvido', placeholder: 'Qual dor de mercado você ataca?' },
            { type: 'textarea', key: 'solution', label: 'Solução Proposta', placeholder: 'Como o software resolve esse problema?' },
            { type: 'text', key: 'moat', label: 'Diferencial Competitivo (Moat)', placeholder: 'Por que o seu é melhor que a concorrência?' },
            { type: 'text', key: 'monetization', label: 'Método de Monetização', placeholder: 'SaaS, Licença única, Gratuito c/ Ad?' },
          ]}
          onSubmit={(d) => submitPhase(projectId, 1, d)} 
        />

        <GenericPhaseForm 
          project={project} phaseNum={2} 
          title="SAD Parte 1: Visão e Atores" 
          subtitle="Alinhamento básico de engenharia com as partes interessadas."
          schema={[
            { type: 'textarea', key: 'executive', label: 'Resumo Executivo Técnico', placeholder: 'Descreva brevemente o escopo macro do sistema.' },
            { 
              type: 'array', key: 'stakeholders', label: 'Lista de Stakeholders (Atores do Sistema)',
              initial: { id: Date.now().toString(), name: '', role: '' },
              subfields: [
                { type: 'text', key: 'name', label: 'Nome/Perfil do Ator', placeholder: 'Ex: Gerente Financeiro' },
                { type: 'text', key: 'role', label: 'Responsabilidades no Sistema', placeholder: 'Libera pagamentos, extrai relatórios.' }
              ]
            }
          ]}
          onSubmit={(d) => submitPhase(projectId, 2, d)}
        />

        <GenericPhaseForm 
          project={project} phaseNum={3} 
          title="SAD Parte 2: Engenharia de Requisitos" 
          subtitle="Contrato de Escopo restrito. Itens funcionais alimentarão o Kanban automático!"
          schema={[
            { 
              type: 'array', key: 'funcionais', label: 'Requisitos Funcionais',
              initial: { id: Date.now().toString(), title: '', description: '', priority: '' },
              subfields: [
                { type: 'text', key: 'title', label: 'Nome do Requisito', placeholder: 'Ex: Emissão de NFe' },
                { type: 'select', key: 'priority', label: 'Prioridade', options: ['Alta', 'Média', 'Baixa'] },
                { type: 'textarea', key: 'description', label: 'Descrição do Comportamento', placeholder: 'O sistema deve...', fullLine: true }
              ]
            },
            {
              type: 'array', key: 'naoFuncionais', label: 'Requisitos Não-Funcionais',
              initial: { id: Date.now().toString(), category: '', metrics: '' },
              subfields: [
                { type: 'select', key: 'category', label: 'Categoria', options: ['Performance', 'Segurança', 'Usabilidade', 'Disponibilidade'] },
                { type: 'text', key: 'metrics', label: 'Métrica/Restrição', placeholder: 'Ex: Carregar em menos de 2s' }
              ]
            },
            {
              type: 'array', key: 'businessRules', label: 'Regras de Negócio',
              initial: { id: Date.now().toString(), rule: '' },
              subfields: [
                { type: 'text', key: 'rule', label: 'Condição Restritiva', placeholder: 'Ex: Usuário menor de idade não pode se cadastrar.', fullLine: true }
              ]
            }
          ]}
          onSubmit={(d) => submitPhase(projectId, 3, d)}
        />

        <GenericPhaseForm 
          project={project} phaseNum={4} 
          title="SAD Parte 3: Arquitetura e BD" 
          subtitle="Fundações técnicas e armazenamento estrutural."
          schema={[
            { type: 'text', key: 'front', label: 'Frontend Stack', placeholder: 'React, Vue, HTML/CSS?' },
            { type: 'text', key: 'back', label: 'Backend Stack', placeholder: 'Node, Python, Java?' },
            { type: 'text', key: 'db', label: 'Banco de Dados', placeholder: 'PostgreSQL, MongoDB?' },
            { type: 'textarea', key: 'flow', label: 'Descrição do Fluxo de Informação', placeholder: 'Diagrama de Contexto textual: Como os sistemas interagem?' },
            {
              type: 'array', key: 'dictionary', label: 'Dicionário de Dados',
              initial: { id: Date.now().toString(), table: '', fields: '' },
              subfields: [
                { type: 'text', key: 'table', label: 'Nome da Tabela/Coleção', placeholder: 'Ex: usuarios' },
                { type: 'textarea', key: 'fields', label: 'Campos e Tipos', placeholder: 'id (UUID PK), nome (VARCHAR), criado_em (TIMESTAMP)' }
              ]
            }
          ]}
          onSubmit={(d) => submitPhase(projectId, 4, d)}
        />

        <GenericPhaseForm 
          project={project} phaseNum={5} title="SAD Parte 4: UI/UX" subtitle="Padronização e Arquitetura de Informação Visual."
          schema={[
            { type: 'textarea', key: 'sitemap', label: 'Árvore do Sitemap', placeholder: '/ (pública)\n/dashboard (privada)\n/configuracoes (admin)' },
            {
              type: 'array', key: 'components', label: 'Componentes Globais',
              initial: { id: Date.now().toString(), comp: '' },
              subfields: [ { type: 'text', key: 'comp', label: 'Nome do Componente', placeholder: 'Navbar, Botão Primário, Modal de Exclusão', fullLine: true } ]
            }
          ]}
          onSubmit={(d) => submitPhase(projectId, 5, d)}
        />

        <GenericPhaseForm 
          project={project} phaseNum={6} title="SAD Parte 5: Infraestrutura e Segurança" subtitle="Go-to-market e proteção de dados."
          schema={[
            { type: 'textarea', key: 'pipeline', label: 'Pipeline de Deploy', placeholder: 'Onde hospedar? (Ex: Vercel p/ Front, AWS p/ BD)' },
            {
              type: 'array', key: 'rbac', label: 'Matriz de Controle de Acesso',
              initial: { id: Date.now().toString(), role: '', permissions: '' },
              subfields: [
                { type: 'text', key: 'role', label: 'Papel (Role)', placeholder: 'Admin' },
                { type: 'text', key: 'permissions', label: 'Permissões (Rotas/Ações permitidas)', placeholder: 'Acesso total' }
              ]
            }
          ]}
          onSubmit={(d) => submitPhase(projectId, 6, d)}
        />

        <GenericPhaseForm 
          project={project} phaseNum={7} title="Quality Assurance (QA) e Testes" subtitle="Validações para não quebrar em produção."
          schema={[
            {
              type: 'array', key: 'tests', label: 'Casos de Teste Estruturados',
              initial: { id: Date.now().toString(), scenario: '', result: '', status: '' },
              subfields: [
                { type: 'textarea', key: 'scenario', label: 'Cenário & Ação', placeholder: 'Botar senha errada no Login' },
                { type: 'textarea', key: 'result', label: 'Resultado Esperado', placeholder: 'Exibir toast vermelho "Senha incorreta"' },
                { type: 'select', key: 'status', label: 'Status da Última Bateria', options: ['Pendente', 'Passou', 'Falhou'] }
              ]
            }
          ]}
          onSubmit={(d) => submitPhase(projectId, 7, d)}
        />

        <GenericPhaseForm 
          project={project} phaseNum={8} title="Documentação de Entrega" subtitle="Manuais de Handover do projeto."
          schema={[
            { type: 'textarea', key: 'devManual', label: 'Manual de Implementação (Engineers)', placeholder: 'npm install, env vars necessárias, como rodar localmente.' },
            { type: 'textarea', key: 'userManual', label: 'Manual do Usuário (Cliente)', placeholder: 'Como o usuário final opera o sistema.' }
          ]}
          onSubmit={(d) => submitPhase(projectId, 8, d)}
        />

      </div>
    </div>
  );
}
