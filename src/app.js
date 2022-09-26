import $ from "./lib/import-jquery";

$("body").css("background-color", "blue");

import { Howl } from "howler";

// https://github.com/goldfire/howler.js/issues/1334
// let soundFile = new URL("../static/some-sound.wav", import.meta.url);

var sound = new Howl({
  src: ["click.mp3"]
});

// Clear listener after first call.
sound.once("load", function() {
  console.log("loaded");
  // sound.play();
});

// Fires when the sound finishes playing.
sound.on("end", function() {
  console.log("Finished!");
});

$("body").click(function() {
  alert("Handler for .click() called.");
  sound.play();
});

// 不知為什麼，若果太快運行
// 重新整理刷新時，camera 權限不會再彈出來

import { Camera } from "./lib/camera";

// 所以在這裡等一秒
window.onload = function() {
  setTimeout(async () => {
    start();
  }, 1000);
};

async function start() {
  const camera = new Camera();
  await camera.setupCamera();
  await camera.setupCanvas();

  // 渲染迴圈
  render();

  async function render() {
    await renderResult();
    requestAnimationFrame(render);
  }

  async function renderResult() {
    // camera 渲染到 canvas
    await camera.render();
  }
}
