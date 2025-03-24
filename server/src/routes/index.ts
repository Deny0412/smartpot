import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";
import potRoutes from './pot'; // Import the pot routes

const routes: FastifyPluginAsync = async (fastify) => {
  // Health check endpoint
  fastify.get(
    "/health",
    {
      schema: {
        response: {
          200: Type.Object({
            status: Type.String(),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
      };
    }
  );

  // Register pot routes under the /api prefix
  fastify.register(potRoutes, { prefix: '/pot' }); // Register the pot routes with /api/pot prefix
};

export default routes;
