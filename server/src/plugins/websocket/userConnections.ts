import { WebSocket } from 'ws'

export interface AuthenticatedWebSocket extends WebSocket {
  id: string
  userId: string
  flowerId: string
}

interface Connection {
  ws: AuthenticatedWebSocket
  flowerId: string
}

class UserConnections {
  private connections: Map<string, Connection> = new Map()

  addConnection(userId: string, flowerId: string, ws: AuthenticatedWebSocket) {
    this.connections.set(userId, { ws, flowerId })
   
  }

  removeConnection(userId: string) {
    this.connections.delete(userId)
  
  }

  getConnection(userId: string): Connection | undefined {
    return this.connections.get(userId)
  }

  broadcastToFlower(flowerId: string, message: any) {
    

    let sentCount = 0
    this.connections.forEach((connection, userId) => {
     

      if (connection.flowerId === flowerId && connection.ws.readyState === WebSocket.OPEN) {
        try {
          const messageString = JSON.stringify(message)
         
          connection.ws.send(messageString)
         
          sentCount++
        } catch (error) {
          console.error(`Error sending message to ${userId}:`, error)
        }
      } else {
        console.log(`Error sending message to ${userId}: Flower ID does not match or WebSocket is not open`)
      }
    })

   
  }

  forEach(callback: (ws: AuthenticatedWebSocket, userId: string) => void) {
    this.connections.forEach((connection, userId) => {
      callback(connection.ws, userId)
    })
  }
}

export const userConnections = new UserConnections()
