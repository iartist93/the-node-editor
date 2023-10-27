<script setup lang="ts">

import {onMounted, ref} from "vue";

const canvas = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D>();


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

const drawRectangle = () => {
  ctx.value.fillStyle = '#4B4B4B';
  ctx.value.fillRect(50, 50, 200, 150);
};

onMounted(() => {
  ctx.value = canvas.value?.getContext('2d');
  initCanvas();
  drawRectangle();
})


</script>

<template>
  <div class="editor">
    <canvas ref="canvas" id="canvas"></canvas>
  </div>
</template>

<style scoped>
</style>
