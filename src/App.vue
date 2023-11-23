<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import { useCanvas } from '@/canvas'
import { useNode, type useNodeType } from '@/node'
import { type SocketType, useSocket, useSocketUtils } from '@/socket'
import { useConnection, useConnectionUtils } from '@/connection'
import { useMouse } from '@/mouse'

// track mouse events
let isDragging = ref(false)
let isHovered = ref(false)
let offsetX = ref(0)
let offsetY = ref(0)
let mouseX = ref(0)
let mouseY = ref(0)

let hasNewConnectionActive = ref(false)

// track active/hover nodes
const activeNodes: useNodeType[] = reactive([])
const hoverNodes: useNodeType[] = reactive([])

// track active/hover sockets
const activeSockets: SocketType[] = reactive([])
const hoverSockets: SocketType[] = reactive([])

const DEFAULT_STROKE = 'gray'
const DEFAULT_SOCKET_STROKE = '$24232c'
const SELECTED_STROKE = 'yellow'

//====================================================
// Build the editor nodes, sockets, connections
//====================================================

const { isInsideSocket, drawSocket, connectToNode } = useSocketUtils()
const { drawConnection } = useConnectionUtils()

// node 1 sockets
const { socket: socket1_i1 } = useSocket({ name: 'x', label: 'x', nodeId: 1 })
const { socket: socket1_i2 } = useSocket({ name: 'y', label: 'y', nodeId: 1 })
const { socket: socket1_o1 } = useSocket({ name: 'sum', label: 'sum', nodeId: 1 })

// node 2 sockets
const { socket: socket2_i1 } = useSocket({ name: 'x', label: 'x', nodeId: 2 })
const { socket: socket2_i2 } = useSocket({ name: 'y', label: 'y', nodeId: 2 })
const { socket: socket2_i3 } = useSocket({ name: 'z', label: 'z', nodeId: 2 })
const { socket: socket2_i4 } = useSocket({ name: 'w', label: 'w', nodeId: 2 })
const { socket: socket2_o1 } = useSocket({ name: 'sum', label: 'sum', nodeId: 2 })
const { socket: socket2_o2 } = useSocket({ name: 'add', label: 'add', nodeId: 2 })

// node 3 sockets
const { socket: socket3_i1 } = useSocket({ name: 'x', label: 'x', nodeId: 3 })
const { socket: socket3_i2 } = useSocket({ name: 'y', label: 'y', nodeId: 3 })
const { socket: socket3_o1 } = useSocket({ name: 'add', label: 'add', nodeId: 3 })

const node1 = useNode({
  id: 1,
  x: 47,
  y: 285,
  name: 'Sum',
  inputSockets: [socket1_i1, socket1_i2],
  outputSockets: [socket1_o1]
})

const node2 = useNode({
  id: 2,
  x: 600,
  y: 340,
  name: 'Math',
  inputSockets: [socket2_i1, socket2_i2, socket2_i3, socket2_i4],
  outputSockets: [socket2_o1, socket2_o2]
})

const node3 = useNode({
  id: 3,
  x: 606,
  y: 82,
  name: 'Add',
  inputSockets: [socket3_i1, socket3_i2],
  outputSockets: [socket2_o1]
})

const { connection: connection1 } = useConnection(
  1,
  node1.value.outputSockets[0],
  node2.value.inputSockets[0],
  mouseX,
  mouseY
)

const { connection: connection2 } = useConnection(
  2,
  node1.value.outputSockets[0],
  node3.value.inputSockets[0],
  mouseX,
  mouseY
)

let allNodes = [node1, node2, node3]
let allConnections = [connection1, connection2]

//====================================================
// Build the canvas
//====================================================

const { canvas, ctx, renderEditor } = useCanvas()

//====================================================
// Handle editor events
//====================================================

const repaintEditor = () => {
  renderEditor()
  allNodes.forEach((node) => node.init())
  allNodes.forEach((node) => {
    node.draw(ctx)
    drawSocket(ctx, node.value)
  })
  allConnections.forEach((connection) => drawConnection(ctx, connection))
}

const activateSelectedNode = () => {
  activeNodes[0].value.stroke = SELECTED_STROKE
  allNodes = allNodes.filter((node) => node.value.id !== activeNodes[0].value.id)
  allNodes.push(activeNodes[0])
  repaintEditor()
}

const deactivateSelectedNode = () => {
  if (activeNodes[0]) {
    activeNodes[0].value.stroke = DEFAULT_STROKE
    activeNodes.pop()
  }
  if (activeSockets[0]) {
    activeSockets[0].stroke = DEFAULT_STROKE
    activeSockets.pop()
  }
  repaintEditor()
}

//====================================================
// Build the mouse events
//====================================================

const removeHoverHighlight = () => {
  if (hoverNodes[0]) {
    hoverNodes[0].value.stroke = DEFAULT_STROKE
    hoverNodes.pop()
  }
  if (hoverSockets[0]) {
    hoverSockets[0].stroke = DEFAULT_STROKE
    hoverSockets.pop()
  }
  repaintEditor()
}

const addHoverHighlight = () => {
  if (hoverSockets[0]) {
    hoverSockets[0].stroke = SELECTED_STROKE
  } else if (hoverNodes[0]) {
    hoverNodes[0].value.stroke = SELECTED_STROKE
  }
  repaintEditor()
}

const checkHover = (event: MouseEvent) => {
  // clean hover array first
  hoverNodes.pop()
  hoverSockets.pop()

  const x = event.offsetX
  const y = event.offsetY

  allNodes.forEach((node) => {
    if (node.isMouseInside(x, y)) {
      hoverNodes[0] = node

      node.value.outputSockets.forEach((socket) => {
        if (isInsideSocket(node.value, socket, x, y)) {
          hoverSockets[0] = socket
        }
      })

      node.value.inputSockets.forEach((socket) => {
        if (isInsideSocket(node.value, socket, x, y)) {
          hoverSockets[0] = socket
        }
      })
    }
  })
  // console.log("============> Hover check ", hoverNodes[0], hoverSockets[0]);
}

const removeConnection = () => {
  allConnections.pop()
  hasNewConnectionActive.value = false
  repaintEditor()
}

const attachConnection = () => {
  console.log('=========> attach to ', hoverSockets[0])
  const connection = allConnections[allConnections.length - 1]
  connection.value.targetToMouse = false
  connection.value.outputSocket = hoverSockets[0]
  hasNewConnectionActive.value = false
  repaintEditor()
}

const onMouseDown = (event: MouseEvent) => {
  console.log('==========> socket 1 ', socket1_i1)

  deactivateSelectedNode()

  const x = event.offsetX
  const y = event.offsetY

  if (hasNewConnectionActive.value) {
    if (hoverSockets[0]) {
      attachConnection()
    } else {
      removeConnection()
    }
    return
  }

  allNodes.forEach((node) => {
    if (node.isMouseInside(x, y)) {
      node.value.outputSockets.forEach((socket) => {
        if (isInsideSocket(node.value, socket, x, y)) {
          activeSockets[0] = socket
        }
      })

      node.value.inputSockets.forEach((socket) => {
        if (isInsideSocket(node.value, socket, x, y)) {
          activeSockets[0] = socket
        }
      })

      if (activeSockets[0]) {
        // console.log("-----------> selected socket ", activeSockets[0].name);
        hasNewConnectionActive.value = true
        const { connection } = useConnection(3, activeSockets[0], null, mouseX, mouseY, true)
        connection.value.targetToMouse = true
        allConnections.push(connection)
      } else {
        isDragging.value = true
        activeNodes[0] = node
        offsetX.value = x - node.value.x
        offsetY.value = y - node.value.y
      }
      console.log('[[ Down ]] sockets ', activeSockets[0])
      console.log('[[ Down ]] nodes ', activeNodes[0])
    }
  })

  if (activeNodes[0]) {
    activateSelectedNode()
  }
}

const onMouseMove = (event: MouseEvent) => {
  mouseX.value = event.offsetX
  mouseY.value = event.offsetY

  removeHoverHighlight()

  checkHover(event)

  const x = event.offsetX
  const y = event.offsetY

  if (isDragging.value) {
    activeNodes[0].value.x = event.offsetX - offsetX.value
    activeNodes[0].value.y = event.offsetY - offsetY.value
    repaintEditor()
  }

  addHoverHighlight()
}

const onMouseUp = (event: MouseEvent) => {
  isDragging.value = false

  console.log('[[  up ]] = ', hoverSockets[0])
}

const onMouseEnter = (event: MouseEvent) => {
  isHovered.value = true
}

const onMouseLeave = (event: MouseEvent) => {
  isHovered.value = false
}

useMouse(canvas, onMouseUp, onMouseDown, onMouseMove, onMouseEnter, onMouseLeave)

onMounted(() => {
  if (!canvas.value) return
  ctx.value = canvas.value.getContext('2d')
  repaintEditor()
})

onBeforeUnmount(() => {})
</script>

<template>
  <div class="editor">
    <canvas id="canvas" ref="canvas"></canvas>

    <div class="debugging">
      <pre>
        {{ activeNodes[0] }}
      </pre>
    </div>
  </div>
</template>

<style scoped>
.debugging {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 20px;
  color: white;
  overflow: scroll;
  height: 100vh;
}
</style>
