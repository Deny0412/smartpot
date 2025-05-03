import { Type } from "@sinclair/typebox";
import { AppConfig } from "../types";
import { config } from "dotenv";
import path from "path";

// Load .env from root directory
config({ path: path.resolve(__dirname, "../../../.env") });

export const ConfigSchema = Type.Object({
  PORT: Type.Number({
    default: 3001,
    minimum: 1,
    maximum: 65535,
  }),
  NODE_ENV: Type.Union(
    [
      Type.Literal("development"),
      Type.Literal("production"),
      Type.Literal("test"),
    ],
    { default: "development" }
  ),
});

export const appConfig: AppConfig = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: (process.env.NODE_ENV as AppConfig["NODE_ENV"]) || "development",
};

export const secrets = {
  CLIENT_ID: process.env.CLIENT_ID!,
  CLIENT_SECRET: process.env.CLIENT_SECRET!,
  REDIRECT_URI: process.env.REDIRECT_URI!,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN!,
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
};
/*
console.log("CLIENT_ID:", process.env.CLIENT_ID); // remove after confirming
console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET); // remove after confirming
console.log("REDIRECT_URI:", process.env.REDIRECT_URI); // remove after confirming
console.log("REFRESH_TOKEN:", process.env.REFRESH_TOKEN); // remove after confirming
console.log("DISCORD_WEBHOOK_URL:", process.env.DISCORD_WEBHOOK_URL); // remove after confirming
console.log("JWT_SECRET::", process.env.JWT_SECRET); // remove after confirming
*/
