import { type SocketType } from '@/socket'
import { computed, type ComputedRef, type Ref } from 'vue'
import type { ReactiveVariable } from 'vue/macros'

export interface ConnectionType {
  id: number
  inputSocket: SocketType
  outputSocket: SocketType | null
  mouseX: Ref<number>
  mouseY: Ref<number>
  targetToMouse: boolean
}

interface useConnectionType {
  connection: ComputedRef<ConnectionType>
}

interface useConnectionUtilsType {
  drawConnection: (
    ctx: Ref<CanvasRenderingContext2D | null>,
    connection: ComputedRef<ConnectionType>
  ) => void
}

export const useConnection = (
  id: number,
  inputSocket: ReactiveVariable<SocketType>,
  outputSocket: ReactiveVariable<SocketType> | null,
  mouseX: Ref<number>,
  mouseY: Ref<number>,
  targetToMouse: boolean = false
): useConnectionType => {
  const connection: ComputedRef<ConnectionType> = computed(() => ({
    id,
    inputSocket,
    outputSocket,
    mouseX,
    mouseY,
    targetToMouse
  }))

  return {
    connection
  }
}
export const useConnectionUtils = (): useConnectionUtilsType => {
  const drawConnection = (
    ctx: Ref<CanvasRenderingContext2D | null>,
    connection: ComputedRef<ConnectionType>
  ) => {
    if (!ctx.value) {
      console.error('You must provide CanvasRenderingContext2D')
      return
    }

    let sourceX = connection.value.inputSocket.x
    let sourceY = connection.value.inputSocket.y
    let targetX = 0
    let targetY = 20

    if (connection.value.targetToMouse) {
      targetX = connection.value.mouseX.value
      targetY = connection.value.mouseY.value
    } else {
      targetX = connection.value.outputSocket?.x || 0
      targetY = connection.value.outputSocket?.y || 0
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

  return {
    drawConnection
  }
}
