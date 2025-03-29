import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";
import flowerRoutes from "./flower"; // Import the flower routes
import householdRoutes from "./household"; // Import the household routes
import smartpotRoutes from "./smart-pot"; // Import the smartpot routes
import measurementRoutes from "./measurement"; // Import the measurement routes
import scheduleRoutes from "./schedule"; // Import the schedule routes
import flowerProfileRoutes from "./flowerProfile"; // Import the household routes

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

  // Register routes under the /api prefix
  fastify.register(flowerRoutes, { prefix: "/flower" });
  fastify.register(householdRoutes, { prefix: "/household" });

  fastify.register(smartpotRoutes, { prefix: "/smart-pot" });
  fastify.register(measurementRoutes, { prefix: "/measurement" });
  fastify.register(scheduleRoutes, { prefix: "/schedule" });
  fastify.register(flowerProfileRoutes, { prefix: "/flowerProfile" });

};

export default routes;
