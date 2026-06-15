import React from 'react';
import { 
  BrainCircuit, Trophy, AlertTriangle, ListChecks, 
  Zap, Users, Target, Rocket, Megaphone, 
  DollarSign, BarChart3, HelpCircle, ClipboardList, TrendingUp
} from 'lucide-react';

const LeanCanvasReport = ({ canvasData, analysis }) => {
  const date = new Date().toLocaleDateString('pt-BR');
  
  const iconMap = {
    problema: <HelpCircle size={18} />,
    solucao: <Zap size={18} />,
    propostaValor: <Target size={18} />,
    vantagem: <Rocket size={18} />,
    segmentos: <Users size={18} />,
    metricas: <BarChart3 size={18} />,
    canais: <Megaphone size={18} />,
    custos: <DollarSign size={18} />,
    receitas: <BarChart3 size={18} />
  };

  return (
    <div className="bg-white text-black p-12 h-auto font-sans">
      {/* Header Executive */}
      <div className="flex justify-between items-end border-b-8 border-black pb-8 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-3">RELATÓRIO DE ANÁLISE DE VIABILIDADE</h1>
          <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em]">Diagnóstico de Modelo de Negócio</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Data de Emissão</p>
          <p className="text-2xl font-black uppercase italic">{date}</p>
        </div>
      </div>

      {/* Project Banner */}
      <div className="mb-16">
         <div className="p-8 bg-black text-white flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-2">Nome do Empreendimento</span>
              <h2 className="text-4xl font-black uppercase tracking-tight">{canvasData.title || "Projeto Sem Título"}</h2>
            </div>
            {analysis && (
              <div className="text-right">
                <div className="text-[40px] font-black leading-none">{analysis.score}%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">SCORE DE VIABILIDADE</div>
              </div>
            )}
         </div>
      </div>

      {/* AI Verdict - High Impact */}
      {analysis && (
        <div className="mb-16 break-inside-avoid">
           <div className="p-10 border-4 border-black bg-slate-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                Análise Estratégica
              </div>
              <div className="flex gap-4 mb-6">
                 <BrainCircuit size={48} className="text-black" strokeWidth={2.5} />
                 <div className="flex-1">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Veredito do Especialista IA</h3>
                    <p className="text-3xl font-black italic leading-[1.1] text-black uppercase tracking-tighter">
                      "{analysis.verdict}"
                    </p>
                 </div>
              </div>
              <div className="pt-6 border-t border-black/10">
                 <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase">{analysis.summary}</p>
              </div>
           </div>
        </div>
      )}

      {/* Deep Validation Metrics Section */}
      {analysis && (
        <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-12 break-inside-avoid">
           <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-widest border-b-4 border-black pb-2">Validação de Estágio</h3>
              <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 bg-slate-50 border-2 border-black flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400">Ajuste Problema-Solução (PSF)</p>
                       <p className="text-xs font-bold text-slate-600 uppercase">A sua solução resolve a dor do cliente?</p>
                    </div>
                    <div className="text-3xl font-black text-indigo-600">{analysis.psfScore || 0}%</div>
                 </div>
                 <div className="p-6 bg-slate-50 border-2 border-black flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400">Ajuste Produto-Mercado (PMF)</p>
                       <p className="text-xs font-bold text-slate-600 uppercase">O mercado quer pagar e continuar com você?</p>
                    </div>
                    <div className="text-3xl font-black text-emerald-600">{analysis.pmfScore || 0}%</div>
                 </div>
              </div>
           </div>
           
           <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-widest border-b-4 border-black pb-2">Testes de Estresse</h3>
              <div className="grid grid-cols-1 gap-3">
                 {analysis.heuristicsTests && Object.entries(analysis.heuristicsTests).map(([key, test]) => (
                    <div key={key} className="flex items-center gap-4 p-4 border-2 border-black">
                       <div className={cn(
                          "w-4 h-4 rounded-full",
                          test.status === 'PASSOU' ? 'bg-emerald-500' : test.status === 'FALHOU' ? 'bg-red-500' : 'bg-amber-500'
                       )} />
                       <div className="flex-1">
                          <p className="text-[9px] font-black uppercase tracking-widest">
                             {key === 'especificidade' ? 'Foco Estratégico (Specificity)' : 
                              key === 'consistenciaCanais' ? 'Conexão com Cliente (Consistency)' : 
                              key === 'viabilidadeFinanceira' ? 'Potencial de Lucro (Viability)' : 
                              'Sustentabilidade (Unfair Advantage)'}
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase leading-none">{test.comentario}</p>
                       </div>
                       <div className="text-[10px] font-black uppercase italic opacity-30">{test.status}</div>
                    </div>
                 ))}
              </div>
           </div>

           {analysis.benchmarksCheck && (
              <div className="col-span-1 md:col-span-2 p-8 bg-black text-white">
                 <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <BarChart3 size={16} /> Saúde Financeira & Comparação de Mercado (Benchmarks)
                 </h4>
                 <p className="text-xs font-bold leading-relaxed uppercase italic text-white/80">{analysis.benchmarksCheck}</p>
              </div>
           )}
        </div>
      )}

      {/* NEW: MAPEAMENTO POR TÓPICOS (Categorizado) */}
      <div className="space-y-16">
        
        {/* Categoria 1: Fundamentos de Mercado */}
        <section className="break-inside-avoid">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-xl font-black">01</div>
              <h3 className="text-2xl font-black uppercase tracking-widest">Fundamentos de Mercado</h3>
              <div className="h-1 flex-1 bg-black/10" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TopicSection title="Segmentos de Clientes" data={canvasData.segmentosClientes} icon={iconMap.segmentos} />
              <TopicSection title="Problemas & Dores" data={canvasData.problema} icon={iconMap.problema} />
              <TopicSection title="Canais de Tração" data={canvasData.canais} icon={iconMap.canais} isFullWidth />
           </div>
        </section>

        {/* Categoria 2: A Proposta de Valor */}
        <section className="page-break-before break-inside-avoid">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-xl font-black">02</div>
              <h3 className="text-2xl font-black uppercase tracking-widest">A Proposta de Valor</h3>
              <div className="h-1 flex-1 bg-black/10" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TopicSection title="Proposta Única de Valor" data={canvasData.propostaValor} icon={iconMap.propostaValor} isFullWidth />
              <TopicSection title="Solução Técnica" data={canvasData.solucao} icon={iconMap.solucao} />
              <TopicSection title="Vantagem Competitiva" data={canvasData.vantagemCompetitiva} icon={iconMap.vantagem} />
           </div>
        </section>

        {/* Categoria 3: Eficiência & Resultados */}
        <section className="page-break-before break-inside-avoid">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-xl font-black">03</div>
              <h3 className="text-2xl font-black uppercase tracking-widest">Eficiência & Resultados</h3>
              <div className="h-1 flex-1 bg-black/10" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TopicSection title="Métricas-Chave" data={canvasData.metricasChave} icon={iconMap.metricas} isFullWidth />
              <TopicSection title="Estrutura de Custos" data={canvasData.estruturaCustos} icon={iconMap.custos} />
              <TopicSection title="Fontes de Receita" data={canvasData.fontesReceita} icon={iconMap.receitas} />
           </div>
        </section>
      </div>

      {/* Analysis Section (Deep Dive) */}
      {analysis && (
        <div className="pt-24 mt-24 border-t-8 border-black page-break-before">
           <div className="flex items-center gap-6 mb-12">
              <TrendingUp size={40} />
              <h3 className="text-5xl font-black uppercase tracking-tighter">ANÁLISE DE PROFUNDIDADE</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <section className="break-inside-avoid">
                 <div className="flex items-center gap-2 mb-8 border-b-4 border-black pb-3">
                    <Trophy size={24} />
                    <h4 className="text-xl font-black uppercase tracking-widest">Pontos Fortes</h4>
                 </div>
                 <div className="space-y-4">
                    {analysis.strengths?.map((s, i) => (
                       <div key={i} className="p-5 bg-slate-50 border-l-8 border-black flex gap-4">
                          <span className="text-[14px] font-black italic">0{i+1}</span>
                          <span className="text-[13px] font-bold leading-tight uppercase">{s}</span>
                       </div>
                    ))}
                 </div>
              </section>

              <section className="break-inside-avoid">
                 <div className="flex items-center gap-2 mb-8 border-b-4 border-black pb-3">
                    <AlertTriangle size={24} />
                    <h4 className="text-xl font-black uppercase tracking-widest">Riscos Identificados</h4>
                 </div>
                 <div className="space-y-4">
                    {analysis.risks?.map((r, i) => (
                       <div key={i} className="p-5 bg-slate-50 border-l-8 border-red-500 flex gap-4">
                          <span className="text-[14px] font-black text-red-600">!</span>
                          <span className="text-[13px] font-bold leading-tight uppercase">{r}</span>
                       </div>
                    ))}
                 </div>
              </section>

              <section className="col-span-1 md:col-span-2 break-inside-avoid mt-10">
                 <div className="flex items-center gap-2 mb-8 border-b-4 border-black pb-3">
                    <ClipboardList size={24} />
                    <h4 className="text-xl font-black uppercase tracking-widest">Roadmap (Próximos Passos)</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {analysis.nextSteps?.map((step, i) => (
                       <div key={i} className="relative p-8 border-4 border-black flex flex-col gap-3 bg-white">
                          <span className="text-6xl font-black text-slate-100 absolute bottom-0 right-2 leading-none z-0">{i+1}</span>
                          <span className="text-[14px] font-black text-black relative z-10 leading-tight uppercase italic">{step}</span>
                       </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      )}

      {/* Signature & Stamp */}
      <div className="mt-20 pt-16 border-t-2 border-black flex justify-between items-center break-inside-avoid">
        <div className="space-y-2">
           <p className="text-[9px] font-black uppercase tracking-[0.4em]">LEAN CANVAS INTERATIVO / ALPHA</p>
           <p className="text-[8px] font-medium uppercase text-slate-400">Documento gerado por inteligência artificial em tempo real</p>
        </div>
        <div className="w-64 h-16 border-b-4 border-black flex items-end justify-center pb-2">
           <p className="text-[10px] font-black uppercase tracking-widest italic opacity-30">Visto do Responsável</p>
        </div>
      </div>
    </div>
  );
};

function TopicSection({ title, data, icon, isFullWidth }) {
  if (!data || (!data.items?.length && !data.headline)) return null;
  return (
    <div className={cn("flex flex-col gap-4 group break-inside-avoid", isFullWidth && "col-span-1 md:col-span-2")}>
      <div className="flex items-center gap-3 border-b-2 border-black/10 pb-3">
        <div className="p-2 bg-black text-white">{icon}</div>
        <h4 className="text-[13px] font-black uppercase tracking-widest leading-none">{title}</h4>
      </div>
      
      {data.headline && (
         <p className="text-[14px] font-black uppercase mb-2 text-black leading-tight bg-slate-50 p-4 border-l-4 border-black">{data.headline}</p>
      )}
      
      <div className="space-y-2 pl-2">
        {data.items?.length > 0 ? (
           <ul className="space-y-3">
              {data.items.slice(0, 10).map((item, i) => (
                 <li key={i} className="flex gap-3 text-[11px] font-bold text-black leading-relaxed uppercase">
                    <span className="text-black opacity-30 shrink-0 select-none">//</span>
                    <span>{item}</span>
                 </li>
              ))}
           </ul>
        ) : !data.headline && (
           <p className="text-[9px] italic text-slate-300 uppercase font-black">Nenhum dado registrado para esta seção.</p>
        )}
      </div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

export default LeanCanvasReport;
