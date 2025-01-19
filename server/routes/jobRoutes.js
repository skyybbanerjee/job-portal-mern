import express from "express";
import { getAllJobs, getJobById } from "../controllers/jobController.js";

const router = express.Router();

//All jobs-data
router.get("/", getAllJobs);

//Single job by ID
router.get("/:id", getJobById);

export default router;
