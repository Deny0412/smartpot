import { smartpotController } from '../controller/smart-pot-controller';
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth-middleware';

export default async function smartpotRoutes(fastify: FastifyInstance) {
    fastify.post('/create'/*,{ preHandler: authMiddleware }*/, smartpotController.create);
    fastify.get('/get/:id', smartpotController.get);
    fastify.put('/update', smartpotController.update);
}