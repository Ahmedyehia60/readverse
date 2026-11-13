import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import api from "./routes";

// Local development reads .env.local. Hosted environments provide variables directly.
dotenv.config({ path: ".env.local" });

const app = express();
app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://covers.openlibrary.org", "https://*.openlibrary.org"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://openlibrary.org", "https://*.openlibrary.org"],
    },
  },
}));

const allowedOrigins = process.env.CLIENT_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean);
if (allowedOrigins?.length) app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/api", api);

export default app;
