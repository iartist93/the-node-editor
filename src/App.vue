<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { useCanvas } from '@/canvas'
import { drawNode, isMouseInsideNode, type NodeType } from '@/node'
import { inMouseInsideSocket, type SocketType } from '@/socket'
import {
  addSocketToConnection,
  type ConnectionType,
  drawConnection,
  useConnection
} from '@/connection'
import { useMouse } from '@/mouse'
import { useEditorStore } from '@/stores'
import { useScene } from '@/scene'

// track mouse events
let isDragging = ref(false)
let isHovered = ref(false)
let offsetX = ref(0)
let offsetY = ref(0)
let mouseX = ref(0)
let mouseY = ref(0)

// track active/hover nodes
const activeNodes: NodeType[] = reactive([])
const hoverNodes: NodeType[] = reactive([])
const activeConnections: ConnectionType[] = reactive([])

// when we create a new connection attached to one socket only but not yet connected to second socket
let hasNewConnectionActive = computed(() => {
  return activeConnections.length > 0
})

// track active/hover sockets
const activeSockets: SocketType[] = reactive([])
const hoverSockets: SocketType[] = reactive([])

const DEFAULT_STROKE = 'gray'
const SELECTED_STROKE = 'yellow'

useScene()
const editorStore = useEditorStore()

watch(editorStore.allConnections, (value) => {
  console.log('XXX connections changed: ', value)
})

//====================================================
// Build the canvas
//====================================================

const { canvas, ctx, renderEditor } = useCanvas()

//====================================================
// Handle editor events
//====================================================

const repaintEditor = () => {
  renderEditor()

  // draw all nodes
  for (const nodeId in editorStore.allNodes) {
    const node = editorStore.allNodes[nodeId]
    drawNode(ctx, node)
  }

  // draw all connections
  for (const connectionId in editorStore.allConnections) {
    const connection = editorStore.allConnections[connectionId]
    drawConnection(ctx, connection, mouse.position)
  }
}

/**
 * push the node to the end of the array
 * @param node
 */
const pushNodeToEnd = (node: NodeType) => {
  const index = editorStore.allNodes.indexOf(node)
  if (index > -1) {
    editorStore.allNodes.splice(index, 1)
    editorStore.allNodes.push(node)
  }
}

const activateSelectedNode = () => {
  activeNodes[0].stroke = SELECTED_STROKE
  pushNodeToEnd(activeNodes[0])
  repaintEditor()
}

const deactivateSelectedNode = () => {
  if (activeNodes[0]) {
    activeNodes[0].stroke = DEFAULT_STROKE
    activeNodes.pop()
  }
  if (activeSockets[0]) {
    activeSockets[0].stroke = DEFAULT_STROKE
    activeSockets.pop()
  }
  repaintEditor()
}

const moveActiveNode = () => {
  if (isDragging.value) {
    activeNodes[0].x = mouse.position.x - offsetX.value
    activeNodes[0].y = mouse.position.y - offsetY.value
    repaintEditor()
  }
}

//====================================================
// Build the mouse events
//====================================================

const removeHoverHighlight = () => {
  if (hoverNodes[0]) {
    hoverNodes[0].stroke = DEFAULT_STROKE
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
    hoverNodes[0].stroke = SELECTED_STROKE
  }
  repaintEditor()
}

/**
 * Track the node and socket that the mouse is hovering over
 * @param event
 */
const checkHover = (event: MouseEvent) => {
  // clean hover array first
  hoverNodes.pop()
  hoverSockets.pop()

  const x = event.offsetX
  const y = event.offsetY

  editorStore.allNodes.forEach((node) => {
    if (isMouseInsideNode(node, x, y)) {
      hoverNodes[0] = node

      node.outputSocketIds.forEach((socketId) => {
        const socket = editorStore.getSocket(socketId)
        if (inMouseInsideSocket(socket, x, y)) {
          hoverSockets[0] = socket
        }
      })

      node.inputSocketIds.forEach((socketId) => {
        const socket = editorStore.getSocket(socketId)
        if (inMouseInsideSocket(socket, x, y)) {
          hoverSockets[0] = socket
        }
      })
    }
  })
}

/**
 * Track active nodes and sockets
 */
const checkActive = () => {
  const { x, y } = mouse.position

  editorStore.allNodes.forEach((node) => {
    if (isMouseInsideNode(node, x, y)) {
      activeNodes[0] = node

      node.outputSocketIds.forEach((socketId) => {
        const socket = editorStore.getSocket(socketId)
        if (inMouseInsideSocket(socket, x, y)) {
          activeSockets[0] = socket
        }
      })

      node.inputSocketIds.forEach((socketId) => {
        const socket = editorStore.getSocket(socketId)
        if (inMouseInsideSocket(socket, x, y)) {
          activeSockets[0] = socket
        }
      })
    }
  })
}

/**
 * if we have an active socket, then we are creating a new connection
 * if we have an active node, then we are dragging the node
 */
const handleActive = () => {
  if (activeSockets[0]) {
    const connection = useConnection()
    activeConnections[0] = connection
    editorStore.addConnection(connection)
    activeConnections[0] = connection
    addSocketToConnection(connection, activeSockets[0])
  } else if (activeNodes[0]) {
    isDragging.value = true
    offsetX.value = mouse.position.x - activeNodes[0].x
    offsetY.value = mouse.position.y - activeNodes[0].y
    activateSelectedNode()
  }
}

/**
 * if the connection is active, and we are hovering over a socket
 */
const attachConnection = () => {
  addSocketToConnection(activeConnections[0], hoverSockets[0])
  activeConnections.pop()
  repaintEditor()
}

/**
 * remove the active connection if we click outside a socket
 */
const removeDraggedConnection = () => {
  editorStore.removeConnection(activeConnections[0].id)
  activeConnections.pop()
  repaintEditor()
}

/**
 * if the connection is active, and we are hovering over a socket
 * then attach the connection to the socket, otherwise remove the connection
 */
const toggleActiveConnection = () => {
  if (hoverSockets[0]) {
    attachConnection()
  } else {
    removeDraggedConnection()
  }
}

// ---------------------------------------------------//

const onMouseDown = (event: MouseEvent) => {
  deactivateSelectedNode()
  if (hasNewConnectionActive.value) {
    toggleActiveConnection()
    return
  }
  checkActive()
  handleActive()
}

const onMouseMove = (event: MouseEvent) => {
  removeHoverHighlight()
  checkHover(event)
  moveActiveNode()
  addHoverHighlight()
}

const onMouseUp = (event: MouseEvent) => {
  isDragging.value = false
}

const onMouseEnter = (event: MouseEvent) => {
  isHovered.value = true
}

const onMouseLeave = (event: MouseEvent) => {
  isHovered.value = false
}

const mouse = useMouse(canvas, onMouseUp, onMouseDown, onMouseMove, onMouseEnter, onMouseLeave)

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
