import $ from "./lib/import-jquery";

AFRAME.registerComponent("play-on-click", {
  init: function() {
    this.onClick = this.onClick.bind(this);
  },
  play: function() {
    window.addEventListener("click", this.onClick);
  },
  pause: function() {
    window.removeEventListener("click", this.onClick);
  },
  onClick: function(evt) {
    var videoEl = this.el.getAttribute("material").src;
    if (!videoEl) {
      return;
    }
    this.el.object3D.visible = true;
    videoEl.play();
  }
});

/* global AFRAME */
AFRAME.registerComponent("hide-on-play", {
  schema: { type: "selector" },
  init: function() {
    this.onPlaying = this.onPlaying.bind(this);
    this.onPause = this.onPause.bind(this);
    this.el.object3D.visible = !this.data.playing;
  },
  play: function() {
    if (this.data) {
      this.data.addEventListener("playing", this.onPlaying);
      this.data.addEventListener("pause", this.onPause);
    }
  },
  pause: function() {
    if (this.data) {
      this.data.removeEventListener("playing", this.onPlaying);
      this.data.removeEventListener("pause", this.onPause);
    }
  },
  onPlaying: function(evt) {
    this.el.object3D.visible = false;
  },
  onPause: function(evt) {
    this.el.object3D.visible = true;
  }
});

$("#start-btn").on("click", () => {
  $("#start-modal").hide();
});

// window.addEventListener("click", function() {
//   document.querySelector("#videoBunny").play();
// });

// import "./lib/motion";

// import $ from "./lib/import-jquery";

// $("body").css("background-color", "blue");

// import { Howl } from "howler";

// // https://github.com/goldfire/howler.js/issues/1334
// // let soundFile = new URL("../static/some-sound.wav", import.meta.url);

// var sound = new Howl({
//   src: ["click.mp3"]
// });

// // Clear listener after first call.
// sound.once("load", function() {
//   console.log("loaded");
//   // sound.play();
// });

// // Fires when the sound finishes playing.
// sound.on("end", function() {
//   console.log("Finished!");
// });

// $("body").on("mousedown", function() {
//   // alert("Handler for .click() called.");
//   sound.play();
// });

// // 不知為什麼，若果太快運行
// // 重新整理刷新時，camera 權限不會再彈出來

// import { Camera } from "./lib/camera";

// // 所以在這裡等一秒
// window.onload = function() {
//   setTimeout(async () => {
//     start();
//   }, 1000);
// };

// async function start() {
//   const camera = new Camera();
//   await camera.setupCamera();
//   await camera.setupCanvas();

//   // 渲染迴圈
//   render();

//   async function render() {
//     await renderResult();
//     requestAnimationFrame(render);
//   }

//   async function renderResult() {
//     // camera 渲染到 canvas
//     await camera.render();
//   }
// }
