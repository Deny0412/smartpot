import { FastifyInstance } from 'fastify';
import { potController } from '../controller/pot-controller';

export default async function potRoutes(fastify: FastifyInstance) {
    fastify.post('/pot/add', potController.create);
    fastify.delete('/pot/delete', potController.delete);
    fastify.get('/pot/get', potController.get);
    fastify.get('/pot/:householdId/list', potController.list);
    fastify.put('/pot/update', potController.update);
    fastify.get('/pot/history/humidity', /* handler for humidity history */);
    fastify.get('/pot/history/temperature', /* handler for temperature history */);
    fastify.get('/pot/history/waterlevel', /* handler for water level history */);
}