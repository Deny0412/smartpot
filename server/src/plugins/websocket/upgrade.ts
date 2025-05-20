import { IncomingMessage } from 'http'
import jwt from 'jsonwebtoken'
import { WebSocketServer } from 'ws'
import { AuthenticatedWebSocket } from './userConnections'

export function handleUpgrade(request: IncomingMessage, socket: any, head: Buffer, wss: WebSocketServer) {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host}`)
    const token = url.searchParams.get('token')
    const flowerId = url.pathname.split('/measurements/')[1]

    if (!token || !flowerId) {
      console.error('Missing token or flower ID:', { token: !!token, flowerId: !!flowerId })
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '')
      const userId = (decoded as any).user_id

      if (!userId) {
        console.error('Invalid token - missing user_id')
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        const authenticatedWs = Object.assign(ws, {
          id: Math.random().toString(36).substring(7),
          userId,
          flowerId,
        }) as AuthenticatedWebSocket

        console.log(`New WebSocket connection for flower ${flowerId} from user ${userId}`)
        wss.emit('connection', authenticatedWs, request)
      })
    } catch (error) {
      console.error('Token verification error:', error)
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
    }
  } catch (error) {
    console.error('Error in handleUpgrade:', error)
    socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
    socket.destroy()
  }
}
