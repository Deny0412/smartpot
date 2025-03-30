import { FastifyInstance } from "fastify";
import { householdController } from "../controller/household-controller";

export default async function householdRoutes(fastify: FastifyInstance) {
  fastify.post("/create", householdController.create);
  fastify.delete("/delete", householdController.delete);
  fastify.get("/get/:id", householdController.get);
  fastify.put("/update", householdController.update);
  fastify.get("/list/:user_id", householdController.list);
  fastify.post("/invite", householdController.invite);
  fastify.put("/kick", householdController.kick);
  fastify.put("/changeOwner", householdController.changeOwner);
  fastify.put("/decision", householdController.decision);
}
