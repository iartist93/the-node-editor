<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import { useCanvas } from '@/canvas'
import { addNewSocket, drawNode, isMouseInsideNode, type NodeType, useNode } from '@/node'
import { inMouseInsideSocket, type SocketType } from '@/socket'
import { drawConnection, useConnection } from '@/connection'
import { useMouse } from '@/mouse'
import { useEditorStore } from '@/stores'

// track mouse events
let isDragging = ref(false)
let isHovered = ref(false)
let offsetX = ref(0)
let offsetY = ref(0)
let mouseX = ref(0)
let mouseY = ref(0)

let hasNewConnectionActive = ref(false)

// track active/hover nodes
const activeNodes: NodeType[] = reactive([])
const hoverNodes: NodeType[] = reactive([])

// track active/hover sockets
const activeSockets: SocketType[] = reactive([])
const hoverSockets: SocketType[] = reactive([])

const DEFAULT_STROKE = 'gray'
const SELECTED_STROKE = 'yellow'

const { allNodes, allConnections, addNode, addConnection, getSocket, getConnection, getNode } =
  useEditorStore()

// --------------------------
// node 1
//---------------------------

const node1 = useNode({
  x: 47,
  y: 285,
  name: 'Sum'
})

addNewSocket(node1, {
  name: 'x',
  label: 'x',
  type: 'input'
})

addNewSocket(node1, {
  name: 'y',
  label: 'y',
  type: 'input'
})

addNewSocket(node1, {
  name: 'sum',
  label: 'sum',
  type: 'output'
})

// --------------------------
// node 2
//---------------------------

const node2 = useNode({
  x: 600,
  y: 340,
  name: 'Math'
})

// add sockets to node 2
addNewSocket(node2, {
  name: 'x',
  label: 'x',
  type: 'input'
})

addNewSocket(node2, {
  name: 'y',
  label: 'y',
  type: 'input'
})

addNewSocket(node2, {
  name: 'z',
  label: 'z',
  type: 'input'
})

addNewSocket(node2, {
  name: 'w',
  label: 'w',
  type: 'input'
})

addNewSocket(node2, {
  name: 'sum',
  label: 'sum',
  type: 'output'
})

addNewSocket(node2, {
  name: 'add',
  label: 'add',
  type: 'output'
})

// --------------------------
// node 2
//---------------------------

const node3 = useNode({
  x: 606,
  y: 82,
  name: 'Add'
})

addNewSocket(node3, {
  name: 'x',
  label: 'x',
  type: 'input'
})

addNewSocket(node3, {
  name: 'y',
  label: 'y',
  type: 'input'
})

addNewSocket(node3, {
  name: 'add',
  label: 'add',
  type: 'output'
})

//---------------------------
// add all nodes to the main editor store

addNode(node1)
addNode(node2)
addNode(node3)

//---------------------------
// connection 1
//---------------------------

const connection1 = useConnection(node1.outputSocketIds[0], node2.inputSocketIds[0], mouseX, mouseY)

//---------------------------
// connection 2
//---------------------------

const connection2 = useConnection(node1.outputSocketIds[0], node3.inputSocketIds[0], mouseX, mouseY)

//---------------------------

// add all connection to the store
addConnection(connection1)
addConnection(connection2)

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
    drawConnection(ctx, connection)
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
  // console.log("============> Hover check ", hoverNodes[0], hoverSockets[0]);
}

const removeDraggedConnection = () => {
  allConnections.pop()
  hasNewConnectionActive.value = false
  repaintEditor()
}

const attachConnection = () => {
  console.log('=========> attach to ', hoverSockets[0])
  const connection = allConnections[allConnections.length - 1]
  connection.value.targetToMouse = false
  connection.value.outputSocketId = hoverSockets[0].id
  hasNewConnectionActive.value = false
  repaintEditor()
}

const onMouseDown = (event: MouseEvent) => {
  deactivateSelectedNode()

  const x = event.offsetX
  const y = event.offsetY

  if (hasNewConnectionActive.value) {
    if (hoverSockets[0]) {
      attachConnection()
    } else {
      removeDraggedConnection()
    }
    return
  }

  allNodes.forEach((node) => {
    if (isMouseInsideNode(node, x, y)) {
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

      if (activeSockets[0]) {
        // console.log("-----------> selected socket ", activeSockets[0].name);
        hasNewConnectionActive.value = true
        const connection = useConnection(activeSockets[0].id, null, mouseX, mouseY, true)
        connection.value.targetToMouse = true
        allConnections.push(connection)
      } else {
        isDragging.value = true
        activeNodes[0] = node
        offsetX.value = x - node.x
        offsetY.value = y - node.y
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
    activeNodes[0].x = event.offsetX - offsetX.value
    activeNodes[0].y = event.offsetY - offsetY.value
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
