import { type Connection } from '../types/canvas'

export function createConnection(fromId: string, toId: string): Connection {
  return {
    id: `${fromId}-${toId}`,
    from: fromId,
    to: toId,
    points: [], // Will be calculated based on frame positions
  }
}

export function updateConnectionPoints(
  connection: Connection,
  fromBounds: { x: number; y: number; w: number; h: number },
  toBounds: { x: number; y: number; w: number; h: number }
): Connection {
  // Calculate connection points
  const fromCenter = {
    x: fromBounds.x + fromBounds.w / 2,
    y: fromBounds.y + fromBounds.h / 2,
  }
  const toCenter = {
    x: toBounds.x + toBounds.w / 2,
    y: toBounds.y + toBounds.h / 2,
  }

  // Determine which side of each frame to connect from/to
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
}

export function drawConnection(ctx: CanvasRenderingContext2D, connection: Connection) {
  if (connection.points.length < 2) return

  ctx.beginPath()
  ctx.moveTo(connection.points[0].x, connection.points[0].y)

  // Draw line
  for (let i = 1; i < connection.points.length; i++) {
    ctx.lineTo(connection.points[i].x, connection.points[i].y)
  }
  ctx.stroke()

  // Draw arrow
  const lastPoint = connection.points[connection.points.length - 1]
  const prevPoint = connection.points[connection.points.length - 2]
  const angle = Math.atan2(
    lastPoint.y - prevPoint.y,
    lastPoint.x - prevPoint.x
  )
  const arrowLength = 10

  ctx.beginPath()
  ctx.moveTo(lastPoint.x, lastPoint.y)
  ctx.lineTo(
    lastPoint.x - arrowLength * Math.cos(angle - Math.PI / 6),
    lastPoint.y - arrowLength * Math.sin(angle - Math.PI / 6)
  )
  ctx.moveTo(lastPoint.x, lastPoint.y)
  ctx.lineTo(
    lastPoint.x - arrowLength * Math.cos(angle + Math.PI / 6),
    lastPoint.y - arrowLength * Math.sin(angle + Math.PI / 6)
  )
  ctx.stroke()
}
