import { type Connection, type Frame } from '../types/canvas'

export class ConnectionManager {
  private activeConnection: {
    fromId: string
    fromConnector: 'left' | 'right'
  } | null = null

  private connections: Connection[] = []
  private onConnectionsChange: (connections: Connection[]) => void

  constructor(onChange: (connections: Connection[]) => void) {
    this.onConnectionsChange = onChange
  }

  startConnection(frameId: string, connector: 'left' | 'right') {
    this.activeConnection = { fromId: frameId, fromConnector: connector }
  }

  endConnection(toId: string, toConnector: 'left' | 'right'): Connection | null {
    if (!this.activeConnection) return null
    if (this.activeConnection.fromId === toId) return null

    // Determine if connection is valid based on connector positions
    const isValid = (
      (this.activeConnection.fromConnector === 'right' && toConnector === 'left') ||
      (this.activeConnection.fromConnector === 'left' && toConnector === 'right')
    )

    if (!isValid) return null

    const connection: Connection = {
      id: `${this.activeConnection.fromId}-${toId}`,
      from: this.activeConnection.fromId,
      to: toId,
      points: [],
    }

    this.connections.push(connection)
    this.onConnectionsChange(this.connections)
    this.activeConnection = null

    return connection
  }

  cancelConnection() {
    this.activeConnection = null
  }

  updateConnectionPoints(frames: Map<string, Frame>) {
    this.connections = this.connections.map(connection => {
      const fromFrame = frames.get(connection.from)
      const toFrame = frames.get(connection.to)

      if (!fromFrame || !toFrame) return connection

      const fromBounds = {
        x: fromFrame.position.x,
        y: fromFrame.position.y,
        w: 320, // Default width
        h: 320, // Default height
      }

      const toBounds = {
        x: toFrame.position.x,
        y: toFrame.position.y,
        w: 320,
        h: 320,
      }

      const fromCenter = {
        x: fromBounds.x + fromBounds.w / 2,
        y: fromBounds.y + fromBounds.h / 2,
      }

      const toCenter = {
        x: toBounds.x + toBounds.w / 2,
        y: toBounds.y + toBounds.h / 2,
      }

      // Determine connection points based on frame positions
      const isFromRight = fromCenter.x < toCenter.x
      const fromX = isFromRight ? fromBounds.x + fromBounds.w : fromBounds.x
      const toX = isFromRight ? toBounds.x : toBounds.x + toBounds.w

      return {
        ...connection,
        points: [
          { x: fromX, y: fromCenter.y },
          { x: toX, y: toCenter.y },
        ],
      }
    })

    this.onConnectionsChange(this.connections)
  }

  removeConnection(connectionId: string) {
    this.connections = this.connections.filter(c => c.id !== connectionId)
    this.onConnectionsChange(this.connections)
  }

  getConnections() {
    return this.connections
  }

  getActiveConnection() {
    return this.activeConnection
  }
}
