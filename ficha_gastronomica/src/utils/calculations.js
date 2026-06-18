export const calculateIngredientLine = (ing) => {
    const quant = Number(ing.quantidade_liquida) || 0;
    const rend = (Number(ing.rendimento_percentual) || 100) / 100;
    const qto_bruta = Number(ing.quantidade_bruta) || 1;
    const preco_bruto = Number(ing.preco_bruto_unidade) || 0;
    
    // Formula: (Quantidade / (Quantidade Bruta * Rendimento %)) * Preço Bruto
    const preco_liquido = ((quant / (qto_bruta * rend)) * preco_bruto).toFixed(2);
    return { ...ing, qto_bruta, preco_liquido };
};

export const calculateTotalCost = (ingredientes) => {
    return ingredientes.reduce((acc, curr) => acc + parseFloat(curr.preco_liquido || 0), 0).toFixed(2);
};

export const calculateCostPerPortion = (totalCost, rendimentoPorcoes) => {
    return (totalCost / (rendimentoPorcoes || 1)).toFixed(2);
};

export const calculateSellingPrice = (costPerPortion) => {
    return (Number(costPerPortion) * 3.0536).toFixed(2);
};
