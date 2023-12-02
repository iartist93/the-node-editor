import { onBeforeUnmount, onMounted, reactive, type Ref } from 'vue'

export interface MousePosition {
  x: number
  y: number
}

export interface useMouseType {
  position: MousePosition
}

export const useMouse = (
  canvas?: Ref<HTMLCanvasElement | null>,
  onMouseUp?: (event: MouseEvent) => void,
  onMouseDown?: (event: MouseEvent) => void,
  onMouseMove?: (event: MouseEvent) => void,
  onMouseEnter?: (event: MouseEvent) => void,
  onMouseLeave?: (event: MouseEvent) => void
): useMouseType => {
  const position: MousePosition = reactive({
    x: 0,
    y: 0
  })

  const onMouseDownEvent = (event: MouseEvent) => {
    if (onMouseDown) {
      onMouseDown(event)
    }
  }

  const onMouseMoveEvent = (event: MouseEvent) => {
    position.x = event.offsetX
    position.y = event.offsetY
    if (onMouseMove) {
      onMouseMove(event)
    }
  }

  const onMouseUpEvent = (event: MouseEvent) => {
    if (onMouseUp) {
      onMouseUp(event)
    }
  }

  const onMouseEnterEvent = (event: MouseEvent) => {
    if (onMouseEnter) {
      onMouseEnter(event)
    }
  }

  const onMouseLeaveEvent = (event: MouseEvent) => {
    if (onMouseLeave) {
      onMouseLeave(event)
    }
  }

  const registerMouseEvents = () => {
    if (!canvas || !canvas.value) return
    canvas.value.addEventListener('mousedown', onMouseDownEvent)
    canvas.value.addEventListener('mousemove', onMouseMoveEvent)
    canvas.value.addEventListener('mouseup', onMouseUpEvent)
    canvas.value.addEventListener('mouseenter', onMouseEnterEvent)
    canvas.value.addEventListener('mouseleave', onMouseLeaveEvent)
  }

  const unregisterMouseEvents = () => {
    if (!canvas || !canvas.value) return
    canvas.value.removeEventListener('mousedown', onMouseDownEvent)
    canvas.value.removeEventListener('mousemove', onMouseMoveEvent)
    canvas.value.removeEventListener('mouseup', onMouseUpEvent)
    canvas.value.removeEventListener('mouseenter', onMouseEnterEvent)
    canvas.value.removeEventListener('mouseleave', onMouseLeaveEvent)
  }

  onMounted(() => {
    if (!canvas || !canvas.value) {
      console.error('You should init the canvas first')
      return
    }
    registerMouseEvents()
  })

  onBeforeUnmount(() => {
    unregisterMouseEvents()
  })

  return {
    position
  }
}
