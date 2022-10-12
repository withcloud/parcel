import { fabric } from "fabric";
import "@tensorflow/tfjs-backend-webgl";
import * as posedetection from "@tensorflow-models/pose-detection";
import _ from "lodash";

import "./lib/import-jquery";
import * as sound from "./lib/sound";

import { Camera } from "./lib/camera";
import { STATE } from "./lib/params";
import {
  setupStats,
  beginEstimatePosesStats,
  endEstimatePosesStats
} from "./lib/stats_panel";
import { Game } from "./lib/game";

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
  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {
    // 開始 fps
    // FPS only counts the time it takes to finish estimatePoses.
    beginEstimatePosesStats();

    // 拿到 poses
    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
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
    // 清除 canvas
    // camera.canvas.clear();

    // canvas 畫 webcam
    camera.drawCtx();

    // canvas 畫 poses
    const pose = poses && poses[0];
    if (pose) {
      camera.drawResult(pose);
      camera.drawAngles();
    }

    // 重新安排順序
    _.sortBy(camera.canvas.getObjects(), "zIndex").forEach(obj => {
      camera.canvas.bringToFront(obj);
    });
  }
}

// 建立 render loop
async function renderPrediction() {
  fabric.util.requestAnimFrame(async function render() {
    await renderResult(camera, detector);

    if (!firstTime) {
      // 檢查是否有碰到
      game.checkIntersection();

      // canvas render
      camera.canvas.renderAll();
    }

    fabric.util.requestAnimFrame(render);
  });
}

// 主程式
async function app() {
  // 搞好 fps stats
  setupStats();

  // 設好 camera
  window.camera = camera = await Camera.setupCamera(STATE.camera);

  // 建立 detector
  detector = await createDetector();

  // 遊戲邏輯
  window.game = game = new Game(camera);

  // 開始 loop
  renderPrediction();
}

app();
