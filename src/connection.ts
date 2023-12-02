import { computed, type ComputedRef, type Ref } from 'vue'
import { useEditorStore } from '@/stores'
import { nanoid } from 'nanoid'

export interface ConnectionType {
  id: string
  inputSocketId: string
  outputSocketId: string | null
  mouseX: Ref<number>
  mouseY: Ref<number>
  targetToMouse: boolean
}

export const useConnection = (
  inputSocketId: string,
  outputSocketId: string | null,
  mouseX: Ref<number>,
  mouseY: Ref<number>,
  targetToMouse: boolean = false
): ComputedRef<ConnectionType> => {
  return computed(() => ({
    id: nanoid(),
    inputSocketId,
    outputSocketId,
    mouseX,
    mouseY,
    targetToMouse
  }))
}

export const drawConnection = (
  ctx: Ref<CanvasRenderingContext2D | null>,
  connection: ComputedRef<ConnectionType>
) => {
  if (!ctx.value) {
    console.error('You must provide CanvasRenderingContext2D')
    return
  }

  const store = useEditorStore()
  const inputSocket = store.getSocket(connection.value.inputSocketId)

  // check if the connection is from socket or mouse
  const outputSocket = connection.value.outputSocketId
    ? store.getSocket(connection.value.outputSocketId)
    : null

  let sourceX = inputSocket.x
  let sourceY = inputSocket.y
  let targetX = 0
  let targetY = 0

  if (connection.value.targetToMouse) {
    targetX = connection.value.mouseX.value
    targetY = connection.value.mouseY.value
  } else {
    targetX = outputSocket?.x || 0
    targetY = outputSocket?.y || 0
  }

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
