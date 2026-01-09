import dotenv from "dotenv";
dotenv.config(); // <-- carrega antes de qualquer uso

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function categorizeWithAI(description) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um classificador de transações financeiras. Retorne apenas a categoria.",
        },
        { role: "user", content: description },
      ],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Erro ao categorizar com IA:", error);
    return "Outros";
  }
}
