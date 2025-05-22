import { WebSocket } from 'ws'

export interface AuthenticatedWebSocket extends WebSocket {
  id: string
  userId: string
  flowerId: string
}

interface Connection {
  ws: AuthenticatedWebSocket
  userId: string
}

class FlowerConnections {
  private connections: Map<string, Connection[]> = new Map()

  addConnection(flowerId: string, userId: string, ws: AuthenticatedWebSocket) {
    if (!this.connections.has(flowerId)) {
      this.connections.set(flowerId, [])
    }
    this.connections.get(flowerId)?.push({ ws, userId })
    console.log(`Added connection for flower ${flowerId} from user ${userId}`)
  }

  removeConnection(flowerId: string, userId: string) {
    const flowerConnections = this.connections.get(flowerId)
    if (flowerConnections) {
      const index = flowerConnections.findIndex((conn) => conn.userId === userId)
      if (index !== -1) {
        flowerConnections.splice(index, 1)
        if (flowerConnections.length === 0) {
          this.connections.delete(flowerId)
        }
        console.log(`Removed connection for flower ${flowerId} from user ${userId}`)
      }
    }
  }

  getConnections(flowerId: string): AuthenticatedWebSocket[] {
    return this.connections.get(flowerId)?.map((conn) => conn.ws) || []
  }

  broadcastToFlower(flowerId: string, message: any) {
    const connections = this.getConnections(flowerId)
    const messageString = JSON.stringify(message)

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageString)
        } catch (error) {
          console.error(`Error sending message to flower ${flowerId}:`, error)
        }
      }
    })
  }

  getConnectionCount(flowerId: string): number {
    return this.connections.get(flowerId)?.length || 0
  }
}

export const flowerConnections = new FlowerConnections()
