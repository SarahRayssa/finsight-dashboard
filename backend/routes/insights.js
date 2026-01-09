import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({ error: "Nenhuma transação recebida." });
    }

    const prompt = `
Você é um analista financeiro. Gere insights claros e úteis com base nas seguintes transações:

${transactions
  ?.map(
    (t) =>
      `• ${t.description} — ${t.formatted} (${t.type === "income" ? "RECEITA" : "DESPESA"})`
  )
  .join("\n")}

Instruções:
1. Respeite o tipo de cada transação informado acima.
2. Gere 3 a 5 insights curtos e úteis no formato:
   - 📊 Maior gasto:
   - 💡 Sugestão de economia:
   - 💰 Receita mais relevante:
   - 🔮 Projeção ou alerta financeiro:
3. Escreva em tom profissional e direto.
`;

    // ✅ Chamada ao modelo
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const insights = completion.choices[0].message.content;

    // 💅 Formata os insights antes de enviar
    const formattedInsights = insights
      .replace(/\*\*/g, "")
      .replace(/RECEITA/gi, "💰 Receita")
      .replace(/DESPESA/gi, "💸 Despesa");

    res.json({ insights: formattedInsights });
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    res.status(500).json({ error: "Erro ao gerar insights" });
  }
});

export default router;
