import Fastify from "fastify";
import cors from "@fastify/cors";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { appConfig } from "./config/config";
import { swaggerPlugin } from "./plugins/swagger";
import { dbPlugin } from "./config/database";
import mongoose from "mongoose";
const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

// Register plugins
fastify.register(cors, {
  origin: true, // allow all origins for now
});

fastify.register(dbPlugin);
fastify.register(swaggerPlugin);

// Register routes
fastify.register(import("./routes"));

// Health check endpoint

/*
fastify.get("/health", async () => {
  return { status: "ok" };
});
*/

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
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});

start();
