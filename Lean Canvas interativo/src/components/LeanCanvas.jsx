import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Users, Target, Zap, Rocket, Megaphone,
  DollarSign, BarChart3, ShieldCheck, HelpCircle,
  Plus, X, Save, Trash2, Printer, FileText, ClipboardList, TrendingUp, CheckCircle,
  ArrowRight, Info, AlertTriangle, CheckCircle2, Trophy,
  ChevronDown, ChevronUp, BrainCircuit, Loader2, Sparkles, RotateCcw,
  Lock, Key, Gift, Wand2, Maximize, User, Tag, Download, Settings, Globe, Shield, FolderOpen
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LeanCanvasReport from './LeanCanvasReport';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DEMO_CANVAS_DATA = {
  segmentosClientes: { items: ["Homens e mulheres de 25-45 anos", "Interessados em autocuidado e rituais domésticos", "Design de interiores e minimalismo"], notes: "" },
  adotantesIniciais: { items: ["Trabalhadores em home office", "Entusiastas de aromaterapia", "Decoração em mídias sociais"], notes: "" },
  problema: { items: ["Stress e ansiedade urbana", "Uso de produtos com parafina tóxica", "Ambientes sem personalidade sensorial"], notes: "" },
  alternativasExistentes: { items: ["Velas de supermercado", "Difusores industriais", "Incenso convencional"], notes: "" },
  propostaValor: { headline: "Velas eco-friendly artesanais que transformam sua casa em um santuário de bem-estar.", notes: "", items: [] },
  solucao: { items: ["Velas de cera de coco e soja", "Fragrâncias terapêuticas exclusivas", "Design minimalista e sustentável"], notes: "" },
  canais: { items: ["Instagram e TikTok", "Loja online própria (e-commerce)", "Feiras de produtores locais"], notes: "" },
  fontesReceita: { items: ["Venda direta de velas", "Clube de assinatura mensal", "Kits de presente corporativos"], notes: "" },
  estruturaCustos: { items: ["Matéria-prima premium", "Embalagens sustentáveis", "Custos de marketing (Anúncios)", "Mão de obra artesanal"], notes: "" },
  metricasChave: { items: ["Valor vitalício (LTV)", "Custo de aquisição (CAC)", "Taxa de recompra", "Nível de engajamento"], notes: "" },
  vantagemCompetitiva: { items: ["Storytelling emocional forte", "Logística reversa de embalagens", "Parcerias com estúdios de Yoga"], notes: "" },
  conceitoAltoNivel: { items: ["Seu Spa particular em um único pavio"], notes: "" },
  title: "EXEMPLO: VELAS ARTESANAIS",
  lastSaved: new Date().toISOString()
};

const blockHelp = {
  problema: "Identifique os 3 problemas reais que sua solução resolve no dia a dia do cliente.",
  alternativasExistentes: "Como esses problemas são resolvidos hoje? Liste concorrentes ou métodos manuais.",
  solucao: "Defina as funcionalidades mínimas (MVP) que resolvem os problemas listados.",
  metricasChave: "Quais indicadores mostram que o negócio está crescendo? (Ex: Retenção, Conversão).",
  propostaValor: "O que torna sua oferta única e por que o cliente deveria escolher você?",
  conceitoAltoNivel: "Uma analogia simples: 'Seu X para Y'. Ex: 'O Uber para entregas de luxo'.",
  vantagemCompetitiva: "O que você tem que é impossível de comprar ou copiar facilmente?",
  canais: "Caminhos para alcançar os clientes: Redes sociais, Parcerias, Venda direta.",
  segmentosClientes: "Quem são seu público-alvo e usuários? Seja específico no perfil demográfico.",
  adotantesIniciais: "O perfil do cliente que pagaria pela solução ainda no estágio inicial.",
  estruturaCustos: "Quais são seus maiores gastos fixos e variáveis (Marketing, Servidores, etc).",
  fontesReceita: "Modelo de cobrança: Assinatura, Venda única, Comissão por transação."
};

const emptyCanvasState = {
  segmentosClientes: { items: [], notes: "" },
  adotantesIniciais: { items: [], notes: "" },
  problema: { items: [], notes: "" },
  alternativasExistentes: { items: [], notes: "" },
  propostaValor: { headline: "", notes: "", items: [] },
  solucao: { items: [], notes: "" },
  canais: { items: [], notes: "" },
  fontesReceita: { items: [], notes: "" },
  estruturaCustos: { items: [], notes: "" },
  metricasChave: { items: [], notes: "" },
  vantagemCompetitiva: { items: [], notes: "" },
  conceitoAltoNivel: { items: [], notes: "" },
  title: "CANVAS VAZIO",
  lastSaved: new Date().toISOString()
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function LeanCanvas({ teamId }) {
  const [canvasData, setCanvasData] = useState(emptyCanvasState);
  const [isLoaded, setIsLoaded] = useState(false);

  const [tourStep, setTourStep] = useState(() => {
    const completed = localStorage.getItem('lean_canvas_tour_completed');
    return completed ? -1 : 0;
  });

  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [focusBlock, setFocusBlock] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const fileInputRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem('lean_canvas_ai_config');
    return saved ? JSON.parse(saved) : { 
      provider: 'gemini', 
      apiKey: '', 
      modelId: 'gemini-1.5-flash', 
      baseUrl: '' 
    };
  });

  // Load initial data from Supabase or localStorage
  useEffect(() => {
    async function loadInitialData() {
      if (isSupabaseConfigured && teamId) {
        try {
          const { data, error } = await supabase
            .from('lean_canvas')
            .select('canvas_data, analysis')
            .eq('team_id', teamId)
            .maybeSingle(); // Use maybeSingle to prevent exception if no row exists yet

          if (data && !error) {
            if (data.canvas_data) {
              setCanvasData({ ...emptyCanvasState, ...data.canvas_data });
            }
            if (data.analysis) {
              setAnalysis(data.analysis);
            }
            setIsLoaded(true);
            return;
          }
        } catch (err) {
          console.error("Erro ao carregar dados do Supabase:", err);
        }
      }

      // Local storage fallback
      const savedData = localStorage.getItem('lean_canvas_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setCanvasData({ ...emptyCanvasState, ...parsed });
        } catch (e) {
          setCanvasData(emptyCanvasState);
        }
      }

      const savedAnalysis = localStorage.getItem('lean_canvas_analysis');
      if (savedAnalysis) {
        try {
          setAnalysis(JSON.parse(savedAnalysis));
        } catch (e) {
          // ignore
        }
      }

      setIsLoaded(true);
    }

    loadInitialData();
  }, [teamId]);

  useEffect(() => {
    localStorage.setItem('lean_canvas_ai_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  // Save changes to localStorage (always) and Supabase (if loaded and online/configured)
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem('lean_canvas_data', JSON.stringify(canvasData));
    setLastSaved(new Date().toLocaleTimeString());
    setIsEditing(false);

    // Save to Supabase
    if (isSupabaseConfigured && teamId) {
      const saveToDb = async () => {
        try {
          await supabase.from('lean_canvas').upsert({
            team_id: teamId,
            canvas_data: canvasData,
            analysis: analysis,
            updated_at: new Date().toISOString()
          });
        } catch (err) {
          console.error("Erro ao salvar no Supabase:", err);
        }
      };
      saveToDb();
    }
  }, [canvasData, isLoaded, teamId]);

  useEffect(() => {
    if (!isLoaded) return;

    if (analysis) {
      localStorage.setItem('lean_canvas_analysis', JSON.stringify(analysis));

      // Save to Supabase
      if (isSupabaseConfigured && teamId) {
        const saveToDb = async () => {
          try {
            await supabase.from('lean_canvas').upsert({
              team_id: teamId,
              canvas_data: canvasData,
              analysis: analysis,
              updated_at: new Date().toISOString()
            });
          } catch (err) {
            console.error("Erro ao salvar no Supabase:", err);
          }
        };
        saveToDb();
      }
    }
  }, [analysis, isLoaded, teamId]);

  const saveCanvasToFile = () => {
    const exportData = {
      canvasData,
      analysis,
      version: "2.0",
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lean-canvas-${canvasData.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    setShowToast("Canvas Exportado com Sucesso!");
    setTimeout(() => setShowToast(false), 3000);
  };

  const updateBlock = (blockId, data) => {
    setIsEditing(true);
    setCanvasData(prev => ({
      ...prev,
      [blockId]: { ...prev[blockId], ...data }
    }));
  };

  const handleOpenFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = JSON.parse(event.target.result);
        
        // Suporte para o novo formato unificado { canvasData, analysis }
        // ou o formato legado (apenas o canvas)
        const content = rawJson.canvasData ? rawJson.canvasData : rawJson;
        const analysisToRestore = rawJson.analysis ? rawJson.analysis : null;
        
        // 1. Validação de Esquema Rigorosa
        const requiredBlocks = [
          'problema', 'solucao', 'propostaValor', 'vantagemCompetitiva', 
          'segmentosClientes', 'metricasChave', 'canais', 'estruturaCustos', 'fontesReceita'
        ];
        
        const hasMissingBlock = requiredBlocks.some(block => !content[block]);
        if (!content.title || hasMissingBlock) {
          throw new Error("Formato de arquivo inválido ou incompleto. Utilize um JSON exportado por este sistema.");
        }

        // 2. Higienização de integridade (Remover propriedades estranhas)
        const sanitizedContent = { title: content.title };
        requiredBlocks.forEach(block => {
           sanitizedContent[block] = {
              items: Array.isArray(content[block].items) ? content[block].items : [],
              notes: typeof content[block].notes === 'string' ? content[block].notes : "",
              headline: typeof content[block].headline === 'string' ? content[block].headline : ""
           };
        });

        // 3. Restaurar campos extras se existirem
        if (content.alternativasExistentes) sanitizedContent.alternativasExistentes = content.alternativasExistentes;
        if (content.adotantesIniciais) sanitizedContent.adotantesIniciais = content.adotantesIniciais;
        if (content.conceitoAltoNivel) sanitizedContent.conceitoAltoNivel = content.conceitoAltoNivel;

        setCanvasData(sanitizedContent);
        if (analysisToRestore) setAnalysis(analysisToRestore);
        
        setShowToast("Canvas Carregado com Sucesso!");
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        console.error("Erro ao carregar arquivo:", err);
        alert(err.message || "Erro ao processar o arquivo JSON.");
      }
    };
    reader.readAsText(file);
    // Limpar o input para permitir carregar o mesmo arquivo novamente se necessário
    e.target.value = '';
  };

  const calculateReadiness = () => {
    const essentialBlocks = ['problema', 'segmentosClientes', 'propostaValor', 'solucao'];
    const filled = essentialBlocks.filter(b => {
      const block = canvasData[b];
      return block && (block.items?.length > 0 || block.headline?.length > 0);
    }).length;
    return (filled / essentialBlocks.length) * 100;
  };

  const canAnalyze = calculateReadiness() === 100;

  const performAnalysis = useCallback(async () => {
    const rawApiKey = aiConfig.apiKey || GEMINI_API_KEY;
    const userApiKey = typeof rawApiKey === 'string' ? rawApiKey.trim() : null;
    
    if (!userApiKey) {
       alert("Configure sua Chave de API nas configurações (ícone de engrenagem).");
       return;
    }
    
    setIsAnalyzing(true);
    const promptText = `Você é um Mentor Pedagógico para fundadores de startups de primeira viagem.
Sua tarefa é realizar uma análise rigorosa e educativa do Lean Canvas fornecido abaixo, seguindo estas diretrizes de comunicação:

1. PADRÃO DE LINGUAGEM:
- Use descrições em português seguidas pelo termo técnico em inglês entre parênteses. 
  Exemplos: "Ajuste entre Problema e Solução (Problem-Solution Fit)", "Valor Vitalício do Cliente (LTV)", "Custo de Aquisição (CAC)".
- O tom deve ser encorajador, mas manter a criticidade necessária para reduzir riscos.
- Use analogias se necessário para explicar conceitos financeiros ou de métricas.

2. DIRETRIZES DE ANÁLISE:
- Avalie o estágio atual: Problema-Solução (PSF) ou Produto-Mercado (PMF).
- Verifique se os problemas e segmentos são específicos o suficiente (Teste de Especificidade).
- Analise a Vantagem Injusta: Explique se é algo realmente defensável ou apenas "boa execução".
- Heurísticas: Execute testes de estresse (Especificidade, Consistência Canais, Viabilidade) e explique o resultado didaticamente.

Retorne EXCLUSIVAMENTE um JSON com os seguintes campos em PORTUGUÊS (BR):
- summary: Um resumo estratégico didático (max 3 sentenças).
- score: Um valor numérico global de 0 a 100.
- psfScore: Pontuação de Ajuste Problema-Solução (PSF) de 0 a 100.
- pmfScore: Pontuação de Ajuste Produto-Mercado (PMF) de 0 a 100.
- scoreLabel: Uma frase curta de 2-3 palavras sobre o progresso.
- strengths: Array de 3 pontos fortes.
- risks: Array de 3 riscos críticos explicados de forma simples.
- suggestions: Array de 3 sugestões táticas de "como fazer".
- nextSteps: Array de 3 ações práticas imediatas.
- verdict: Um veredito final empoderador e honesto (max 15 palavras).
- riskLevel: "BAIXO", "MÉDIO" ou "ALTO".
- heuristicsTests: Objeto com status ("PASSOU", "FALHOU" ou "AVISO") e comentário didático curto para:
    - especificidade
    - consistenciaCanais
    - viabilidadeFinanceira
    - vantagemInjusta
- benchmarksCheck: Comparação breve com números de mercado de forma simples.

Canvas: ${JSON.stringify(canvasData)}`;

    try {
      let url, headers, body;

      if (aiConfig.provider === 'gemini') {
        url = `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.modelId || 'gemini-1.5-flash'}:generateContent`;
        headers = { 
          "Content-Type": "application/json",
          "x-goog-api-key": userApiKey
        };
        body = JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { response_mime_type: "application/json" }
        });
      } else {
        // OpenRouter or Custom (OpenAI Compatible)
        url = aiConfig.provider === 'openrouter' ? "https://openrouter.ai/api/v1/chat/completions" : aiConfig.baseUrl;
        headers = { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userApiKey}`,
          "HTTP-Referer": "https://lean-canvas-pro.local",
          "X-Title": "Lean Canvas Pro"
        };
        body = JSON.stringify({
          model: aiConfig.modelId,
          messages: [{ role: "user", content: promptText }],
          response_format: { type: "json_object" }
        });
      }

      const resp = await fetch(url, { method: "POST", headers, body });
      
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        console.error("Erro na API:", resp.status, errorData);
        
        if (resp.status === 503) {
          throw new Error(`Modelo indisponível (503). O ID '${aiConfig.modelId}' pode estar incorreto ou o serviço está instável. Verifique as configurações.`);
        }
        if (resp.status === 404) {
          throw new Error(`Modelo não encontrado (404). Verifique o ID '${aiConfig.modelId}' nas configurações.`);
        }
        throw new Error(errorData.error?.message || `Erro ${resp.status} na conexão com a IA.`);
      }

      const result = await resp.json();
      
      let finalContent;
      if (aiConfig.provider === 'gemini') {
        finalContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
      } else {
        finalContent = result.choices?.[0]?.message?.content;
      }

      if (finalContent) {
        try {
          setAnalysis(JSON.parse(finalContent));
        } catch (e) {
          console.error("Falha ao processar resposta JSON da IA:", e);
          alert("A IA gerou um formato inválido. Tente novamente.");
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro na análise. Verifique sua chave de API e conexão.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [canvasData, aiConfig]);

  return (
    <div id="lean-canvas-root-container" className="flex flex-col h-screen overflow-hidden bg-[#020617] relative select-none">
      
      {/* 1. Interface Interativa (Oculta via CSS ID no momento da impressão) */}
      <div id="lean-canvas-ui" className="flex flex-col flex-1 overflow-hidden">
        
        {/* AI Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
            <div className="w-full max-w-md bg-[#0f172a] border border-cyan-500/30 p-8 relative z-10 shadow-[0_0_100px_rgba(34,211,238,0.1)] text-white">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <div className="p-2 bg-cyan-500 rounded-sm text-black">
                     <Settings size={20} />
                  </div>
                  <div>
                     <h2 className="text-lg font-black uppercase tracking-tighter">COFRE DE CONFIGURAÇÃO IA</h2>
                     <p className="text-[9px] font-bold text-cyan-400/60 uppercase tracking-[0.2em]">Ponte de Conexão Neural Universal</p>
                  </div>
               </div>

               <div className="bg-amber-500/10 border-l-2 border-amber-500 p-4 mb-6 animate-pulse">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Shield size={12} /> Aviso de Segurança
                  </p>
                  <p className="text-[9px] font-medium text-white/60 leading-relaxed uppercase">
                    Suas chaves de API são armazenadas exclusivamente no <b>LocalStorage</b> deste navegador. Recomendamos o uso de chaves com limites de faturamento e a exclusão após o uso.
                  </p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block">PROVEDOR DA API</label>
                     <select 
                        value={aiConfig.provider} 
                        onChange={e => setAiConfig(prev => ({ ...prev, provider: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 p-3 text-xs font-bold text-white outline-none focus:border-cyan-500/50 appearance-none"
                     >
                        <option value="gemini">GOOGLE GEMINI (DIRETO)</option>
                        <option value="openrouter">OPENROUTER (CLAUDE, GPT, LLAMA)</option>
                        <option value="custom">CUSTOM ENDPOINT (DEEPSEEK, xAI, etc)</option>
                     </select>
                  </div>

                  {aiConfig.provider === 'custom' && (
                    <div className="space-y-2 animate-in slide-in-from-top duration-200">
                       <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block">BASE URL DO ENDPOINT</label>
                       <input 
                          type="text" 
                          placeholder="https://api.deepseek.com/v1"
                          value={aiConfig.baseUrl}
                          onChange={e => setAiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                          className="w-full bg-black/40 border border-white/10 p-3 text-xs font-bold text-white outline-none focus:border-cyan-500/50"
                       />
                    </div>
                  )}

                  <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block">ID DO MODELO</label>
                        <button 
                          onClick={() => setAiConfig(prev => ({ 
                            ...prev, 
                            modelId: aiConfig.provider === 'gemini' ? 'gemini-1.5-flash' : 'google/gemini-2.0-flash-001' 
                          }))}
                          className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter hover:underline"
                        >
                          Usar Recomendado
                        </button>
                     </div>
                     <div className="relative group/select">
                        <input 
                           type="text" 
                           placeholder={aiConfig.provider === 'gemini' ? "gemini-1.5-flash" : "meta-llama/llama-3-8b-instruct"}
                           value={aiConfig.modelId}
                           onChange={e => setAiConfig(prev => ({ ...prev, modelId: e.target.value }))}
                           className="w-full bg-black/40 border border-white/10 p-3 text-xs font-bold text-white outline-none focus:border-cyan-500/50"
                        />
                        <div className="mt-2 grid grid-cols-2 gap-2">
                           {(aiConfig.provider === 'gemini' ? ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'] : ['google/gemini-2.0-flash-001', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.3-70b-instruct']).map(m => (
                              <button 
                                 key={m}
                                 onClick={() => setAiConfig(prev => ({ ...prev, modelId: m }))}
                                 className={cn(
                                    "px-2 py-1.5 text-[8px] font-black border transition-all text-left truncate uppercase",
                                    aiConfig.modelId === m ? "bg-cyan-500 text-black border-cyan-500" : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                                 )}
                              >
                                 {m.split('/').pop()}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block text-left flex justify-between items-center">
                       CHAVE DE API PRIVADA
                       <span className="flex items-center gap-1 text-emerald-400 capitalize bg-emerald-500/10 px-2 py-0.5"><Shield size={8} /> Local-Only</span>
                     </label>
                     <input 
                        type="password" 
                        placeholder="sk-...."
                        value={aiConfig.apiKey}
                        onChange={e => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 p-3 text-xs font-bold text-white outline-none focus:border-cyan-500/50"
                     />
                  </div>

                   <div className="pt-4 flex flex-col gap-3">
                     <button 
                        onClick={() => setIsSettingsOpen(false)}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] uppercase tracking-widest py-3 transition-colors"
                     >
                        SALVAR E APLICAR CONEXÃO
                     </button>
                     <button 
                        onClick={() => {
                          if (confirm("Resetar configurações para o padrão?")) {
                            setAiConfig({ provider: 'gemini', apiKey: '', modelId: 'gemini-1.5-flash', baseUrl: '' });
                          }
                        }}
                        className="w-full bg-white/5 hover:bg-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest py-2 transition-colors border border-white/5"
                     >
                        RESTALRAR PADRÕES
                     </button>
                     <div className="text-[8px] text-white/20 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                        <Globe size={10} /> Conexão Criptografada SSL Ativada
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {showToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-4 duration-300">
            {showToast}
          </div>
        )}

        {/* Header Precise */}
        <header className="flex items-center justify-between p-2 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Rocket className="text-white w-5 h-5" />
            <input
              className="text-lg font-black bg-transparent border-none focus:ring-0 p-0 tracking-tight text-white uppercase w-80"
              value={canvasData.title}
              onChange={(e) => setCanvasData(prev => ({...prev, title: e.target.value}))}
            />
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/20 text-[8px] font-black uppercase border border-white/5 tracking-widest">
              <div className={cn("w-1.5 h-1.5 rounded-full", isEditing ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
              {isEditing ? "EDITANDO" : "SALVO"} 
            </div>
             <button 
              onClick={() => {
                if (confirm("Carregar dados de exemplo? Isso substituirá seu progresso atual.")) {
                  setCanvasData(DEMO_CANVAS_DATA);
                }
              }} 
              className="sharp-button bg-cyan-400 hover:bg-cyan-300 text-black flex items-center gap-2 px-3 py-1 text-[8px] tracking-widest font-black"
            >
               <Sparkles size={12} /> EXEMPLO
            </button>
            <button 
               onClick={() => fileInputRef.current.click()} 
               className="sharp-button bg-amber-400 hover:bg-amber-300 text-black flex items-center gap-2 px-3 py-1 text-[8px] tracking-widest font-black"
            >
               <FolderOpen size={12} />ABRIR
            </button>
            <button onClick={saveCanvasToFile} className="sharp-button bg-emerald-500 hover:bg-emerald-400 flex items-center gap-2 px-3 py-1 text-[8px] tracking-widest font-black">
               <Save size={12} />SALVAR
            </button>
            <button 
              onClick={() => {
                const originalTitle = document.title;
                document.title = "Relatório de análise de viabilidade";
                window.print();
                document.title = originalTitle;
              }} 
              className="sharp-button bg-white text-black border-2 border-black flex items-center gap-2 px-3 py-1 text-[8px] tracking-widest font-black transition-all hover:bg-black hover:text-white"
            >
               <FileText size={12} />RELATÓRIO PDF
            </button>
            <button onClick={() => confirm("Deseja realmente apagar todos os campos?") && setCanvasData(emptyCanvasState)} className="sharp-button-dark px-3 py-1 text-[8px] border-red-500/30 hover:bg-red-500/10 text-red-400">REINICIAR</button>
          </div>
        </header>

        <main className="flex flex-col lg:flex-row gap-3 flex-1 lg:overflow-hidden overflow-y-auto relative p-2.5">
          
          {/* Mobile Navigation Dots */}
          <div className="lg:hidden flex justify-center gap-1.5 py-4 border-b border-white/5">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.3)]",
                  activeSlide === i ? "w-8 bg-cyan-400" : "w-1.5 bg-white/10"
                )} 
              />
            ))}
          </div>
          
          {/* Precise Lean Canvas Grid */}
          <div 
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const containerWidth = e.currentTarget.offsetWidth;
              const newIndex = Math.round((scrollLeft + (containerWidth / 4)) / containerWidth);
              if (newIndex !== activeSlide && newIndex >= 0 && newIndex < 7) setActiveSlide(newIndex);
            }}
            className="flex-1 flex lg:grid lg:grid-cols-10 lg:grid-rows-[2fr_1fr] gap-[15px] lg:gap-[10px] h-full overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-hide px-4 lg:px-0 pb-24 lg:pb-0"
          >
            <CanvasBlock id="merged_problem" title="PROBLEMA" bgColor="col-purple" icon={<Lock size={14}/>} className="w-[85vw] md:w-[45vw] lg:w-auto flex-shrink-0 snap-center col-span-1 lg:col-span-2"
              subBlocks={[
                { id: 'problema', title: 'PROBLEMA', data: canvasData.problema, placeholder: "Liste seus 3 principais problemas", icon: <Lock size={14}/> },
                { id: 'alternativasExistentes', title: 'ALTERNATIVAS EXISTENTES', data: canvasData.alternativasExistentes, placeholder: "Como estes são resolvidos hoje", icon: <ArrowRight size={14}/>, isSubInput: true }
              ]}
              onFocus={() => setFocusBlock({ ids: ['problema', 'alternativasExistentes'], title: 'PROBLEMA & ALTERNATIVAS', color: 'col-purple', icon: <Lock size={24}/> })}
              onUpdate={(sid, d) => updateBlock(sid, d)}
            />

            <div className="w-[85vw] md:w-[45vw] lg:w-auto flex-shrink-0 snap-center col-span-1 lg:col-span-2 grid grid-rows-2 gap-[10px] h-full">
              <CanvasBlock id="solucao" title="SOLUÇÃO" bgColor="col-orange" icon={<Key size={14}/>} data={canvasData.solucao} onUpdate={(id, d) => updateBlock(id, d)} placeholder="Descreva possíveis soluções" onFocus={() => setFocusBlock({ ids: ['solucao'], title: 'SOLUÇÃO', color: 'col-orange', icon: <Key size={24}/> })} />
              <CanvasBlock id="metricasChave" title="MÉTRICAS-CHAVE" bgColor="col-orange-dark" icon={<BarChart3 size={14}/>} data={canvasData.metricasChave} onUpdate={(id, d) => updateBlock(id, d)} placeholder="Números-chave para o negócio" onFocus={() => setFocusBlock({ ids: ['metricasChave'], title: 'MÉTRICAS-CHAVE', color: 'col-orange-dark', icon: <BarChart3 size={24}/> })} />
            </div>

            <CanvasBlock id="merged_uvp" title="PROPOSTA DE VALOR" bgColor="col-green-medium" icon={<Gift size={14}/>} className="w-[85vw] md:w-[45vw] lg:w-auto flex-shrink-0 snap-center col-span-1 lg:col-span-2"
              subBlocks={[
                { id: 'propostaValor', title: 'PROPOSTA DE VALOR ÚNICA', data: canvasData.propostaValor, placeholder: "Mensagem única, clara e convincente...", icon: <Gift size={14}/>, isSpecial: true },
                { id: 'conceitoAltoNivel', title: 'CONCEITO DE ALTO NÍVEL', data: canvasData.conceitoAltoNivel, placeholder: "Analogie: seu X para Y", icon: <Info size={14}/>, isSubInput: true }
              ]}
              onFocus={() => setFocusBlock({ ids: ['propostaValor', 'conceitoAltoNivel'], title: 'PROPOSTA DE VALOR', color: 'col-green-medium', icon: <Gift size={24}/> })}
              onUpdate={(sid, d) => updateBlock(sid, d)}
            />

            <div className="w-[85vw] md:w-[45vw] lg:w-auto flex-shrink-0 snap-center col-span-1 lg:col-span-2 grid grid-rows-2 gap-[10px] h-full">
               <CanvasBlock id="vantagemCompetitiva" title="VANTAGEM COMPETITIVA" bgColor="col-green-lime" icon={<Wand2 size={14}/>} data={canvasData.vantagemCompetitiva} onUpdate={(id, d) => updateBlock(id, d)} placeholder="Não pode ser copiado facilmente" onFocus={() => setFocusBlock({ ids: ['vantagemCompetitiva'], title: 'VANTAGEM COMPETITIVA', color: 'col-green-lime', icon: <Wand2 size={24}/> })} />
               <CanvasBlock id="canais" title="CANAIS" bgColor="col-turquesa" icon={<Maximize size={14}/>} data={canvasData.canais} onUpdate={(id, d) => updateBlock(id, d)} placeholder="Caminhos para chegar ao cliente" onFocus={() => setFocusBlock({ ids: ['canais'], title: 'CANAIS', color: 'col-turquesa', icon: <Maximize size={24}/> })} />
            </div>

            <CanvasBlock id="merged_segments" title="SEGMENTOS DE CLIENTES" bgColor="col-azul-royal" icon={<User size={14}/>} className="w-[85vw] md:w-[45vw] lg:w-auto flex-shrink-0 snap-center col-span-1 lg:col-span-2"
              subBlocks={[
                { id: 'segmentosClientes', title: 'SEGMENTOS DE CLIENTES', data: canvasData.segmentosClientes, placeholder: "Liste seu público-alvo e usuários", icon: <User size={14}/> },
                { id: 'adotantesIniciais', title: 'ADOTANTES INICIAIS', data: canvasData.adotantesIniciais, placeholder: "Características do cliente ideal", icon: <Target size={14}/>, isSubInput: true }
              ]}
              onFocus={() => setFocusBlock({ ids: ['segmentosClientes', 'adotantesIniciais'], title: 'SEGMENTOS & ADOTANTES', color: 'col-azul-royal', icon: <User size={24}/> })}
              onUpdate={(sid, d) => updateBlock(sid, d)}
            />

            <CanvasBlock id="estruturaCustos" title="ESTRUTURA DE CUSTOS" bgColor="col-azul-cobalto" icon={<Tag size={14}/>} data={canvasData.estruturaCustos} onUpdate={(id, d) => updateBlock(id, d)} placeholder="Custos fixos e variáveis" onFocus={() => setFocusBlock({ ids: ['estruturaCustos'], title: 'ESTRUTURA DE CUSTOS', color: 'col-azul-cobalto', icon: <Tag size={24}/> })} className="w-[85vw] md:w-[45vw] lg:w-auto flex-shrink-0 snap-center col-span-1 lg:col-span-5" />
            <CanvasBlock id="fontesReceita" title="FONTES DE RECEITA" bgColor="col-azul-petroleo" icon={<DollarSign size={14}/>} data={canvasData.fontesReceita} onUpdate={(id, d) => updateBlock(id, d)} placeholder="Fontes de faturamento" onFocus={() => setFocusBlock({ ids: ['fontesReceita'], title: 'FONTES DE RECEITA', color: 'col-azul-petroleo', icon: <DollarSign size={24}/> })} className="w-[85vw] md:w-[45vw] lg:w-auto flex-shrink-0 snap-center col-span-1 lg:col-span-5" />
          </div>

          <aside className={cn(
            "w-full lg:w-[480px] cyber-terminal flex flex-col gap-6 border-cyan-500/10 transition-all duration-500 z-40 shadow-2xl",
            "fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto",
            isAnalysisExpanded ? "h-[85dvh] p-6 pb-24 lg:h-auto" : "h-[75px] px-6 py-4 lg:h-auto lg:p-6"
          )} style={{ 
            bottom: window.innerWidth < 1024 ? (isAnalysisExpanded ? '0' : '65px') : 'auto',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div className="flex items-center justify-between cursor-pointer lg:cursor-default" onClick={() => window.innerWidth < 1024 && setIsAnalysisExpanded(!isAnalysisExpanded)}>
              <div className="flex items-center gap-3">
                <div className="lg:hidden">
                  {isAnalysisExpanded ? <ChevronDown size={20} className="text-cyan-400" /> : <ChevronUp size={20} className="text-cyan-400 animate-bounce" />}
                </div>
                <h2 className="text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase leading-none">INTELIGÊNCIA CENTRAL</h2>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="relative group/help">
                  <button className="p-1.5 hover:bg-white/5 text-white/30 hover:text-cyan-400 transition-all border border-transparent hover:border-white/10 outline-none">
                    <HelpCircle size={14} />
                  </button>
                  {/* Tooltip Tutorial */}
                  <div className="absolute top-full right-0 mt-3 w-72 p-4 bg-[#0f172a] border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all duration-300 z-[600]">
                    <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                      <Sparkles size={12} className="text-cyan-400" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Guia de Conexão Neural</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-[9px] font-black text-cyan-400 uppercase">1. Google Gemini</h4>
                        <p className="text-[8px] text-white/60 leading-relaxed uppercase">Obtenha sua chave gratuita no <b>Google AI Studio</b> para acesso direto.</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[9px] font-black text-purple-400 uppercase">2. OpenRouter</h4>
                        <p className="text-[8px] text-white/60 leading-relaxed uppercase">Conecte via <b>OpenRouter</b> para usar Claude, GPT-4 ou Llama.</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[9px] font-black text-amber-400 uppercase">3. Custom Endpoint</h4>
                        <p className="text-[8px] text-white/60 leading-relaxed uppercase">Use <b>DeepSeek</b> ou outros provedores inserindo a Base URL e sua chave.</p>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                        <Shield size={10} className="text-emerald-400" />
                        <p className="text-[7px] text-emerald-400/80 font-bold uppercase tracking-tighter">Privacidade Total: Dados salvos localmente.</p>
                      </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute bottom-full right-2 w-3 h-3 bg-[#0f172a] border-l border-t border-cyan-500/30 rotate-45 -mb-1.5" />
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }} className="p-1.5 hover:bg-white/5 text-white/30 hover:text-cyan-400 transition-all border border-transparent hover:border-white/10"><Settings size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); performAnalysis(); }} disabled={isAnalyzing || !canAnalyze} className={cn("sharp-button bg-cyan-400 hover:bg-cyan-300", !canAnalyze && "opacity-20 pointer-events-none")}>{isAnalyzing ? "..." : "ANALISAR"}</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full gap-12 animate-in fade-in duration-500">
                  <div className="spinner-3d-container scale-125"><div className="cube-3d"><div className="cube-face face-front"></div><div className="cube-face face-back"></div><div className="cube-face face-right"></div><div className="cube-face face-left"></div><div className="cube-face face-top"></div><div className="cube-face face-bottom"></div><div className="scan-line-3d"></div></div></div>
                  <div className="text-center space-y-3"><p className="text-[10px] font-black tracking-[0.4em] text-cyan-400 animate-pulse">PROCESSANDO REDE NEURAL</p></div>
                </div>
              ) : !analysis ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-30 text-white"><BrainCircuit size={48} className="mb-4 animate-pulse duration-[3s]" /><p className="text-[9px] font-black uppercase tracking-widest leading-loose">Aguardando dados estruturais do canvas para análise sistêmica.</p></div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                      <div className="text-5xl font-black text-white tracking-tighter mb-1 relative z-10">{analysis.score}</div>
                      <div className="text-[8px] font-black text-cyan-400 uppercase tracking-widest leading-none text-center">SCORE GLOBAL</div>
                      <div className="absolute bottom-0 left-0 h-1 bg-cyan-400 transition-all duration-1000 ease-out" style={{ width: `${analysis.score}%` }} />
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 flex flex-col justify-center gap-3">
                       <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">NÍVEL DE RISCO</div>
                       <div className={cn("text-[10px] font-black uppercase px-2 py-1 rounded-sm text-center", 
                         analysis.riskLevel === 'ALTO' ? 'bg-red-500 text-white' : 
                         analysis.riskLevel === 'MÉDIO' ? 'bg-amber-500 text-black' : 
                         'bg-emerald-500 text-black'
                       )}>{analysis.riskLevel}</div>
                    </div>
                  </div>

                  {/* Novos Scores de Validação */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 border border-white/10 p-4 space-y-2">
                        <div className="flex justify-between items-center text-[8px] font-black text-white/40 uppercase tracking-widest">
                           <span>PROBLEMA-SOLUÇÃO</span>
                           <span className="text-white">{analysis.psfScore || 0}%</span>
                        </div>
                        <div className="h-1 bg-white/5 w-full overflow-hidden">
                           <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${analysis.psfScore || 0}%` }} />
                        </div>
                        <p className="text-[7px] text-white/20 uppercase tracking-tighter">A dor é real e a solução resolve? (PSF)</p>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-4 space-y-2">
                        <div className="flex justify-between items-center text-[8px] font-black text-white/40 uppercase tracking-widest">
                           <span>PRODUTO-MERCADO</span>
                           <span className="text-white">{analysis.pmfScore || 0}%</span>
                        </div>
                        <div className="h-1 bg-white/5 w-full overflow-hidden">
                           <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${analysis.pmfScore || 0}%` }} />
                        </div>
                        <p className="text-[7px] text-white/20 uppercase tracking-tighter">O mercado quer pagar e ficar? (PMF)</p>
                     </div>
                  </div>

                  {/* Testes de Heurística */}
                  {analysis.heuristicsTests && (
                    <div className="space-y-3 bg-black/20 border border-white/5 p-4">
                       <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-3 text-center">ANÁLISE DE SAÚDE DO MODELO</h4>
                       <div className="grid grid-cols-1 gap-2">
                          {Object.entries(analysis.heuristicsTests).map(([key, test]) => (
                             <div key={key} className="flex items-start gap-3 p-2 border-l-2 border-white/5 bg-white/[0.02] group/test">
                                <div className={cn(
                                   "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                                   test.status === 'PASSOU' ? 'bg-emerald-500' : test.status === 'FALHOU' ? 'bg-red-500' : 'bg-amber-500'
                                )} />
                                <div className="space-y-1">
                                   <div className="text-[9px] font-black text-white/80 uppercase tracking-widest">
                                      {key === 'especificidade' ? 'Foco Estratégico' : 
                                       key === 'consistenciaCanais' ? 'Conexão com Cliente' : 
                                       key === 'viabilidadeFinanceira' ? 'Potencial de Lucro' : 
                                       'Sustentabilidade (Vantagem)'}
                                   </div>
                                   <p className="text-[8px] text-white/40 font-medium leading-relaxed uppercase italic">{test.comentario}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {analysis.benchmarksCheck && (
                    <div className="bg-cyan-500/5 border-l-2 border-cyan-500/50 p-4">
                       <div className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <BarChart3 size={10} /> SAÚDE FINANCEIRA COMPARADA
                       </div>
                       <p className="text-[9px] font-medium text-slate-300 leading-relaxed uppercase">{analysis.benchmarksCheck}</p>
                    </div>
                   )}
                  <div className="space-y-3"><div className="flex items-center gap-2"><h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">SUMÁRIO ESTRATÉGICO</h4></div><div className="bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-6 relative"><p className="text-[11px] font-medium text-slate-300 leading-relaxed text-justify">{analysis.summary}</p></div></div>
                  <div className="pt-4 border-t border-white/5"><p className="text-xl font-black italic text-white leading-tight tracking-tighter text-center uppercase">"{analysis.verdict}"</p></div>

                  {/* Novas Seções de Análise Detalhada */}
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    
                    {/* Pontos Fortes */}
                    <div className="space-y-3">
                       <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2">
                          <Trophy size={12} /> PONTOS FORTES
                       </h4>
                       <div className="grid gap-2">
                          {analysis.strengths?.map((s, i) => (
                             <div key={i} className="bg-emerald-500/5 border border-emerald-500/20 p-3 text-[10px] font-bold text-slate-300 leading-relaxed uppercase">
                                <span className="text-emerald-400 mr-2">0{i+1}.</span> {s}
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Riscos */}
                    <div className="space-y-3">
                       <h4 className="text-[10px] font-black uppercase text-red-400 tracking-widest flex items-center gap-2">
                          <AlertTriangle size={12} /> RISCOS CRÍTICOS
                       </h4>
                       <div className="grid gap-2">
                          {analysis.risks?.map((r, i) => (
                             <div key={i} className="bg-red-500/5 border border-red-500/20 p-3 text-[10px] font-bold text-slate-300 leading-relaxed uppercase">
                                <span className="text-red-400 mr-2">!</span> {r}
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Roadmap */}
                    <div className="space-y-3 pb-4">
                       <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-widest flex items-center gap-2">
                          <TrendingUp size={12} /> ROADMAP (PRÓXIMOS PASSOS)
                       </h4>
                       <div className="grid gap-2">
                          {analysis.nextSteps?.map((step, i) => (
                             <div key={i} className="bg-cyan-500/5 border border-cyan-500/20 p-3 text-[10px] font-bold text-slate-300 leading-relaxed uppercase flex gap-3">
                                <div className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shrink-0 text-[8px] font-black">{i+1}</div>
                                {step}
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="text-[8px] text-white/10 text-center uppercase tracking-[0.4em] pt-4">RELATÓRIO DIAGNÓSTICO COMPLETO</div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </main>

        {/* Mobile Actions */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#020617]/95 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleOpenFile} 
            />
            <button onClick={() => confirm("Carregar dados de exemplo?") && setCanvasData(DEMO_CANVAS_DATA)} className="p-3 bg-cyan-500 text-black rounded-sm active:scale-95 transition-all"><Sparkles size={20} /></button>
            <button onClick={() => fileInputRef.current.click()} className="p-3 bg-amber-400 text-black rounded-sm active:scale-95 transition-all"><FolderOpen size={20} /></button>
            <button onClick={saveCanvasToFile} className="p-3 bg-emerald-500 text-black rounded-sm active:scale-95 transition-all"><Save size={20} /></button>
            <button 
              onClick={() => {
                const originalTitle = document.title;
                document.title = "Relatório de análise de viabilidade";
                window.print();
                document.title = originalTitle;
              }} 
              className="flex items-center gap-2 p-3 bg-white text-black border-2 border-black rounded-sm active:scale-95 transition-all outline-none"
            >
              <FileText size={20} /> <span className="text-[10px] font-black">RELATÓRIO</span>
            </button>
          </div>
        </div>

        {/* Overlays */}
        {focusBlock && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8 animate-in zoom-in-95 duration-200">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setFocusBlock(null)} />
             <div className="w-full max-w-4xl bg-[#0f172a] border-4 border-white p-6 md:p-10 relative z-10 shadow-[20px_20px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-6 text-white font-black uppercase">
                   <h2 className="text-3xl tracking-tighter">{focusBlock.title}</h2>
                   <button onClick={() => setFocusBlock(null)} className="p-3 hover:bg-white/10 transition-all"><X size={32} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-8">
                      {focusBlock.ids.map(id => (
                         <div key={id} className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] block">Entrada de Dados: {id}</label>
                            <textarea autoFocus className="w-full h-48 bg-black/40 border-4 border-white/10 p-6 text-lg font-bold text-white outline-none focus:border-cyan-500/50 resize-none transition-all" placeholder={blockHelp[id]} value={canvasData[id].headline !== undefined ? canvasData[id].headline : canvasData[id].items.join('\n')} onChange={(e) => { const val = e.target.value; if (canvasData[id].headline !== undefined) { updateBlock(id, { headline: val }); } else { updateBlock(id, { items: val.split('\n') }); } }} />
                         </div>
                      ))}
                   </div>
                   <div className="bg-white/5 border-4 border-white/5 p-8 flex flex-col gap-6 text-white">
                      <div className="flex items-center gap-4 text-cyan-400"><HelpCircle size={24} /><h3>Guia Estratégico</h3></div>
                      <div className="space-y-6">
                        {focusBlock.ids.map(id => (<div key={id} className="p-6 bg-black/40 border-l-4 border-cyan-500"><h4 className="text-[10px] font-black uppercase text-cyan-500 mb-2">{id}</h4><p className="text-xs text-white/60 leading-relaxed font-medium italic">{blockHelp[id]}</p></div>))}
                      </div>
                   </div>
                </div>
                <div className="mt-10 flex justify-end"><button onClick={() => setFocusBlock(null)} className="sharp-button bg-cyan-400 hover:bg-cyan-300 text-black px-10 py-4 text-xs font-black">CONCLUIR EDIÇÃO</button></div>
             </div>
          </div>
        )}

        {tourStep !== -1 && (
          <TourOverlay step={tourStep} onNext={() => setTourStep(prev => prev + 1)} onSkip={() => { localStorage.setItem('lean_canvas_tour_completed', 'true'); setTourStep(-1); }} isMobile={window.innerWidth < 1024} />
        )}

      </div> {/* Fim Interface Interativa (#lean-canvas-ui) */}

      {/* 2. Relatório PDF (Renderizado em container com ID controlado via CSS) */}
      <div id="lean-canvas-report">
        <LeanCanvasReport canvasData={canvasData} analysis={analysis} />
      </div>

    </div>
  );
}

function BlockEntries({ blockId, blockData, blockTitle, blockIcon, blockPlaceholder, blockIsSpecial, isSubInput, onUpdate, onFocus }) {
  const bData = blockData || { items: [], notes: "", headline: "" };
  const [inputValue, setInputValue] = useState('');

  const handleAddItem = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onUpdate(blockId, { items: [...(bData.items || []), inputValue.trim()] });
      setInputValue('');
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5 flex-1 relative whitespace-normal", isSubInput && "sub-entry-border")}>
      <div className="flex items-center justify-between relative z-20">
         <div className="flex items-center gap-2">
            <div className="text-white/40">{blockIcon}</div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.1em] text-white/90">{blockTitle}</h3>
         </div>
         
         <div className="group/help relative flex items-center justify-center">
            <div className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-help">
               <HelpCircle size={14} className="text-white/40 group-hover/help:text-cyan-400 transition-colors" />
            </div>
            <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-[#0f172a] border border-cyan-500/30 backdrop-blur-3xl shadow-[0_0_50px_rgba(34,211,238,0.1)] z-[100] opacity-0 group-hover/help:opacity-100 pointer-events-none transition-all duration-300 transform -translate-y-2 group-hover/help:translate-y-0 text-[11px] font-medium text-slate-200 leading-relaxed rounded-md border-l-4 border-l-cyan-400">
               <div className="text-cyan-400 font-black mb-2 uppercase tracking-widest text-[9px] flex items-center gap-2">
                  <Sparkles size={10} /> DICA ESTRATÉGICA
               </div>
               {blockHelp[blockId] || "Defina os parâmetros estratégicos deste bloco."}
            </div>
         </div>
      </div>
      
      <div className="flex flex-col gap-1.5 flex-1 text-left min-h-0">
        {blockIsSpecial && (
          <div className="flex flex-col gap-1.5 mb-2">
            <textarea 
               className="w-full bg-transparent border-none p-0 text-[13px] font-black text-white placeholder:text-white/10 h-16 outline-none focus:ring-0 resize-none leading-[1.4] overflow-hidden uppercase tracking-tight" 
               placeholder={blockPlaceholder} 
               value={bData.headline || ""} 
               onChange={e => onUpdate(blockId, { headline: e.target.value })} 
               onClick={e => e.stopPropagation()}
            />
            <textarea 
               className="w-full bg-transparent border-none p-0 text-[10px] text-white/50 placeholder:text-white/5 outline-none focus:ring-0 resize-none leading-relaxed custom-scrollbar font-bold italic" 
               placeholder="Conceito Adicional..." 
               value={bData.notes || ""} 
               onChange={e => onUpdate(blockId, { notes: e.target.value })} 
               onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5 flex-1 overflow-hidden pointer-events-auto" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1">
            {bData.items?.map((item, idx) => (
              <div key={idx} className="px-2.5 py-1 border-l-2 border-white/30 text-[10px] font-bold text-white/90 flex items-center justify-between group/tag bg-white/5 hover:bg-white/10 transition-colors">
                <span className="flex-1">{item}</span>
                <button 
                   onClick={e => { 
                      e.stopPropagation(); 
                      const next = [...bData.items]; 
                      next.splice(idx, 1); 
                      onUpdate(blockId, { items: next }); 
                   }} 
                   className="opacity-0 group-hover/tag:opacity-100 text-white/40 ml-2 hover:text-red-500 transition-colors"
                >
                   <X size={8} />
                </button>
              </div>
            ))}
            {(!bData.items || bData.items.length === 0) && !blockIsSpecial && (
              <p className="text-[10px] text-white/30 leading-tight italic">{blockPlaceholder}</p>
            )}
          </div>
          
          <div className="mt-auto flex items-center gap-1 pt-1">
            <input 
               type="text" 
               className="flex-1 bg-transparent border-b border-white/10 py-1 text-[10px] font-bold placeholder:text-white/20 focus:border-white/40 outline-none text-white/90 transition-all font-sans" 
               placeholder={blockIsSpecial ? "Adicionar ponto..." : "Adicionar item"} 
               value={inputValue} 
               onChange={e => setInputValue(e.target.value)} 
               onKeyDown={handleAddItem} 
               onClick={e => e.stopPropagation()} 
            />
            <button 
              onClick={e => { e.stopPropagation(); onFocus(); }} 
              className="p-1 bg-black/40 border border-white/5 text-white/20 hover:text-white transition-all shadow-sm"
            >
              <Plus size={8} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasBlock({ id, title, icon, data, subBlocks, bgColor, onUpdate, placeholder, onFocus, className }) {
  return (
    <div 
      onClick={() => onFocus()}
      className={cn("brutal-card flex flex-col relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-transform", bgColor, className)}
    >
      {subBlocks ? (
        <div className="flex flex-col h-full">
          {subBlocks.map(sb => (
            <BlockEntries 
              key={sb.id}
              blockId={sb.id} 
              blockData={sb.data} 
              blockTitle={sb.title} 
              blockIcon={sb.icon} 
              blockPlaceholder={sb.placeholder} 
              blockIsSpecial={sb.isSpecial} 
              isSubInput={sb.isSubInput} 
              onUpdate={onUpdate}
              onFocus={onFocus}
            />
          ))}
        </div>
      ) : (
        <BlockEntries 
          blockId={id} 
          blockData={data} 
          blockTitle={title} 
          blockIcon={icon} 
          blockPlaceholder={placeholder} 
          blockIsSpecial={id === 'propostaValor'} 
          onUpdate={onUpdate}
          onFocus={onFocus}
        />
      )}
    </div>
  );
}

function TourOverlay({ step, onNext, onSkip, isMobile }) {
  const steps = [
    {
      title: "BEM-VINDO AO LEAN CANVAS PRO",
      text: "Transforme sua ideia em um modelo de negócio estratégico com o poder da Inteligência Artificial.",
      pos: "center",
      icon: <Rocket size={40} className="text-cyan-400" />
    },
    {
      title: "IDENTIDADE DO PROJETO",
      text: "Dê um nome impactante à sua startup no topo. Você também pode carregar um 'Canvas de Exemplo' para ver como tudo funciona.",
      pos: isMobile ? "top" : "top-left",
      target: "header",
      icon: <Sparkles size={24} className="text-amber-400" />
    },
    {
      title: "BLOCOS ESTRATÉGICOS",
      text: isMobile 
        ? "No smartphone, navegue pelos blocos deslizando lateralmente no carrossel. Toque em qualquer bloco para editar em tela cheia." 
        : "Complete cada um dos 9 blocos. Use as dicas internas para estruturar sua proposta de valor, problemas e canais.",
      pos: "center",
      icon: <Plus size={24} className="text-cyan-400" />
    },
    {
      title: "INTELIGÊNCIA CENTRAL",
      text: "Clique em ANALISAR para que a rede neural processe seu modelo e forneça insights, riscos, sugestões e um roadmap prático.",
      pos: isMobile ? "bottom" : "bottom-right",
      icon: <BrainCircuit size={24} className="text-cyan-400" />
    },
    {
      title: "GERENCIAMENTO DE ARQUIVOS",
      text: "Salve seu progresso no computador como JSON ou abra um projeto existente para continuar editando de onde parou.",
      pos: "bottom",
      icon: <FolderOpen size={24} className="text-amber-400" />
    },
    {
      title: "EXPORTAÇÃO E LIMPEZA",
      text: "Gere seu relatório PDF executivo ou reinicie o canvas no menu inferior. Tudo pronto para começar!",
      pos: "bottom",
      icon: <FileText size={24} className="text-emerald-400" />
    }
  ];

  if (step >= steps.length) {
    onSkip();
    return null;
  }

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#020617]/40" />
      
      <div className={cn(
        "relative w-full max-w-sm bg-[#0f172a] border-4 border-white p-8 shadow-[20px_20px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300",
        currentStep.pos === "top-left" && "lg:absolute lg:top-20 lg:left-20",
        currentStep.pos === "bottom-right" && "lg:absolute lg:bottom-10 lg:right-[500px]",
        currentStep.target === "header" && "-mt-40"
      )}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             {currentStep.icon}
             <div className="h-0.5 flex-1 bg-white/10" />
             <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{step + 1}/{steps.length}</span>
          </div>
          
          <div className="space-y-3 font-sans">
            <h3 className="text-xl font-black text-white leading-tight uppercase italic">{currentStep.title}</h3>
            <p className="text-xs font-medium text-white/60 leading-relaxed">{currentStep.text}</p>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={onSkip}
              className="text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors"
            >
              PULAR TOUR
            </button>
            <button 
              onClick={onNext}
              className="flex-1 sharp-button bg-cyan-400 hover:bg-cyan-300 text-black py-3 text-[10px] font-black uppercase tracking-widest"
            >
              {step === steps.length - 1 ? "COMEÇAR" : "PRÓXIMO"}
            </button>
          </div>
        </div>

        {!isMobile && currentStep.target && (
           <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rotate-45 bg-white" />
        )}
      </div>
    </div>
  );
}
