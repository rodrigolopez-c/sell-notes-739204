import { Router } from "express";
import { createSellNote, createSellNoteContent } from "../controllers/notes.controller";

const router = Router();

router.post("/", createSellNote);
router.post("/content", createSellNoteContent);

export default router;
