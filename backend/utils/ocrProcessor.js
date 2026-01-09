import Tesseract from "tesseract.js";
import * as Jimp from "jimp";

const JimpInstance = Jimp.default ? Jimp.default : Jimp;

export async function extractText(imagePath) {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, "por");
    return text;
  } catch (error) {
    console.error("Erro ao extrair texto:", error);
    return "";
  }
}

/**
 * Faz o OCR da imagem e extrai apenas valores monetários válidos em reais.
 * Exemplo de formatos aceitos:
 *  - R$ 123,45
 *  - R$123,45
 *  - TOTAL: 45,90
 *  - DÉBITO: R$ 20,00
 *  - Valor pago 1.230,00
 */
export async function extractCleanText(imagePath) {
  try {
    // 🔹 Abre e melhora a imagem para leitura OCR
    const image = await JimpInstance.read(imagePath);
    image
      .greyscale() // tons de cinza
      .contrast(0.6) // aumenta contraste
      .normalize() // normaliza brilho
      .resize(1000, JimpInstance.AUTO); // melhora resolução de leitura

    const tempFile = imagePath.replace(/\.(png|jpg|jpeg)$/i, "_prepped.png");
    await image.writeAsync(tempFile);

    // 🔹 Executa o OCR (Português, mas aceita caracteres monetários)
    const { data } = await Tesseract.recognize(tempFile, "por", {
      tessedit_char_whitelist:
        "0123456789R$r$,.:;/ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ",
    });

    console.log("\n=== TEXTO OCR BRUTO ===\n");
    console.log(data.text);
    console.log("\n=======================\n");

    const texto = data.text;
    return extrairGastos(texto);
  } catch (error) {
    console.error("Erro no OCR:", error);
    throw new Error("Falha ao processar o comprovante");
  }
}

/**
 * Extrai apenas os valores monetários do texto OCR
 */
function extrairGastos(texto) {
  // 🔹 1. Normaliza o texto: limpa sujeira e formata pra análise
  texto = texto
    .replace(/[^\dR$r$,.\nA-Za-zÀ-ú ]/g, "") // mantém letras acentuadas e números
    .replace(/\s{2,}/g, " ")
    .trim();

  const linhas = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const gastos = [];

  // 🔹 2. Define palavras-chave pra classificação
  const palavrasReceita = [
    "crédito",
    "recebido",
    "entrada",
    "depósito",
    "pagamento recebido",
    "saldo a receber",
  ];
  const palavrasDespesa = [
    "débito",
    "compra",
    "saída",
    "pagamento",
    "transferência",
    "pix enviado",
    "total",
    "valor pago",
  ];

  for (const linha of linhas) {
    // 🔹 3. Captura valores monetários
    const match = linha.match(
      /(R\$ ?)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})(?!\d)/g
    );

    if (match) {
      for (const valorBruto of match) {
        const valorStr = valorBruto.replace(/[^\d,]/g, "").replace(",", ".");
        const valor = parseFloat(valorStr);

        if (valor > 0 && valor < 100000) {
          const linhaLower = linha.toLowerCase();
          let tipo = "Despesa";

          // 🔹 4. Detecta tipo baseado nas palavras
          if (palavrasReceita.some((p) => linhaLower.includes(p)))
            tipo = "Receita";
          else if (palavrasDespesa.some((p) => linhaLower.includes(p)))
            tipo = "Despesa";

          gastos.push({
            descricao: linha,
            valor,
            exibicao: valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
            tipo,
          });
        }
      }
    }
  }

  // 🔹 5. Remove duplicatas
  const unicos = [];
  const vistos = new Set();

  for (const g of gastos) {
    const chave = `${g.descricao}-${g.valor}-${g.tipo}`;
    if (!vistos.has(chave)) {
      vistos.add(chave);
      unicos.push(g);
    }
  }

  return unicos;
}
