import React from 'react';
import { Award, Zap, Award as TrophyIcon, Sparkles } from 'lucide-react';

const RankingSidebar = ({ teams, onSelectTeam }) => {
  // Calculate stats and sort teams
  const getSortedTeams = () => {
    return [...teams].map(team => {
      const completedCount = Object.values(team.stagesStatus).filter(s => s === 'completed').length;
      const progressPercent = Math.round((completedCount / 10) * 100);
      
      // Badges system
      const badges = [];
      if (team.stagesStatus[1] === 'completed') badges.push({ emoji: '🚀', name: 'Decolou' });
      if (team.stagesStatus[2] === 'completed') badges.push({ emoji: '🎨', name: 'Identidade Criada' });
      if (team.stagesStatus[3] === 'completed') badges.push({ emoji: '💰', name: 'Modelo Definido' });
      if (team.stagesStatus[10] === 'completed') badges.push({ emoji: '🏆', name: 'Pitch Master' });

      return {
        ...team,
        completedCount,
        progressPercent,
        badges
      };
    }).sort((a, b) => {
      // Sort by progress percent desc, then by currentStage desc, then by name
      if (b.progressPercent !== a.progressPercent) {
        return b.progressPercent - a.progressPercent;
      }
      if (b.currentStage !== a.currentStage) {
        return b.currentStage - a.currentStage;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const sortedTeams = getSortedTeams();
  const maxCompleted = sortedTeams.length > 0 ? sortedTeams[0].completedCount : -1;

  return (
    <div className="bg-slate-900 rounded-none border-[3px] border-slate-900 p-5 shadow-[4px_4px_0px_0px_#020617] h-full flex flex-col justify-start text-white">
      <div className="flex items-center gap-2 pb-4 border-b-2 border-slate-800">
        <TrophyIcon className="w-6 h-6 text-amber-500 fill-amber-100/10" />
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Líderes do Mural
        </h2>
      </div>

      {sortedTeams.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs font-semibold">
          Nenhuma equipe cadastrada no momento.
        </div>
      ) : (
        <div className="mt-4 space-y-3 flex-1 overflow-y-auto pr-1">
          {sortedTeams.map((team, index) => {
            const isLeader = team.completedCount > 0 && team.completedCount === maxCompleted;
            const rank = index + 1;

            return (
              <div
                key={team.id}
                onClick={() => onSelectTeam(team)}
                className={`p-3 rounded-none border-2 border-slate-900 transition-all duration-150 cursor-pointer flex items-center justify-between group neo-interactive ${
                  isLeader 
                    ? 'bg-amber-100 text-slate-950' 
                    : 'bg-slate-800 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank number or Crown */}
                  <div className="w-7 h-7 flex items-center justify-center font-black text-sm relative">
                    {isLeader ? (
                      <span className="text-lg crown-float select-none">👑</span>
                    ) : (
                      <span className={`border-2 border-slate-900 rounded-none w-6 h-6 flex items-center justify-center text-xs font-black ${
                        rank === 2 
                          ? 'bg-slate-600 text-white' 
                          : rank === 3 
                          ? 'bg-orange-300 text-slate-950' 
                          : 'bg-slate-700 text-white'
                      }`}>
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Team Logo / Initials */}
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden flex items-center justify-center bg-slate-900 shadow-sm"
                    style={{ borderColor: team.color }}
                  >
                    {team.logo.startsWith('data:image') || team.logo.startsWith('http') ? (
                      <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-200">
                        {team.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Team details */}
                  <div>
                    <h3 className={`font-extrabold text-sm uppercase leading-tight ${isLeader ? 'text-slate-950' : 'text-white'}`}>
                      {team.name}
                    </h3>
                    
                    {/* Badges list */}
                    <div className="flex items-center gap-1 mt-1">
                      {team.badges.map((badge, idx) => (
                        <span
                          key={idx}
                          title={badge.name}
                          className="text-xs filter drop-shadow-sm select-none"
                        >
                          {badge.emoji}
                        </span>
                      ))}
                      {team.badges.length === 0 && (
                        <span className={`text-[10px] font-extrabold ${isLeader ? 'text-slate-700' : 'text-slate-400'}`}>
                          Fase {team.currentStage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Circle / Percentage */}
                <div className="text-right flex flex-col items-end">
                  <span className={`font-black text-sm ${isLeader ? 'text-slate-950' : 'text-white'}`}>
                    {team.progressPercent}%
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isLeader ? 'text-slate-700' : 'text-slate-400'}`}>
                    {team.completedCount}/10 Etapas
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gamification tip/legend */}
      <div className="mt-4 pt-4 border-t-2 border-slate-800">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          Conquistas Automáticas
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-extrabold text-slate-300">
          <div className="flex items-center gap-1">
            <span>🚀</span> Decolou (Etapa 1)
          </div>
          <div className="flex items-center gap-1">
            <span>🎨</span> Identidade (Etapa 2)
          </div>
          <div className="flex items-center gap-1">
            <span>💰</span> Monetizou (Etapa 3)
          </div>
          <div className="flex items-center gap-1">
            <span>🏆</span> Finalista (Etapa 10)
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingSidebar;
