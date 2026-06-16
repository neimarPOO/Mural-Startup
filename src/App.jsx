import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Navigation/Header';
import Mural from './components/Board/Mural';
import RankingSidebar from './components/Navigation/RankingSidebar';
import TeamDrawer from './components/Modals/TeamDrawer';
import AdminPanel from './components/Modals/AdminPanel';
import StageHubModal from './components/Modals/StageHubModal';
import LoginModal from './components/Modals/LoginModal';
import ItemDetailModal from './components/Modals/ItemDetailModal';
import Confetti from './components/UI/Confetti';
import { HelpCircle, Sparkles, BookOpen } from 'lucide-react';

const AppContent = () => {
  const { teams, user, showConfetti } = useAuth();
  
  // Modals / Drawer State
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeStageId, setActiveStageId] = useState(null);
  const [activeDetailItem, setActiveDetailItem] = useState(null); // { stageId, itemName }
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [startInRegister, setStartInRegister] = useState(false);

  const { deliverables } = useAuth();

  // Helper to open Link Manager for the selected team
  const handleManageLinks = (stageId) => {
    setActiveStageId(stageId);
  };

  // Keep selected team state updated if team progress changes
  const currentSelectedTeam = selectedTeam 
    ? teams.find(t => t.id === selectedTeam.id) 
    : null;

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col font-sans text-slate-100">
      {/* Celebration Confetti */}
      <Confetti active={showConfetti} />

      {/* Header */}
      <Header 
        onOpenAdmin={() => setShowAdminPanel(true)} 
        onOpenLogin={() => { setStartInRegister(false); setShowLoginModal(true); }} 
        onOpenRegister={() => { setStartInRegister(true); setShowLoginModal(true); }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Interactive Mural / Game Board */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Welcome Banner */}
          <div className="bg-slate-900 rounded-none neo-border p-6 neo-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Roadmap Gamificado</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white leading-tight mt-1">
                Acompanhe a Jornada das Startups Estudantis!
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-1">
                Clique nos avatares das equipes para ver seus relatórios, acessar links de entrega ou gerenciar o progresso.
              </p>
            </div>
            
            {/* Quick Guide */}
            <div className="flex items-center gap-2 text-xs text-white font-black bg-slate-800 border-2 border-slate-900 rounded-none px-4 py-2 flex-shrink-0 shadow-sm">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>10 etapas até a grande final</span>
            </div>
          </div>
 
          {/* Interactive Mural Card */}
          <div className="bg-slate-900 rounded-none neo-border p-4 neo-shadow">
            <Mural 
              onSelectTeam={(team) => setSelectedTeam(team)}
              onClickDetail={(stageId, item) => setActiveDetailItem({ stageId, itemName: item })}
              deliverables={deliverables}
              selectedTeamId={currentSelectedTeam?.id || (user?.role === 'team' ? user.id : null)}
              onSelectStage={(stage) => {
                setActiveStageId(stage.id);
                
                // If a user is logged in as a team, automatically select their own team
                if (user && user.role === 'team') {
                  const teamToSelect = teams.find(t => t.id === user.id);
                  if (teamToSelect) {
                    setSelectedTeam(teamToSelect);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Right Column: Leaderboard Sidebar */}
        <div className="w-full lg:w-[360px] flex-shrink-0">
          <RankingSidebar 
            teams={teams} 
            onSelectTeam={(team) => setSelectedTeam(team)}
          />
        </div>
      </main>

      {/* --- OVERLAY MODALS & DRAWERS --- */}

      {/* Login / Register Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          startInRegister={startInRegister}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* Item Detail Modal */}
      {activeDetailItem && (
        <ItemDetailModal
          team={currentSelectedTeam || (user?.role === 'team' ? teams.find(t => t.id === user.id) : null)}
          stageId={activeDetailItem.stageId}
          itemName={activeDetailItem.itemName}
          onClose={() => setActiveDetailItem(null)}
        />
      )}

      {/* Team Details Drawer */}
      {currentSelectedTeam && (
        <TeamDrawer 
          team={currentSelectedTeam} 
          onClose={() => setSelectedTeam(null)}
          onManageLinks={handleManageLinks}
        />
      )}

      {/* Stage Action Hub Modal */}
      {activeStageId && (
        <StageHubModal 
          team={currentSelectedTeam} 
          stageId={activeStageId} 
          onClose={() => setActiveStageId(null)}
        />
      )}

      {/* Premium Footer with Institutional Logos */}
      <footer className="py-8 bg-slate-950 border-t-4 border-slate-900 mt-12 px-6">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm font-black text-white uppercase tracking-wider">
              MURAL ESCOLA STARTUP 2026
            </p>
            <p className="text-xs text-slate-500 font-bold mt-1">
              Todos os direitos reservados.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-3">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              Realização & Apoio Institucional
            </span>
            <div className="flex items-center gap-6">
              <img src="/Logos_Startup02.png" alt="Logo Startup 02" className="h-14 md:h-18 object-contain hover:scale-105 transition-transform duration-200" />
              <img src="/food_makers.png" alt="Food Makers" className="h-20 md:h-26 object-contain hover:scale-105 transition-transform duration-200" />
              <img src="/calabria.png" alt="Calabria" className="h-14 md:h-18 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
