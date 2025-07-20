import express from "express";
import { getAllCourses, getCourse } from "../controllers/courseController";

const router = express.Router();
router.get("/", getAllCourses);
router.get("/:courseId", getCourse);

export default router;
