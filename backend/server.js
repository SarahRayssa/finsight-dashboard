import express from "express";
import cors from "cors";
import uploadRoute from "./routes/upload.js";
import insightsRoute from "./routes/insights.js";
import transactionsRoute from "./routes/transactions.js";
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());


app.use("/upload", uploadRoute);
app.use("/insights", insightsRoute);
app.use("/transactions", transactionsRoute);


app.listen(4000, () => console.log("✅ Backend rodando na porta 4000"));