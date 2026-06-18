import React from 'react';
import InfoCard from '../InfoCard';

const Step1 = ({ recipeData, setRecipeData }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <InfoCard
                title="1. Identificação da Receita"
                text="Insira os dados básicos. Lembre-se: a referência ajuda a organizar o receituário da cozinha e o rendimento define o custo final de cada porção."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Nome do Prato</label>
                    <input
                        type="text"
                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all text-lg font-bold"
                        placeholder="Ex: Biscoito Amanteigado com Amêndoas"
                        value={recipeData.prato}
                        onChange={(e) => setRecipeData({ ...recipeData, prato: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Código / Referência</label>
                    <input
                        type="text"
                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                        placeholder="Ex: BIS-001"
                        value={recipeData.referencia}
                        onChange={(e) => setRecipeData({ ...recipeData, referencia: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Acompanhamento / Guarnição</label>
                    <input
                        type="text"
                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                        placeholder="Ex: Açúcar de confeiteiro"
                        value={recipeData.guarnicao}
                        onChange={(e) => setRecipeData({ ...recipeData, guarnicao: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Rendimento em Porções</label>
                    <input
                        type="number"
                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none font-bold"
                        value={recipeData.rendimento_porcoes}
                        min="1"
                        onChange={(e) => setRecipeData({ ...recipeData, rendimento_porcoes: parseInt(e.target.value) || 1 })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Nome do Aluno / Colaborador</label>
                    <input
                        type="text"
                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                        placeholder="Seu nome completo"
                        value={recipeData.colaborador}
                        onChange={(e) => setRecipeData({ ...recipeData, colaborador: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
};

export default Step1;
