import React, { forwardRef } from 'react';
import * as Icons from 'lucide-react';

const iconMap = {
  rocket: Icons.Rocket,
  palette: Icons.Palette,
  coins: Icons.Coins,
  calculator: Icons.Calculator,
  wrench: Icons.Wrench,
  beaker: Icons.Beaker,
  messageSquare: Icons.MessageSquare,
  refresh: Icons.RefreshCw,
  presentation: Icons.Presentation,
  trophy: Icons.Trophy,
};

const StageCard = forwardRef(({ 
  stage, isActive, isCompleted, teamCount, onClick, onClickDetail, 
  deliverables = [], stageDetails = null, selectedTeamId = null, direction = 'right',
  mobileTeams = []
}, ref) => {
  const IconComponent = iconMap[stage.iconType] || Icons.HelpCircle;
  const clipClass = direction === 'right' ? 'trail-arrow-right' : 'trail-arrow-left';
  
  // Resolve details list from context or fallback
  const detailsList = (stageDetails && stageDetails[stage.id]) || stage.details || [];

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="relative group cursor-pointer" onClick={() => onClick && onClick(stage)}>
        {/* Outer Chevron Wrapper acting as the thick black border */}
        <div
          className={`p-[3px] select-none ${clipClass} bg-slate-950 transition-all duration-200 ${
            isActive 
              ? 'ring-4 ring-offset-2 ring-indigo-500' 
              : 'shadow-[4px_4px_0px_0px_#020617] group-hover:shadow-[6px_6px_0px_0px_#020617] group-hover:-translate-x-[2px] group-hover:-translate-y-[2px]'
          } active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#020617]`}
        >
          {/* Inner Chevron containing the actual color background */}
          <div
            ref={ref}
            className={`p-5 py-6 ${clipClass}`}
            style={{ 
              backgroundColor: stage.color,
              color: stage.id === 7 ? '#0f172a' : '#ffffff',
            }}
          >
            {/* Content */}
            <div className="flex items-center gap-4 pr-3 pl-3 select-none">
              {/* Big Number */}
              <span className="text-4xl md:text-5xl font-black opacity-80 font-display leading-none">
                {stage.id}
              </span>
              
              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-sm md:text-base leading-tight uppercase truncate">
                  {stage.title}
                </h3>
                <p className="text-[10px] md:text-xs font-semibold opacity-90 truncate mt-0.5">
                  {stage.subtitle}
                </p>
              </div>
            </div>

            {/* Team count badge */}
            {teamCount > 0 && (
              <div className="absolute right-4 bottom-2 bg-slate-900 text-white px-2 py-0.5 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-xs">
                <span className="text-[9px] font-black uppercase tracking-tight">
                  {teamCount} {teamCount === 1 ? 'equipe' : 'equipes'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Icon OUTSIDE the clipped container with thick black border */}
        <div 
          className="absolute -top-3.5 right-8 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center shadow-sm text-white transition-transform group-hover:scale-110 z-30"
          style={{ borderColor: stage.color }}
        >
          <IconComponent className="w-4 h-4" style={{ color: stage.color }} />
        </div>
      </div>

      {/* Render Mobile Team Avatars inside card if on mobile */}
      {mobileTeams.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center py-1.5 px-3 bg-slate-950/40 border border-slate-800 rounded-lg">
          <span className="text-[9px] font-bold text-slate-400 uppercase w-full text-center">Equipes nesta etapa:</span>
          {mobileTeams.map(t => (
            <div
              key={t.id}
              className="flex items-center gap-1.5 bg-slate-900 border-2 border-slate-950 px-2 py-1 rounded-md"
              style={{ borderColor: t.color }}
            >
              <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center bg-slate-950 text-[8px] font-black" style={{ backgroundColor: t.color }}>
                {t.logo.startsWith('data:image') || t.logo.startsWith('http') ? (
                  <img src={t.logo} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  t.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <span className="text-[9px] font-black text-white">{t.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sub-items list / Details tags below the card */}
      <div className="flex flex-wrap gap-1 px-4 justify-center">
        {detailsList.map((detail, idx) => {
          const del = selectedTeamId 
            ? deliverables.find(
                d => d.teamId === selectedTeamId && 
                     d.stageId === stage.id && 
                     d.itemName.toUpperCase() === detail.toUpperCase()
              )
            : null;
            
          let borderClass = 'border-slate-950';
          let bgClass = 'bg-slate-800 text-slate-200';
          let titleTip = 'Clique para ver detalhes';
          
          if (del) {
            if (del.approved) {
              borderClass = 'border-emerald-500';
              bgClass = 'bg-emerald-950/40 text-emerald-400';
              titleTip = 'Aprovado ✅';
            } else if (del.content.trim()) {
              borderClass = 'border-amber-500';
              bgClass = 'bg-amber-950/40 text-amber-400';
              titleTip = 'Aguardando Aprovação ⏳';
            }
          }

          return (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (onClickDetail) onClickDetail(stage.id, detail);
              }}
              className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-none border-2 shadow-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer ${borderClass} ${bgClass}`}
              title={titleTip}
            >
              {detail}
            </button>
          );
        })}
      </div>
    </div>
  );
});

StageCard.displayName = 'StageCard';

export default StageCard;
