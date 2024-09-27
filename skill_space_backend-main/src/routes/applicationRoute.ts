import express from "express";
import { Request, Response } from "express";
const router = express.Router();
import { createApplication, getAllApplication, getApplicationById, editApplication, deleteApplication } from "../controllers/applicationController";

router.post("/create", createApplication);
router.get("/applications", getAllApplication);
router.get("/:id", getApplicationById);
router.put("/:id/edit", editApplication);
router.delete("/:id/delete", deleteApplication);

router.use("/" , (req: Request, res: Response) => {
  res.status(200).json({ message: "Application API" });
});

export default router;