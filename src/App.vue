<script setup lang="ts">

import {onBeforeUnmount, onMounted, reactive, ref} from "vue";
import type {ReactiveVariable} from "vue/macros";
import {NodeObject, isInsideNode} from "@/node";
import {SocketObject, isInsideSocket} from "@/socket";

const canvas = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D>();

// track mouse events
let isDragging = ref(false);
let isHovered = ref(false);
let offsetX = ref(0);
let offsetY = ref(0);

// TODO: This should be an array of selected nodes
// active dragged node
const activeNodes: NodeObject[] = reactive([]);
const selectedSockets : SocketObject[] = reactive([]);


const DEFAULT_STROKE = "gray";
const SELECTED_STROKE = "yellow";

const node1: ReactiveVariable<NodeObject> = reactive(new NodeObject({
  id: 1,
  x: 47,
  y: 285,
  name: "Sum",
  inputSockets: [
    new SocketObject({name: "x", label: "x", node: this}),
    new SocketObject({name: "y", label: "y", node: this}),
  ],
  outputSockets: [
    new SocketObject({name: "sum", label: "sum", node : this}),
  ],
}));

const node2: ReactiveVariable<NodeObject> = reactive(new NodeObject({
  id: 2,
  x: 600,
  y: 340,
  name: "Math",
  inputSockets: [
    new SocketObject({name: "x", label: "x", node : this}),
    new SocketObject({name: "y", label: "y", node : this}),
    new SocketObject({name: "z", label: "z", node : this}),
    new SocketObject({name: "w", label: "w", node : this}),
  ],
  outputSockets: [
    new SocketObject({name: "sum", label: "sum", node : this}),
    new SocketObject({name: "multiply", label: "multiply", node : this}),
  ],
}));

const node3: ReactiveVariable<NodeObject> = reactive(new NodeObject({
  id: 3,
  x: 606,
  y: 82,
  name: "Add",
  inputSockets: [
    new SocketObject({name: "x", label: "x", node : this}),
    new SocketObject({name: "y", label: "y", node : this}),
  ],
  outputSockets: [
    new SocketObject({name: "add", label: "add", node : this}),

  ],
}));

let allNodes = [node1, node2, node3];

/**
 * Set the canvas size
 * Currently it fill the whole screen
 */
const setCanvasSize = () => {
  if (!canvas.value) return;

  canvas.value.width = document.body.clientWidth;
  canvas.value.height = document.body.clientHeight;
}

/**
 * Editor initialization and draw the editor background.
 */
const initCanvas = () => {
  if (!ctx.value || !canvas.value) return;

  setCanvasSize();

  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.value.fillStyle = "#24232c";
  ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height);
}

const initNode = (node: ReactiveVariable<NodeObject>) => {
  node.outputs = node.outputSockets.length;
  node.inputs = node.inputSockets.length;

  // set the height dynamically based on how many sockets
  const maxSocketsNum = Math.max(node.outputs, node.inputs);
  node.height = node.unit * (maxSocketsNum + 1) + node.headerHeight;
}

const drawNode = (node: ReactiveVariable<NodeObject>) => {
  if (!ctx.value) return;

  // draw the node body
  ctx.value.globalAlpha = 0.93;
  ctx.value.beginPath();
  ctx.value.fillStyle = node.fill;
  ctx.value.strokeStyle = node.stroke;
  ctx.value.lineWidth = node.strokeWidth;
  ctx.value.roundRect(node.x, node.y, node.width, node.height, node.borderRadius);
  ctx.value.stroke();
  ctx.value.fill();
  ctx.value.closePath();

  // draw the node title
  ctx.value.textAlign = "center";
  ctx.value.font = 'bold 14px Courier New';
  ctx.value.fillStyle = "white";
  ctx.value.fillText(node.name, node.x + node.width / 2, node.y + node.headerHeight / 1.6);

  // draw divider
  ctx.value.beginPath();
  ctx.value.strokeStyle = "#8c8c8c";
  ctx.value.lineWidth = 1;
  ctx.value.moveTo(node.x, node.y + node.headerHeight);
  ctx.value.lineTo(node.x + node.width, node.y + node.headerHeight);
  ctx.value.stroke();
  ctx.value.closePath();

  // reset alpha
  ctx.value.globalAlpha = 1.0;

  // draw inputs
  for (let i = 1; i <= node.inputSockets.length; i++) {
    const x = node.x;
    const y = node.y + (i * node.socketSpacing) + node.headerHeight;

    ctx.value.beginPath();
    ctx.value.arc(x, y, node.socketRadius, 0, 2 * Math.PI);
    ctx.value.fillStyle = node.socketColorIn;
    ctx.value.fill();
    ctx.value.strokeStyle = "#24232c";
    ctx.value.lineWidth = 2;
    ctx.value.stroke();
    ctx.value.closePath();

    ctx.value.textAlign = "left";
    ctx.value.font = '14px Courier New';
    ctx.value.fillStyle = "#e4e4ea";
    ctx.value.fillText(node.inputSockets[i - 1].label, x + node.socketRadius * 1.5, y + node.socketRadius / 2, 500);

    node.inputSockets[i - 1].x = x;
    node.inputSockets[i - 1].y = y;

  }

  // draw outputs
  for (let i = 1; i <= node.outputSockets.length; i++) {
    const x = node.x + node.width;
    const y = node.y + (i * node.socketSpacing) + node.headerHeight;

    ctx.value.beginPath();
    ctx.value.arc(x, y, node.socketRadius, 0, 2 * Math.PI);
    ctx.value.fillStyle = node.socketColorOut;
    ctx.value.fill();
    ctx.value.strokeStyle = "#24232c";
    ctx.value.lineWidth = 2;
    ctx.value.stroke();
    ctx.value.closePath();

    ctx.value.textAlign = "right";
    ctx.value.font = '14px Courier New';
    ctx.value.fillStyle = "#e4e4ea";
    ctx.value.fillText(node.outputSockets[i - 1].label, x - node.socketRadius * 1.5, y + node.socketRadius / 2, 500);

    node.outputSockets[i - 1] = {
      ...node.outputSockets[i - 1],
      x,
      y,
    };
  }

};

const drawConnections = (nodeA: NodeObject, nodeB: NodeObject) => {
  if (!ctx.value) return;

  const sourceX = nodeA.outputSockets[0].x;
  const sourceY = nodeA.outputSockets[0].y;
  const targetX = nodeB.inputSockets[0].x;
  const targetY = nodeB.inputSockets[0].y;

  // control points
  const cp1X = sourceX + (targetX - sourceX) * (5 / 10);
  const cp2X = sourceX + (targetX - sourceX) * (5 / 10);
  const cp1Y = sourceY;
  const cp2Y = targetY;

  ctx.value.beginPath();
  ctx.value.moveTo(sourceX, sourceY);
  ctx.value.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, targetX, targetY);
  ctx.value.lineWidth = 3;
  ctx.value.strokeStyle = "white";
  ctx.value.stroke();
  ctx.value.closePath();
}

const repaintEditor = () => {
  initCanvas();
  allNodes.forEach(initNode);
  allNodes.forEach(drawNode);
  drawConnections(node1, node2);
  drawConnections(node1, node3);
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

const onMouseDown = (event: MouseEvent) => {

  deactivateSelectedNode();

  const x = event.offsetX;
  const y = event.offsetY;

  allNodes.forEach((node) => {
    if (isInsideNode(node, x, y)) {

      node.outputSockets.forEach(socket => {

        if(isInsideSocket(node, socket, x, y)) {
          selectedSockets[0] = socket;
        }
      })

      node.inputSockets.forEach(socket => {
        if(isInsideSocket(node, socket, x, y)) {
          selectedSockets[0] = socket;
        }
      })

      if(selectedSockets[0]) {
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
  if (isDragging.value) {
    activeNodes[0].x = event.offsetX - offsetX.value;
    activeNodes[0].y = event.offsetY - offsetY.value;
    repaintEditor()
  }
};

const onMouseUp = () => {
  isDragging.value = false;
};

const onMouseEnter = () => {
  isHovered.value = true;
  // You can add code to handle hover effects here
};

const onMouseLeave = () => {
  isHovered.value = false;
  // You can add code to handle when the mouse leaves the canvas here
};


const registerMouseEvents = () => {
  if (!canvas.value) return;

  canvas.value.addEventListener('mousedown', onMouseDown);
  canvas.value.addEventListener('mousemove', onMouseMove);
  canvas.value.addEventListener('mouseup', onMouseUp);
  canvas.value.addEventListener('mouseenter', onMouseEnter);
  canvas.value.addEventListener('mouseleave', onMouseLeave);
}

const unregisterMouseEvents = () => {
  if (!canvas.value) return;

  canvas.value.removeEventListener('mousedown', onMouseDown);
  canvas.value.removeEventListener('mousemove', onMouseMove);
  canvas.value.removeEventListener('mouseup', onMouseUp);
  canvas.value.removeEventListener('mouseenter', onMouseEnter);
  canvas.value.removeEventListener('mouseleave', onMouseLeave);
}

onMounted(() => {
  if (!canvas.value) return;

  ctx.value = canvas.value.getContext('2d');
  repaintEditor();
  registerMouseEvents();
})

onBeforeUnmount(() => {
  unregisterMouseEvents();
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
