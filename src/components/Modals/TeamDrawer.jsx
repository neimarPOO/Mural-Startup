import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { stages } from '../../data/stages';
import { 
  X, CheckCircle2, PlayCircle, Circle, Link2, 
  ExternalLink, Plus, Edit, Trash2, FileText, ChevronRight,
  Pencil, Upload, Palette, Check
} from 'lucide-react';

const TrelloIcon = () => (
  <svg className="w-4 h-4 text-sky-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 12.5c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-6c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v6zm7-4.5c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-2c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v2z"/>
  </svg>
);

const FigmaIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/>
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/>
    <path d="M12 9h3.5a3.5 3.5 0 1 1-3.5 3.5V9z"/>
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/>
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 0 1-3.5 3.5c-1.93 0-3.5-1.57-3.5-3.5z"/>
  </svg>
);

const GithubIcon = () => (
  <svg className="w-4 h-4 text-slate-800 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const renderLinkIcon = (url) => {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const sizeClass = "w-4 h-4";
    if (domain.includes('trello.com')) return <TrelloIcon />;
    if (domain.includes('figma.com')) return <FigmaIcon />;
    if (domain.includes('github.com')) return <GithubIcon />;
    if (domain.includes('docs.google.com') || domain.includes('drive.google.com')) {
      return <FileText className={`${sizeClass} text-emerald-600`} />;
    }
    
    // Google Favicon service as fallback
    const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    return (
      <span className="flex items-center justify-center">
        <img 
          src={faviconUrl} 
          alt="icon" 
          className="w-4 h-4 rounded-sm object-contain" 
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'inline-block';
          }}
        />
        <Link2 className={`${sizeClass} text-slate-400`} style={{ display: 'none' }} />
      </span>
    );
  } catch (e) {
    return <Link2 className="w-4 h-4 text-slate-400" />;
  }
};

const presetColors = [
  '#4CAF50', // verde
  '#FF9800', // laranja
  '#2196F3', // azul
  '#FFC107', // amarelo
  '#9C27B0', // roxo
  '#E91E63', // rosa
  '#00BCD4', // ciano
  '#3F51B5', // indigo
];

const TeamDrawer = ({ team, onClose, onManageLinks }) => {
  const { user, updateTeamStage, updateTeam } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(team ? team.name : '');
  const [password, setPassword] = useState(team ? team.password : '');
  const [color, setColor] = useState(team ? team.color : '#2196F3');
  const [logo, setLogo] = useState(team ? team.logo : '');
  const [logoFileName, setLogoFileName] = useState('');
  const [members, setMembers] = useState(team ? (team.members || '') : '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (team) {
      setName(team.name);
      setPassword(team.password);
      setColor(team.color);
      setLogo(team.logo);
      setMembers(team.members || '');
      setLogoFileName('');
      setError('');
      setIsEditingProfile(false);
    }
  }, [team]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('O logo deve ter menos de 2MB.');
        return;
      }
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('O nome da equipe não pode ser vazio.');
      return;
    }
    if (!password.trim()) {
      setError('A senha não pode ser vazia.');
      return;
    }

    updateTeam(team.id, {
      name: name.trim(),
      password: password.trim(),
      color,
      logo,
      members: members.trim()
    });

    setIsEditingProfile(false);
  };

  if (!team) return null;

  // Calculate statistics
  const completedCount = Object.values(team.stagesStatus).filter(s => s === 'completed').length;
  const progressPercent = Math.round((completedCount / 10) * 100);

  // Check if current user has edit permission for this team
  const hasPermission = user && (user.role === 'admin' || (user.role === 'team' && user.id === team.id));

  // Determine stage status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  const handleStatusChange = (stageId, currentStatus) => {
    if (!hasPermission) return;
    
    // Toggle cycle: pending -> in_progress -> completed -> pending
    let nextStatus = 'pending';
    if (currentStatus === 'pending') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'completed';
    
    updateTeamStage(team.id, stageId, nextStatus);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Panel Container */}
        {/* Panel Container */}
        <div className="w-screen max-w-md bg-slate-900 shadow-2xl flex flex-col h-full rounded-none border-l-4 border-slate-950 text-white">
          
          {/* Header */}
          <div 
            className="p-6 relative text-white flex flex-col justify-end border-b-4 border-slate-950"
            style={{ 
              background: `linear-gradient(135deg, ${team.color}dd, ${team.color})`,
              minHeight: '180px'
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-none p-2 border border-white transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo and Name */}
            <div className="flex items-center gap-4 mt-6">
              <div 
                className="w-16 h-16 rounded-none bg-slate-900 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center"
              >
                {team.logo.startsWith('data:image') || team.logo.startsWith('http') ? (
                  <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-black text-white">
                    {team.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-white bg-slate-950 border border-white px-2 py-0.5 rounded-none">
                    Fase {team.currentStage}
                  </span>
                  {hasPermission && (
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="p-1 bg-slate-950 hover:bg-slate-850 text-white rounded-none border border-white transition-all active:scale-90 flex items-center justify-center gap-1 text-[8px] font-black"
                      title="Editar Informações da Equipe"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>EDITAR PERFIL</span>
                    </button>
                  )}
                </div>
                <h2 className="text-2xl font-black mt-1 leading-tight tracking-tight text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] truncate">
                  {team.name}
                </h2>
                <p className="text-[10px] text-white font-bold opacity-85 mt-1 truncate">
                  👥 {team.members || 'Sem integrantes cadastrados'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="px-6 py-4 border-b-4 border-slate-950 bg-slate-850">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300 uppercase">
              <span>Progresso Geral</span>
              <span className="text-white font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 h-4 border-2 border-slate-950 rounded-none mt-2 overflow-hidden">
              <div 
                className="h-full rounded-none transition-all duration-500 ease-out border-r border-slate-950"
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: team.color
                }}
              />
            </div>
          </div>

          {/* Stages list / Profile Editor */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4 bg-slate-850 p-4 border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b-2 border-slate-950 pb-2">
                  Editar Perfil da Equipe
                </h3>

                {error && (
                  <div className="p-2 bg-red-950/40 border border-red-900 text-red-200 rounded-none text-[10px] font-bold">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Nome da Startup
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-950 rounded-none px-3 py-2 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Senha de Acesso
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-950 rounded-none px-3 py-2 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Participantes / Integrantes
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ana, Bruno, Carlos"
                    value={members}
                    onChange={(e) => setMembers(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-950 rounded-none px-3 py-2 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all"
                  />
                </div>

                {/* Color Preset */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Cor da Startup
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="w-6 h-6 rounded-none border-2 border-slate-950 relative flex items-center justify-center hover:scale-110 active:scale-95"
                        style={{ backgroundColor: c }}
                      >
                        {color === c && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3px] drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Upload de Logo (imagem)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-950 text-[10px] font-bold px-3 py-2 rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                      <span>Selecionar Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[150px]">
                      {logoFileName || (logo ? 'Logo Atual' : 'Sigla')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t-2 border-slate-950">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-slate-900 border-2 border-slate-950 text-white hover:bg-slate-800 text-[10px] font-black py-2 rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black border-2 border-slate-950 hover:bg-slate-100 text-[10px] font-black py-2 rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Acompanhamento de Etapas
                </h3>

            {stages.map((stage) => {
              const status = team.stagesStatus[stage.id] || 'pending';
              const linksList = team.links[stage.id] || [];

              return (
                <div 
                  key={stage.id} 
                  className={`border-2 border-slate-950 rounded-none p-4 transition-all duration-200 shadow-[2px_2px_0px_0px_#020617] ${
                    status === 'in_progress' 
                      ? 'bg-blue-950/20' 
                      : 'bg-slate-800 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-3">
                      {/* Interactive Status Indicator */}
                      <button
                        onClick={() => handleStatusChange(stage.id, status)}
                        disabled={!hasPermission}
                        className={`flex-shrink-0 transition-transform ${
                          hasPermission ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
                        }`}
                        title={hasPermission ? 'Clique para alterar status' : 'Status da etapa'}
                      >
                        {getStatusIcon(status)}
                      </button>

                      {/* Stage info */}
                      <div>
                        <h4 className="font-extrabold text-white text-sm leading-snug">
                          {stage.id}. {stage.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                          {status === 'completed' 
                            ? 'Concluída ✅' 
                            : status === 'in_progress' 
                            ? 'Em Andamento 🔄' 
                            : 'Pendente ⬜'}
                        </p>
                      </div>
                    </div>

                    {/* Manage Links trigger */}
                    {hasPermission && (
                      <button
                        onClick={() => onManageLinks(stage.id)}
                        className="flex items-center justify-center p-1.5 rounded-none border-2 border-slate-950 bg-slate-900 hover:bg-slate-800 text-white transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#020617] shadow-[2px_2px_0px_0px_#020617]"
                        title="Gerenciar Links"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Stage Links */}
                  {linksList.length > 0 ? (
                    <div className="mt-3 pt-3 border-t-2 border-slate-950 space-y-1.5">
                      {linksList.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-none bg-slate-900 border-2 border-slate-950 hover:bg-slate-850 text-xs text-white font-bold group/link transition-all"
                        >
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            {renderLinkIcon(link.url)}
                            <span className="truncate">{link.title}</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover/link:text-white flex-shrink-0 transition-colors" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    linksList.length === 0 && hasPermission && (
                      <button
                        onClick={() => onManageLinks(stage.id)}
                        className="mt-3 w-full border-2 border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white rounded-none py-2 flex items-center justify-center gap-1 text-[11px] font-bold transition-all bg-slate-900/40"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Adicionar links de entrega
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

          {/* Footer controls */}
          <div className="p-6 border-t-4 border-slate-950 flex items-center justify-between bg-slate-850">
            {hasPermission && (
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                💡 Clique no ícone de círculo para alternar status
              </span>
            )}
            <button
              onClick={onClose}
              className="ml-auto bg-slate-950 hover:bg-slate-900 text-white font-black text-xs px-5 py-2.5 rounded-none border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              Fechar Detalhes
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TeamDrawer;
