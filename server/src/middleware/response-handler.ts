import { FastifyReply } from 'fastify'

export function sendResponse(reply: FastifyReply, statusCode: number, data: any, message: string) {
  reply.status(statusCode).send({
    status: message,
    data: data,
  })
}

// 2xx Responses
export const sendSuccess = (reply: FastifyReply, data: any, message?: string) => {
  return reply.status(200).send({
    success: true,
    message: message || 'Success',
    data,
  })
}

export function sendCreated(reply: FastifyReply, data: any, message?: string) {
  return reply.status(201).send({
    success: true,
    message: message || 'Created successfully',
    data,
  })
}

export const sendNoContent = (reply: FastifyReply) => {
  return reply.status(204).send()
}

// Enhanced error handling function
export const sendError = (reply: FastifyReply, error: any) => {
  console.error('Error:', error)
  return reply.status(500).send({
    success: false,
    message: error.message || 'Internal server error',
  })
}

// 4xx Responses
export const sendClientError = (reply: FastifyReply, message: string) => {
  return reply.status(400).send({
    success: false,
    message,
  })
}

// New function for 3xx responses
export const sendRedirect = (reply: FastifyReply, location: string, message: string = 'Redirecting') => {
  reply.status(302).header('Location', location).send({
    message,
    status: 'redirect',
  })
}

export const sendNotFound = (reply: FastifyReply, message: string) => {
  return reply.status(404).send({
    success: false,
    message,
  })
}

export const sendUnauthorized = (reply: FastifyReply, message: string = 'Unauthorized access') => {
  sendClientError(reply, message)
}

// 5xx Responses
export const sendInternalServerError = (reply: FastifyReply, message: string = 'Internal server error') => {
  sendResponse(reply, 500, null, message)
}

export const sendServiceUnavailable = (reply: FastifyReply, message: string = 'Service unavailable') => {
  sendResponse(reply, 503, null, message)
}

export const sendGatewayTimeout = (reply: FastifyReply, message: string = 'Gateway timeout') => {
  sendResponse(reply, 504, null, message)
}
