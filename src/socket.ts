import { reactive, type Ref } from 'vue'
import { useEditorStore } from '@/stores'
import { nanoid } from 'nanoid'
import { type NodeType } from '@/node'

export interface SocketType {
  id: string
  index: number
  type: string
  name: string
  label: string
  socketRadius: number
  x: number
  y: number
  color: string
  stroke: string
  colorIn: string
  colorOut: string
  nodeId: string
  connections: string[]
}

/**
 * returns reactive variable to newly created socket
 * @param newSocket
 */
export const useSocket = (newSocket?: Partial<SocketType>): SocketType => {
  const defaultValue: SocketType = {
    id: '[[ID]]',
    type: '[[Type]]',
    name: '[[Name]]',
    label: '[[Label]]',
    nodeId: '[[Node_ID]]',
    index: 0,
    x: 0,
    y: 0,
    socketRadius: 10,
    color: 'gray',
    colorIn: '#ad89b5',
    colorOut: '#f7aa69',
    stroke: '#24232c',
    connections: []
  }

  return reactive<SocketType>({
    ...structuredClone(defaultValue),
    ...newSocket,
    id: nanoid()
  })
}

//TODO: Do we really need the socket radius inside the node itself?

/**
 * Track if the mouse cursor is inside a socket
 *
 * @param socket socket to check if mouse is inside
 * @param x mouse x
 * @param y mouse y
 */
export const inMouseInsideSocket = (socket: SocketType | string, x: number, y: number) => {
  if (typeof socket === 'string') {
    socket = useEditorStore().getSocket(socket)
  }
  return (
    x >= socket.x - socket.socketRadius &&
    x <= socket.x + socket.socketRadius &&
    y >= socket.y - socket.socketRadius &&
    y <= socket.y + socket.socketRadius
  )
}

const addConnectionToSocket = (socket: SocketType, connectionId: string) => {
  // input socket should have only one connection                                                                                                                                                                                      nection to it
  if (socket.type === 'input') {
    socket.connections[0] = connectionId
  } else {
    socket.connections.push(connectionId)
  }
}

/**
 * Check if the current socket has connection
 */
const isSocketHasConnections = (socket: SocketType) => {
  return socket.connections.length > 0
}

export const drawSocket = (
  ctx: Ref<CanvasRenderingContext2D | null>,
  socket: SocketType,
  node: NodeType
) => {
  if (!ctx.value) {
    console.error('You must provide CanvasRenderingContext2D')
    return
  }

  let x = 0
  let y = 0

  if (socket.type === 'input') {
    x = node.x
    y = node.y + (socket.index + 1) * node.socketSpacing + node.headerHeight
  } else {
    x = node.x + node.width
    y = node.y + (socket.index + 1) * node.socketSpacing + node.headerHeight
  }

  socket.x = x
  socket.y = y

  ctx.value.beginPath()
  ctx.value.arc(x, y, node.socketRadius, 0, 2 * Math.PI)
  ctx.value.fillStyle = socket.colorIn
  ctx.value.fill()
  ctx.value.strokeStyle = socket.stroke
  ctx.value.lineWidth = 2
  ctx.value.stroke()
  ctx.value.closePath()

  ctx.value.textAlign = 'left'
  ctx.value.font = '14px Courier New'
  ctx.value.fillStyle = '#e4e4ea'
  ctx.value.fillText(socket.label, x + node.socketRadius * 1.5, y + node.socketRadius / 2, 500)
}
