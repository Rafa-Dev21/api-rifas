import prisma from "../lib/prisma.js";

// CREATE
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
        totalNumbers
      }
    });

    // CRIA TODOS OS NÚMEROS
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

  } catch {

    res.status(500).json({
      error: "Erro ao criar rifa"
    });

  }
};


// LISTAR RIFAS
export const getRifas = async (req, res) => {

  try {

    const rifas = await prisma.rifa.findMany({
      include: {
        tickets: true
      }
    });

    // FORMATA DADOS
    const formatted = rifas.map(rifa => {

      // QUANTOS FORAM VENDIDOS
      const vendidos =
        rifa.tickets.filter(
          ticket => ticket.isSold
        ).length;

      // QUANTOS RESTAM
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

  } catch {

    res.status(500).json({
      error: "Erro ao buscar rifas"
    });

  }
};


// VER RIFA POR ID
export const getRifaById = async (req, res) => {

  try {

    const { id } = req.params;

    const rifa = await prisma.rifa.findUnique({
      where: {
        id: Number(id)
      },

      include: {
        tickets: true
      }
    });

    if (!rifa) {

      return res.status(404).json({
        error: "Rifa não encontrada"
      });

    }

    const vendidos =
      rifa.tickets.filter(
        ticket => ticket.isSold
      ).length;

    res.json({
      ...rifa,

      soldNumbers: vendidos,

      availableNumbers:
        rifa.totalNumbers - vendidos
    });

  } catch {

    res.status(500).json({
      error: "Erro ao buscar rifa"
    });

  }
};


// ATUALIZAR
export const updateRifa = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      title,
      description,
      price
    } = req.body;

    const rifa = await prisma.rifa.update({
      where: {
        id: Number(id)
      },

      data: {
        title,
        description,
        price
      }
    });

    res.json(rifa);

  } catch {

    res.status(500).json({
      error: "Erro ao atualizar rifa"
    });

  }
};


// DELETAR
export const deleteRifa = async (req, res) => {

  try {

    const { id } = req.params;

    // DELETA TICKETS
    await prisma.ticket.deleteMany({
      where: {
        rifaId: Number(id)
      }
    });

    // DELETA RIFA
    await prisma.rifa.delete({
      where: {
        id: Number(id)
      }
    });

    res.json({
      message: "Rifa deletada com sucesso"
    });

  } catch {

    res.status(500).json({
      error: "Erro ao deletar rifa"
    });

  }
};


// COMPRAR NÚMERO
export const buyTicket = async (req, res) => {

  try {

    const { id } = req.params;

    // PROCURA NÚMERO LIVRE
    const ticket = await prisma.ticket.findFirst({
      where: {
        rifaId: Number(id),
        isSold: false
      }
    });

    // ESGOTOU
    if (!ticket) {

      return res.status(400).json({
        error: "Sem números disponíveis"
      });

    }

    // MARCA COMO VENDIDO
    const updated = await prisma.ticket.update({
      where: {
        id: ticket.id
      },

      data: {
        isSold: true,
        userId: req.userId
      }
    });

    res.json(updated);

  } catch {

    res.status(500).json({
      error: "Erro ao comprar número"
    });

  }
};


// SORTEAR GANHADOR
export const drawWinner = async (req, res) => {

  try {

    const { id } = req.params;

    // PEGA APENAS VENDIDOS
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

    // ESCOLHE ALEATÓRIO
    const winner =
      tickets[
        Math.floor(
          Math.random() * tickets.length
        )
      ];

    // SALVA GANHADOR
    await prisma.rifa.update({
      where: {
        id: Number(id)
      },

      data: {
        winnerId: winner.userId
      }
    });

    res.json({
      message: "Sorteio realizado!",

      winner
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Erro ao sortear"
    });

  }
};