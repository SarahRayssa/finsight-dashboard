// backend/routes/transactions.js
import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

/* função extractTotalAdvanced (copie a sua versão já testada) */
function extractTotalAdvanced(text) {
  const cleaned = text.toLowerCase().replace(/\s+/g, " ");
  const patterns = [
    /valor total[:\s]*r?\$?\s*([\d.,]+)/i,
    /total geral[:\s]*r?\$?\s*([\d.,]+)/i,
    /total[:\s]*r?\$?\s*([\d.,]+)/i,
    /total a pagar[:\s]*r?\$?\s*([\d.,]+)/i,
    /valor a pagar[:\s]*r?\$?\s*([\d.,]+)/i,
    /pagamento[:\s]*r?\$?\s*([\d.,]+)/i,
  ];

  let bestMatch = null;
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const numeric = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
      if (!bestMatch || numeric > bestMatch) bestMatch = numeric;
    }
  }

  if (!bestMatch) {
    const numbers = cleaned.match(/(\d{1,3}(\.\d{3})*,\d{2})/g);
    if (numbers) {
      bestMatch = Math.max(...numbers.map(n => parseFloat(n.replace(/\./g, "").replace(",", "."))));
    }
  }
  return bestMatch || null;
}

// GET - listar (com opção de filtro por mês via ?month=YYYY-MM)
router.get("/", async (req, res) => {
  try {
    const { month } = req.query;
    let where = {};
    if (month) {
      // month format: "2025-11"
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      where = {
        createdAt: {
          gte: start,
          lt: end,
        },
      };
    }
    const txs = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar transações." });
  }
});

/**
 * POST híbrido: aceita payload manual {description, value, type, category}
 * ou { text } (OCR)
 */
router.post("/", async (req, res) => {
  try {
    const { text, type, description, value, category } = req.body;

    // 1) caso manual
    if (description && (value !== undefined && value !== null)) {
      const numeric = Number(value);
      if (isNaN(numeric) || numeric <= 0) {
        return res.status(400).json({ error: "Valor inválido." });
      }
      const newTx = await prisma.transaction.create({
        data: {
          description,
          value: numeric,
          type: type === "income" ? "income" : "expense",
          category: category || "geral",
        },
      });
      return res.status(201).json(newTx);
    }

    // 2) caso OCR
    if (!text) {
      return res.status(400).json({ error: "Envie 'description' e 'value' OU o 'text' do cupom." });
    }

    const totalValue = extractTotalAdvanced(text);
    if (!totalValue) {
      return res.status(400).json({ error: "Não foi possível identificar o TOTAL do cupom." });
    }

    const lower = text.toLowerCase();
    let detectedType = "expense";
    const incomeKeywords = ["recebido", "entrada", "crédito", "depositado", "venda", "receita"];
    const expenseKeywords = ["débito", "compra", "pagamento", "saída", "pago"];
    if (incomeKeywords.some(k => lower.includes(k))) detectedType = "income";
    if (expenseKeywords.some(k => lower.includes(k))) detectedType = "expense";

    const tx = await prisma.transaction.create({
      data: {
        description: "Total identificado no cupom",
        value: totalValue,
        type: detectedType,
        category: "geral",
      },
    });

    return res.status(201).json(tx);
  } catch (err) {
    console.error("Erro POST /transactions:", err);
    res.status(500).json({ error: "Erro ao criar transação." });
  }
});

export default router;