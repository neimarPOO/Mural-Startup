import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, User, LogIn, AlertCircle, Sparkles, Upload, Palette, Check } from 'lucide-react';

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

const LoginModal = ({ onClose, startInRegister = false }) => {
  const { login, addTeam, teams } = useAuth();
  const [isRegister, setIsRegister] = useState(startInRegister);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [color, setColor] = useState('#2196F3');
  const [logo, setLogo] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Por favor, informe o nome.');
      return;
    }
    if (!password) {
      setError('Por favor, digite a senha.');
      return;
    }

    if (isRegister) {
      const loginName = username.toLowerCase().replace(/\s+/g, '');
      
      // Check if name already exists
      const alreadyExists = teams.some(t => t.login === loginName);
      if (alreadyExists) {
        setError('Já existe uma equipe com este nome (ou nome semelhante).');
        return;
      }

      try {
        await addTeam({
          name: username.trim(),
          password: password,
          color,
          logo
        });
        
        // Auto login
        const result = login(loginName, password);
        if (result.success) {
          onClose();
        } else {
          setError('Equipe cadastrada, mas falha no login automático. Tente entrar manualmente.');
          setIsRegister(false);
        }
      } catch (err) {
        setError('Erro ao cadastrar equipe. Tente novamente.');
      }
    } else {
      const result = login(username, password);
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-slate-900 rounded-none max-w-md w-full shadow-[8px_8px_0px_0px_#020617] overflow-hidden border-[3px] border-slate-950 z-10 p-6 md:p-8 text-white max-h-[95vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:bg-slate-800 p-1.5 rounded-none border-2 border-slate-950 transition-all active:scale-95 bg-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Branding header */}
        <div className="text-center mt-2">
          <div className="w-12 h-12 rounded-none bg-slate-800 border-2 border-slate-950 flex items-center justify-center mx-auto text-indigo-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {isRegister ? <Sparkles className="w-6 h-6 text-yellow-450" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mt-4">
            {isRegister ? 'Nova Startup' : 'Acessar o Mural'}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {isRegister ? 'Cadastre sua equipe para iniciar a jornada no mural.' : 'Entre como coordenador ou com o perfil da sua startup.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mt-6 border-b-2 border-slate-950 pb-4">
          <button 
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`py-2 text-[10px] font-black tracking-widest uppercase border-2 transition-all rounded-none ${
              !isRegister 
                ? 'bg-slate-700 border-white text-white shadow-[2px_2px_0px_0px_#000]' 
                : 'bg-slate-900 border-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button 
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`py-2 text-[10px] font-black tracking-widest uppercase border-2 transition-all rounded-none ${
              isRegister 
                ? 'bg-slate-700 border-white text-white shadow-[2px_2px_0px_0px_#000]' 
                : 'bg-slate-900 border-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Cadastrar Time
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="p-3 bg-red-950/40 border-2 border-red-900 text-red-200 rounded-none text-xs font-bold flex items-start gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name Input */}
          <div>
            <label className="block text-xs font-black text-slate-350 uppercase tracking-wider mb-1">
              {isRegister ? 'Nome da Startup' : 'Usuário / Login'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={isRegister ? 'Ex: Tech Flow' : "Nome da equipe ou 'admin'"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-950 rounded-none pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:bg-slate-950 text-white transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-black text-slate-355 uppercase tracking-wider mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-950 rounded-none pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:bg-slate-950 text-white transition-all"
              />
            </div>
          </div>

          {/* Register-Only Fields */}
          {isRegister && (
            <>
              {/* Color Selector */}
              <div>
                <label className="block text-xs font-black text-slate-350 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Cor do Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-none border-2 border-slate-950 relative flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && (
                        <Check className="w-4 h-4 text-white stroke-[3px] drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-black text-slate-350 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Logo da Startup
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center justify-center bg-slate-800 hover:bg-slate-750 text-white border-2 border-slate-950 text-xs font-bold px-4 py-2.5 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
                    <span>Selecionar Arquivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[180px]">
                    {logoFileName || 'Nenhum arquivo (usará sigla)'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-850 text-white text-sm font-black py-3 rounded-none border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all mt-6 uppercase tracking-wider"
          >
            {isRegister ? (
              <>
                <Sparkles className="w-4 h-4" />
                Cadastrar e Entrar
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Entrar
              </>
            )}
          </button>
        </form>

        {/* Credentials guide for testing */}
        {!isRegister && (
          <div className="mt-6 pt-4 border-t-2 border-slate-950 text-[10px] text-slate-400 font-semibold text-center leading-relaxed">
            <p>Coordenador: use o login configurado no <b>.env</b></p>
            <p className="mt-1">Equipe Seed: <b>alphatech</b> / <b>at123</b> (ou crie nova via admin)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
