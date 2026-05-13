import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import rifaRoutes from "./routes/rifa.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/rifas", rifaRoutes);

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});