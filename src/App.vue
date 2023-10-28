<script setup lang="ts">

import {onBeforeUnmount, onMounted, reactive, Ref, ref} from "vue";

const canvas = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D>();

// track mouse events
let isDragging = ref(false);
let isHovered = ref(false);
let offsetX = ref(0);
let offsetY = ref(0);

interface Node {
  id : Number;
  x : number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius : number;
  draggable: boolean;
}

const DEFAULT_STROKE = "gray";
const SELECTED_STROKE = "red";

const node : Ref<Node> = reactive({
  id: 1,
  x : 50,
  y : 50,
  width: 200,
  height: 210,
  fill : '#4B4B4B',
  stroke: 'gray',
  strokeWidth: 5, 
  borderRadius : 10,
  draggable: true,
});

const draggedNode : Ref<number> = ref(null);

const setCanvasSize = () => {
  canvas.value.width = document.body.clientWidth;
  canvas.value.height = document.body.clientHeight;
}

const initCanvas = () => {
  setCanvasSize();

  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.value.fillStyle = "#24232C";
  ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height);
}

const drawNode = () => {
  ctx.value.fillStyle = node.fill;
  ctx.value.strokeStyle = node.stroke;
  ctx.value.lineWidth = node.strokeWidth;
  ctx.value.roundRect(node.x, node.y, node.width, node.height, node.borderRadius);
  ctx.value.stroke();
  ctx.value.fill();
};


const repaintEditor = () => {
  initCanvas();
  drawNode();
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
const isInsideNode = (x : number, y : number) => {
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

  // console.log("-------> Offset ", x, y, node.x, node.y, offsetX.value, offsetY.value);
};

const onMouseMove = (event) => {
  if (isDragging.value) {
    node.x = event.offsetX - offsetX.value;
    node.y = event.offsetY - offsetY.value;

    initCanvas();
    drawNode()
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
  initCanvas();
  drawNode();
  registerMouseEvents();
})

onBeforeUnmount(() => {
  unregisterMouseEvents();
})


</script>

<template>
  <div class="editor">
    <canvas ref="canvas" id="canvas"></canvas>
  </div>
</template>

<style scoped>
</style>
