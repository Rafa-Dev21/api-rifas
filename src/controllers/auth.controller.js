import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Dados inválidos"
      });
    }

    const exists = await prisma.user.findUnique({
      where: { email }
    });

    if (exists) {
      return res.status(400).json({
        error: "Email já existe"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hash
      }
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro no servidor"
    });

  }
};

export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Dados inválidos"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(401).json({
        error: "Senha inválida"
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔥 AGORA RETORNA DADOS DO USUÁRIO
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro no servidor"
    });

  }
};