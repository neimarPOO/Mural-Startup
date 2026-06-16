import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { stages } from '../../data/stages';
import StageCard from './StageCard';
import TeamAvatar from './TeamAvatar';
import { ArrowRight, ArrowLeft, RefreshCw, Sparkles, Award } from 'lucide-react';

const Mural = ({ onSelectTeam, onSelectStage, onClickDetail, deliverables, selectedTeamId }) => {
  const { teams, stageDetails } = useAuth();
  const boardRef = useRef(null);
  const cardRefs = useRef({});
  const [coords, setCoords] = useState({});

  // Recalculate card center coordinates relative to the board container
  const updateCoords = () => {
    if (!boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const newCoords = {};

    Object.keys(cardRefs.current).forEach((key) => {
      const el = cardRefs.current[key];
      if (el) {
        const rect = el.getBoundingClientRect();
        newCoords[key] = {
          x: (rect.left + rect.width / 2) - boardRect.left,
          y: (rect.top + rect.height / 2) - boardRect.top
        };
      }
    });
    setCoords(newCoords);
  };

  useEffect(() => {
    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [teams]); // dependency on teams to recalculate if teams render changes positions

  // Helper to get teams at a specific stage position
  const getTeamsAtPosition = (posId) => {
    return teams.filter(team => {
      const isFinished = team.stagesStatus[10] === 'completed';
      const currentPos = isFinished ? 'finish' : team.currentStage;
      return String(currentPos) === String(posId);
    });
  };

  // Determine the leader(s) (highest number of completed stages)
  const getLeaders = () => {
    if (teams.length === 0) return [];
    let maxCompleted = -1;
    let leaders = [];
    
    teams.forEach(t => {
      const completedCount = Object.values(t.stagesStatus).filter(s => s === 'completed').length;
      if (completedCount > maxCompleted) {
        maxCompleted = completedCount;
        leaders = [t.id];
      } else if (completedCount === maxCompleted) {
        leaders.push(t.id);
      }
    });
    
    return leaders;
  };

  const leaders = getLeaders();

  // Create the winding board connector path (SVG)
  const getSvgPath = () => {
    if (
      !coords[1] || !coords[2] || !coords[3] || !coords[4] ||
      !coords[5] || !coords[6] || !coords[7] || !coords['curveLeft'] ||
      !coords[8] || !coords[9] || !coords[10] || !coords['finish']
    ) return '';

    return `
      M ${coords[1].x} ${coords[1].y}
      L ${coords[2].x} ${coords[2].y}
      L ${coords[3].x} ${coords[3].y}
      L ${coords[4].x} ${coords[4].y}
      C ${coords[4].x + 80} ${coords[4].y}, ${coords[5].x + 80} ${coords[5].y}, ${coords[5].x} ${coords[5].y}
      L ${coords[6].x} ${coords[6].y}
      L ${coords[7].x} ${coords[7].y}
      C ${coords[7].x - 80} ${coords[7].y}, ${coords['curveLeft'].x - 20} ${coords['curveLeft'].y - 20}, ${coords['curveLeft'].x} ${coords['curveLeft'].y}
      C ${coords['curveLeft'].x} ${coords['curveLeft'].y + 20}, ${coords[8].x - 80} ${coords[8].y}, ${coords[8].x} ${coords[8].y}
      L ${coords[9].x} ${coords[9].y}
      L ${coords[10].x} ${coords[10].y}
      L ${coords['finish'].x} ${coords['finish'].y}
    `;
  };

  return (
    <div className="relative w-full overflow-x-auto p-4 select-none">
      <div 
        ref={boardRef} 
        className="min-w-[1200px] max-w-none w-full mx-auto relative serpentine-grid p-8 bg-slate-900 border-[3px] border-slate-950 rounded-none shadow-[8px_8px_0px_0px_#020617]"
      >
        {/* SVG connection lines in the background */}
        {Object.keys(coords).length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Outline shadow pathway (the asphalt road) */}
            <path
              d={getSvgPath()}
              fill="none"
              stroke="#1e293b"
              strokeWidth="48"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner dashed line center of the road */}
            <path
              d={getSvgPath()}
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="trail-road"
            />
          </svg>
        )}

        {/* --- ROW 1 (Left to Right) --- */}
        <div className="col-start-1 row-start-1">
          <StageCard
            ref={el => cardRefs.current[1] = el}
            stage={stages[0]}
            onClick={onSelectStage}
            onClickDetail={onClickDetail}
            deliverables={deliverables}
            stageDetails={stageDetails}
            selectedTeamId={selectedTeamId}
            teamCount={getTeamsAtPosition(1).length}
            direction="right"
          />
        </div>
        
        <div className="col-start-2 row-start-1">
          <StageCard
            ref={el => cardRefs.current[2] = el}
            stage={stages[1]}
            onClick={onSelectStage}
            onClickDetail={onClickDetail}
            deliverables={deliverables}
            stageDetails={stageDetails}
            selectedTeamId={selectedTeamId}
            teamCount={getTeamsAtPosition(2).length}
            direction="right"
          />
        </div>

        <div className="col-start-3 row-start-1">
          <StageCard
            ref={el => cardRefs.current[3] = el}
            stage={stages[2]}
            onClick={onSelectStage}
            onClickDetail={onClickDetail}
            deliverables={deliverables}
            stageDetails={stageDetails}
            selectedTeamId={selectedTeamId}
            teamCount={getTeamsAtPosition(3).length}
            direction="right"
          />
        </div>

        <div className="col-start-4 row-start-1">
          <StageCard
            ref={el => cardRefs.current[4] = el}
            stage={stages[3]}
            onClick={onSelectStage}
            onClickDetail={onClickDetail}
            deliverables={deliverables}
            stageDetails={stageDetails}
            selectedTeamId={selectedTeamId}
            teamCount={getTeamsAtPosition(4).length}
            direction="right"
          />
        </div>

        {/* --- ROW 2 (Right to Left) --- */}
        <div className="col-start-4 row-start-2">
          <StageCard
            ref={el => cardRefs.current[5] = el}
            stage={stages[4]}
            onClick={onSelectStage}
            onClickDetail={onClickDetail}
            deliverables={deliverables}
            stageDetails={stageDetails}
            selectedTeamId={selectedTeamId}
            teamCount={getTeamsAtPosition(5).length}
            direction="left"
          />
        </div>

        <div className="col-start-3 row-start-2">
          <StageCard
            ref={el => cardRefs.current[6] = el}
            stage={stages[5]}
            onClick={onSelectStage}
            onClickDetail={onClickDetail}
            deliverables={deliverables}
            stageDetails={stageDetails}
            selectedTeamId={selectedTeamId}
            teamCount={getTeamsAtPosition(6).length}
            direction="left"
          />
        </div>

        <div className="col-start-2 row-start-2">
          <StageCard
            ref={el => cardRefs.current[7] = el}
            stage={stages[6]}
            onClick={onSelectStage}
            onClickDetail={onClickDetail}
            deliverables={deliverables}
            stageDetails={stageDetails}
            selectedTeamId={selectedTeamId}
            teamCount={getTeamsAtPosition(7).length}
            direction="left"
          />
        </div>

        {/* Curve connector block "Melhora Tudo!" */}
        <div
          ref={el => cardRefs.current['curveLeft'] = el}
          className="col-start-1 row-start-2 self-center justify-self-center bg-amber-950/40 border-[3px] border-slate-950 rounded-none p-4 w-full h-[120px] flex flex-col justify-center items-center text-center shadow-[4px_4px_0px_0px_#020617] relative group transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#020617] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#020617] z-10"
        >
          <div className="absolute -top-3.5 -right-3.5 bg-amber-550 text-slate-900 border-2 border-slate-900 rounded-full p-1 shadow-sm animate-spin-slow">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-amber-400 text-sm tracking-wide uppercase">
            Melhora Tudo!
          </span>
          <p className="text-[10px] text-amber-200 font-bold mt-1 max-w-[120px]">
            Ajuste o rumo do projeto!
          </p>
        </div>

        {/* --- ROW 3 (Left to Right) --- */}
        <div className="col-start-1 row-start-3">
          <StageCard
            ref={el => cardRefs.current[8] = el}
            stage={stages[7]}
            onClick={onSelectStage}
            onClickDetail={onClickDetail}
            deliverables={deliverables}
            stageDetails={stageDetails}
            selectedTeamId={selectedTeamId}
            teamCount={getTeamsAtPosition(8).length}
            direction="right"
          />
        </div>

        <div className="col-start-2 row-start-3">
          <StageCard
            ref={el => cardRefs.current[9] = el}
            stage={stages[8]}
            onClick={onSelectStage}
            onClickDetail={onClickDetail}
            deliverables={deliverables}
            stageDetails={stageDetails}
            selectedTeamId={selectedTeamId}
            teamCount={getTeamsAtPosition(9).length}
            direction="right"
          />
        </div>

        <div className="col-start-3 row-start-3">
          <StageCard
            ref={el => cardRefs.current[10] = el}
            stage={stages[9]}
            onClick={onSelectStage}
            onClickDetail={onClickDetail}
            deliverables={deliverables}
            stageDetails={stageDetails}
            selectedTeamId={selectedTeamId}
            teamCount={getTeamsAtPosition(10).length}
            direction="right"
          />
        </div>

        {/* Finish area stage mockup */}
        <div
          ref={el => cardRefs.current['finish'] = el}
          className="col-start-4 row-start-3 self-stretch border-[3px] border-slate-900 rounded-none bg-slate-950 p-4 flex flex-col justify-between items-center text-center shadow-[4px_4px_0px_0px_#0f172a] relative overflow-hidden group transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#0f172a] z-10"
        >
          {/* Checkered flag top/bottom bars */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(90deg,#fff_50%,#000_50%)] bg-[length:16px_100%] border-b border-slate-900" />
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[linear-gradient(90deg,#fff_50%,#000_50%)] bg-[length:16px_100%] border-t border-slate-900" />

          {/* Sparkle effects */}
          <div className="absolute top-2 left-2 text-yellow-400 opacity-60 animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="absolute bottom-2 right-2 text-indigo-400 opacity-60 animate-pulse-slow">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="flex flex-col items-center mt-2">
            <Award className="w-12 h-12 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-bounce-slow" />
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mt-2">
              Pitch Final
            </h4>
            <span className="text-[10px] text-purple-300 font-bold bg-purple-950/80 px-2 py-0.5 border border-purple-800 rounded-full mt-1">
              22 de Agosto
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-semibold mb-2">
            Conquiste os investidores! 🏆
          </p>
        </div>

        {/* --- DYNAMIC ABSOLUTE POSITIONED AVATARS --- */}
        {teams.map(team => {
          const isFinished = team.stagesStatus[10] === 'completed';
          const posId = isFinished ? 'finish' : team.currentStage;
          
          const stageTeams = getTeamsAtPosition(posId);
          const teamIdx = stageTeams.findIndex(t => t.id === team.id);
          
          const cardCoord = coords[posId];
          if (!cardCoord || teamIdx === -1) return null;

          // Compute centered horizontal stacking with vertical offset
          const count = stageTeams.length;
          // Offset distance: 22px horizontal, stagger slightly vertically for depth
          const offsetX = (teamIdx - (count - 1) / 2) * 24;
          const offsetY = posId === 'finish' || posId === 'curveLeft' ? 20 : 25; 

          return (
            <TeamAvatar
              key={team.id}
              team={team}
              x={cardCoord.x + offsetX}
              y={cardCoord.y + offsetY}
              isLeader={leaders.includes(team.id)}
              onClick={onSelectTeam}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Mural;
