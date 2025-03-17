require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const jwt = require('@fastify/jwt');
const cors = require('@fastify/cors');

// Register plugins
fastify.register(jwt, {
  secret: process.env.JWT_SECRET
});

fastify.register(cors, {
  origin: true // allow all origins for now, configure according to your needs
});

// Register routes
fastify.register(require('./routes/auth'));

// JWT verification middleware
fastify.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    fastify.log.info(`Server is running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 