# 💰 Finsight — Financial Intelligence Dashboard

Finsight é uma aplicação full-stack que transforma comprovantes financeiros em insights inteligentes, utilizando OCR, categorização automática e análise com IA.

> De um cupom borrado a decisões financeiras melhores.

---

## 🚀 Funcionalidades

- 📸 Upload de comprovantes (imagem)
- 🔍 OCR para extração de texto
- 🧮 Identificação automática do valor total
- 🏷️ Categorização inteligente de despesas
- 🧠 Geração de insights com IA
- ➕ Adição manual de transações
- 📊 Dashboard com gráfico de gastos
- 💾 Persistência com Prisma + PostgreSQL

---

## 🧱 Stack Tecnológica

### Frontend
- React.js + Vite
- Recharts
- Tailwind / shadcn-ui

### Backend
- Node.js + Express
- Tesseract.js (OCR)
- OpenAI API
- Prisma + PostgreSQL (Neon)

---

## 🧠 Arquitetura (resumo)

- **Frontend** consome API REST
- **Backend** processa OCR, regras financeiras e IA
- **Prisma** gerencia persistência e migrations
- **IA** classifica categorias e gera insights financeiros

---

## ⚙️ Como rodar localmente

Antes de iniciar o projeto, crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```env
OPENAI_API_KEY=your_key_here
DATABASE_URL=your_database_url
PORT=4000
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev

cd frontend
npm install
npm run dev
```
---

## 🛣️ Roadmap

O que vem a seguir:

- 🔐 Sistema de autenticação e perfis financeiros personalizados
- 📊 Dashboards inteligentes com análise de comportamento financeiro
- 🚀 Publicação em produção com foco em performance e escalabilidade
---
  
## 👩‍💻 Autora

Projeto desenvolvido por **Sarah Rayssa**, foco em engenharia de software, IA aplicada e produtos financeiros
