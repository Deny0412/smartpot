import { FastifyPluginAsync } from 'fastify';
import swagger from '@fastify/swagger';
import { appConfig } from '../config/config';

export const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Backend API',
        description: 'API documentation',
        version: '1.0.0'
      },
      servers: [
        {
          url: `http://localhost:${appConfig.PORT}`
        }
      ]
    }
  });
}; 