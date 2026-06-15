import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { stages } from '../../data/stages';
import { 
  X, Plus, Trash2, Edit2, Link2, Check, AlertCircle, 
  ExternalLink, PlayCircle, CheckCircle2, Circle, HelpCircle, ArrowRight
} from 'lucide-react';

const TrelloIcon = () => (
  <svg className="w-4 h-4 text-sky-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 12.5c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-6c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v6zm7-4.5c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-2c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v2z"/>
  </svg>
);

const FigmaIcon = () => (
  <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/>
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/>
    <path d="M12 9h3.5a3.5 3.5 0 1 1-3.5 3.5V9z"/>
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/>
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 0 1-3.5 3.5c-1.93 0-3.5-1.57-3.5-3.5z"/>
  </svg>
);

const GithubIcon = () => (
  <svg className="w-4 h-4 text-slate-300 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const defaultTools = {
  1: { name: "Lean Canvas Interativo", url: "https://leancanvas-interativo.netlify.app/", desc: "Crie o quadro do seu negócio e analise a viabilidade com IA." },
  2: { name: "Canva (Design)", url: "https://www.canva.com/", desc: "Crie a logo, identidade visual e embalagem da sua startup." },
  3: { name: "Trello (Gestão)", url: "https://trello.com/", desc: "Monte o quadro Kanban para gerenciar as tarefas do time." },
  4: { name: "Google Sheets (Planilhas)", url: "https://sheets.new/", desc: "Estruture planilhas de custos fixos, variáveis e projeção financeira." },
  5: { name: "Figma (Protótipos)", url: "https://figma.com/", desc: "Desenhe o wireframe e protótipo interativo do seu MVP." },
  6: { name: "Google Forms (Pesquisa)", url: "https://forms.new/", desc: "Crie questionários para testes de usabilidade com usuários." },
  7: { name: "Tally / Google Forms", url: "https://tally.so/", desc: "Colete feedbacks reais sobre o produto e valide hipóteses." },
  8: { name: "Trello / Notion", url: "https://trello.com/", desc: "Planeje os ajustes e iterações com base no feedback recebido." },
  9: { name: "Canva Slides (Pitch)", url: "https://slides.new/", desc: "Prepare a apresentação de slides (Pitch) para os investidores." },
  10: { name: "YouTube / Drive", url: "https://youtube.com/", desc: "Publique a demonstração final ou o vídeo do pitch de encerramento." }
};

const renderLinkIcon = (url) => {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.includes('trello.com')) return <TrelloIcon />;
    if (domain.includes('figma.com')) return <FigmaIcon />;
    if (domain.includes('github.com')) return <GithubIcon />;
    if (domain.includes('docs.google.com') || domain.includes('drive.google.com')) {
      return <span className="text-emerald-500 font-bold">📄</span>;
    }
    const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    return (
      <img 
        src={faviconUrl} 
        alt="icon" 
        className="w-4 h-4 rounded-sm object-contain" 
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  } catch (e) {
    return <Link2 className="w-4 h-4 text-slate-400" />;
  }
};

const StageHubModal = ({ team, stageId, onClose }) => {
  const { user, updateTeamLinks, updateTeamStage, deliverables } = useAuth();
  const stage = stages.find(s => s.id === parseInt(stageId));
  const tool = defaultTools[stageId];
  
  const currentLinks = team ? (team.links[stageId] || []) : [];
  const status = team ? (team.stagesStatus[stageId] || 'pending') : 'pending';
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const hasPermission = team && user && (user.role === 'admin' || (user.role === 'team' && user.id === team.id));

  const validateUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!hasPermission) return;
    setError('');

    if (!title.trim()) {
      setError('Por favor, informe um título descritivo.');
      return;
    }
    if (!url.trim()) {
      setError('Por favor, insira a URL.');
      return;
    }

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (!validateUrl(formattedUrl)) {
      setError('A URL inserida é inválida.');
      return;
    }

    let updatedLinks = [...currentLinks];
    
    if (editId) {
      updatedLinks = updatedLinks.map(l => 
        l.id === editId ? { ...l, title: title.trim(), url: formattedUrl } : l
      );
      setEditId(null);
    } else {
      const newLink = {
        id: 'lnk-' + Date.now(),
        title: title.trim(),
        url: formattedUrl
      };
      updatedLinks.push(newLink);
    }

    updateTeamLinks(team.id, stageId, updatedLinks);
    setTitle('');
    setUrl('');
  };

  const handleEdit = (link) => {
    setEditId(link.id);
    setTitle(link.title);
    setUrl(link.url);
    setError('');
  };

  const handleDelete = (linkId) => {
    if (!hasPermission) return;
    const updatedLinks = currentLinks.filter(l => l.id !== linkId);
    updateTeamLinks(team.id, stageId, updatedLinks);
    setError('');
  };

  const handleStatusChange = (newStatus) => {
    if (!hasPermission) return;
    setError('');

    if (newStatus === 'completed') {
      const stageDetails = stage?.details || [];
      const stageDeliverables = deliverables.filter(
        d => d.teamId === team.id && d.stageId === parseInt(stageId)
      );
      
      const allApproved = stageDetails.every(detail => {
        const found = stageDeliverables.find(d => d.itemName.toUpperCase() === detail.toUpperCase());
        return found && found.approved;
      });

      if (!allApproved) {
        setError('Você só pode marcar como Concluído se todos os sub-itens dessa etapa forem preenchidos e Aprovados pelo Admin!');
        return;
      }
    }

    updateTeamStage(team.id, stageId, newStatus);
  };

  const handleOpenTool = () => {
    if (!tool) return;
    let targetUrl = tool.url;
    if (parseInt(stageId) === 1 && team) {
      targetUrl = `https://leancanvas-interativo.netlify.app/?teamId=${team.id}`;
    }
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 select-none animate-in fade-in duration-250">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-slate-900 rounded-none max-w-xl w-full shadow-[8px_8px_0px_0px_#020617] overflow-hidden border-[3px] border-slate-950 z-10 flex flex-col max-h-[90vh] text-white">
        
        {/* Header */}
        <div 
          className="p-6 text-white flex justify-between items-start relative border-b-4 border-slate-950"
          style={{ backgroundColor: stage?.color || '#9C27B0' }}
        >
          <div>
            <span className="text-[9px] uppercase font-black bg-slate-950 border border-white px-2 py-0.5 rounded-none tracking-widest">
              Roadmap da Startup — Etapa {stageId}
            </span>
            <h2 className="text-2xl font-black mt-1 text-white drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] uppercase tracking-tight">
              {stage?.title}
            </h2>
            <p className="text-xs font-semibold opacity-95 mt-0.5 max-w-md drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
              {stage?.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-none border-2 border-slate-950 p-2 transition-colors active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Checklist / Requirements */}
          <div className="bg-slate-950/40 p-4 border-2 border-slate-950 neo-shadow">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">📋 Itens a Produzir</h3>
            <div className="flex flex-wrap gap-2">
              {stage?.details.map((detail, index) => (
                <span key={index} className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-1 font-bold rounded-none uppercase">
                  {detail}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Tool */}
          {tool && (
            <div className="bg-slate-950/20 border-2 border-slate-950 p-4 neo-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">🛠️ Ferramenta Recomendada</h3>
                <h4 className="font-extrabold text-sm text-white">{tool.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">{tool.desc}</p>
              </div>
              <button 
                onClick={handleOpenTool}
                className="w-full md:w-auto sharp-button bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 text-[10px] font-black tracking-widest flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#020617] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                <span>ACESSAR FERRAMENTA</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Workspace Links */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              🔗 Links de Trabalho & Entregas {team ? `(${team.name})` : ''}
            </h3>

            <div className="space-y-2">
              {currentLinks.map((link) => (
                <div 
                  key={link.id}
                  className="flex items-center justify-between p-3 rounded-none bg-slate-800 border-2 border-slate-950 hover:bg-slate-750 transition-colors shadow-[2px_2px_0px_0px_#020617]"
                >
                  <div className="overflow-hidden mr-2">
                    <h4 className="font-extrabold text-xs text-white truncate flex items-center gap-2">
                      {renderLinkIcon(link.url)}
                      {link.title}
                    </h4>
                    <a 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-slate-400 font-bold hover:underline truncate block mt-0.5"
                    >
                      {link.url}
                    </a>
                  </div>

                  {hasPermission && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(link)}
                        className="p-1.5 text-white hover:text-blue-400 bg-slate-900 border border-slate-950 rounded-none transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1.5 text-white hover:text-red-400 bg-slate-900 border border-slate-950 rounded-none transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {currentLinks.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 font-bold border-2 border-dashed border-slate-800 rounded-none bg-slate-950/40">
                  Nenhum link de trabalho cadastrado para esta etapa.
                </div>
              )}
            </div>
          </div>

          {/* Add link form */}
          {hasPermission && (
            <div className="bg-slate-850 p-4 border-2 border-slate-950 neo-shadow">
              <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">
                {editId ? '📝 Editar Link da Etapa' : '➕ Adicionar Link da Etapa'}
              </h4>
              <form onSubmit={handleSave} className="space-y-3">
                {error && (
                  <div className="p-2 bg-red-950/40 border border-red-900 text-red-200 rounded-none text-[9px] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Nome do Link (Ex: Nosso Quadro Canva)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 bg-slate-800 border-2 border-slate-950 rounded-none px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="URL (Ex: canva.com/...)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-slate-800 border-2 border-slate-950 rounded-none px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  {editId && (
                    <button
                      type="button"
                      onClick={() => { setEditId(null); setTitle(''); setUrl(''); setError(''); }}
                      className="px-4 py-1.5 border border-slate-700 bg-slate-900 text-white text-[10px] font-bold rounded-none uppercase transition-colors hover:bg-slate-850"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-950 hover:bg-slate-850 text-white text-[10px] font-black rounded-none border border-slate-950 transition-all uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#020617] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    {editId ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Progress / Status Controls */}
          {hasPermission && (
            <div className="bg-slate-950/40 p-4 border-2 border-slate-950 neo-shadow">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">🔄 Progresso da Etapa</h3>
              {error && (
                <div className="p-2 mb-3 bg-red-950/40 border border-red-900 text-red-200 rounded-none text-[9px] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange('pending')}
                  className={`py-2 text-[10px] font-black tracking-widest border-2 uppercase transition-all flex items-center justify-center gap-2 rounded-none ${
                    status === 'pending'
                      ? 'bg-slate-700 border-white text-white'
                      : 'bg-slate-900 border-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <Circle className="w-3.5 h-3.5" />
                  <span>Pendente</span>
                </button>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className={`py-2 text-[10px] font-black tracking-widest border-2 uppercase transition-all flex items-center justify-center gap-2 rounded-none ${
                    status === 'in_progress'
                      ? 'bg-blue-900 border-blue-400 text-white animate-pulse'
                      : 'bg-slate-900 border-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Fazendo</span>
                </button>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className={`py-2 text-[10px] font-black tracking-widest border-2 uppercase transition-all flex items-center justify-center gap-2 rounded-none ${
                    status === 'completed'
                      ? 'bg-emerald-900 border-emerald-450 text-white'
                      : 'bg-slate-900 border-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Feito</span>
                </button>
              </div>
            </div>
          )}

          {!team && (
            <div className="p-4 bg-indigo-950/20 border-2 border-indigo-900/50 text-slate-300 text-xs font-bold text-center uppercase tracking-wide">
              💡 Faça login com a sua Equipe para gerenciar links de trabalho e avançar etapas!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-slate-950 flex items-center justify-end bg-slate-850">
          <button
            onClick={onClose}
            className="bg-slate-950 hover:bg-slate-900 text-white font-black text-xs px-6 py-2.5 rounded-none border-2 border-slate-950 shadow-[3px_3px_0px_0px_#020617] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-widest"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

export default StageHubModal;
