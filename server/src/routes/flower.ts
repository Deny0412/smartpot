import { flowerController } from '../controller/flower-controller';
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth-middleware';
import { householdAuthMidlleware } from '../middleware/household-membership-middleware';

export default async function flowerRoutes(fastify: FastifyInstance) {
    fastify.post('/add', { 
        onRequest: [authMiddleware],  // Authenticate first
        preHandler: [householdAuthMidlleware(["owner", "member" , "fuj"])] // Then check household auth
    }, flowerController.create);
    
    fastify.delete('/delete/:id', flowerController.delete);
    fastify.get('/get/:id', flowerController.get);
    fastify.get('/list', flowerController.list);
    fastify.put('/update', flowerController.update);
    fastify.post('/measurement/add', flowerController.addMeasurement);
    fastify.get('/history', flowerController.history);
    fastify.get('/listactive', flowerController.listActive);
    //fastify.get('/flower/history/humidity', /* handler for humidity history */);
    //fastify.get('/flower/history/temperature', /* handler for temperature history */);
    //fastify.get('/flower/history/waterlevel', /* handler for water level history */);
}