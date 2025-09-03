import { Request, Response } from "express";
import Course from "../models/courseModel";
import { v4 } from "uuid";
import { getAuth } from "@clerk/express";

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

export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teacherId, teacherName } = req.body;
  try {
    if (!teacherId || !teacherName) {
      res.status(400).json({ message: "Teacher id and name are required." });
      return;
    }
    const newCourse = new Course({
      courseId: v4(),
      teacherId,
      teacherName,
      title: "Untitled Course",
      description: "",
      category: "Uncategorized",
      image: "",
      price: 0,
      level: "Beginner",
      status: "Draft",
      sections: [],
      enrollments: [],
    });
    await newCourse.save();
    res
      .status(200)
      .json({ message: "course created successfully", data: newCourse });
  } catch (err) {
    res.status(500).json({
      message: "Error creating a course",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const updateData = { ...req.body };
  const { userId } = getAuth(req);
  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({
        message: "Course not found.",
      });
      return;
    }
    if (course.teacherId !== userId) {
      res.status(403).json({
        message: "Not authorized to update this course.",
      });
      return;
    }
    if (updateData.price) {
      const price = parseInt(updateData.price);
      if (isNaN(price)) {
        res.status(400).json({
          message: "Invalid Price Format.",
          error: "Price must be a valid number.",
        });
        return;
      }
      updateData.price = price * 100;
    }
    if (updateData.sections) {
      const sectionsData =
        typeof updateData.sections === "string"
          ? JSON.parse(updateData.sections)
          : updateData.sections;
      updateData.sections = sectionsData.map((section: any) => ({
        ...section,
        sectionId: section.sectionId || v4(),
        chapters: section.chapters.map((chapter: any) => ({
          ...chapter,
          chapterId: chapter.chapterId || v4(),
        })),
      }));
    }
    Object.assign(course, updateData);
    await course.save();
    res
      .status(200)
      .json({ message: "Course updated successfully.", data: course });
  } catch (err) {
    res.status(500).json({
      message: "Error Updating a course",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const { userId } = getAuth(req);
  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found." });
      return;
    }
    if (course.teacherId !== userId) {
      res
        .status(403)
        .json({ message: "Not authorized to delete this course." });
      return;
    }
    const deletedCourse = await Course.delete(courseId);
    res
      .status(200)
      .json({ message: "course created successfully", data: deletedCourse });
  } catch (err) {
    res.status(500).json({
      message: "Error creating a course",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
