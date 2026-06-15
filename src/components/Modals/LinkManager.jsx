import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { stages } from '../../data/stages';
import { X, Plus, Trash2, Edit2, Link2, Check, AlertCircle } from 'lucide-react';

const LinkManager = ({ team, stageId, onClose }) => {
  const { updateTeamLinks } = useAuth();
  const stage = stages.find(s => s.id === parseInt(stageId));
  
  const currentLinks = team.links[stageId] || [];
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

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
    setError('');

    if (!title.trim()) {
      setError('Por favor, informe um título descritivo para o link.');
      return;
    }
    if (!url.trim()) {
      setError('Por favor, insira a URL do link.');
      return;
    }

    // Auto prepend http/https if missing
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (!validateUrl(formattedUrl)) {
      setError('A URL inserida é inválida. Certifique-se de usar o formato correto.');
      return;
    }

    let updatedLinks = [...currentLinks];
    
    if (editId) {
      // Edit mode
      updatedLinks = updatedLinks.map(l => 
        l.id === editId ? { ...l, title: title.trim(), url: formattedUrl } : l
      );
      setEditId(null);
    } else {
      // Add mode
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
    const updatedLinks = currentLinks.filter(l => l.id !== linkId);
    updateTeamLinks(team.id, stageId, updatedLinks);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setTitle('');
    setUrl('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-slate-900 rounded-none max-w-md w-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-[3px] border-slate-950 z-10 flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div 
          className="p-5 text-white flex justify-between items-center relative border-b-4 border-slate-950"
          style={{ backgroundColor: stage?.color || '#9C27B0' }}
        >
          <div>
            <span className="text-[10px] uppercase font-black bg-slate-950 border border-white px-2 py-0.5 rounded-none">
              Etapa {stageId} — {stage?.title}
            </span>
            <h2 className="text-lg font-black mt-1 text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">Gerenciar Entregas</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-none border border-white p-1.5 transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Links list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
            Links Cadastrados
          </h3>

          <div className="space-y-2">
            {currentLinks.map((link) => (
              <div 
                key={link.id}
                className="flex items-center justify-between p-3 rounded-none bg-slate-800 border-2 border-slate-950 hover:bg-slate-750 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="overflow-hidden mr-2">
                  <h4 className="font-extrabold text-xs text-white truncate">
                    {link.title}
                  </h4>
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-400 font-bold hover:underline truncate block"
                  >
                    {link.url}
                  </a>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(link)}
                    className="p-1 text-white hover:text-blue-400 bg-slate-900 border border-slate-950 rounded-none transition-colors"
                    title="Editar Link"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1 text-white hover:text-red-400 bg-slate-900 border border-slate-950 rounded-none transition-colors"
                    title="Remover Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {currentLinks.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400 font-bold border-2 border-dashed border-slate-700 rounded-none bg-slate-900/40">
                Nenhum link adicionado a esta etapa.
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="p-5 border-t-4 border-slate-950 bg-slate-850">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-3">
            {editId ? '📝 Editar Link' : '➕ Novo Link'}
          </h3>

          <form onSubmit={handleSave} className="space-y-3">
            {error && (
              <div className="p-2 bg-red-950/40 border-2 border-red-900 text-red-200 rounded-none text-[10px] font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Título (Ex: Dashboard do Trello)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-950 rounded-none px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="URL (Ex: trello.com/b/...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-950 rounded-none px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:bg-slate-950 transition-all"
              />
            </div>

            <div className="flex gap-2 pt-1">
              {editId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 border-2 border-slate-950 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2 rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-slate-950 hover:bg-slate-850 text-white text-xs font-black py-2 rounded-none border-2 border-slate-950 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-1"
              >
                {editId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Salvar Alteração
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Link
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LinkManager;
