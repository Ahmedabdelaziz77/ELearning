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

// routes
import courseRoutes from "./routes/courseRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";

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
app.use(cors());
app.use(clerkMiddleware());

// routes
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users/clerk", requireAuth(), userClerkRoutes);

// server setup
const PORT = process.env.PORT || 3000;
if (!isProduction)
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
