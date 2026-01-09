// backend/utils/categorizeExpense.js
export function categorizeExpense(description = "") {
  if (!description) return "Outros";
  const s = description.toLowerCase();

  const mapping = [
    { category: "Alimentação", keywords: ["padaria", "lanche", "cafe", "restaurante", "mcdonald", "pizza", "burger", "mercado", "supermercado"] },
    { category: "Transporte", keywords: ["uber", "99", "posto", "combustível", "gasolina", "etanol", "taxi", "posto de gasolina"] },
    { category: "Vestuário", keywords: ["blusa", "calça", "camisa", "roupa", "vestido", "sapato"] },
    { category: "Saúde", keywords: ["farmácia", "drogaria", "clínica", "laboratório", "psicólogo"] },
    { category: "Casa", keywords: ["bandeja", "utensílios", "loja de casa", "conserto", "eletricidade"] },
    { category: "Beleza", keywords: ["salão", "barbe", "botox", "harmonização", "cosmético", "estética"] },
    { category: "Eletrônicos", keywords: ["celular", "notebook", "eletrônico", "tablet", "tv", "headphone"] },
    { category: "Assinaturas", keywords: ["netflix", "spotify", "prime", "assinatura", "serviço mensal"] },
    { category: "Outros", keywords: [] }
  ];

  for (const item of mapping) {
    for (const kw of item.keywords) {
      if (s.includes(kw)) return item.category;
    }
  }

  // heuristic: if contains "dinheiro" or "débito" treat as "Outros" or "Pagamento"
  if (/debito|dinheiro|pix/i.test(s)) return "Outros";

  return "Outros";
}
