import Fastify from "fastify";
import cors from "@fastify/cors";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { appConfig } from "./config/config";
import { swaggerPlugin } from "./plugins/swagger";
import { dbPlugin } from "./config/database";
import mongoose from "mongoose";
import routes from './routes'; // Import the routes

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

// Register plugins
fastify.register(cors, {
  origin: true, // allow all origins for now
});

fastify.register(dbPlugin);
fastify.register(swaggerPlugin);

// Register routes with the /api prefix
fastify.register(routes, { prefix: '/api' }); // This will add /api to all routes defined in index.ts

// Health check endpoint

/*
fastify.get("/health", async () => {
  return { status: "ok" };
});
*/

import householdRoutes from "./controller/household-controller";
fastify.register(householdRoutes);


// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: appConfig.PORT,
      host: "0.0.0.0",
    });
    fastify.log.info(`Server is running on port ${appConfig.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during graceful shutdown:", err);
    process.exit(1);
  }
});

start();
