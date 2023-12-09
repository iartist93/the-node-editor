import { reactive, type Ref } from 'vue'
import { useEditorStore } from '@/stores'
import { nanoid } from 'nanoid'
import { type NodeType } from '@/node'
import type { ConnectionType } from '@/connection'

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
  func?: Function
  value: number
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
    connections: [],
    value: 0
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

/**
 * add a reference to the connection to its socket
 * @param socket
 * @param connection
 */
export const addConnectionToSocket = (socket: SocketType, connection: ConnectionType | string) => {
  let connectionId = typeof connection === 'string' ? connection : connection.id
  connection =
    typeof connection === 'string' ? useEditorStore().getConnection(connection) : connection

  // input socket should have only one connection                                                                                                                                                                                     nection to it
  if (socket.type === 'input') {
    // remove the current connection first
    if (socket.connections.length > 0) {
      const currentConnection = socket.connections[0]
      useEditorStore().removeConnection(currentConnection)
    }
    socket.connections[0] = connectionId
  } else {
    socket.connections.push(connectionId)
  }
}

/**
 * Remove connection from socket
 * @param socket
 * @param connectionId
 */
export const removeConnectionFromSocket = (socket: SocketType, connectionId: string) => {
  socket.connections = socket.connections.filter((connection) => connection !== connectionId)
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
  let labelX = 0
  let label = 0
  let textAlign: CanvasTextAlign = 'left'

  if (socket.type === 'input') {
    x = node.x
    y = node.y + (socket.index + 1) * node.socketSpacing + node.headerHeight
    labelX = x + node.socketRadius * 1.5
    textAlign = 'left'
  } else {
    x = node.x + node.width
    y = node.y + (socket.index + 1) * node.socketSpacing + node.headerHeight
    labelX = x - node.socketRadius * 1.5
    textAlign = 'right'
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

  ctx.value.textAlign = textAlign
  ctx.value.font = '14px Courier New'
  ctx.value.fillStyle = '#e4e4ea'
  ctx.value.fillText(socket.label, labelX, y + node.socketRadius / 2, 500)
}

/**
 * Set the function to be executed when any input socket's value change
 * @param socket
 * @param func
 */
export const setSocketFunction = (socket: SocketType, func: Function) => {
  if (socket.type === 'output') {
    socket.func = func
  }
}
