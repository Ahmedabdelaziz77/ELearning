import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define matchers for student and teacher routes
const isStudentRoute = createRouteMatcher("/user/(.*)");
const isTeacherRoute = createRouteMatcher("/teacher/(.*)");

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  // Extract user role from session claims metadata
  const userRole =
    (
      sessionClaims?.metadata as {
        userType?: "student" | "teacher";
      }
    )?.userType || "student";

  // If trying to access /user/* but not a student, redirect to teacher
  if (isStudentRoute(req)) {
    if (userRole !== "student") {
      const url = new URL("/teacher/courses", req.url);
      return NextResponse.redirect(url);
    }
  }

  // If trying to access /teacher/* but not a teacher, redirect to student
  if (isTeacherRoute(req)) {
    if (userRole !== "teacher") {
      const url = new URL("/user/courses", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Allow access if role matches route
  return NextResponse.next();
});

// Define what routes the middleware applies to
export const config = {
  matcher: [
    // Exclude static files and Next internals
    "/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|js|css|woff2?|ttf|eot|gif|pdf|txt|json)).*)",
    "/(api|trpc)(.*)",
  ],
};
