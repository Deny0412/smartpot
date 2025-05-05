import { FastifyReply } from 'fastify'
import { exportFlower } from '../../dao/flower/flower-export-dao'

const flowerExportAbl = async (flowerId: string, reply: FastifyReply) => {
  try {
    const exportedData = await exportFlower(flowerId)
    reply.send({
      status: 'success',
      data: exportedData,
    })
  } catch (error) {
    reply.status(500).send({
      status: 'error',
      message: 'Failed to export flower data',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default flowerExportAbl
