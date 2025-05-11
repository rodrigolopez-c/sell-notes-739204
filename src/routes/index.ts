import express, { Router } from "express";
import path from "path";
import noteRoutes from "./notes";


const router = Router();
router.use(express.json());

router.use("/notes", noteRoutes);

export default router;