import { FastifyReply } from 'fastify';

export const sendSuccess = (reply: FastifyReply, data: any, message: string) => {
    reply.status(200).send({
        data,
        message,
        status: "success",
    });
};

export const sendError = (reply: FastifyReply, error: unknown) => {
    if (error instanceof Error) {
        reply.status(500).send({ message: error.message, status: "error" });
    } else {
        reply.status(500).send({ message: "Unknown error occurred", status: "error" });
    }
}; 