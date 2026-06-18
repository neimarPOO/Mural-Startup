import React from 'react';
import InfoCard from '../InfoCard';

const Step3 = ({ recipeData, setRecipeData }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <InfoCard
                title="3. Processos e Ferramental"
                text="Uma boa ficha técnica garante que o sabor seja o mesmo não importa quem esteja na cozinha. Detalhe tempos, temperaturas e ferramentas utilizadas."
            />
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Passo a Passo (Modo de Fazer)</label>
                    <textarea
                        className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl h-64 focus:border-amber-500 outline-none text-slate-700 leading-relaxed"
                        placeholder="1. Bata a manteiga com o açúcar... 2. Adicione as gemas..."
                        value={recipeData.preparo}
                        onChange={(e) => setRecipeData({ ...recipeData, preparo: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Utensílios Necessários</label>
                    <input
                        type="text"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                        placeholder="Batedeira, Bowl, Espátula, Assadeira perfurada..."
                        value={recipeData.utensilios}
                        onChange={(e) => setRecipeData({ ...recipeData, utensilios: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
};

export default Step3;
