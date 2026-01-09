import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const Dashboard = () => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("expense");
  // const [loading, setLoading] = useState(false);

  // Upload e OCR
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return alert("Selecione uma imagem do comprovante!");

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setExtractedText(res.data.extractedText);
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Erro no upload:", err);
    }
  };

  // Insights com IA
  const gerarInsights = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/insights`, {
        text: extractedText,
        transactions,
      });
      setInsights(res.data.insights);
    } catch (err) {
      console.error("Erro ao gerar insights:", err);
      alert(
        "Erro ao gerar insights. Verifique se o backend está rodando na porta 4000."
      );
    }
  };

  // Adicionar nova transação manual
  async function adicionarTransacao() {
  try {
    // validações simples
    if (!description || !value) {
      alert("Preencha descrição e valor.");
      return;
    }

    const payload = {
      type,
      description,
      value: Number(value) // garante que é número
    };

    // chama a rota /transactions (POST híbrida)
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/transactions`, payload, {
      headers: { "Content-Type": "application/json" }
    });

    // seu backend retorna o objeto da transação diretamente (res.data)
    const created = res.data;

    // adiciona na lista local
    setTransactions(prev => [...prev, created]);

    // limpa inputs
    setDescription("");
    setValue("");
  } catch (err) {
    console.error("Erro ao adicionar transação:", err);
    // mostra mensagem do backend se existir
    const msg = err?.response?.data?.error || err?.message || "Erro desconhecido";
    alert(`Erro ao adicionar transação: ${msg}`);
  }
}

  // Carregar transações ao iniciar
  useEffect(() => {
    async function carregarTransacoes() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/transactions`
        );
        setTransactions(res.data);
      } catch (err) {
        console.error("Erro ao carregar transações:", err);
      }
    }
    carregarTransacoes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
        💰 Finsight - Dashboard Financeiro
      </h1>

      {/* Upload de comprovante */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-3">Pré-visualização</h2>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <Button
            onClick={handleUpload}
            className="ml-3 bg-blue-600 hover:bg-blue-500"
          >
            <Upload className="mr-2 w-4 h-4" /> Enviar Comprovante
          </Button>
          {image && (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(image)}
                alt="Prévia"
                className="w-40 rounded-xl border border-gray-600"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Texto Extraído */}
      {extractedText && (
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-3">📜 Texto Extraído</h2>
            <pre className="bg-gray-900 p-4 rounded-xl whitespace-pre-wrap">
              {extractedText}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Adicionar Transação Manual */}
      <div className="bg-gray-800 p-4 rounded-2xl mb-6">
        <h3 className="text-lg font-semibold mb-2">Adicionar Transação</h3>
        <div className="flex flex-wrap gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded-xl"
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded-xl flex-1"
          />
          <input
            type="number"
            placeholder="Valor"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded-xl w-32"
          />
          <button
            onClick={adicionarTransacao}
            className="bg-blue-600 hover:bg-blue-500 px-4 rounded-xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Tabela de Gastos Identificados */}
      {transactions.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              📊 Gastos Identificados
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-2">Descrição</th>
                  <th className="pb-2">Valor (R$)</th>
                  <th className="pb-2">Categoria</th>
                  <th className="pb-2">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t.id || t.description}
                    className="border-b border-gray-700"
                  >
                    <td className="py-2">{t.description}</td>
                    <td className="py-2">
                      {t.formatted ??
                        t.value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                    </td>
                    <td className="py-2">{t.category ?? "Outros"}</td>
                    <td className="py-2 capitalize">
                      {t.type === "income" ? "Receita" : "Despesa"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Resumo Financeiro */}
      <div className="bg-gray-800 p-4 rounded-2xl mt-6">
        <h3 className="text-lg font-semibold mb-4">Resumo Financeiro</h3>

        {transactions.length > 0 ? (
          (() => {
            const receitas = transactions
              .filter((t) => t.type === "income")
              .reduce((a, b) => a + b.value, 0);
            const despesas = transactions
              .filter((t) => t.type === "expense")
              .reduce((a, b) => a + b.value, 0);
            const total = receitas - despesas;
            const COLORS = ["#BF1D17", "#00FF00"];

            // agrupa apenas despesas
            const groupByCategory = transactions.reduce((acc, t) => {
              const key = t.category || "Outros";
              if (!acc[key]) acc[key] = 0;
              // queremos apenas despesas no gráfico de gasto
              if (t.type !== "income") acc[key] += t.value;
              return acc;
            }, {});

            const chartData = Object.entries(groupByCategory).map(
              ([name, value]) => ({ name, value })
            );

            return (
              <div className="flex flex-col items-center">
                <PieChart width={300} height={300}>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>

                <p
                  className={`text-xl font-semibold ${
                    total >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  Saldo Atual:{" "}
                  {total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            );
          })()
        ) : (
          <p className="text-gray-400">Nenhuma transação adicionada ainda.</p>
        )}
      </div>

      {/* Insights da IA */}
      {insights && (
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              🧠 Insights Financeiros
            </h2>
            <p className="text-gray-300 whitespace-pre-wrap">{insights}</p>
          </CardContent>
        </Card>
      )}

      {/* Botão de Insights */}
      <div className="text-center mt-6">
        <Button
          onClick={gerarInsights}
          className="bg-purple-600 hover:bg-purple-500"
          disabled={!extractedText}
        >
          Gerar Insights com IA 🤖
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
