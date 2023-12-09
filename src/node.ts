import { reactive, type Ref } from 'vue'
import { useEditorStore } from '@/stores'
import { drawSocket, type SocketType, useSocket } from '@/socket'
import { nanoid } from 'nanoid'

export interface NodeType {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  unit: number
  fill: string
  stroke: string
  strokeWidth: number
  borderRadius: number
  draggable: boolean
  socketRadius: number
  socketSpacing: number
  headerHeight: number
  inputSocketIds: string[]
  outputSocketIds: string[]
  inputs: number
  outputs: number
}

/**
 * default node parameters
 */
const defaultValue: NodeType = {
  id: '[[ID]]',
  name: '[[NAME]]',
  x: 1,
  y: 285,
  width: 200,
  height: 200,
  headerHeight: 40,
  unit: 50,
  fill: '#4b4b4b',
  stroke: 'gray',
  strokeWidth: 5,
  borderRadius: 10,
  draggable: true,
  socketRadius: 10,
  socketSpacing: 50,
  inputSocketIds: [],
  outputSocketIds: [],
  inputs: 0,
  outputs: 0
}

/**
 * create a new node and return reactive variable
 * @param newNode
 */
export const useNode = (newNode?: Partial<NodeType>): NodeType => {
  return reactive<NodeType>({
    ...structuredClone(defaultValue),
    ...newNode,
    id: nanoid()
  })
}

/**
 * Track if the mouse cursor is inside a node
 * @param node node to check if mouse is inside
 * @param x mouse x
 * @param y mouse y
 */
export const isMouseInsideNode = (node: NodeType, x: number, y: number) => {
  return (
    x >= node.x - node.socketRadius &&
    x <= node.x + node.width + node.socketRadius &&
    y >= node.y - node.socketRadius &&
    y <= node.y + node.height + node.socketRadius
  )
}

/**
 * update node height depends on the number of sockets
 * @param node
 */
export const updateNode = (node: NodeType) => {
  const maxSocketsNum = Math.max(node.outputs, node.inputs)
  node.height = node.unit * (maxSocketsNum + 1) + node.headerHeight
}

/**
 * draw the node on the canvas
 * @param ctx : CanvasRenderingContext2D
 * @param node : NodeType
 */
export const drawNode = (ctx: Ref<CanvasRenderingContext2D | null>, node: NodeType) => {
  if (!ctx.value) {
    console.error('You must provide CanvasRenderingContext2D')
    return
  }

  // draw the node body
  ctx.value.globalAlpha = 0.93
  ctx.value.beginPath()
  ctx.value.fillStyle = node.fill
  ctx.value.strokeStyle = node.stroke
  ctx.value.lineWidth = node.strokeWidth
  ctx.value.roundRect(node.x, node.y, node.width, node.height, node.borderRadius)
  ctx.value.stroke()
  ctx.value.fill()
  ctx.value.closePath()

  // draw the node title
  ctx.value.textAlign = 'center'
  ctx.value.font = 'bold 14px Courier New'
  ctx.value.fillStyle = 'white'
  ctx.value.fillText(node.name, node.x + node.width / 2, node.y + node.headerHeight / 1.6)

  // draw divider
  ctx.value.beginPath()
  ctx.value.strokeStyle = '#8c8c8c'
  ctx.value.lineWidth = 1
  ctx.value.moveTo(node.x, node.y + node.headerHeight)
  ctx.value.lineTo(node.x + node.width, node.y + node.headerHeight)
  ctx.value.stroke()
  ctx.value.closePath()

  // reset alpha
  ctx.value.globalAlpha = 1.0

  // draw node input sockets
  for (let socketId of node.inputSocketIds) {
    const socket = useEditorStore().getSocket(socketId)
    drawSocket(ctx, socket, node)
  }

  // draw node output sockets
  for (let socketId of node.outputSocketIds) {
    const socket = useEditorStore().getSocket(socketId)
    drawSocket(ctx, socket, node)
  }

  //=============== TEMP =======================//
  // draw the socket values above the nodes

  // for each output socket, draw the value of the socket above the node
  for (let socketId of node.outputSocketIds) {
    const socket = useEditorStore().getSocket(socketId)
    const value = socket.value
    ctx.value.textAlign = 'center'
    ctx.value.font = 'bold 14px Courier New'
    ctx.value.fillStyle = '#c6cbfa'
    ctx.value.fillText(`${value}`, socket.x + 30, socket.y + 6)
  }

  // for each input soskcet draw the socket value beside the socket name
  for (let socketId of node.inputSocketIds) {
    const socket = useEditorStore().getSocket(socketId)
    const value = socket.value
    ctx.value.textAlign = 'left'
    ctx.value.font = 'bold 14px Courier New'
    ctx.value.fillStyle = '#c6cbfa'
    ctx.value.fillText(`${value}`, socket.x + 40, socket.y)
  }
}

/**
 * Create a new socket and add it to the node
 * @param node node to add the socket to
 * @param newSocket configuration of the new socket
 */
export const addNewSocket = (node: NodeType, newSocket: Partial<SocketType>) => {
  const socket = useSocket(newSocket)

  if (socket.type === 'input') {
    node.inputSocketIds.push(socket.id)
    socket.index = node.inputs
    node.inputs = node.inputs + 1
  } else {
    node.outputSocketIds.push(socket.id)
    socket.index = node.outputs
    node.outputs = node.outputs + 1
  }

  // add the node id to the socket
  socket.nodeId = node.id

  // add socket to the main store
  useEditorStore().addSocket(socket)

  // update the node height
  updateNode(node)
}

export const runSocketFunctions = (node: NodeType) => {
  for (let socketId of node.outputSocketIds) {
    const socket = useEditorStore().getSocket(socketId)
    if (socket.func) {
      socket.func()
    }
  }
}
