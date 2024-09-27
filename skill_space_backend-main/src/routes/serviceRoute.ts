import express from "express";
import { Request, Response } from "express";
const router = express.Router();
import { createService, getAllServices, updateService, getServiceById, deleteService, getServiceByFilter, getFeaturedServices } from "../controllers/serviceController";
import { authenticateMiddleware } from "../middleware/authMiddleware";

router.post("/:freelancerId/create", authenticateMiddleware, createService);
router.get("/services", getAllServices);
router.get("/filter", getServiceByFilter);
router.get("/featured", getFeaturedServices);
router.put("/:id/edit", authenticateMiddleware, updateService);
router.get("/:id", getServiceById);
router.delete("/:id/delete", authenticateMiddleware, authenticateMiddleware, deleteService);

router.use("/", (req: Request, res: Response) => {
  res.json({ message: "Service API" });
});

export default router;