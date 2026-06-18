import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { stages } from '../../data/stages';
import { X, Save, CheckCircle, AlertTriangle, User, ShieldAlert, Upload, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const ItemDetailModal = ({ team, stageId, itemName, onClose }) => {
  const { user, teams, deliverables, saveDeliverable, approveDeliverable, saveFeedback } = useAuth();
  
  const stage = stages.find(s => s.id === parseInt(stageId));
  const isMediaStage = [2, 5, 6, 7].includes(parseInt(stageId));
  
  // Allow visitors/admins to switch teams inside the modal if no team was pre-selected
  const [selectedTeamId, setSelectedTeamId] = useState(team ? team.id : (teams[0] ? teams[0].id : ''));
  const activeTeam = teams.find(t => t.id === selectedTeamId);

  const deliverable = deliverables.find(
    d => d.teamId === selectedTeamId && d.stageId === parseInt(stageId) && d.itemName === itemName
  );
  
  const [contentText, setContentText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const [adminFeedback, setAdminFeedback] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isFeedbackSaved, setIsFeedbackSaved] = useState(false);

  // Sync content and feedback when active team or database updates
  useEffect(() => {
    if (deliverable) {
      let parsed = { text: '', mediaUrl: '' };
      try {
        if (deliverable.content.startsWith('{')) {
          parsed = JSON.parse(deliverable.content);
        } else {
          parsed = { text: deliverable.content, mediaUrl: '' };
        }
      } catch (e) {
        parsed = { text: deliverable.content || '', mediaUrl: '' };
      }
      
      setContentText(parsed.text || '');
      setMediaUrl(parsed.mediaUrl || '');
      setAdminFeedback(deliverable.feedback || '');
    } else {
      setContentText('');
      setMediaUrl('');
      setAdminFeedback('');
    }
    setIsSaved(false);
    setIsFeedbackSaved(false);
    setUploadError('');
  }, [selectedTeamId, deliverables, stageId, itemName]);

  const hasEditPermission = activeTeam && user && (
    user.role === 'admin' || (user.role === 'team' && user.id === activeTeam.id)
  );
  const isAdmin = user && user.role === 'admin';

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const fileExt = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
      const sanitizedTeamId = activeTeam.id
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_]/g, "");
      const fileName = `${sanitizedTeamId}_${stageId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('mural_media')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('mural_media')
        .getPublicUrl(filePath);

      setMediaUrl(publicUrl);
      
      // Auto-save: immediately persist upload URL to database to avoid loss if modal is closed
      const finalContent = JSON.stringify({ text: contentText, mediaUrl: publicUrl });
      saveDeliverable(activeTeam.id, stageId, itemName, finalContent);
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      setUploadError(err.message || 'Falha no upload do arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = async () => {
    if (!hasEditPermission) return;
    
    const urlToRemove = mediaUrl;
    if (!urlToRemove) return;

    setMediaUrl('');
    setUploadError('');

    const isUploaded = urlToRemove.includes('/storage/v1/object/public/mural_media/');
    if (isUploaded) {
      try {
        const parts = urlToRemove.split('/mural_media/');
        const filePath = parts[parts.length - 1];
        const { error } = await supabase.storage
          .from('mural_media')
          .remove([filePath]);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao excluir do Storage:', err);
        setUploadError('Erro ao deletar arquivo físico do Storage.');
      }
    }

    const finalContent = contentText.trim() ? JSON.stringify({ text: contentText, mediaUrl: '' }) : '';
    saveDeliverable(activeTeam.id, stageId, itemName, finalContent);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!hasEditPermission) return;
    
    const finalContent = isMediaStage
      ? (contentText.trim() || mediaUrl.trim() ? JSON.stringify({ text: contentText, mediaUrl }) : '')
      : contentText;

    saveDeliverable(activeTeam.id, stageId, itemName, finalContent);
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

  const renderMediaPreview = (url) => {
    if (!url) return null;
    
    // Check if YouTube link
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const ytMatch = url.match(ytRegex);
    if (ytMatch && ytMatch[1]) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video"
        />
      );
    }
    
    // Check if Vimeo link
    const vimeoRegex = /vimeo\.com\/(?:video\/)?([0-9]+)/i;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          title="Vimeo video player"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video"
        />
      );
    }

    // Check if direct video file link
    const isVideo = /\.(mp4|webm|ogg|mov)(?:\?.*)?$/i.test(url) || url.includes('/storage/v1/object/public/mural_media/') && (url.includes('.mp4') || url.includes('.webm'));
    if (isVideo) {
      return (
        <video controls className="w-full max-h-[250px] object-contain">
          <source src={url} />
          Seu navegador não suporta a reprodução de vídeo.
        </video>
      );
    }

    // Check if image link
    const isImage = /\.(jpeg|jpg|gif|png|webp|svg)(?:\?.*)?$/i.test(url) || url.includes('/storage/v1/object/public/mural_media/') && !(url.includes('.mp4') || url.includes('.webm'));
    if (isImage) {
      return (
        <img
          src={url}
          alt="Entregável da equipe"
          className="w-full max-h-[250px] object-contain"
        />
      );
    }

    // Fallback: link
    return (
      <div className="p-4 text-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-black text-indigo-400 hover:underline break-all"
        >
          Abrir link em nova aba ↗
        </a>
      </div>
    );
  };

  const hasContent = contentText.trim() !== '' || mediaUrl.trim() !== '';

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
                  : hasContent
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
                      : hasContent
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
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  disabled={!hasEditPermission}
                  placeholder={hasEditPermission ? "Escreva aqui a resposta da equipe ou cole o link do documento..." : "Nenhuma entrega registrada ainda."}
                  className="w-full h-24 bg-slate-800 border-2 border-slate-950 rounded-none px-3 py-2 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all resize-none disabled:opacity-60"
                />
              </div>

              {/* Media Upload / URL section (Only for stages 2, 5, 6, 7) */}
              {isMediaStage && (
                <div className="space-y-2 border-2 border-slate-950 p-3 bg-slate-950/20">
                  <label className="block text-[10px] font-black text-slate-405 uppercase tracking-wider">
                    Anexar Imagem ou Vídeo:
                  </label>
                  
                  <div className="flex flex-col gap-2">
                    {/* Link URL input */}
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      disabled={!hasEditPermission || isUploading}
                      placeholder="Cole uma URL externa (YouTube, Vimeo, imagem ou vídeo)..."
                      className="w-full bg-slate-800 border-2 border-slate-950 px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all disabled:opacity-60"
                    />
                    
                    {/* File Upload Button wrapper */}
                    {hasEditPermission && (
                      <div className="relative">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          accept="image/*,video/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                        />
                        <button
                          type="button"
                          className="w-full bg-slate-905 text-white border-2 border-slate-950 px-3 py-2 text-[10px] font-black tracking-widest flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000]"
                        >
                          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>{isUploading ? 'ENVIANDO...' : 'OU FAÇA UPLOADING DE ARQUIVO'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-[10px] text-red-400 font-bold mt-1">{uploadError}</p>
                  )}

                  {/* Media Preview inside the panel */}
                  {mediaUrl && (
                    <div className="mt-3 border border-slate-950 p-1 bg-slate-950/40 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[8.5px] font-black text-slate-450 uppercase tracking-widest">
                          Pré-visualização:
                        </span>
                        {hasEditPermission && (
                          <button
                            type="button"
                            onClick={handleRemoveMedia}
                            className="text-red-400 hover:text-red-350 text-[9px] font-black flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            Remover
                          </button>
                        )}
                      </div>
                      <div className="overflow-hidden border border-slate-950 bg-slate-950 flex items-center justify-center min-h-[120px] max-h-[250px]">
                        {renderMediaPreview(mediaUrl)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit button for teams */}
              {hasEditPermission && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[8px] text-slate-400 font-bold uppercase leading-tight">
                    💡 Salvar reinicia a aprovação do coordenador.
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
                  disabled={!hasContent}
                  className={`flex-1 py-2.5 text-[10px] font-black tracking-widest border-2 uppercase transition-all flex items-center justify-center gap-2 rounded-none shadow-[2px_2px_0px_0px_#020617] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                    !hasContent
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
