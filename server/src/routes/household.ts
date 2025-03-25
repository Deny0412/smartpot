import { FastifyInstance } from "fastify";
import { householdController } from "../controller/household-controller";

export default async function householdRoutes(fastify: FastifyInstance) {
  fastify.post("/create", householdController.create);
  fastify.delete("/delete", householdController.delete);
  fastify.get("/get/:id", householdController.get);
  //fastify.get("/list/:householdId", householdController.list);
  fastify.put("/update", householdController.update);
}
