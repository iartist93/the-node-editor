<script setup lang="ts">

import {onBeforeUnmount, onMounted, reactive, ref} from "vue";

import {useCanvas} from "@/canvas";
import {type NodeType, useNode, useNodeUtils} from "@/node";
import {type SocketType, useSocket, useSocketUtils} from "@/socket";
import {useConnection, useConnectionUtils} from "@/connection";
import {useMouse} from "@/mouse";

// track mouse events
let isDragging = ref(false);
let isHovered = ref(false);
let offsetX = ref(0);
let offsetY = ref(0);

// TODO: This should be an array of selected nodes
// active dragged node
const activeNodes: NodeType[] = reactive([]);
const selectedSockets: SocketType[] = reactive([]);

// array of hover sockets
const hoverNodes: NodeType[] = reactive([]);
const hoverSockets: SocketType[] = reactive([]);


const DEFAULT_STROKE = "gray";
const DEFAULT_SOCKET_STROKE = "$24232c";
const SELECTED_STROKE = "yellow";

//====================================================
// Build the editor nodes, sockets, connections
//====================================================

const {initNode, isInsideNode, drawNode} = useNodeUtils();
const {isInsideSocket, drawSocket} = useSocketUtils();
const {drawConnection} = useConnectionUtils();

// node 1 sockets
const {socket: socket1_i1} = useSocket({name: "x", label: "x", node: this});
const {socket: socket1_i2} = useSocket({name: "y", label: "y", node: this});
const {socket: socket1_o1} = useSocket({name: "sum", label: "sum", node: this});

// node 2 sockets
const {socket: socket2_i1} = useSocket({name: "x", label: "x", node: this});
const {socket: socket2_i2} = useSocket({name: "y", label: "y", node: this});
const {socket: socket2_i3} = useSocket({name: "z", label: "z", node: this});
const {socket: socket2_i4} = useSocket({name: "w", label: "w", node: this});
const {socket: socket2_o1} = useSocket({name: "sum", label: "sum", node: this});
const {socket: socket2_o2} = useSocket({name: "add", label: "add", node: this});

// node 3 sockets
const {socket: socket3_i1} = useSocket({name: "x", label: "x", node: this});
const {socket: socket3_i2} = useSocket({name: "y", label: "y", node: this});
const {socket: socket3_o1} = useSocket({name: "add", label: "add", node: this});

const {node: node1} = useNode({
      id: 1,
      x: 47,
      y: 285,
      name: "Sum",
      inputSockets: [socket1_i1, socket1_i2],
      outputSockets: [socket1_o1],
    }
);

const {node: node2} = useNode({
      id: 2,
      x: 600,
      y: 340,
      name: "Math",
      inputSockets: [socket2_i1, socket2_i2, socket2_i3, socket2_i4],
      outputSockets: [socket2_o1, socket2_o2],
    }
);

const {node: node3} = useNode({
      id: 3,
      x: 606,
      y: 82,
      name: "Add",
      inputSockets: [socket3_i1, socket3_i2],
      outputSockets: [socket2_o1],
    }
);

const {connection: connection1} = useConnection(
    1,
    node1,
    node2,
    node1.outputSockets[0],
    node2.inputSockets[0],
)

const {connection: connection2} = useConnection(
    2,
    node1,
    node3,
    node1.outputSockets[0],
    node3.inputSockets[0],
)

let allNodes = [node1, node2, node3];
let allConnections = [connection1, connection2];

//====================================================
// Build the canvas
//====================================================

const {canvas, ctx, renderEditor} = useCanvas();

//====================================================
// Handle editor events
//====================================================

const repaintEditor = () => {
  renderEditor();
  allNodes.forEach(initNode);
  allNodes.forEach(node => {
    drawNode(ctx, node);
    drawSocket(ctx, node);
  });
  allConnections.forEach(connection => drawConnection(ctx, connection));
}

const activateSelectedNode = () => {
  activeNodes[0].stroke = SELECTED_STROKE;
  allNodes = allNodes.filter(node => node.id !== activeNodes[0].id);
  allNodes.push(activeNodes[0]);
  repaintEditor();
}

const deactivateSelectedNode = () => {
  if (activeNodes[0]) {
    activeNodes[0].stroke = DEFAULT_STROKE;
    activeNodes.pop();
  }
  repaintEditor();
}

//====================================================
// Build the mouse events
//====================================================

const removeHoverHighlight = () => {
  if (hoverNodes[0]) {
    hoverNodes[0].stroke = DEFAULT_STROKE;
    hoverNodes.pop();
  }
  if (hoverSockets[0]) {
    hoverSockets[0].stroke = DEFAULT_STROKE;
    hoverSockets.pop();
  }
  repaintEditor();
}

const addHoverHighlight = () => {
  if (hoverSockets[0]) {
    hoverSockets[0].stroke = SELECTED_STROKE;
  } else if (hoverNodes[0]) {
    hoverNodes[0].stroke = SELECTED_STROKE;
  }
  repaintEditor();
}

const checkHover = (event: MouseEvent) => {
  // clean hover array first
  hoverNodes.pop();
  hoverSockets.pop();

  const x = event.offsetX;
  const y = event.offsetY;

  allNodes.forEach((node) => {

    if (isInsideNode(node, x, y)) {
      hoverNodes[0] = node;

      node.outputSockets.forEach(socket => {
        if (isInsideSocket(node, socket, x, y)) {
          hoverSockets[0] = socket;
        }
      })

      node.inputSockets.forEach(socket => {
        if (isInsideSocket(node, socket, x, y)) {
          hoverSockets[0] = socket;
        }
      })
    }
  })
  console.log("============> Hover check ", hoverNodes[0], hoverSockets[0]);
}


const onMouseDown = (event: MouseEvent) => {
  deactivateSelectedNode();

  const x = event.offsetX;
  const y = event.offsetY;

  allNodes.forEach((node) => {
    if (isInsideNode(node, x, y)) {
      node.outputSockets.forEach(socket => {
        if (isInsideSocket(node, socket, x, y)) {
          selectedSockets[0] = socket;
        }
      })

      node.inputSockets.forEach(socket => {
        if (isInsideSocket(node, socket, x, y)) {
          selectedSockets[0] = socket;
        }
      })

      if (selectedSockets[0]) {
        console.log("-----------> selected socket ", selectedSockets[0].name);
      }

      isDragging.value = true;
      activeNodes[0] = node;
      offsetX.value = x - node.x;
      offsetY.value = y - node.y;
    }
  })

  if (activeNodes[0]) {
    activateSelectedNode();
  }
};

const onMouseMove = (event: MouseEvent) => {
  removeHoverHighlight();

  checkHover(event);

  const x = event.offsetX;
  const y = event.offsetY;

  if (isDragging.value) {
    activeNodes[0].x = event.offsetX - offsetX.value;
    activeNodes[0].y = event.offsetY - offsetY.value;
    repaintEditor()
  }

  addHoverHighlight();

};

const onMouseUp = (event: MouseEvent) => {
  isDragging.value = false;
};

const onMouseEnter = (event: MouseEvent) => {
  isHovered.value = true;
};

const onMouseLeave = (event: MouseEvent) => {
  isHovered.value = false;
};

useMouse(canvas, onMouseUp, onMouseDown, onMouseMove, onMouseEnter, onMouseLeave);

onMounted(() => {
  if (!canvas.value) return;
  ctx.value = canvas.value.getContext('2d');
  repaintEditor();
})

onBeforeUnmount(() => {
})


</script>

<template>
  <div class="editor">
    <canvas ref="canvas" id="canvas"></canvas>

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
