<script setup lang="ts">

import {onBeforeUnmount, onMounted, reactive, Ref, ref} from "vue";
import type {ReactiveVariable} from "vue/macros";

const canvas = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D>();

// track mouse events
let isDragging = ref(false);
let isHovered = ref(false);
let offsetX = ref(0);
let offsetY = ref(0);

interface Node {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  unit: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
  draggable: boolean;
  socketRadius: number;
  socketColor: string;
  socketColorIn: string;
  socketColorOut: string;
  inputs: number;
  outputs: number;
  socketSpacing: number;
  inputSockets: any[]; // TODO: Socket[]
  outputSockets: any[]; // TODO: Socket[]
}

const DEFAULT_STROKE = "gray";
const SELECTED_STROKE = "yellow";

const node: ReactiveVariable<Node> = reactive({
  id: 1,
  x: 50,
  y: 50,
  width: 200,
  height: 200,
  unit: 50,
  fill: '#4b4b4b',
  stroke: 'gray',
  strokeWidth: 5,
  borderRadius: 10,
  draggable: true,
  socketRadius: 10,
  socketColor: "gray",
  socketColorIn: "#ad89b5",
  socketColorOut: "#f7aa69",
  inputs: 2,
  outputs: 5,
  socketSpacing: 50,
  inputSockets: [],
  outputSockets: [],
});

const draggedNode: Ref<number> = ref(null);

const setCanvasSize = () => {
  canvas.value.width = document.body.clientWidth;
  canvas.value.height = document.body.clientHeight;
}

const initCanvas = () => {
  setCanvasSize();

  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.value.fillStyle = "#24232c";
  ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height);
}

const drawNode = () => {
  // set the height dynamically based on how many sockets
  const maxSocketsNum = Math.max(node.outputs, node.inputs);
  node.height = node.unit * (maxSocketsNum + 1);

  // draw the node body
  ctx.value.fillStyle = node.fill;
  ctx.value.strokeStyle = node.stroke;
  ctx.value.lineWidth = node.strokeWidth;
  ctx.value.roundRect(node.x, node.y, node.width, node.height, node.borderRadius);
  ctx.value.stroke();
  ctx.value.fill();

  // draw inputs
  for (let i = 1; i <= node.inputs; i++) {
    const x = node.x;
    const y = node.y + (i * node.socketSpacing);

    ctx.value.beginPath();
    ctx.value.arc(x, y, node.socketRadius, 0, 2 * Math.PI);
    ctx.value.fillStyle = node.socketColorIn;
    ctx.value.fill();
    ctx.value.strokeStyle = "#24232c";
    ctx.value.lineWidth = 2;
    ctx.value.stroke();
    ctx.value.closePath();

    ctx.value.lineWidth = 50;
    ctx.value.fillStyle = "white";
    ctx.value.fillText("Hello text", x + node.socketRadius * 1.5, y + node.socketRadius / 2, 500);

    node.inputSockets[i-1] = {
      x,
      y,
    };
  }

  // draw outputs
  for (let i = 1; i <= node.outputs; i++) {
    const x = node.x + node.width;
    const y = node.y + (i * node.socketSpacing);

    ctx.value.beginPath();
    ctx.value.arc(x, y, node.socketRadius, 0, 2 * Math.PI);
    ctx.value.fillStyle = node.socketColorOut;
    ctx.value.fill();
    ctx.value.strokeStyle = "#24232c";
    ctx.value.lineWidth = 2;
    ctx.value.stroke();
    ctx.value.closePath();

    node.outputSockets[i-1] = {
      x,
      y,
    };
  }
};

const drawConnections = () => {
  const sourceX = 20;
  const sourceY = 20;
  const targetX = node.inputSockets[0].x;
  const targetY = node.inputSockets[0].y;

  // control points
  const cp1X = sourceX + (targetX - sourceX) * (5/10);
  const cp2X = sourceX + (targetX - sourceX) * (5/10);
  const cp1Y = sourceY;
  const cp2Y = targetY;

  ctx.value.beginPath();
  ctx.value.moveTo(sourceX, sourceY);
  ctx.value.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, targetX, targetY);

  ctx.value.lineWidth = 3;
  ctx.value.strokeStyle = "white";
  ctx.value.stroke();
}

const repaintEditor = () => {
  initCanvas();
  drawNode();
  drawConnections();
}

const activateNode = () => {
  node.stroke = SELECTED_STROKE;
  repaintEditor();
}

const deactiviateNode = () => {
  node.stroke = DEFAULT_STROKE;
  repaintEditor();
}


/**
 * Track if the mouse cursor is inside a node
 * @param x
 * @param y
 */
const isInsideNode = (x: number, y: number) => {
  return (
      x >= node.x &&
      x <= node.x + node.width &&
      y >= node.y &&
      y <= node.y + node.height
  );
};


const onMouseDown = (event) => {
  deactiviateNode();

  const x = event.offsetX;
  const y = event.offsetY;

  if (isInsideNode(x, y)) {
    isDragging.value = true;
    draggedNode.value = node.id;
    offsetX.value = x - node.x;
    offsetY.value = y - node.y;

    activateNode();
  }
};

const onMouseMove = (event) => {
  if (isDragging.value) {
    node.x = event.offsetX - offsetX.value;
    node.y = event.offsetY - offsetY.value;
    repaintEditor()
  }
};

const onMouseUp = () => {
  isDragging.value = false;
};

const onMouseEnter = () => {
  isHovered = true;
  // You can add code to handle hover effects here
};

const onMouseLeave = () => {
  isHovered = false;
  // You can add code to handle when the mouse leaves the canvas here
};


const registerMouseEvents = () => {
  canvas.value.addEventListener('mousedown', onMouseDown);
  canvas.value.addEventListener('mousemove', onMouseMove);
  canvas.value.addEventListener('mouseup', onMouseUp);
  canvas.value.addEventListener('mouseenter', onMouseEnter);
  canvas.value.addEventListener('mouseleave', onMouseLeave);
}

const unregisterMouseEvents = () => {
  canvas.value.removeEventListener('mousedown', onMouseDown);
  canvas.value.removeEventListener('mousemove', onMouseMove);
  canvas.value.removeEventListener('mouseup', onMouseUp);
  canvas.value.removeEventListener('mouseenter', onMouseEnter);
  canvas.value.removeEventListener('mouseleave', onMouseLeave);
}

onMounted(() => {
  ctx.value = canvas.value?.getContext('2d');
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
        {{node}}
      </pre>
    </div>
  </div>
</template>

<style scoped>
.debugging{
  position: absolute;
  top: 0;
  right : 0;
  font-size: 20px;
  color: white;
  overflow: scroll;
  height: 100vh;
}
</style>
