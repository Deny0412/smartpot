import mongoose from "mongoose";
import { FastifyPluginAsync } from "fastify";

export const dbPlugin: FastifyPluginAsync = async (fastify) => {
  try {
    const url = process.env.MONGODB_URL || 'mongodb+srv://skull-crusher123:275Y34NbzVky4QrN@clustermain.zgzesyz.mongodb.net/smart-pot';
    await mongoose.connect(url);
    
    fastify.log.info('MongoDB connected successfully');
    
    // Close MongoDB connection when fastify closes
    fastify.addHook('onClose', async () => {
      await mongoose.connection.close();
      fastify.log.info('MongoDB connection closed');
    });
  } catch (err) {
    fastify.log.error('MongoDB connection error:', err);
    throw err;
  }
}; 