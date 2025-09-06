import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import {
  clerkMiddleware,
  createClerkClient,
  requireAuth,
} from "@clerk/express";
import serverless from "serverless-http";

// routes
import courseRoutes from "./routes/courseRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";
import userCourseProgressRoutes from "./routes/userCourseProgressRoutes";
import seed from "./seed/seedDynamodb";

// configurations
dotenv.config();
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) dynamoose.aws.ddb.local();

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || "",
});

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const allowedOrigins = [
  "https://e-learning-45j2.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(clerkMiddleware());

// routes
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users/clerk", requireAuth(), userClerkRoutes);
app.use("/api/v1/transactions", requireAuth(), transactionRoutes);
app.use(
  "/api/v1/users/course-progress",
  requireAuth(),
  userCourseProgressRoutes
);
// server setup
const PORT = process.env.PORT || 8001;
if (!isProduction)
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

// aws production env
const serverlessApp = serverless(app);
export const handler = async (event: any, context: any) => {
  if (event.action === "seed") {
    await seed();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Database seeded successfully" }),
    };
  } else {
    return serverlessApp(event, context);
  }
};
