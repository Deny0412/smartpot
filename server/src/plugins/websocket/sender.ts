import { userConnections } from './userConnections'

export function sendToUser(userId: string, data: any) {
  const connection = userConnections.getConnection(userId)
  if (connection && connection.ws.readyState === connection.ws.OPEN) {
    connection.ws.send(JSON.stringify(data))
  } else {
    console.warn(`WebSocket not open for user ${userId}`)
  }
}

export function broadcastToAll(data: any) {
  userConnections.forEach((ws, userId) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data))
    } else {
      console.log(`WebSocket for user ID ${userId} is not open or does not exist.`)
    }
  })
}

export function sendToMultipleUsers(users: Array<any>, data: any) {
  users.forEach((user: any) => {
    if (user) sendToUser(user.id, data)
  })
}