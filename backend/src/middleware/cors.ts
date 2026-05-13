import cors from "cors";
import { env } from "../config/env.js";

const allowedOrigins = env.CORS_ORIGINS.split(",").map((o) => o.trim());

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-GitHub-OTP",
    "X-Next-GitHub-OTP",
  ],
  exposedHeaders: [
    "ETag",
    "Link",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
    "X-OAuth-Scopes",
    "X-Accepted-OAuth-Scopes",
    "X-Poll-Interval",
  ],
  maxAge: 86400,
});
