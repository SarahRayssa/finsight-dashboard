import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import fs from "fs";
import { categorizeExpense } from "../utils/categorizeExpense.js";
import { categorizeWithAI } from "../utils/categorizeWithAI.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ----------------------------------------------------------
   FUNÇÃO 1 — EXTRAI VALORES INDIVIDUAIS (SE PRECISAR FUTURO)
----------------------------------------------------------- */
function extractValuesFromText(text) {
  const linhas = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const transactions = [];

  for (const linha of linhas) {
    if (
      /CNPJ|CPF|QTD|UN|SEQ|TEL|IE|ITEM|CÓDIGO|LOJA|END|HORA|DATA|CUPOM/i.test(
        linha
      )
    )
      continue;

    const match = linha.match(
      /(R\$ ?)?\d{1,3}(\.\d{3})*,\d{2}(?!\d)|\b\d{1,3},\d{2}(?!\d)/g
    );

    if (match) {
      for (const valorStr of match) {
        const cleaned = valorStr.replace(/[^\d,]/g, "").replace(",", ".");
        const valor = parseFloat(cleaned);
        const dec = cleaned.split(".")[1] || "";

        if (dec.length !== 2) continue;
        if (isNaN(valor) || valor <= 0 || valor > 100000) continue;

        let type = "expense";
        if (/recebido|entrada|crédito|depositado|venda/i.test(linha)) {
          type = "income";
        }

        transactions.push({
          description: linha.slice(0, 80),
          value: valor,
          formatted: valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          type,
        });
      }
    }
  }

  return transactions;
}

/* ----------------------------------------------------------
   FUNÇÃO 2 — EXTRAI SOMENTE O TOTAL DO CUPOM (principal)
----------------------------------------------------------- */
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
    const m = cleaned.match(pattern);
    if (m) {
      const num = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
      if (!bestMatch || num > bestMatch) bestMatch = num;
    }
  }

  // fallback — maior valor encontrado
  if (!bestMatch) {
    const all = cleaned.match(/(\d{1,3}(\.\d{3})*,\d{2})/g);
    if (all) {
      bestMatch = Math.max(
        ...all.map((v) => parseFloat(v.replace(/\./g, "").replace(",", ".")))
      );
    }
  }

  return bestMatch || null;
}

/* ----------------------------------------------------------
   ROTA DE UPLOAD + OCR + PROCESSAMENTO
----------------------------------------------------------- */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log(`📸 Recebendo imagem: ${req.file.originalname}`);

    const imagePath = req.file.path;

    // Executa o OCR
    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, "por");

    fs.unlinkSync(imagePath); // Remove imagem temporária

    console.log("\n🧠 Texto extraído:");
    console.log(text);

    // Extrai SOMENTE o total
    const total = extractTotalAdvanced(text);

    if (!total) {
      return res.status(400).json({
        error: "Nenhum valor TOTAL foi identificado no cupom.",
      });
    }

    // Classificação automática (receita/despesa)
    let type = "expense";
    const low = text.toLowerCase();

    if (/(recebido|entrada|crédito|depositado|venda|receita)/i.test(low)) {
      type = "income";
    }

    const finalTransaction = {
  description: "TOTAL do cupom",
  value: total,
  formatted: total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  }),
  type,
  category: await categorizeWithAI(text),
};

    console.log("\n🔥 FINAL TRANSACTION:");
    console.table([finalTransaction]);

    // Retorno oficial para o front
    res.json({
      extractedText: text,
      transactions: [finalTransaction],
    });
  } catch (err) {
    console.error("❌ Erro ao processar OCR:", err);
    res.status(500).json({ error: "Falha ao processar imagem." });
  }
});

export default router;
