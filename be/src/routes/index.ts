import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';

const routes: FastifyPluginAsync = async (fastify) => {
  // Health check endpoint
  fastify.get('/health', {
    schema: {
      response: {
        200: Type.Object({
          status: Type.String(),
          timestamp: Type.String()
        })
      }
    }
  }, async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  });
};

export default routes; 