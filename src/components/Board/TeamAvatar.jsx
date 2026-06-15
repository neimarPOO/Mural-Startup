import React from 'react';
import { Crown } from 'lucide-react';

const TeamAvatar = ({ team, x, y, isLeader, onClick }) => {
  // Calculate completion percentage
  const completedCount = Object.values(team.stagesStatus).filter(s => s === 'completed').length;
  const progressPercent = Math.round((completedCount / 10) * 100);

  return (
    <div
      className="absolute z-30 group cursor-pointer team-avatar-transition select-none avatar-pulsing rounded-full"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        '--avatar-color': team.color,
      }}
      onClick={() => onClick(team)}
    >
      {/* Crown for leader */}
      {isLeader && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 z-40 crown-float">
          <Crown className="w-6 h-6 fill-amber-400 drop-shadow-md" />
        </div>
      )}

      {/* Avatar circular frame */}
      <div
        className="w-12 h-12 rounded-full border-4 shadow-lg transition-transform duration-300 group-hover:scale-110 flex items-center justify-center bg-white overflow-hidden"
        style={{ borderColor: team.color }}
      >
        {team.logo.startsWith('data:image') || team.logo.startsWith('http') ? (
          <img
            src={team.logo}
            alt={team.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to text if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Text fallback (hidden if image loads successfully) */}
        <div
          className="w-full h-full flex items-center justify-center font-bold text-white uppercase text-sm"
          style={{
            backgroundColor: team.color,
            display: team.logo.startsWith('data:image') || team.logo.startsWith('http') ? 'none' : 'flex'
          }}
        >
          {team.name.substring(0, 2)}
        </div>
      </div>

      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-950 text-white text-xs rounded-none border border-slate-700 py-2 px-3 shadow-xl whitespace-nowrap z-50 pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-100">
        <div className="font-bold">{team.name}</div>
        <div className="text-slate-300 mt-0.5">Progresso: {progressPercent}% ({completedCount}/10)</div>
        <div className="text-slate-400 text-[10px] mt-0.5">Fase: {team.currentStage}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
      </div>
    </div>
  );
};

export default TeamAvatar;
