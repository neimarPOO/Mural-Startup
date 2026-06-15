import React, { useState, useEffect } from 'react';
import { Rocket, Sparkles, Zap, ChevronRight, Globe, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const HINTS = [
  "Use sua própria IA com uma chave de API",
  "Análise inteligente de viabilidade de negócio",
  "Privacidade total: dados salvos localmente",
  "Sugestões táticas e roadmap de projeto",
  "Score de viabilidade estrutural",
  "Exportação instantânea para JSON e PDF"
];

function FeatureHint({ initialDelay = 0, boundingBox, currentHintIndex, onCycle }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ 
    top: `${boundingBox.minTop + Math.random() * (boundingBox.maxTop - boundingBox.minTop)}%`, 
    left: `${boundingBox.minLeft + Math.random() * (boundingBox.maxLeft - boundingBox.minLeft)}%` 
  });
  const onCycleRef = React.useRef(onCycle);

  useEffect(() => {
    onCycleRef.current = onCycle;
  }, [onCycle]);

  useEffect(() => {
    let intervalId;
    const timerId = setTimeout(() => {
      const cycle = () => {
        setIsVisible(false);
        setTimeout(() => {
          onCycleRef.current(); 
          // Generate new random position within the assigned quadrant
          setPosition({
            top: `${boundingBox.minTop + Math.random() * (boundingBox.maxTop - boundingBox.minTop)}%`,
            left: `${boundingBox.minLeft + Math.random() * (boundingBox.maxLeft - boundingBox.minLeft)}%`
          });
          setIsVisible(true);
        }, 1500);
      };
      
      cycle();
      intervalId = setInterval(cycle, 12000 + Math.random() * 4000);
    }, initialDelay);

    return () => {
      clearTimeout(timerId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [initialDelay, boundingBox]);

  return (
    <div 
      className={cn(
        "absolute z-50 pointer-events-none transition-all duration-[1500ms] ease-in-out select-none",
        isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
      )}
      style={position}
    >
      <div className="flex items-start gap-4 max-w-[140px] md:max-w-[220px]">
        <div className="h-[1px] w-6 bg-cyan-500/40 mt-3 flex-shrink-0" />
        <span className="text-sm md:text-lg font-black uppercase tracking-[0.4em] text-cyan-400 hologram-text animate-hologram drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] leading-snug">
          {HINTS[currentHintIndex]}
        </span>
      </div>
    </div>
  );
}

function FeatureSwarm() {
  const [activeIndices, setActiveIndices] = useState([0, 1, 2, 3]);

  const handleCycle = React.useCallback((slotIndex) => {
    setActiveIndices(prev => {
      const next = [...prev];
      const available = HINTS.map((_, i) => i).filter(i => !prev.includes(i));
      if (available.length > 0) {
        next[slotIndex] = available[Math.floor(Math.random() * available.length)];
      } else {
        let nextIdx;
        do {
          nextIdx = Math.floor(Math.random() * HINTS.length);
        } while (nextIdx === prev[slotIndex]);
        next[slotIndex] = nextIdx;
      }
      return next;
    });
  }, []);

  // Define 4 safe quadrants (outside the center 30-70% zone)
  const quadrants = React.useMemo(() => [
    { minTop: 5, maxTop: 20, minLeft: 5, maxLeft: 25 },   // Top-Left
    { minTop: 5, maxTop: 20, minLeft: 65, maxLeft: 85 },  // Top-Right
    { minTop: 75, maxTop: 90, minLeft: 5, maxLeft: 25 },  // Bottom-Left
    { minTop: 75, maxTop: 90, minLeft: 65, maxLeft: 85 }  // Bottom-Right
  ], []);

  return (
    <>
      {activeIndices.map((hintIdx, slotIdx) => (
        <FeatureHint 
          key={slotIdx}
          initialDelay={slotIdx * 4000} 
          boundingBox={quadrants[slotIdx]} 
          currentHintIndex={hintIdx}
          onCycle={() => handleCycle(slotIdx)}
        />
      ))}
    </>
  );
}

export default function LandingPage({ onStart, isExiting }) {
  return (
    <div className={cn(
      "fixed inset-0 bg-[#020617] flex flex-col items-center justify-center overflow-hidden z-[500] transition-all duration-700",
      isExiting && "exit-animation"
    )}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:40px_40px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      {/* Floating Feature Hints Swarm */}
      <FeatureSwarm />
      
      {/* Container */}
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-4xl px-6 text-center">
        
        {/* Animated 3D Spinner - Large Version */}
        <div className="relative group perspective-1000 scale-[1.2] md:scale-[2.5] mb-8 md:mb-12">
          <div className="spinner-3d-container">
            <div className="cube-3d">
              <div className="cube-face face-front border-cyan-400/40 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.2)]"></div>
              <div className="cube-face face-back border-cyan-400/40 bg-cyan-400/5"></div>
              <div className="cube-face face-right border-cyan-400/40 bg-cyan-400/5"></div>
              <div className="cube-face face-left border-cyan-400/40 bg-cyan-400/5"></div>
              <div className="cube-face face-top border-cyan-400/40 bg-cyan-400/5"></div>
              <div className="cube-face face-bottom border-cyan-400/40 bg-cyan-400/5"></div>
              <div className="scan-line-3d bg-cyan-400 shadow-[0_0_20px_#22d3ee]"></div>
            </div>
          </div>
          
          {/* Decorative rings around spinner */}
          <div className="absolute inset-0 -m-8 border border-cyan-500/10 rounded-full animate-spin duration-[10s] linear hidden md:block" />
          <div className="absolute inset-0 -m-4 border border-purple-500/10 rounded-full animate-spin-reverse duration-[15s] linear hidden md:block" />
        </div>

        <div className="space-y-4 px-4 overflow-x-hidden w-full">
          <div className="flex items-center justify-center gap-3 mb-2 animate-in fade-in slide-in-from-bottom duration-700">
            <div className="h-px w-6 md:w-8 bg-cyan-500/40" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-cyan-400 italic">Análise estratégica de IA</span>
            <div className="h-px w-6 md:w-8 bg-cyan-500/40" />
          </div>
          
          <h1 className="text-4xl md:text-8xl font-black text-white uppercase italic leading-none animate-in fade-in slide-in-from-bottom duration-1000">
            Lean Canvas<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 pr-4 animate-gradient-flow whitespace-nowrap">Interativo</span>
          </h1>
          
          <p className="text-xs md:text-base text-slate-400 max-w-xl mx-auto font-medium leading-relaxed uppercase tracking-wide opacity-60 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
             A modelagem de negócios reimaginada com Inteligência Artificial integrada.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
          <button 
            onClick={onStart}
            className="group relative px-12 py-5 bg-white overflow-hidden active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            <div className="absolute inset-0 bg-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-3 text-[14px] font-black uppercase tracking-[0.2em] text-black group-hover:text-black">
              INICIAR MODELAGEM <ChevronRight size={18} />
            </span>
          </button>
          
          <div className="flex items-center gap-8 opacity-20">
             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white">
                <Sparkles size={12} /> IA GENERATIVA
             </div>
             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white">
                <Globe size={12} /> MULTI-MODELO
             </div>
             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white">
                <Lock size={12} /> PRIVACIDADE LOCAL
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
