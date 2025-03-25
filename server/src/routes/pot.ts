import { FastifyInstance } from 'fastify';
import { potController } from '../controller/pot-controller';


export default async function potRoutes(fastify: FastifyInstance) {
    fastify.post('/add', potController.create);
    fastify.delete('/delete/:id', potController.delete);
    fastify.get('/get/:id', potController.get);
    fastify.get('/list', potController.list);
    fastify.put('/update', potController.update);
    fastify.post('/measurement/add', potController.addMeasurement);
    fastify.get('/history', potController.history);
    //fastify.get('/pot/history/humidity', /* handler for humidity history */);
    //fastify.get('/pot/history/temperature', /* handler for temperature history */);
    //fastify.get('/pot/history/waterlevel', /* handler for water level history */);
}