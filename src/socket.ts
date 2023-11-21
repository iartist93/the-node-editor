import { type NodeType } from '@/node'
import type { ReactiveVariable } from 'vue/macros'
import { reactive, type Ref } from 'vue'
import * as Vue from 'vue-demi'

export interface SocketType {
  id: number
  name: String
  label: string
  x: number
  y: number
  color: string
  stroke: string
  colorIn: string
  colorOut: string
  nodeId: number
}

interface useSocketType {
  socket: ReactiveVariable<SocketType>
  defaultSocket: SocketType
}

interface useSocketUtilsType {
  isInsideSocket: (node: NodeType, socket: SocketType, x: number, y: number) => boolean
  drawSocket: (
    ctx: Ref<CanvasRenderingContext2D | null>,
    node: ReactiveVariable<NodeType>,
    socket: ReactiveVariable<SocketType>
  ) => void
}

export const useSocket = (newSocket?: Partial<SocketType>): useSocketType => {
  const defaultSocket: SocketType = {
    id: 1,
    name: '[SOCKET]',
    label: '[SOCKET]',
    x: 0,
    y: 0,
    color: 'gray',
    colorIn: '#ad89b5',
    colorOut: '#f7aa69',
    stroke: '#24232c',
    nodeId: 0
  }

  const socket: ReactiveVariable<SocketType> = reactive({ ...defaultSocket, ...newSocket })

  return {
    socket,
    defaultSocket
  }
}

export const useSocketUtils = () => {
  /**
   * Track if the mouse cursor is inside a socket
   *
   * @param node node that include the socket
   * @param socket socket to check if mouse is inside
   * @param x mouse x
   * @param y mouse y
   */
  const isInsideSocket = (node: NodeType, socket: SocketType, x: number, y: number) => {
    return (
      x >= socket.x - node.socketRadius &&
      x <= socket.x + node.socketRadius &&
      y >= socket.y - node.socketRadius &&
      y <= socket.y + node.socketRadius
    )
  }

  /**
   * Connect current socket to a node
   *
   * @param socket
   * @param node
   */
  const connectToNode = (socket: ReactiveVariable<SocketType>, nodeId: number) => {
    socket.nodeId = nodeId
  }

  const drawSocket = (
    ctx: Ref<CanvasRenderingContext2D | null>,
    node: ReactiveVariable<NodeType>
  ) => {
    if (!ctx.value) {
      console.error('You must provide CanvasRenderingContext2D')
      return
    }

    for (let i = 1; i <= node.inputSockets.length; i++) {
      const x = node.x
      const y = node.y + i * node.socketSpacing + node.headerHeight
      const socket = node.inputSockets[i - 1]

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
      ctx.value.fillText(
        node.inputSockets[i - 1].label,
        x + node.socketRadius * 1.5,
        y + node.socketRadius / 2,
        500
      )

      Vue.set(node.inputSockets[i - 1], 'x', x)
      Vue.set(node.inputSockets[i - 1], 'y', y)
    }

    // draw outputs
    for (let i = 1; i <= node.outputSockets.length; i++) {
      const x = node.x + node.width
      const y = node.y + i * node.socketSpacing + node.headerHeight
      const socket = node.outputSockets[i - 1]

      ctx.value.beginPath()
      ctx.value.arc(x, y, node.socketRadius, 0, 2 * Math.PI)
      ctx.value.fillStyle = socket.colorOut
      ctx.value.fill()
      ctx.value.strokeStyle = socket.stroke
      ctx.value.lineWidth = 2
      ctx.value.stroke()
      ctx.value.closePath()

      ctx.value.textAlign = 'right'
      ctx.value.font = '14px Courier New'
      ctx.value.fillStyle = '#e4e4ea'
      ctx.value.fillText(
        node.outputSockets[i - 1].label,
        x - node.socketRadius * 1.5,
        y + node.socketRadius / 2,
        500
      )

      Vue.set(node.outputSockets[i - 1], 'x', x)
      Vue.set(node.outputSockets[i - 1], 'y', y)
    }
  }

  return {
    isInsideSocket,
    drawSocket,
    connectToNode
  }
}
