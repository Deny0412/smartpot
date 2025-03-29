import { measurementController } from '../controller/measurement-controller';
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth-middleware';

export default async function smartmeasurementRoutes(fastify: FastifyInstance) {
    fastify.post('/create'/*,{ preHandler: authMiddleware }*/, measurementController.create);
}