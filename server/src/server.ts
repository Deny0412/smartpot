import Fastify from "fastify";
import cors from "@fastify/cors";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { appConfig } from "./config/config";
import { swaggerPlugin } from "./plugins/swagger";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

// Register plugins
fastify.register(cors, {
  origin: true, // allow all origins for now
});

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

start();
