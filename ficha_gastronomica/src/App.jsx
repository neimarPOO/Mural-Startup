import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Utensils,
  CheckCircle2,
  Loader2,
  Cloud,
  CloudOff
} from 'lucide-react';

import Step1 from './components/steps/Step1';
import Step2 from './components/steps/Step2';
import Step3 from './components/steps/Step3';
import Step4 from './components/steps/Step4';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const defaultRecipeState = {
  prato: '',
  referencia: '',
  guarnicao: '',
  rendimento_porcoes: 1,
  ingredientes: [],
  preparo: '',
  utensilios: '',
  colaborador: ''
};

function App() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [recipeData, setRecipeData] = useState(defaultRecipeState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('offline'); // 'loading' | 'saving' | 'saved' | 'error' | 'offline'
  
  const [teamId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('teamId') || '';
  });

  // Load initial data from Supabase or localStorage
  useEffect(() => {
    async function loadInitialData() {
      if (isSupabaseConfigured && teamId) {
        setSyncStatus('loading');
        try {
          const { data, error } = await supabase
            .from('ficha_gastronomica')
            .select('recipe_data')
            .eq('team_id', teamId)
            .maybeSingle();

          if (data && !error) {
            if (data.recipe_data) {
              setRecipeData({ ...defaultRecipeState, ...data.recipe_data });
            }
            setSyncStatus('saved');
            setIsLoaded(true);
            return;
          }
        } catch (err) {
          console.error("Erro ao carregar dados do Supabase:", err);
          setSyncStatus('error');
        }
      }

      // Local storage fallback
      const savedData = localStorage.getItem('ficha_gastronomica_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setRecipeData({ ...defaultRecipeState, ...parsed });
        } catch (e) {
          console.error("Erro ao carregar do localStorage:", e);
        }
      }
      setSyncStatus(teamId ? 'saved' : 'offline');
      setIsLoaded(true);
    }

    loadInitialData();
  }, [teamId]);

  // Save changes to localStorage (always) and Supabase (if configured and logged in)
  useEffect(() => {
    if (!isLoaded) return;

    // Always save to localStorage
    localStorage.setItem('ficha_gastronomica_data', JSON.stringify(recipeData));

    if (isSupabaseConfigured && teamId) {
      setSyncStatus('saving');
      const saveToDb = async () => {
        try {
          const { error } = await supabase
            .from('ficha_gastronomica')
            .upsert({
              team_id: teamId,
              recipe_data: recipeData,
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.error("Erro ao salvar no Supabase:", error);
            setSyncStatus('error');
          } else {
            setSyncStatus('saved');
          }
        } catch (err) {
          console.error("Erro ao salvar no Supabase:", err);
          setSyncStatus('error');
        }
      };

      const timer = setTimeout(() => {
        saveToDb();
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setSyncStatus('offline');
    }
  }, [recipeData, isLoaded, teamId]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

        {/* Header Profissional */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b-4 border-amber-500">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Utensils size={28} className="text-amber-500" /> Ficha Técnica Interativa
            </h1>
            <p className="text-slate-400 text-sm">Preencha conforme o modelo padrão da aula</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Indicador de Sincronização */}
            {syncStatus === 'loading' && (
              <div className="flex items-center gap-1 bg-slate-800 text-cyan-400 text-xs px-3 py-1.5 rounded-lg border border-cyan-500/30">
                <Loader2 size={12} className="animate-spin" /> Carregando...
              </div>
            )}
            {syncStatus === 'saving' && (
              <div className="flex items-center gap-1 bg-slate-800 text-amber-400 text-xs px-3 py-1.5 rounded-lg border border-amber-500/30 animate-pulse">
                <Loader2 size={12} className="animate-spin" /> Salvando...
              </div>
            )}
            {syncStatus === 'saved' && (
              <div className="flex items-center gap-1 bg-slate-800 text-emerald-400 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <Cloud size={12} /> Sincronizado
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="flex items-center gap-1 bg-red-950/50 text-red-400 text-xs px-3 py-1.5 rounded-lg border border-red-500/30">
                <CloudOff size={12} /> Erro ao salvar
              </div>
            )}
            {syncStatus === 'offline' && (
              <div className="flex items-center gap-1 bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-lg border border-slate-700">
                <CloudOff size={12} /> Local
              </div>
            )}

            <div className="hidden md:block bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
              <span className="text-xs uppercase font-bold block text-slate-500">Etapa Atual</span>
              <span className="text-xl font-mono text-amber-500">{step} de {totalSteps}</span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-200 h-1.5">
          <div
            className="bg-amber-500 h-full transition-all duration-700 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        <div className="p-6 md:p-10">
          {!isLoaded ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
              <Loader2 size={40} className="animate-spin text-amber-500" />
              <p className="text-sm font-bold uppercase tracking-wider">Carregando dados da ficha...</p>
            </div>
          ) : (
            <>
              {step === 1 && <Step1 recipeData={recipeData} setRecipeData={setRecipeData} />}
              {step === 2 && <Step2 recipeData={recipeData} setRecipeData={setRecipeData} />}
              {step === 3 && <Step3 recipeData={recipeData} setRecipeData={setRecipeData} />}
              {step === 4 && <Step4 recipeData={recipeData} />}
            </>
          )}
        </div>

        {/* Navegação de Rodapé */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className={`flex items-center gap-2 font-black text-xs uppercase px-6 py-3 rounded-xl transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${step === i ? 'bg-amber-500 w-8' : 'bg-slate-300 w-2'}`}></div>
            ))}
          </div>

          {step < totalSteps && (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 font-black text-xs uppercase px-8 py-3 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg"
            >
              Próximo <ChevronRight size={16} />
            </button>
          )}

          {step === totalSteps && <div className="w-[120px]"></div>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-6 flex justify-between items-center px-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Software de Gestão de Cozinha v2.0</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><CheckCircle2 size={12} className="text-emerald-500" /> Cálculos Certificados</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><CheckCircle2 size={12} className="text-emerald-500" /> Layout Original Mantido</div>
        </div>
      </div>
    </div>
  );
}

export default App;
