import React from 'react';
import { Download, Eye, Calculator } from 'lucide-react';
import { calculateTotalCost, calculateCostPerPortion, calculateSellingPrice } from '../../utils/calculations';
import { exportToFormattedExcel } from '../../utils/exportExcel';

const Step4 = ({ recipeData }) => {
    const totalCost = calculateTotalCost(recipeData.ingredientes);
    const costPerPortion = calculateCostPerPortion(totalCost, recipeData.rendimento_porcoes);
    const sellingPrice = calculateSellingPrice(costPerPortion);

    const handleExport = () => {
        exportToFormattedExcel(recipeData, totalCost, costPerPortion);
    };

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-400">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-b-8 border-amber-500">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black mb-2 text-amber-500">{recipeData.prato || 'Sem Nome'}</h2>
                        <p className="text-slate-400 uppercase text-xs tracking-widest font-bold">Ficha Concluída com Sucesso</p>
                    </div>
                    <div className="flex gap-4 flex-wrap justify-center md:justify-end">
                        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 min-w-[130px] text-center">
                            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Custo Total</span>
                            <span className="text-xl font-black text-white">R$ {totalCost}</span>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 min-w-[130px] text-center">
                            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Custo Unitário</span>
                            <span className="text-xl font-black text-white">R$ {costPerPortion}</span>
                        </div>
                        <div className="bg-amber-500 p-4 rounded-2xl min-w-[130px] text-center">
                            <span className="block text-[10px] text-amber-900 uppercase font-bold mb-1">Preço Venda (3.05x)</span>
                            <span className="text-xl font-black text-slate-900">R$ {sellingPrice}</span>
                        </div>
                    </div>
                </div>
                <Calculator className="absolute -right-8 -bottom-8 opacity-10 text-white" size={240} />
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-3xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-700 uppercase text-sm tracking-tighter">
                    <Eye size={18} className="text-amber-500" /> Prévia da Ficha Técnica (Layout Oficial)
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300 text-[10px] font-mono overflow-x-auto">
                    <div className="grid grid-cols-8 gap-x-1 gap-y-0.5 min-w-[700px] border border-slate-200 p-2 bg-white">
                        {/* Logo Area */}
                        <div className="col-span-8 bg-slate-50 h-10 flex items-center justify-center border-b mb-2 italic text-slate-400 text-[8px]">
                            [ CABEÇALHO COM LOGOS ESCOLA STARTUP & REDE CALÁBRIA ]
                        </div>

                        {/* Row 7 */}
                        <div className="col-span-5"></div>
                        <div className="bg-slate-100 p-1 font-bold border">Custo Total</div>
                        <div className="bg-green-100 p-1 border font-bold">R$ {totalCost}</div>
                        <div className=""></div>

                        {/* Row 8 */}
                        <div className="bg-slate-100 p-1 font-bold border">Referência</div>
                        <div className="bg-white p-1 border">{recipeData.referencia}</div>
                        <div className="bg-slate-100 p-1 font-bold border">Guarnição</div>
                        <div className="col-span-2 bg-white p-1 border">{recipeData.guarnicao}</div>
                        <div className="bg-slate-100 p-1 font-bold border">Custo Porção</div>
                        <div className="bg-green-100 p-1 border font-bold">R$ {costPerPortion}</div>
                        <div className=""></div>

                        {/* Row 9 */}
                        <div className="bg-slate-100 p-1 font-bold border">Prato</div>
                        <div className="col-span-4 bg-white p-1 border">{recipeData.prato}</div>
                        <div className="bg-slate-100 p-1 font-bold border">Preço Venda</div>
                        <div className="bg-green-100 p-1 border font-bold">R$ {sellingPrice}</div>
                        <div className=""></div>

                        {/* Row 10 - NOVO: Aluno */}
                        <div className="bg-slate-100 p-1 font-bold border">Aluno</div>
                        <div className="col-span-4 bg-white p-1 border font-bold text-blue-600">{recipeData.colaborador || '-'}</div>
                        <div className="col-span-3"></div>

                        {/* Row 11 */}
                        <div className="bg-slate-100 p-1 font-bold border col-span-2">Rendimento (porções)</div>
                        <div className="bg-white p-1 border">{recipeData.rendimento_porcoes}</div>
                        <div className="col-span-5"></div>

                        {/* Table Header Row 14 */}
                        <div className="col-span-8 h-4"></div>
                        <div className="bg-emerald-900 text-white p-1 font-bold border text-center text-[7px]">Produto</div>
                        <div className="bg-emerald-900 text-white p-1 font-bold border text-center text-[7px]">Qtd</div>
                        <div className="bg-emerald-900 text-white p-1 font-bold border text-center text-[7px]">Unid</div>
                        <div className="bg-emerald-900 text-white p-1 font-bold border text-center text-[7px]">Preço B.</div>
                        <div className="bg-emerald-900 text-white p-1 font-bold border text-center text-[7px]">Rend %</div>
                        <div className="bg-emerald-800 text-white p-1 font-bold border text-center text-[7px]">Qtd Bruta</div>
                        <div className="bg-emerald-800 text-white p-1 font-bold border text-center text-[7px]">P. Líquido</div>
                        <div className="bg-white border"></div>

                        {/* Ingredients Rows */}
                        {recipeData.ingredientes.slice(0, 3).map((ing, i) => (
                            <React.Fragment key={i}>
                                <div className="bg-white p-1 border truncate">{ing.produto}</div>
                                <div className="bg-white p-1 border text-center">{ing.quantidade_liquida}</div>
                                <div className="bg-white p-1 border text-center font-bold text-slate-400">{ing.unidade}</div>
                                <div className="bg-white p-1 border text-center">R$ {ing.preco_bruto_unidade}</div>
                                <div className="bg-white p-1 border text-center">{ing.rendimento_percentual}%</div>
                                <div className="bg-green-50 p-1 border text-center font-bold text-emerald-700">{ing.qto_bruta}{ing.unidade}</div>
                                <div className="bg-green-50 p-1 border text-center font-bold text-emerald-700">R$ {ing.preco_liquido}</div>
                                <div className="bg-white border text-center"></div>
                            </React.Fragment>
                        ))}
                        {recipeData.ingredientes.length > 3 && <div className="col-span-8 text-center py-1 text-slate-400 italic text-[7px]">...mais {recipeData.ingredientes.length - 3} ingredientes...</div>}
                    </div>
                    <div className="mt-4 opacity-70 italic text-blue-600 font-bold">Layout sincronizado 100% com o modelo do Google Sheets.</div>
                </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl flex items-center gap-4 border border-emerald-100">
                <div className="bg-emerald-500 p-3 rounded-full text-white">
                    <Download size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-emerald-900">Exportação de Alta Fidelidade</h4>
                    <p className="text-emerald-700 text-sm">O download agora gera um arquivo que respeita exatamente as colunas, cores e cabeçalhos (incluindo logos) da sua planilha modelo.</p>
                </div>
            </div>

            <button
                onClick={handleExport}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-black transition-all transform hover:-translate-y-1 shadow-xl flex items-center justify-center gap-3 border-b-8 border-emerald-600"
            >
                BAIXAR MINHA FICHA (MODELO OFICIAL)
            </button>
        </div>
    );
};

export default Step4;
