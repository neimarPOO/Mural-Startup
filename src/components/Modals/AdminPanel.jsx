import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, Trash2, ShieldAlert, Sparkles, Upload, Palette, Pencil } from 'lucide-react';

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

const AdminPanel = ({ onClose }) => {
  const { teams, addTeam, updateTeam, deleteTeam } = useAuth();
  
  const [editingTeam, setEditingTeam] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [color, setColor] = useState('#2196F3');
  const [logo, setLogo] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [error, setError] = useState('');

  const handleEditClick = (team) => {
    setEditingTeam(team);
    setName(team.name);
    setPassword(team.password);
    setColor(team.color);
    setLogo(team.logo);
    setLogoFileName(team.logo && !team.logo.startsWith('data:image/svg+xml') ? 'Logo atual' : '');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setName('');
    setPassword('');
    setColor('#2196F3');
    setLogo('');
    setLogoFileName('');
    setError('');
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor, informe o nome da equipe.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor, defina uma senha de acesso.');
      return;
    }

    const login = name.toLowerCase().replace(/\s+/g, '');

    if (editingTeam) {
      // Check if team name login already exists for other teams
      const alreadyExists = teams.some(t => t.login === login && t.id !== editingTeam.id);
      if (alreadyExists) {
        setError('Já existe outra equipe com este nome (ou nome semelhante).');
        return;
      }

      updateTeam(editingTeam.id, {
        name: name.trim(),
        password: password.trim(),
        color,
        logo
      });

      handleCancelEdit();
    } else {
      // Check if team name login already exists
      const alreadyExists = teams.some(t => t.login === login);
      if (alreadyExists) {
        setError('Já existe uma equipe com este nome (ou nome semelhante).');
        return;
      }

      addTeam({
        name: name.trim(),
        password: password.trim(),
        color,
        logo
      });

      // Reset Form
      setName('');
      setPassword('');
      setColor('#2196F3');
      setLogo('');
      setLogoFileName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-slate-900 rounded-none max-w-4xl w-full shadow-[6px_6px_0px_0px_#020617] overflow-hidden flex flex-col md:flex-row border-[3px] border-slate-950 z-10 max-h-[90vh] text-white">
        {/* Left Side: Team Registration Form */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto border-b md:border-b-0 md:border-r-4 md:border-slate-950 border-slate-800 bg-slate-900">
          <div className="flex justify-between items-center pb-4 border-b-2 border-slate-950">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {editingTeam ? 'Editar Equipe' : 'Cadastrar Nova Equipe'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-white hover:bg-slate-800 p-1 rounded-none border border-slate-950 bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {error && (
              <div className="p-3 bg-red-950/40 border-2 border-red-900 text-red-200 rounded-none text-xs font-bold">
                ⚠️ {error}
              </div>
            )}

            {/* Team Name */}
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">
                Nome da Startup
              </label>
              <input
                type="text"
                placeholder="Ex: Eco Bag"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-950 rounded-none px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:bg-slate-950 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">
                Senha de Acesso
              </label>
              <input
                type="text"
                placeholder="Ex: bag123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-950 rounded-none px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:bg-slate-950 transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-bold">
                O login será automático em minúsculas (ex: <b>ecobag</b>).
              </p>
            </div>

            {/* Color selection */}
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                Cor de Destaque
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-none transition-transform active:scale-90 relative border-2 border-slate-950"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && (
                      <span className="absolute inset-0.5 border-2 border-white flex items-center justify-center text-white text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
                
                {/* Custom Color Picker */}
                <div className="relative w-8 h-8 rounded-none border-2 border-slate-950 overflow-hidden flex items-center justify-center cursor-pointer bg-slate-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <Palette className="w-4 h-4 text-slate-300 pointer-events-none" />
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">
                Logo da Startup (Opcional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-none p-3 bg-slate-800 hover:bg-slate-750 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-300">
                    {logoFileName ? logoFileName : 'Fazer upload do logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logo && (
                  <div className="w-12 h-12 rounded-none overflow-hidden border-2 border-slate-950 flex items-center justify-center bg-slate-800 flex-shrink-0">
                    <img src={logo} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {editingTeam ? (
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-black py-3 rounded-none border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-white text-sm font-black py-3 rounded-none border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white text-sm font-black py-3 rounded-none border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all mt-4"
              >
                <Plus className="w-4 h-4" />
                Adicionar Equipe ao Tabuleiro
              </button>
            )}
          </form>
        </div>

        {/* Right Side: Manage Existing Teams */}
        <div className="w-full md:w-[350px] p-6 md:p-8 bg-slate-850 flex flex-col max-h-[400px] md:max-h-none overflow-y-auto border-t-4 md:border-t-0 border-slate-950">
          <div className="flex justify-between items-center pb-4 border-b-2 border-slate-950">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">
              Gerenciar Equipes ({teams.length})
            </h3>
            <button
              onClick={onClose}
              className="hidden md:block text-white hover:bg-slate-800 p-1.5 rounded-none border-2 border-slate-950 bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3 flex-1 overflow-y-auto pr-1">
            {teams.map((t) => (
              <div 
                key={t.id} 
                className="flex items-center justify-between bg-slate-800 border-2 border-slate-950 p-3 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div 
                    className="w-8 h-8 rounded-full border-2 overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: t.color }}
                  >
                    {t.logo.startsWith('data:image') || t.logo.startsWith('http') ? (
                      <img src={t.logo} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-white">
                        {t.name.substring(0,2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-extrabold text-xs text-white truncate uppercase">
                      {t.name}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-bold truncate">
                      User: {t.login} | Senha: {t.password}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleEditClick(t)}
                    className="p-1.5 hover:bg-slate-700 text-white rounded-none border border-slate-950 bg-slate-900 transition-colors"
                    title="Editar Equipe"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja excluir a equipe "${t.name}"? Todos os progressos e links serão perdidos permanentemente.`)) {
                        deleteTeam(t.id);
                        if (editingTeam && editingTeam.id === t.id) {
                          handleCancelEdit();
                        }
                      }
                    }}
                    className="p-1.5 hover:bg-slate-700 text-white rounded-none border border-slate-950 bg-slate-900 transition-colors"
                    title="Excluir Equipe"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {teams.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500 font-bold">
                Nenhuma equipe cadastrada.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
