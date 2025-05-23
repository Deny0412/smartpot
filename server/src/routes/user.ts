import { userController } from "../controller/user-controller";
import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth-middleware";

export default async function flowerRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/search",
    {
      onRequest: [authMiddleware],
    },
    userController.search
  );
}
