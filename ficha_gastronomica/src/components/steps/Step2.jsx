import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import InfoCard from '../InfoCard';
import { calculateIngredientLine, calculateTotalCost } from '../../utils/calculations';

const Step2 = ({ recipeData, setRecipeData }) => {
    const [currentIngredient, setCurrentIngredient] = useState({
        produto: '',
        quantidade_liquida: '',
        unidade: 'g',
        preco_bruto_unidade: '',
        rendimento_percentual: 100,
        quantidade_bruta: '1000'
    });

    const addIngredient = () => {
        if (currentIngredient.produto && currentIngredient.quantidade_liquida) {
            const calculated = calculateIngredientLine(currentIngredient);
            setRecipeData({
                ...recipeData,
                ingredientes: [...recipeData.ingredientes, calculated]
            });
            setCurrentIngredient({
                produto: '',
                quantidade_liquida: '',
                unidade: 'g',
                preco_bruto_unidade: '',
                rendimento_percentual: 100,
                quantidade_bruta: '1000'
            });
        }
    };

    const removeIngredient = (index) => {
        const newIngs = [...recipeData.ingredientes];
        newIngs.splice(index, 1);
        setRecipeData({ ...recipeData, ingredientes: newIngs });
    };

    const totalCost = calculateTotalCost(recipeData.ingredientes);

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <InfoCard
                title="2. Ingredientes e Fator de Correção"
                text="O 'Rendimento %' representa o quanto do produto é aproveitado. Se o ingrediente não tem perda (ex: açúcar), use 100%. Se tem casca ou osso, o valor é menor. Insira também a quantidade bruta (tamanho total) e o preço bruto pago pela embalagem."
            />

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-lg">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-amber-500"><Plus size={18} /> Novo Insumo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-4 items-end">
                    <div className="flex flex-col sm:col-span-2 md:col-span-3 lg:col-span-3">
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Produto</label>
                        <input
                            className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                            value={currentIngredient.produto}
                            onChange={(e) => setCurrentIngredient({ ...currentIngredient, produto: e.target.value })}
                            placeholder="Ex: Farinha de Trigo"
                        />
                    </div>
                    <div className="flex flex-col sm:col-span-1 md:col-span-1 lg:col-span-3">
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Qtd Líquida (C)</label>
                        <div className="flex h-10 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden focus-within:border-amber-500 transition-colors">
                            <input
                                type="number"
                                className="w-full h-full px-3 bg-transparent border-none text-white outline-none min-w-[60px]"
                                value={currentIngredient.quantidade_liquida}
                                onChange={(e) => setCurrentIngredient({ ...currentIngredient, quantidade_liquida: e.target.value })}
                                placeholder="Ex: 750"
                            />
                            <select
                                className="h-full bg-slate-700 text-amber-500 font-bold px-2 outline-none border-l border-slate-600 w-20 text-center cursor-pointer"
                                value={currentIngredient.unidade}
                                onChange={(e) => setCurrentIngredient({ ...currentIngredient, unidade: e.target.value })}
                            >
                                <option value="g">g</option>
                                <option value="ml">ml</option>
                                <option value="unid">unid</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col sm:col-span-1 md:col-span-1 lg:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Rendimento % (F)</label>
                        <input
                            type="number"
                            className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                            value={currentIngredient.rendimento_percentual}
                            onChange={(e) => setCurrentIngredient({ ...currentIngredient, rendimento_percentual: e.target.value })}
                            placeholder="Ex: 100"
                        />
                    </div>
                    <div className="flex flex-col sm:col-span-1 md:col-span-1 lg:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Qtd Bruta Emb. (G)</label>
                        <input
                            type="number"
                            className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                            value={currentIngredient.quantidade_bruta}
                            onChange={(e) => setCurrentIngredient({ ...currentIngredient, quantidade_bruta: e.target.value })}
                            placeholder="Ex: 1000"
                        />
                    </div>
                    <div className="flex flex-col sm:col-span-1 md:col-span-1 lg:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Preço Bruto Emb. (E)</label>
                        <input
                            type="number"
                            className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                            value={currentIngredient.preco_bruto_unidade}
                            onChange={(e) => setCurrentIngredient({ ...currentIngredient, preco_bruto_unidade: e.target.value })}
                            placeholder="Ex: 5.00"
                        />
                    </div>
                </div>
                <button
                    onClick={addIngredient}
                    className="mt-6 w-full bg-amber-500 text-slate-900 py-3 rounded-xl font-black hover:bg-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                >
                    ADICIONAR À FICHA
                </button>
            </div>

            <div className="overflow-x-auto border-2 border-slate-100 rounded-2xl shadow-sm">
                <table className="w-full text-sm text-left min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b">
                        <tr>
                            <th className="px-4 py-4 uppercase">Insumo</th>
                            <th className="px-4 py-4 uppercase">Qtd Líq. (C)</th>
                            <th className="px-4 py-4 uppercase text-center text-amber-500">Unid</th>
                            <th className="px-4 py-4 uppercase">Preço Bruto (E)</th>
                            <th className="px-4 py-4 uppercase">Rend % (F)</th>
                            <th className="px-4 py-4 uppercase">Qtd Bruta (G)</th>
                            <th className="px-4 py-4 uppercase">Custo Real (H)</th>
                            <th className="px-4 py-4 text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {recipeData.ingredientes.map((ing, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-4 font-bold text-slate-700">{ing.produto}</td>
                                <td className="px-4 py-4">{ing.quantidade_liquida}</td>
                                <td className="px-4 py-4 text-center font-bold text-slate-400">{ing.unidade}</td>
                                <td className="px-4 py-4">R$ {Number(ing.preco_bruto_unidade).toFixed(2)}</td>
                                <td className="px-4 py-4">{ing.rendimento_percentual}%</td>
                                <td className="px-4 py-4 font-mono text-slate-500">{ing.quantidade_bruta || ing.qto_bruta}{ing.unidade}</td>
                                <td className="px-4 py-4 font-black text-amber-600">R$ {ing.preco_liquido}</td>
                                <td className="px-4 py-4 text-center">
                                    <button onClick={() => removeIngredient(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white">
                        <tr>
                            <td colSpan="6" className="px-4 py-4 text-right text-xs uppercase opacity-70">Total da Preparação:</td>
                            <td className="px-4 py-4 text-lg font-black text-amber-400">R$ {totalCost}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default Step2;
