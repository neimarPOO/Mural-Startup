import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToFormattedExcel = async (recipeData, total, perPortion) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ficha Técnica', {
    views: [{ showGridLines: false }]
  });

  // Configuração de Colunas (A a H)
  const startRow = 14;

  worksheet.columns = [
    { header: '', key: 'col_a', width: 4 },
    { header: '', key: 'col_b', width: 40 },
    { header: '', key: 'col_c', width: 15 },
    { header: '', key: 'col_d', width: 12 },
    { header: '', key: 'col_e', width: 15 },
    { header: '', key: 'col_f', width: 15 },
    { header: '', key: 'col_g', width: 18 },
    { header: '', key: 'col_h', width: 18 },
  ];

  // Cores do Modelo
  const colorLabel = 'F1F5F9';     // Cinza azulado
  const colorResult = 'D9EAD3';    // Verde claro
  const colorHeaderBg = '0D3B31';  // Verde escuro
  const colorHeaderFg = 'FFFFFF';  // Branco
  const colorBorder = 'CBD5E1';    // Borda slate-300

  const styleBorder = {
    top: { style: 'thin', color: { argb: colorBorder } },
    left: { style: 'thin', color: { argb: colorBorder } },
    bottom: { style: 'thin', color: { argb: colorBorder } },
    right: { style: 'thin', color: { argb: colorBorder } }
  };

  // --- LOGOS (Linhas 1-6) ---
  // Carregando o logo diretamente da pasta public para evitar erros de Base64 corrompido
  try {
    const response = await fetch('/logos_template.png');
    if (!response.ok) throw new Error('Falha ao carregar logo');
    const arrayBuffer = await response.arrayBuffer();

    const imageId = workbook.addImage({
      buffer: arrayBuffer,
      extension: 'png',
    });

    // Posiciona o logo de B1 até H6
    worksheet.addImage(imageId, {
      tl: { col: 1, row: 0 },
      br: { col: 8, row: 5.5 },
      editAs: 'oneCell'
    });
  } catch (error) {
    console.error('Erro ao carregar logo para o Excel:', error);
    // Continua sem o logo em caso de erro para não travar o download
  }

  // Espaçamento para o cabeçalho (Linhas 1-6 vazias para o logo)
  for (let i = 1; i <= 6; i++) {
    worksheet.getRow(i).height = 15;
  }

  // --- CUSTO TOTAL (Linha 7) ---
  const row7 = worksheet.getRow(7);
  row7.getCell('G').value = 'Custo Total';
  // H7 será uma fórmula de soma de todos os preços líquidos
  const lastIngRow = startRow + recipeData.ingredientes.length;
  row7.getCell('H').value = { formula: `SUM(H${startRow + 1}:H${lastIngRow > startRow ? lastIngRow : startRow + 1})` };
  row7.getCell('H').numFmt = '"R$ "0.00';

  [row7.getCell('G'), row7.getCell('H')].forEach(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorResult } };
    cell.font = { bold: true, color: { argb: '166534' } }; // Verde escuro para o texto
    cell.border = styleBorder;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // --- IDENTIFICAÇÃO (Linha 8) ---
  const row8 = worksheet.getRow(8);
  row8.getCell('B').value = 'Referência';
  row8.getCell('C').value = recipeData.referencia || '-';
  row8.getCell('D').value = 'Guarnição';
  row8.getCell('E').value = recipeData.guarnicao || '-';
  row8.getCell('G').value = 'Custo Porção';
  row8.getCell('H').value = { formula: 'H7/C11' };
  row8.getCell('H').numFmt = '"R$ "0.00';

  // Estilo labels linha 8
  ['B', 'D', 'G'].forEach(col => {
    const cell = row8.getCell(col);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorLabel } };
    cell.font = { bold: true };
    cell.border = styleBorder;
  });
  // Estilo valores linha 8
  ['C', 'E', 'H'].forEach(col => {
    const cell = row8.getCell(col);
    cell.border = styleBorder;
    if (col === 'H') {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorResult } };
      cell.font = { bold: true, color: { argb: '166534' } };
      cell.alignment = { horizontal: 'center' };
    }
  });

  // --- PRATO (Linha 9) ---
  worksheet.mergeCells('B9:E9');
  const cellPratoLabel = worksheet.getCell('B9');
  cellPratoLabel.value = `Prato: ${recipeData.prato || 'Novo Prato'}`;
  cellPratoLabel.font = { bold: true, size: 12 };
  cellPratoLabel.alignment = { vertical: 'middle' };
  cellPratoLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
  cellPratoLabel.border = styleBorder;

  const row9 = worksheet.getRow(9);
  row9.getCell('G').value = 'Preço Venda';
  row9.getCell('H').value = { formula: 'H8*3.0536' };
  row9.getCell('H').numFmt = '"R$ "0.00';
  [row9.getCell('G'), row9.getCell('H')].forEach(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorResult } };
    cell.font = { bold: true, color: { argb: '166534' } };
    cell.border = styleBorder;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // --- ALUNO (Linha 10) ---
  worksheet.mergeCells('B10:E10');
  const cellAlunoLabel = worksheet.getCell('B10');
  cellAlunoLabel.value = `Aluno / Colaborador: ${recipeData.colaborador || '-'}`;
  cellAlunoLabel.font = { bold: true };
  cellAlunoLabel.border = styleBorder;

  // --- RENDIMENTO (Linha 11) ---
  const row11 = worksheet.getRow(11);
  row11.getCell('B').value = 'Rendimento (porções)';
  row11.getCell('C').value = recipeData.rendimento_porcoes;

  row11.getCell('B').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorLabel } };
  row11.getCell('B').font = { bold: true };
  row11.getCell('B').border = styleBorder;
  row11.getCell('C').border = styleBorder;
  row11.getCell('C').alignment = { horizontal: 'center' };

  // --- TABELA DE INGREDIENTES ---
  const headerRow = worksheet.getRow(startRow);
  const headers = ['Produto', 'Quantidade', 'Unidade', 'Preço Bruto', 'Rendimento (%)', 'Quantidade Bruta', 'Preço Líquido'];
  const columns = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];

  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(columns[idx]);
    cell.value = h;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHeaderBg } };
    cell.font = { bold: true, color: { argb: colorHeaderFg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = styleBorder;
  });

  // Adicionar Ingredientes
  recipeData.ingredientes.forEach((ing, index) => {
    const rowNum = startRow + 1 + index;
    const currentRow = worksheet.getRow(rowNum);
    currentRow.getCell('B').value = ing.produto;
    currentRow.getCell('C').value = Number(ing.quantidade_liquida);
    currentRow.getCell('D').value = ing.unidade;
    currentRow.getCell('E').value = Number(ing.preco_bruto_unidade);
    currentRow.getCell('F').value = Number(ing.rendimento_percentual);
    currentRow.getCell('F').numFmt = '0"%"';

    // Qtd Bruta (tamanho total da embalagem comprada)
    currentRow.getCell('G').value = Number(ing.quantidade_bruta || ing.qto_bruta);
    currentRow.getCell('G').numFmt = '0.00';

    // Preço Líquido = (Quantidade / (Quantidade Bruta * Rendimento %)) * Preço Bruto
    currentRow.getCell('H').value = {
      formula: `=(C${rowNum}/(G${rowNum}*(F${rowNum}/100)))*E${rowNum}`
    };
    currentRow.getCell('H').numFmt = '"R$ "0.00';

    columns.forEach(col => {
      const cell = currentRow.getCell(col);
      cell.border = styleBorder;
      cell.alignment = { horizontal: 'center' };
      // Colunas calculadas (G e H) com fundo verde
      if (col === 'G' || col === 'H') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorResult } };
        cell.font = { bold: true };
      }
    });
    // Alinhamento à direita para preços
    currentRow.getCell('E').alignment = { horizontal: 'right' };
    currentRow.getCell('H').alignment = { horizontal: 'right' };
  });

  // --- MODO DE FAZER / UTENSÍLIOS ---
  const lastTableItemRow = startRow + recipeData.ingredientes.length + 2;
  worksheet.mergeCells(`B${lastTableItemRow}:H${lastTableItemRow}`);
  const preparoHeader = worksheet.getCell(`B${lastTableItemRow}`);
  preparoHeader.value = 'MODO DE PREPARO E UTENSÍLIOS';
  preparoHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } }; // Slate-700
  preparoHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
  preparoHeader.alignment = { horizontal: 'center' };

  const preparoContentRow = lastTableItemRow + 1;
  worksheet.mergeCells(`B${preparoContentRow}:H${preparoContentRow + 10}`);
  const preparoCell = worksheet.getCell(`B${preparoContentRow}`);
  preparoCell.value = `INSTRUÇÕES:\n${recipeData.preparo || '-'}\n\nUTENSÍLIOS:\n${recipeData.utensilios || '-'}`;
  preparoCell.alignment = { vertical: 'top', wrapText: true };
  preparoCell.border = styleBorder;

  // Gerar o arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  const sanitize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `ficha_tecnica_${sanitize(recipeData.prato || 'nova')}.xlsx`;

  saveAs(new Blob([buffer]), fileName);
};
