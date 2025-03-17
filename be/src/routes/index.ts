import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';

const routes: FastifyPluginAsync = async (fastify) => {
  // Example route with TypeBox schema
  fastify.get('/hello', {
    schema: {
      response: {
        200: Type.Object({
          message: Type.String()
        })
      }
    }
  }, async () => {
    return { message: 'Hello from the backend!' };
  });
};

export default routes; 