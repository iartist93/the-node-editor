<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import { useCanvas } from '@/canvas'
import { drawNode, isMouseInsideNode, type NodeType } from '@/node'
import { addConnectionToSocket, inMouseInsideSocket, type SocketType } from '@/socket'
import { drawConnection, useConnection } from '@/connection'
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

// when we create a new connection attached to one socket only but not yet connected to second socket
let hasNewConnectionActive = ref(false)

// track active/hover nodes
const activeNodes: NodeType[] = reactive([])
const hoverNodes: NodeType[] = reactive([])

// track active/hover sockets
const activeSockets: SocketType[] = reactive([])
const hoverSockets: SocketType[] = reactive([])

const DEFAULT_STROKE = 'gray'
const SELECTED_STROKE = 'yellow'

useScene()
const { allNodes, allConnections, getSocket } = useEditorStore()

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
  for (const nodeId in allNodes) {
    const node = allNodes[nodeId]
    drawNode(ctx, node)
  }

  // draw all connections
  for (const connectionId in allConnections) {
    const connection = allConnections[connectionId]
    drawConnection(ctx, connection, mouse.position)
  }
}

/**
 * push the node to the end of the array
 * @param node
 */
const pushNodeToEnd = (node: NodeType) => {
  const index = allNodes.indexOf(node)
  if (index > -1) {
    allNodes.splice(index, 1)
    allNodes.push(node)
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

const checkHover = (event: MouseEvent) => {
  // clean hover array first
  hoverNodes.pop()
  hoverSockets.pop()

  const x = event.offsetX
  const y = event.offsetY

  allNodes.forEach((node) => {
    if (isMouseInsideNode(node, x, y)) {
      hoverNodes[0] = node

      node.outputSocketIds.forEach((socketId) => {
        const socket = getSocket(socketId)
        if (inMouseInsideSocket(socket, x, y)) {
          hoverSockets[0] = socket
        }
      })

      node.inputSocketIds.forEach((socketId) => {
        const socket = getSocket(socketId)
        if (inMouseInsideSocket(socket, x, y)) {
          hoverSockets[0] = socket
        }
      })
    }
  })
}

// function to check and track active nodes and sockets
const checkActive = () => {
  const { x, y } = mouse.position

  allNodes.forEach((node) => {
    if (isMouseInsideNode(node, x, y)) {
      activeNodes[0] = node

      node.outputSocketIds.forEach((socketId) => {
        const socket = getSocket(socketId)
        if (inMouseInsideSocket(socket, x, y)) {
          activeSockets[0] = socket
        }
      })

      node.inputSocketIds.forEach((socketId) => {
        const socket = getSocket(socketId)
        if (inMouseInsideSocket(socket, x, y)) {
          activeSockets[0] = socket
        }
      })
    }
  })
}

// function to whether handle active socket or active node
const handleActive = () => {
  if (activeSockets[0]) {
    hasNewConnectionActive.value = true
    const connection = useConnection(activeSockets[0].id, null)
    allConnections.push(connection)
    addConnectionToSocket(activeSockets[0], connection.id)
  } else if (activeNodes[0]) {
    isDragging.value = true
    offsetX.value = mouse.position.x - activeNodes[0].x
    offsetY.value = mouse.position.y - activeNodes[0].y
    activateSelectedNode()
  }
}

const attachConnection = () => {
  const connection = allConnections[allConnections.length - 1]
  connection.outputSocketId = hoverSockets[0].id
  hasNewConnectionActive.value = false
  repaintEditor()
}

const removeDraggedConnection = () => {
  allConnections.pop()
  hasNewConnectionActive.value = false
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
  mouseX.value = event.offsetX
  mouseY.value = event.offsetY

  removeHoverHighlight()
  checkHover(event)

  const x = event.offsetX
  const y = event.offsetY

  if (isDragging.value) {
    activeNodes[0].x = event.offsetX - offsetX.value
    activeNodes[0].y = event.offsetY - offsetY.value
    repaintEditor()
  }

  addHoverHighlight()
}

const onMouseUp = (event: MouseEvent) => {
  isDragging.value = false

  // console.log('[[  up ]] = ', hoverSockets[0])
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
