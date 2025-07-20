import { Request, Response } from "express";
import Course from "../models/courseModel";

export const getAllCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category } = req.query;
  try {
    const courses =
      category && category !== "all"
        ? await Course.scan("category").eq(category).exec()
        : await Course.scan().exec();
    res
      .status(200)
      .json({ message: "courses retrived successfully", data: courses });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving courses",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "course retrived successfully", data: course });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving a course",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
