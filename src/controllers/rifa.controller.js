import prisma from "../lib/prisma.js";

// ======================
// CREATE RIFA
// ======================
export const createRifa = async (req, res) => {

  try {

    const {
      title,
      description,
      price,
      totalNumbers
    } = req.body;

    if (
      !title ||
      !price ||
      !totalNumbers ||
      totalNumbers <= 0
    ) {
      return res.status(400).json({
        error: "Dados inválidos"
      });
    }

    const rifa = await prisma.rifa.create({
      data: {
        title,
        description,
        price,
        totalNumbers,
        status: "open"
      }
    });

    // CRIA TICKETS
    const tickets = [];

    for (let i = 1; i <= totalNumbers; i++) {
      tickets.push({
        number: i,
        rifaId: rifa.id
      });
    }

    await prisma.ticket.createMany({
      data: tickets
    });

    res.status(201).json(rifa);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao criar rifa"
    });

  }
};

// ======================
// LISTAR RIFAS
// ======================
export const getRifas = async (req, res) => {

  try {

    const rifas = await prisma.rifa.findMany({
      include: {
        tickets: true
      }
    });

    const formatted = rifas.map(rifa => {

      const vendidos =
        rifa.tickets.filter(t => t.isSold).length;

      const disponiveis =
        rifa.totalNumbers - vendidos;

      return {
        ...rifa,
        soldNumbers: vendidos,
        availableNumbers: disponiveis,
        isSoldOut: disponiveis <= 0
      };
    });

    res.json(formatted);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao buscar rifas"
    });

  }
};

// ======================
// GET RIFA BY ID
// ======================
export const getRifaById = async (req, res) => {

  try {

    const { id } = req.params;

    const rifa = await prisma.rifa.findUnique({
      where: { id: Number(id) },
      include: { tickets: true }
    });

    if (!rifa) {
      return res.status(404).json({
        error: "Rifa não encontrada"
      });
    }

    const vendidos =
      rifa.tickets.filter(t => t.isSold).length;

    res.json({
      ...rifa,
      soldNumbers: vendidos,
      availableNumbers:
        rifa.totalNumbers - vendidos
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao buscar rifa"
    });

  }
};

// ======================
// UPDATE RIFA
// ======================
export const updateRifa = async (req, res) => {

  try {

    const { id } = req.params;
    const { title, description, price } = req.body;

    const rifa = await prisma.rifa.update({
      where: { id: Number(id) },
      data: { title, description, price }
    });

    res.json(rifa);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao atualizar rifa"
    });

  }
};

// ======================
// DELETE RIFA
// ======================
export const deleteRifa = async (req, res) => {

  try {

    const { id } = req.params;

    await prisma.ticket.deleteMany({
      where: { rifaId: Number(id) }
    });

    await prisma.rifa.delete({
      where: { id: Number(id) }
    });

    res.json({
      message: "Rifa deletada com sucesso"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao deletar rifa"
    });

  }
};

// ======================
// BUY TICKET (COM SORTEIO AUTOMÁTICO)
// ======================
export const buyTicket = async (req, res) => {

  try {

    const { id } = req.params;

    const rifa = await prisma.rifa.findUnique({
      where: { id: Number(id) }
    });

    if (!rifa || rifa.status === "closed") {
      return res.status(400).json({
        error: "Rifa encerrada"
      });
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        rifaId: Number(id),
        isSold: false
      }
    });

    if (!ticket) {
      await closeAndDraw(Number(id));

      return res.status(400).json({
        error: "Rifa esgotada"
      });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isSold: true,
        userId: req.userId
      }
    });

    // verifica se acabou depois da compra
    const remaining = await prisma.ticket.count({
      where: {
        rifaId: Number(id),
        isSold: false
      }
    });

    if (remaining === 0) {
      await closeAndDraw(Number(id));
    }

    res.json(updated);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao comprar número"
    });

  }
};

// ======================
// DRAW WINNER MANUAL
// ======================
export const drawWinner = async (req, res) => {

  try {

    const { id } = req.params;

    const rifa = await prisma.rifa.findUnique({
      where: { id: Number(id) }
    });

    if (!rifa || rifa.status === "closed") {
      return res.status(400).json({
        error: "Rifa já encerrada"
      });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        rifaId: Number(id),
        isSold: true
      }
    });

    if (tickets.length === 0) {
      return res.status(400).json({
        error: "Sem participantes"
      });
    }

    const winner =
      tickets[Math.floor(Math.random() * tickets.length)];

    const updated = await prisma.rifa.update({
      where: { id: Number(id) },
      data: {
        winnerId: winner.userId,
        status: "closed"
      }
    });

    res.json({
      message: "Sorteio realizado!",
      winner,
      rifa: updated
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao sortear"
    });

  }
};

// ======================
// FUNÇÃO INTERNA (AUTO DRAW)
// ======================
async function closeAndDraw(rifaId) {

  const tickets = await prisma.ticket.findMany({
    where: {
      rifaId,
      isSold: true
    }
  });

  if (tickets.length === 0) return;

  const winner =
    tickets[Math.floor(Math.random() * tickets.length)];

  await prisma.rifa.update({
    where: { id: rifaId },
    data: {
      winnerId: winner.userId,
      status: "closed"
    }
  });
}