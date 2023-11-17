<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {type ReactiveVariable} from "vue/macros";

import {NodeObject, isInsideNode, initNode, drawNode} from "@/node";
import {SocketObject, isInsideSocket} from "@/socket";
import {ConnectionObject, drawConnection} from "@/connection";
import {useCanvas} from "@/canvas";
import {useMouse} from "@/mouse";

// track mouse events
let isDragging = ref(false);
let isHovered = ref(false);
let offsetX = ref(0);
let offsetY = ref(0);

// TODO: This should be an array of selected nodes
// active dragged node
const activeNodes: NodeObject[] = reactive([]);
const selectedSockets: SocketObject[] = reactive([]);

const DEFAULT_STROKE = "gray";
const SELECTED_STROKE = "yellow";

const node1: ReactiveVariable<NodeObject> = reactive(new NodeObject({
  id: 1,
  x: 47,
  y: 285,
  name: "Sum",
  inputSockets: [
    reactive(new SocketObject({name: "x", label: "x", node: this})),
    reactive(new SocketObject({name: "y", label: "y", node: this})),
  ],
  outputSockets: [
    reactive(new SocketObject({name: "sum", label: "sum", node: this})),
  ],
}));

const node2: ReactiveVariable<NodeObject> = reactive(new NodeObject({
  id: 2,
  x: 600,
  y: 340,
  name: "Math",
  inputSockets: [
    reactive(new SocketObject({name: "x", label: "x", node: this})),
    reactive(new SocketObject({name: "y", label: "y", node: this})),
    reactive(new SocketObject({name: "z", label: "z", node: this})),
    reactive(new SocketObject({name: "w", label: "w", node: this})),
  ],
  outputSockets: [
    reactive(new SocketObject({name: "sum", label: "sum", node: this})),
    reactive(new SocketObject({name: "multiply", label: "multiply", node: this})),
  ],
}));

const node3: ReactiveVariable<NodeObject> = reactive(new NodeObject({
  id: 3,
  x: 606,
  y: 82,
  name: "Add",
  inputSockets: [
    reactive(new SocketObject({name: "x", label: "x", node: this})),
    reactive(new SocketObject({name: "y", label: "y", node: this})),
  ],
  outputSockets: [
    reactive(new SocketObject({name: "add", label: "add", node: this})),

  ],
}));

const connection1 = computed(() => new ConnectionObject({
  id: 1,
  inputNode: node1,
  inputSocket: node1.outputSockets[0],
  outputNode: node2,
  outputSocket: node2.inputSockets[0],
  sourceX: node1.outputSockets[0].x,
  sourceY: node1.outputSockets[0].y,
  targetX: node2.inputSockets[0].x,
  targetY: node2.inputSockets[0].y,
}));


const connection2 = computed(() => new ConnectionObject({
  id: 1,
  inputNode: node1,
  inputSocket: node1.outputSockets[0],
  outputNode: node3,
  outputSocket: node3.inputSockets[0],
  sourceX: node1.outputSockets[0].x,
  sourceY: node1.outputSockets[0].y,
  targetX: node3.inputSockets[0].x,
  targetY: node3.inputSockets[0].y,
}));

let allNodes = [node1, node2, node3];
let allConnections = [connection1, connection2];

//----------------------------------------------------------------
// Canvas
//--------------

const {canvas, ctx, renderEditor} = useCanvas();

//----------------------------------------------------------------

const repaintEditor = () => {
  renderEditor();
  allNodes.forEach(initNode);
  allNodes.forEach(node => drawNode(ctx, node));
  allConnections.forEach(connection => drawConnection(ctx, connection.value));
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


//==========================================================
// Handle Mouse Event
//-----------------------

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
  if (isDragging.value) {
    activeNodes[0].x = event.offsetX - offsetX.value;
    activeNodes[0].y = event.offsetY - offsetY.value;
    repaintEditor()
  }
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

onBeforeUnmount(() => {})


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
