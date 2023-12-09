import { reactive, type Ref } from 'vue'
import { useEditorStore } from '@/stores'
import { nanoid } from 'nanoid'
import { addConnectionToSocket, removeConnectionFromSocket, type SocketType } from '@/socket'
import { type MousePosition } from '@/mouse'
import { runSocketFunctions } from '@/node'

export interface ConnectionType {
  id: string
  inputSocketId: string | null
  outputSocketId: string | null
}

export const useConnection = (
  inputSocketId: string | null = null,
  outputSocketId: string | null = null
): ConnectionType => {
  const connection: ConnectionType = reactive<ConnectionType>({
    id: nanoid(),
    inputSocketId,
    outputSocketId
  })

  if (inputSocketId) {
    const socket = useEditorStore().getSocket(inputSocketId)
    addConnectionToSocket(socket, connection)
  }

  if (outputSocketId) {
    const socket = useEditorStore().getSocket(outputSocketId)
    addConnectionToSocket(socket, connection)
  }

  return connection
}

export const drawConnection = (
  ctx: Ref<CanvasRenderingContext2D | null>,
  connection: ConnectionType,
  mouse: MousePosition
) => {
  if (!ctx.value) {
    console.error('You must provide CanvasRenderingContext2D')
    return
  }

  const store = useEditorStore()

  const inputSocket = connection.inputSocketId ? store.getSocket(connection.inputSocketId) : null
  const outputSocket = connection.outputSocketId ? store.getSocket(connection.outputSocketId) : null
  const targetToMouse = connection.inputSocketId === null || connection.outputSocketId === null

  let targetX = inputSocket ? inputSocket.x : targetToMouse ? mouse.x : 0
  let targetY = inputSocket ? inputSocket.y : targetToMouse ? mouse.y : 0
  let sourceX = outputSocket ? outputSocket.x : targetToMouse ? mouse.x : 0
  let sourceY = outputSocket ? outputSocket.y : targetToMouse ? mouse.y : 0

  // control points
  const cp1X = sourceX + (targetX - sourceX) * (5 / 10)
  const cp2X = sourceX + (targetX - sourceX) * (5 / 10)
  const cp1Y = sourceY
  const cp2Y = targetY

  ctx.value.beginPath()
  ctx.value.moveTo(sourceX, sourceY)
  ctx.value.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, targetX, targetY)
  ctx.value.lineWidth = 3
  ctx.value.strokeStyle = 'white'
  ctx.value.stroke()
  ctx.value.closePath()
}

export const addSocketToConnection = (connection: ConnectionType, socket: SocketType | string) => {
  const socketId = typeof socket === 'string' ? socket : socket.id
  socket = typeof socket === 'string' ? useEditorStore().getSocket(socket) : socket

  if (socket.type === 'input') {
    connection.outputSocketId = socketId
  } else {
    connection.inputSocketId = socketId
  }

  // add connection to the socket
  addConnectionToSocket(socket, connection)

  console.log('===> add socket to connection ', connection)

  // update the socket value
  if (connection.inputSocketId && connection.outputSocketId) {
    // get the value of the input socket of the connection and then set the value of the output socket of the connection with this value
    const inputSocket = useEditorStore().getSocket(connection.inputSocketId)
    const outputSocket = useEditorStore().getSocket(connection.outputSocketId)
    outputSocket.value = inputSocket.value

    // get the node of the output socket
    const node = useEditorStore().getNode(outputSocket.nodeId)

    // run the function of the output socket
    runSocketFunctions(node)
  }
}

export const removeSocketFromConnection = (connection: ConnectionType, socket: SocketType) => {
  const socketId = socket.id

  if (socket.type === 'input') {
    connection.outputSocketId = null
  } else {
    connection.inputSocketId = null
  }

  // remove connection from the socket
  removeConnectionFromSocket(socket, connection.id)
}
