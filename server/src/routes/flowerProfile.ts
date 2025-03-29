import { FastifyInstance } from "fastify";
import { flowerProfileController } from "../controller/flowerProfile-controller";

export default async function flowerProfileRoutes(fastify: FastifyInstance) {
  fastify.post("/create", flowerProfileController.create);
  fastify.delete("/delete", flowerProfileController.delete);
  fastify.get("/get/:id", flowerProfileController.get);
  fastify.put("/update", flowerProfileController.update);
}
