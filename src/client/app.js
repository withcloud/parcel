import { fabric } from "fabric";
import "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as posedetection from "@tensorflow-models/pose-detection";
import _ from "lodash";

import "./lib/import-jquery";
// import * as sound from "./lib/sound";

import { Camera } from "./lib/camera";
import { STATE } from "./lib/params";
import {
  setupStats,
  beginEstimatePosesStats,
  endEstimatePosesStats
} from "./lib/stats_panel";
// import { Game } from "./lib/game";
import { initDefaultValueMap, setBackendAndEnvFlags } from "./lib/util";

// fabric.Object.prototype.objectCaching = false;

let detector;
let camera;
let game;
let firstTime = true;

// 建立 post detector
async function createDetector() {
  const modelType = posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING;
  const modelConfig = {
    modelType,
    modelUrl: "/model/model.json"
  };
  return posedetection.createDetector(STATE.model, modelConfig);
}

// render loop
async function renderResult() {
  if (camera.video.readyState < 2) {
    await new Promise(resolve => {
      camera.video.onloadeddata = () => {
        resolve(true);
      };
    });
  }

  let poses = null;

  // pose detect
  if (detector != null) {
    // 開始 fps
    beginEstimatePosesStats();

    // 拿到 poses
    try {
      poses = await detector.estimatePoses(camera.video, {
        maxPoses: STATE.modelConfig.maxPoses,
        flipHorizontal: false
      });
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }

    // 結束 fps
    endEstimatePosesStats();

    if (firstTime) {
      firstTime = false;
    }
  }

  if (!firstTime) {
    // canvas 畫 webcam
    camera.drawCtx();

    // canvas 畫 poses
    const pose = poses && poses[0];
    if (pose) {
      camera.drawResult(pose);
      // camera.drawAngles();
    }

    // // 重新安排順序
    // _.sortBy(camera.canvas.getObjects(), "zIndex").forEach(obj => {
    //   camera.canvas.bringToFront(obj);
    // });
    // camera.canvas.bringToFront(game.menuItem1);
    // camera.canvas.bringToFront(game.menuItem2);
    // camera.canvas.bringToFront(game.rect1);
    // camera.canvas.bringToFront(game.rect2);
    // camera.canvas.bringToFront(game.rect3);
    // camera.canvas.bringToFront(game.line);
  }
}

// 建立 render loop
async function renderPrediction() {
  await renderResult();

  if (!firstTime) {
    // 檢查是否有碰到
    // game.checkIntersection();
    // canvas render
    camera.canvas.renderAll();
  }

  requestAnimationFrame(renderPrediction);
}

// 主程式
async function app() {
  // 搞好 fps stats
  setupStats();

  // 設好 camera
  window.camera = camera = await Camera.setupCamera(STATE.camera);

  await initDefaultValueMap();
  await setBackendAndEnvFlags(STATE.flags, STATE.backend);

  // 建立 detector
  detector = await createDetector();

  // 遊戲邏輯
  // window.game = game = new Game(camera);

  // 開始 loop
  renderPrediction();
}

app();
