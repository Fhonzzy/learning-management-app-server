import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import courseRoutes from "./routes/courseRoutes";
import {
  clerkMiddleware,
  createClerkClient,
  requireAuth,
} from "@clerk/express";
import userClerkRoute from "./routes/userClerkRoute";
import transactionRoute from "./routes/transactionRoute";

dotenv.config();

const isProduction = process.env.NODE_ENV === "Production";

if (!isProduction) {
  dynamoose.aws.ddb.local();
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
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

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/courses", courseRoutes);
app.use("/users/clerk", requireAuth(), userClerkRoute);
app.use("/transactions", requireAuth(), transactionRoute);

const port = process.env.PORT || 3000;
if (!isProduction) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
