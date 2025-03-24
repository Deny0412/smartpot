import { FastifyInstance } from 'fastify';
import { potController } from '../controller/pot-controller';
import { authMiddleware } from '../middleware/auth-middleware';

export default async function potRoutes(fastify: FastifyInstance) {
    fastify.post('/add', { preHandler: authMiddleware }, potController.create);
    fastify.delete('/delete/:id', potController.delete);
    fastify.get('/get/:id', potController.get);
    fastify.get('/list/:householdId', potController.list);
    fastify.put('/update/:id', potController.update);
    //fastify.get('/pot/history/humidity', /* handler for humidity history */);
    //fastify.get('/pot/history/temperature', /* handler for temperature history */);
    //fastify.get('/pot/history/waterlevel', /* handler for water level history */);
}