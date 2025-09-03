import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define matchers for student and teacher routes
const isStudentRoute = createRouteMatcher("/user/(.*)");
const isTeacherRoute = createRouteMatcher("/teacher/(.*)");

export default clerkMiddleware(async (auth: any, req: any) => {
  const { sessionClaims } = await auth();

  // Extract user role from session claims (prefer metadata, fall back to publicMetadata)
  const claims = sessionClaims as
    | {
        metadata?: { userType?: "student" | "teacher" };
        publicMetadata?: { userType?: "student" | "teacher" };
      }
    | undefined;

  const userRole =
    claims?.metadata?.userType ?? claims?.publicMetadata?.userType;

  // If trying to access /user/* but role is explicitly not "student", redirect to teacher
  if (isStudentRoute(req)) {
    if (userRole && userRole !== "student") {
      const url = new URL("/teacher/courses", req.url);
      return NextResponse.redirect(url);
    }
  }

  // If trying to access /teacher/* but role is explicitly not "teacher", redirect to student
  if (isTeacherRoute(req)) {
    if (userRole && userRole !== "teacher") {
      const url = new URL("/user/courses", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Allow access if role matches or role is not set
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
