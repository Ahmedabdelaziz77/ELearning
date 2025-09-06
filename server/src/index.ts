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

dotenv.config();
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  dynamoose.aws.ddb.local();
}

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

/**
 * Allow ALL origins by reflecting the request Origin (works with credentials).
 * NOTE: You cannot use "*" when credentials=true — this is the correct approach.
 */
const corsOptions: cors.CorsOptions = {
  origin: (_origin, cb) => cb(null, true), // reflect any origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-clerk-auth",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/** Ensure every response has proper CORS when there is an Origin */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    // important for caches/proxies/CDN to vary by Origin
    res.setHeader("Vary", "Origin");
  }
  next();
});

// Auth middleware
app.use(clerkMiddleware());

// Routes
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users/clerk", requireAuth(), userClerkRoutes);
app.use("/api/v1/transactions", requireAuth(), transactionRoutes);
app.use(
  "/api/v1/users/course-progress",
  requireAuth(),
  userCourseProgressRoutes
);

// 404 with CORS
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handler with CORS
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const status =
      err?.status || (err?.message === "Not allowed by CORS" ? 403 : 500);
    res.status(status).json({ error: err?.message || "Server error" });
  }
);

// Local dev server
const PORT = process.env.PORT || 8001;
if (!isProduction) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Lambda handler
const serverlessApp = serverless(app);

export const handler = async (event: any, context: any) => {
  if (event?.action === "seed") {
    await seed();
    const origin =
      event?.headers?.origin ||
      event?.headers?.Origin ||
      "https://e-learning-45j2.vercel.app";
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        Vary: "Origin",
      },
      body: JSON.stringify({ message: "Database seeded successfully" }),
    };
  }
  return serverlessApp(event, context);
};
