import express from "express";
import {
  createRifa,
  getRifas,
  getRifaById,
  updateRifa,
  deleteRifa,
  buyTicket,
  drawWinner
} from "../controllers/rifa.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createRifa);
router.get("/", getRifas);
router.get("/:id", getRifaById);

router.put("/:id", authMiddleware, updateRifa);
router.delete("/:id", authMiddleware, deleteRifa);

router.post("/:id/buy", authMiddleware, buyTicket);
router.post("/:id/draw", authMiddleware, drawWinner);

export default router;