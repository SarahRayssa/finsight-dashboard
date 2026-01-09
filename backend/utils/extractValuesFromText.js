export function extractValuesFromText(text) {
  const lines = text.split(/\n|;/).map(l => l.trim()).filter(Boolean);

  const validKeywords = [
    'TOTAL', 'VALOR', 'VENDA', 'COMPRA', 'PAGAMENTO',
    'DEBITO', 'DÉBITO', 'CRÉDITO', 'CREDITO', 'PIX',
    'DINHEIRO', 'APROVADO', 'CARTÃO', 'MASTERCARD', 'VISA'
  ];

  const categoryKeywords = {
    alimentação: ['PADARIA', 'LANCHONETE', 'RESTAURANTE', 'PIZZA', 'CAFÉ', 'SUPERMERCADO', 'MERCADO', 'BAR'],
    vestuário: ['ROUPA', 'BLUSA', 'CALÇA', 'CAMISA', 'VESTIDO', 'SAPATO', 'TENIS', 'MODA'],
    transporte: ['POSTO', 'COMBUSTÍVEL', 'GASOLINA', 'ETANOL', 'UBER'],
    saúde: ['FARMÁCIA', 'DROGARIA', 'CLÍNICA', 'LABORATÓRIO'],
    tecnologia: ['CELULAR', 'NOTEBOOK', 'ELETRÔNICOS', 'LOJA APPLE', 'SAMSUNG'],
    outros: []
  };

  const regex = /(?:R?\$?\s*)(\d{1,3}(?:[\.,]\d{3})*[\.,]\d{2})/g;
  const results = [];

  for (const line of lines) {
    const clean = line.replace(/\s+/g, ' ').toUpperCase();
    regex.lastIndex = 0;
    if (!regex.test(clean)) continue;

    const hasKeyword = validKeywords.some(k => clean.includes(k));
    if (!hasKeyword) continue;

    let match;
    while ((match = regex.exec(clean)) !== null) {
      const rawValue = match[1].replace(/\./g, '').replace(',', '.');
      const value = parseFloat(rawValue);
      if (isNaN(value) || value < 5) continue;

      const possibleCategory = Object.entries(categoryKeywords).find(([_, list]) =>
        list.some(k => clean.includes(k))
      );
      const category = possibleCategory ? possibleCategory[0] : 'outros';

      results.push({
        description: line,
        value,
        formatted: `R$ ${value.toFixed(2).replace('.', ',')}`,
        type: 'expense',
        category
      });
    }
  }

  const unique = results.filter((v, i, arr) =>
    i === arr.findIndex(o => o.value === v.value)
  );

  unique.sort((a, b) => b.value - a.value);

  return unique.slice(0, 3);
}
