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

const allowedOrigins = [
  "https://e-learning-45j2.vercel.app",
  "http://localhost:3000",
];

const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-clerk-auth",
  ],
};

const app = express();

app.use(express.json());
app.use(helmet());

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(clerkMiddleware());

app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users/clerk", requireAuth(), userClerkRoutes);
app.use("/api/v1/transactions", requireAuth(), transactionRoutes);
app.use(
  "/api/v1/users/course-progress",
  requireAuth(),
  userCourseProgressRoutes
);

app.use((req, res) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Credentials", "true");
  }
  res.status(404).json({ message: "Not Found" });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Access-Control-Allow-Credentials", "true");
    }
    const status =
      err?.status || (err?.message === "Not allowed by CORS" ? 403 : 500);
    res.status(status).json({ error: err?.message || "Server error" });
  }
);

const PORT = process.env.PORT || 8001;
if (!isProduction) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

const serverlessApp = serverless(app);

export const handler = async (event: any, context: any) => {
  if (event?.action === "seed") {
    await seed();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://e-learning-45j2.vercel.app",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({ message: "Database seeded successfully" }),
    };
  }
  return serverlessApp(event, context);
};
