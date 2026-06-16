import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Settings, PlusCircle, LogIn } from 'lucide-react';

const Header = ({ onOpenAdmin, onOpenLogin, onOpenRegister }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900 border-b-4 border-slate-900 sticky top-0 z-40 px-6 py-6 shadow-[0_4px_0_0_#020617]">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Colorful Title matching the style in reference image */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start gap-2">
          <h1 className="text-2xl md:text-3.5xl font-black tracking-wide leading-none select-none">
            <span className="text-[#38bdf8] title-cartoon-3d">PROJETO FINAL</span>{' '}
            <span className="text-[#4ade80] title-cartoon-3d">2026</span>
          </h1>
          <p className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-widest mt-1">
            9 DE JUNHO - 22 DE AGOSTO
          </p>
        </div>

        {/* Institutional Logos / Apoio */}
        <div className="flex items-center gap-5 my-2 md:my-0">
          <img src="/Logos_Startup02.png" alt="Escola Startup" className="h-10 md:h-12 object-contain" />
          <img src="/food_makers.png" alt="Food Makers" className="h-16 md:h-20 object-contain" />
          <img src="/calabria.png" alt="Calabria" className="h-10 md:h-12 object-contain" />
        </div>

        {/* Auth status & actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* User badge */}
              <div className="flex items-center gap-2 bg-yellow-100 border-2 border-slate-900 rounded-none px-4 py-1.5 shadow-sm">
                {user.role === 'admin' ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse border border-slate-900" />
                ) : (
                  <div 
                    className="w-2.5 h-2.5 rounded-full border border-slate-900" 
                    style={{ backgroundColor: user.color }} 
                  />
                )}
                <span className="text-xs font-black text-slate-950 uppercase tracking-wide">
                  {user.role === 'admin' ? 'Coordenador (Admin)' : `Equipe ${user.name}`}
                </span>
              </div>

              {/* Admin Panel button */}
              {user.role === 'admin' && (
                <>
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 bg-[#a78bfa] text-slate-900 border-2 border-slate-900 text-xs font-black px-4 py-2 rounded-none neo-shadow-sm neo-interactive"
                  >
                    <Settings className="w-4 h-4" />
                    Painel do Admin
                  </button>
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 bg-[#818cf8] text-slate-900 border-2 border-slate-900 text-xs font-black px-4 py-2 rounded-none neo-shadow-sm neo-interactive"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Cadastrar Equipe
                  </button>
                </>
              )}

              {/* Logout button */}
              <button
                onClick={logout}
                className="flex items-center justify-center p-2 rounded-none border-2 border-slate-900 bg-slate-800 text-white hover:bg-red-900 transition-colors neo-shadow-sm neo-interactive"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenRegister}
                className="flex items-center gap-1.5 bg-[#a78bfa] text-slate-900 border-2 border-slate-900 text-xs font-black px-4 py-2 rounded-none neo-shadow-sm neo-interactive"
              >
                <PlusCircle className="w-4 h-4" />
                Cadastrar Equipe
              </button>
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 bg-[#fbbf24] text-slate-900 border-2 border-slate-900 text-xs font-black px-5 py-2.5 rounded-none neo-shadow-sm neo-interactive"
              >
                <LogIn className="w-4 h-4" />
                Entrar no Mural
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
