import { measurementController } from "../controller/measurement-controller";
import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth-middleware";
import { householdAuthMidlleware } from "../middleware/household-membership-middleware";

const MEMBER_ROLE = "member";
const OWNER_ROLE = "owner";

export default async function measurementRoutes(fastify: FastifyInstance) {
  // fastify.post("/measurement/add", flowerController.addMeasurement);
  fastify.post(
    "/history",
    {
      onRequest: [authMiddleware], // Authenticate first
    },
    measurementController.history
  );
  fastify.post("/create", measurementController.create);

 

  /*
  fastify.post(
    "/createWater",
    
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    
    measurementController.create
  );
  fastify.post(
    "/createLight",
    
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    
    measurementController.create
  );
  fastify.post(
    "/createTemperature",
    
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    
    measurementController.create
  );
  fastify.post(
    "/createHumidity",
    
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    
    measurementController.create
  );
  */
}
