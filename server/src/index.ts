import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";

// routes
// configurations
dotenv.config();
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) dynamoose.aws.ddb.local();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// routes
app.use("/", (req, res) => {
  res.send("Hello, World!");
});

// server setup
const PORT = process.env.PORT || 3000;
if (!isProduction)
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
