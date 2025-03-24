import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import CREATE from "../abl/household/household-create-abl";
import DELETE from "../abl/household/household-delete-abl";
import GET from "../abl/household/household-get-abl";
import UPDATE from "../abl/household/household-update-abl";
import LIST from "../abl/household/household-list-abl";

export default async function householdRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/household/create",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return CREATE(request, reply);
    }
  );

  fastify.delete(
    "/household/delete",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return DELETE(request, reply);
    }
  );

  fastify.get(
    "/household/get",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return GET(request, reply);
    }
  );

  fastify.put(
    "/household/update",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return UPDATE(request, reply);
    }
  );

  fastify.get(
    "/household/list",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return LIST(request, reply);
    }
  );
}
