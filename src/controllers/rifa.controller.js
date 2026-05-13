import prisma from "../lib/prisma.js";

// CREATE
export const createRifa = async (req, res) => {
  try {
    const { title, description, price, totalNumbers } = req.body;

    if (!title || !price || !totalNumbers || totalNumbers <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const rifa = await prisma.rifa.create({
      data: { title, description, price, totalNumbers }
    });

    
    const tickets = [];
    for (let i = 1; i <= totalNumbers; i++) {
      tickets.push({
        number: i,
        rifaId: rifa.id
      });
    }

    await prisma.ticket.createMany({ data: tickets });

    res.status(201).json(rifa);

  } catch {
    res.status(500).json({ error: "Erro ao criar rifa" });
  }
};


export const getRifas = async (req, res) => {
  try {
    const rifas = await prisma.rifa.findMany();
    res.json(rifas);
  } catch {
    res.status(500).json({ error: "Erro ao buscar rifas" });
  }
};

// VER ID
export const getRifaById = async (req, res) => {
  try {
    const { id } = req.params;

    const rifa = await prisma.rifa.findUnique({
      where: { id: Number(id) }
    });

    if (!rifa) {
      return res.status(404).json({ error: "Rifa não encontrada" });
    }

    res.json(rifa);

  } catch {
    res.status(500).json({ error: "Erro ao buscar rifa" });
  }
};

// ATUALIZAR
export const updateRifa = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;

    const rifa = await prisma.rifa.update({
      where: { id: Number(id) },
      data: { title, description, price }
    });

    res.json(rifa);

  } catch {
    res.status(500).json({ error: "Erro ao atualizar rifa" });
  }
};

// deletar
export const deleteRifa = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.ticket.deleteMany({
      where: { rifaId: Number(id) }
    });

    await prisma.rifa.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Rifa deletada com sucesso" });

  } catch {
    res.status(500).json({ error: "Erro ao deletar rifa" });
  }
};

// comprar rifa
export const buyTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findFirst({
      where: {
        rifaId: Number(id),
        isSold: false
      }
    });

    if (!ticket) {
      return res.status(400).json({ error: "Sem números disponíveis" });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isSold: true,
        userId: req.userId
      }
    });

    res.json(updated);

  } catch {
    res.status(500).json({ error: "Erro ao comprar número" });
  }
};

// GANHADOR DO SORTEIO
export const drawWinner = async (req, res) => {
  try {
    const { id } = req.params;

    const tickets = await prisma.ticket.findMany({
      where: {
        rifaId: Number(id),
        isSold: true
      }
    });

    if (tickets.length === 0) {
      return res.status(400).json({ error: "Sem participantes" });
    }

    const winner =
      tickets[Math.floor(Math.random() * tickets.length)];

    // 🔥 SALVA O GANHADOR
    await prisma.rifa.update({
      where: { id: Number(id) },
      data: {
        winnerId: winner.userId
      }
    });

    res.json(winner);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao sortear" });
  }
};