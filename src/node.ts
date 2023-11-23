import { type SocketType } from '@/socket'
import { type ReactiveVariable } from 'vue/macros'
import { reactive, type Ref } from 'vue'

export interface NodeType {
  id: number
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
  inputs: number
  outputs: number
  socketSpacing: number
  headerHeight: number
  inputSockets: SocketType[]
  outputSockets: SocketType[]
}

export interface useNodeType {
  value: ReactiveVariable<NodeType>
  defaultValue: NodeType
  draw: (ctx: Ref<CanvasRenderingContext2D | null>) => void
  init: () => void
  isMouseInside: (x: number, y: number) => boolean
}

export const useNode = (newNode?: Partial<NodeType>): useNodeType => {
  const defaultValue: NodeType = {
    id: 1,
    name: 'Sum',
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
    inputs: 2,
    outputs: 5,
    socketSpacing: 50,
    inputSockets: [],
    outputSockets: []
  }

  const value: ReactiveVariable<NodeType> = reactive({ ...defaultValue, ...newNode })

  /**
   * Track if the mouse cursor is inside a node
   * @param node node to check if mouse is inside
   * @param x mouse x
   * @param y mouse y
   */
  const isMouseInside = (x: number, y: number) => {
    return (
      x >= value.x - value.socketRadius &&
      x <= value.x + value.width + value.socketRadius &&
      y >= value.y - value.socketRadius &&
      y <= value.y + value.height + value.socketRadius
    )
  }

  const init = () => {
    value.outputs = value.outputSockets.length
    value.inputs = value.inputSockets.length

    // set the height dynamically based on how many sockets
    const maxSocketsNum = Math.max(value.outputs, value.inputs)
    value.height = value.unit * (maxSocketsNum + 1) + value.headerHeight
  }

  const draw = (ctx: Ref<CanvasRenderingContext2D | null>) => {
    if (!ctx.value) {
      console.error('You must provide CanvasRenderingContext2D')
      return
    }

    // draw the node body
    ctx.value.globalAlpha = 0.93
    ctx.value.beginPath()
    ctx.value.fillStyle = value.fill
    ctx.value.strokeStyle = value.stroke
    ctx.value.lineWidth = value.strokeWidth
    ctx.value.roundRect(value.x, value.y, value.width, value.height, value.borderRadius)
    ctx.value.stroke()
    ctx.value.fill()
    ctx.value.closePath()

    // draw the node title
    ctx.value.textAlign = 'center'
    ctx.value.font = 'bold 14px Courier New'
    ctx.value.fillStyle = 'white'
    ctx.value.fillText(value.name, value.x + value.width / 2, value.y + value.headerHeight / 1.6)

    // draw divider
    ctx.value.beginPath()
    ctx.value.strokeStyle = '#8c8c8c'
    ctx.value.lineWidth = 1
    ctx.value.moveTo(value.x, value.y + value.headerHeight)
    ctx.value.lineTo(value.x + value.width, value.y + value.headerHeight)
    ctx.value.stroke()
    ctx.value.closePath()

    // reset alpha
    ctx.value.globalAlpha = 1.0
  }

  return {
    value,
    defaultValue,
    isMouseInside,
    init,
    draw
  }
}
