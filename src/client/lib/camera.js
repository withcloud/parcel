/* eslint-disable no-unused-vars */

import { fabric } from "fabric";

import * as posedetection from "@tensorflow-models/pose-detection";

import * as params from "./params";

// #ffffff - White
// #800000 - Maroon
// #469990 - Malachite
// #e6194b - Crimson
// #42d4f4 - Picton Blue
// #fabed4 - Cupid
// #aaffc3 - Mint Green
// #9a6324 - Kumera
// #000075 - Navy Blue
// #f58231 - Jaffa
// #4363d8 - Royal Blue
// #ffd8b1 - Caramel
// #dcbeff - Mauve
// #808000 - Olive
// #ffe119 - Candlelight
// #911eb4 - Seance
// #bfef45 - Inchworm
// #f032e6 - Razzle Dazzle Rose
// #3cb44b - Chateau Green
// #a9a9a9 - Silver Chalice
const COLOR_PALETTE = [
  "#ffffff",
  "#800000",
  "#469990",
  "#e6194b",
  "#42d4f4",
  "#fabed4",
  "#aaffc3",
  "#9a6324",
  "#000075",
  "#f58231",
  "#4363d8",
  "#ffd8b1",
  "#dcbeff",
  "#808000",
  "#ffe119",
  "#911eb4",
  "#bfef45",
  "#f032e6",
  "#3cb44b",
  "#a9a9a9"
];
export class Camera {
  constructor() {
    this.video = document.getElementById("video");
    this.canvas = new fabric.Canvas("output", { selection: false });
    this.ctx = this.canvas.getContext("2d");
    this.keypoints = {};
    this.skeletons = {};
    window.canvas = this.canvas;
  }

  /**
   * Initiate a Camera instance and wait for the camera stream to be ready.
   * @param cameraParam From app `STATE.camera`.
   */
  static async setupCamera(cameraParam) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Browser API navigator.mediaDevices.getUserMedia not available"
      );
    }

    const { targetFPS, sizeOption } = cameraParam;
    const videoConfig = {
      audio: false,
      video: {
        facingMode: "user",
        // Only setting the video to a specified size for large screen, on
        // mobile devices accept the default size.
        width: sizeOption.width,
        height: sizeOption.height,
        frameRate: {
          ideal: targetFPS
        }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

    const camera = new Camera();
    camera.video.srcObject = stream;

    await new Promise(resolve => {
      camera.video.onloadedmetadata = () => {
        resolve(true);
      };
    });

    camera.video.play();

    const videoWidth = camera.video.videoWidth;
    const videoHeight = camera.video.videoHeight;
    // Must set below two lines, otherwise video element doesn't show.
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    camera.canvas.width = videoWidth;
    camera.canvas.height = videoHeight;
    const canvasContainer = document.querySelector(".canvas-wrapper");
    canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;

    // // Because the image from camera is mirrored, need to flip horizontally.
    // camera.ctx.translate(camera.video.videoWidth, 0);
    // camera.ctx.scale(-1, 1);

    return camera;
  }

  drawCtx() {
    if (!this.webcamImage) {
      this.webcamImage = new fabric.Image(this.video, {
        left: 0,
        top: 0,
        objectCaching: false,
        selectable: false,
        hoverCursor: "default",
        flipX: true
      });
      this.canvas.add(this.webcamImage);
      this.webcamImage.zIndex = 0;
    }
  }

  /**
   * Draw the keypoints and skeleton on the video.
   * @param poses A list of poses to render.
   */
  drawResults(poses) {
    for (const pose of poses) {
      pose.keypoints.forEach(kp => {
        // if (kp.name.includes("left")) {
        //   kp.name = kp.name.replace("left", "right");
        // } else if (kp.name.includes("right")) {
        //   kp.name = kp.name.replace("right", "left");
        // }
        kp.x = this.canvas.width - kp.x;
      });
      this.drawResult(pose);
    }
  }

  /**
   * Draw the keypoints and skeleton on the video.
   * @param pose A pose with keypoints to render.
   */
  drawResult(pose) {
    if (pose.keypoints != null) {
      this.drawKeypoints(pose.keypoints, pose.id);
      this.drawSkeleton(pose.keypoints, pose.id);
    }
  }

  /**
   * Draw the keypoints on the video.
   * @param keypoints A list of keypoints.
   */
  drawKeypoints(keypoints, poseId) {
    const keypointInd = posedetection.util.getKeypointIndexBySide(
      params.STATE.model
    );

    for (const i of keypointInd.middle) {
      this.drawKeypoint(keypoints[i], "red", poseId);
    }

    for (const i of keypointInd.left) {
      this.drawKeypoint(keypoints[i], "green", poseId);
    }

    for (const i of keypointInd.right) {
      this.drawKeypoint(keypoints[i], "orange", poseId);
    }
  }

  drawKeypoint(keypoint, color, poseId) {
    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

    // 若沒有，先建立
    if (!this.keypoints[keypoint.name]) {
      const c = new fabric.Circle({
        left: keypoint.x,
        top: keypoint.y,
        strokeWidth: 2,
        radius: 4,
        fill: color,
        stroke: "white",
        originX: "center",
        originY: "center"
      });
      c.hasControls = false;
      c.hasBorders = false;
      c.poseId = poseId;
      c.keypointName = keypoint.name;
      this.canvas.add(c);
      this.keypoints[keypoint.name] = c;
      c.zIndex = 1;
    }

    const c = this.keypoints[keypoint.name];

    if (score >= scoreThreshold) {
      c.visible = true;
      c.left = keypoint.x;
      c.top = keypoint.y;
    } else {
      c.visible = false;
    }
  }

  /**
   * Draw the skeleton of a body on the video.
   * @param keypoints A list of keypoints.
   */
  drawSkeleton(keypoints, poseId) {
    // Each poseId is mapped to a color in the color palette.
    const color = "White";

    posedetection.util
      .getAdjacentPairs(params.STATE.model)
      .forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;
        const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

        // 若沒有，先建立
        const name = kp1.name + "-" + kp2.name;
        if (!this.skeletons[name]) {
          const line = new fabric.Line([kp1.x, kp1.y, kp2.x, kp2.y], {
            fill: color,
            stroke: color,
            strokeWidth: 2,
            selectable: false,
            evented: false
          });
          this.canvas.add(line);
          this.skeletons[name] = line;
          line.zIndex = 1;
        }

        const line = this.skeletons[name];

        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
          line.visible = true;
          line.set({
            x1: kp1.x,
            y1: kp1.y,
            x2: kp2.x,
            y2: kp2.y
          });
        } else {
          line.visible = false;
        }
      });
  }
}
