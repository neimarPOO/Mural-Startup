import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { stages } from '../../data/stages';
import { X, Save, CheckCircle, AlertTriangle, User, ShieldAlert } from 'lucide-react';

const ItemDetailModal = ({ team, stageId, itemName, onClose }) => {
  const { user, teams, deliverables, saveDeliverable, approveDeliverable, saveFeedback } = useAuth();
  
  const stage = stages.find(s => s.id === parseInt(stageId));
  
  // Allow visitors/admins to switch teams inside the modal if no team was pre-selected
  const [selectedTeamId, setSelectedTeamId] = useState(team ? team.id : (teams[0] ? teams[0].id : ''));
  const activeTeam = teams.find(t => t.id === selectedTeamId);

  const deliverable = deliverables.find(
    d => d.teamId === selectedTeamId && d.stageId === parseInt(stageId) && d.itemName === itemName
  );
  
  const [content, setContent] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isFeedbackSaved, setIsFeedbackSaved] = useState(false);

  // Sync content and feedback when active team or database updates
  useEffect(() => {
    if (deliverable) {
      setContent(deliverable.content);
      setAdminFeedback(deliverable.feedback || '');
    } else {
      setContent('');
      setAdminFeedback('');
    }
    setIsSaved(false);
    setIsFeedbackSaved(false);
  }, [selectedTeamId, deliverables, stageId, itemName]);

  const hasEditPermission = activeTeam && user && (
    user.role === 'admin' || (user.role === 'team' && user.id === activeTeam.id)
  );
  const isAdmin = user && user.role === 'admin';

  const handleSave = (e) => {
    e.preventDefault();
    if (!hasEditPermission) return;
    
    saveDeliverable(activeTeam.id, stageId, itemName, content);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleApproveToggle = () => {
    if (!isAdmin) return;
    const nextApproved = !deliverable?.approved;
    approveDeliverable(activeTeam.id, stageId, itemName, nextApproved);
  };

  const handleSaveFeedback = () => {
    if (!isAdmin) return;
    saveFeedback(activeTeam.id, stageId, itemName, adminFeedback);
    setIsFeedbackSaved(true);
    setTimeout(() => setIsFeedbackSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-slate-900 rounded-none max-w-md w-full shadow-[8px_8px_0px_0px_#020617] overflow-hidden border-[3px] border-slate-950 z-10 flex flex-col max-h-[90vh] text-white">
        
        {/* Header */}
        <div 
          className="p-5 text-white flex justify-between items-start relative border-b-4 border-slate-950"
          style={{ backgroundColor: stage?.color || '#9C27B0' }}
        >
          <div>
            <span className="text-[9px] uppercase font-black bg-slate-950 border border-white px-2 py-0.5 rounded-none tracking-widest">
              Etapa {stageId} — {stage?.title}
            </span>
            <h2 className="text-xl font-black mt-1 text-white drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] uppercase tracking-tight">
              Objetivo: {itemName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-none border-2 border-slate-950 p-1.5 transition-colors active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Team Dropdown Selector (if opened from mural/public view) */}
          {!team && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                Visualizando Equipe:
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-950 rounded-none px-3 py-2 text-xs font-bold text-white focus:outline-none"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {activeTeam ? (
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Approval status banner */}
              <div className={`p-3 border-2 border-slate-950 flex items-center justify-between shadow-xs ${
                deliverable?.approved 
                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/50' 
                  : content.trim() 
                  ? 'bg-amber-950/20 text-amber-400 border-amber-900/50' 
                  : 'bg-slate-950/40 text-slate-400 border-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  {deliverable?.approved ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {deliverable?.approved 
                      ? 'Entrega Aprovada ✅' 
                      : content.trim() 
                      ? 'Aguardando Avaliação do Admin ⏳' 
                      : 'Pendente / Não Iniciado ⬜'}
                  </span>
                </div>
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Descreva o conteúdo ou adicione o link de entrega:
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={!hasEditPermission}
                  placeholder={hasEditPermission ? "Escreva aqui a resposta da equipe ou cole o link do documento..." : "Nenhuma entrega registrada ainda."}
                  className="w-full h-32 bg-slate-800 border-2 border-slate-950 rounded-none px-3 py-2 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all resize-none disabled:opacity-60"
                />
              </div>

              {/* Submit button for teams */}
              {hasEditPermission && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[8px] text-slate-400 font-bold uppercase leading-tight">
                    💡 Alterar o texto reinicia a aprovação do coordenador.
                  </span>
                  <button
                    type="submit"
                    className="sharp-button bg-white text-black px-4 py-2 text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'SALVO!' : 'SALVAR'}</span>
                  </button>
                </div>
              )}
              
              {/* Feedback display (read-only for students/visitors) */}
              {!isAdmin && deliverable?.feedback && (
                <div className="mt-4 bg-purple-950/20 border-2 border-purple-900/40 p-3 shadow-xs">
                  <span className="block text-[9px] font-black text-purple-400 uppercase tracking-wider mb-1">
                    💬 Feedback do Administrador:
                  </span>
                  <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap">
                    {deliverable.feedback}
                  </p>
                </div>
              )}
            </form>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 font-bold border-2 border-dashed border-slate-850 rounded-none">
              Nenhuma equipe cadastrada para visualizar.
            </div>
          )}

          {/* Admin Evaluation Panel */}
          {isAdmin && activeTeam && (
            <div className="border-t-2 border-slate-950 pt-4 mt-4 space-y-4">
              <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Painel de Avaliação do Coordenador
              </h3>
              
              {/* Admin feedback input */}
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  Feedback sobre o objetivo:
                </label>
                <textarea
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  placeholder="Escreva orientações, críticas ou parabéns à equipe..."
                  className="w-full h-20 bg-slate-800 border-2 border-slate-950 rounded-none px-3 py-2 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveFeedback}
                    className="sharp-button bg-slate-950 text-white border-2 border-slate-950 px-3 py-1.5 text-[9px] font-black tracking-widest flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isFeedbackSaved ? 'FEEDBACK SALVO!' : 'SALVAR FEEDBACK'}</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleApproveToggle}
                  disabled={!content.trim()}
                  className={`flex-1 py-2.5 text-[10px] font-black tracking-widest border-2 uppercase transition-all flex items-center justify-center gap-2 rounded-none shadow-[2px_2px_0px_0px_#020617] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                    !content.trim() 
                      ? 'opacity-20 cursor-default shadow-none pointer-events-none'
                      : deliverable?.approved
                      ? 'bg-red-900 border-red-500 text-white hover:bg-red-800'
                      : 'bg-emerald-500 border-slate-950 text-black hover:bg-emerald-400'
                  }`}
                >
                  {deliverable?.approved ? 'Revogar Aprovação' : 'Aprovar Entrega'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-slate-950 flex items-center justify-end bg-slate-850">
          <button
            onClick={onClose}
            className="bg-slate-950 hover:bg-slate-900 text-white font-black text-xs px-5 py-2 rounded-none border-2 border-slate-950 shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-widest"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

export default ItemDetailModal;
