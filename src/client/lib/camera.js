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
    this.text = document.getElementById("text");
    this.video = document.getElementById("video");
    this.canvas = new fabric.Canvas("output", { selection: false });
    this.ctx = this.canvas.getContext("2d");
    this.keypoints = {};
    this.skeletons = {};
    window.canvas = this.canvas;

    this.lastRenderAnglesTime = Date.now();
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
        },
        deviceId: window.search.deviceId
          ? { exact: window.search.deviceId }
          : undefined
      }
    };

    let stream = await navigator.mediaDevices.getUserMedia(videoConfig);
    window.stream = stream;

    // 查看 device id
    const deviceInfos = await navigator.mediaDevices.enumerateDevices();
    console.log(deviceInfos);
    window.deviceInfos = deviceInfos;

    let audios = [];
    let videos = [];
    for (const deviceInfo of deviceInfos) {
      const option = {};
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === "audioinput") {
        option.text = deviceInfo.label || `Microphone ${audios.length + 1}`;
        audios.push(option);
      } else if (deviceInfo.kind === "videoinput") {
        option.text = deviceInfo.label || `Camera ${audios.length + 1}`;
        videos.push(option);
      }
    }
    window.audios = audios;
    window.videos = videos;
    console.log(window.audios);
    console.log(window.videos);

    if (!window.search.deviceId) {
      alert("deviceId not found");
      await wait(1000 * 60 * 60 * 24);
    }

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

  setupCanvasObjects() {
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

    const keypoints = [
      { key: "nose", x: 321.1714486608809, y: 69.27845376056568 },
      { key: "left_eye", x: 312.5737016684717, y: 60.40401521600088 },
      { key: "left_ear", x: 306.1615931664136, y: 67.72593275154101 },
      { key: "left_shoulder", x: 285.6424011819502, y: 120.37349587262328 },
      { key: "left_elbow", x: 262.8932517686212, y: 185.90749724590802 },
      { key: "left_wrist", x: 254.0534185314233, y: 236.3666420149043 },
      { key: "left_hip", x: 300.98320318717384, y: 257.3983293087912 },
      { key: "left_knee", x: 292.6207436919961, y: 354.79140469875375 },
      { key: "left_ankle", x: 282.0647667840646, y: 422.89684171640425 },
      { key: "right_eye", x: 330.1192676127817, y: 61.59546395552639 },
      { key: "right_ear", x: 344.14965868115553, y: 70.13012397148042 },
      { key: "right_shoulder", x: 373.72537015381164, y: 117.17275512873869 },
      { key: "right_elbow", x: 389.1451043473787, y: 183.68152693301627 },
      { key: "right_wrist", x: 401.8436716010829, y: 233.24806604143765 },
      { key: "right_hip", x: 355.6434497439315, y: 257.652027433169 },
      { key: "right_knee", x: 372.4374681545515, y: 355.0741245796427 },
      { key: "right_ankle", x: 379.8362369533651, y: 434.69482907758584 }
    ];

    keypoints.forEach(keypoint => {
      const c = new fabric.Circle({
        left: keypoint.x,
        top: keypoint.y,
        strokeWidth: 2,
        radius: 4,
        fill: "black",
        stroke: "white",
        originX: "center",
        originY: "center",
        objectCaching: false,
        selectable: false
      });
      c.poseId = 0;
      c.keypointName = keypoint.name;
      this.canvas.add(c);
      this.keypoints[keypoint.key] = c;
      c.zIndex = 8;
    });

    const skeletons = [
      {
        key: "nose,left_eye",
        x1: 321.1714486608809,
        y1: 69.27845376056568,
        x2: 312.5737016684717,
        y2: 60.40401521600088
      },
      {
        key: "nose,right_eye",
        x1: 321.1714486608809,
        y1: 69.27845376056568,
        x2: 330.1192676127817,
        y2: 61.59546395552639
      },
      {
        key: "left_eye,left_ear",
        x1: 312.5737016684717,
        y1: 60.40401521600088,
        x2: 306.1615931664136,
        y2: 67.72593275154101
      },
      {
        key: "right_eye,right_ear",
        x1: 330.1192676127817,
        y1: 61.59546395552639,
        x2: 344.14965868115553,
        y2: 70.13012397148042
      },
      {
        key: "left_shoulder,right_shoulder",
        x1: 285.6424011819502,
        y1: 120.37349587262328,
        x2: 373.72537015381164,
        y2: 117.17275512873869
      },
      {
        key: "left_shoulder,left_elbow",
        x1: 285.6424011819502,
        y1: 120.37349587262328,
        x2: 262.8932517686212,
        y2: 185.90749724590802
      },
      {
        key: "left_shoulder,left_hip",
        x1: 285.6424011819502,
        y1: 120.37349587262328,
        x2: 300.98320318717384,
        y2: 257.3983293087912
      },
      {
        key: "right_shoulder,right_elbow",
        x1: 373.72537015381164,
        y1: 117.17275512873869,
        x2: 389.1451043473787,
        y2: 183.68152693301627
      },
      {
        key: "right_shoulder,right_hip",
        x1: 373.72537015381164,
        y1: 117.17275512873869,
        x2: 355.6434497439315,
        y2: 257.652027433169
      },
      {
        key: "left_elbow,left_wrist",
        x1: 262.8932517686212,
        y1: 185.90749724590802,
        x2: 254.0534185314233,
        y2: 236.3666420149043
      },
      {
        key: "right_elbow,right_wrist",
        x1: 389.1451043473787,
        y1: 183.68152693301627,
        x2: 401.8436716010829,
        y2: 233.24806604143765
      },
      {
        key: "left_hip,right_hip",
        x1: 300.98320318717384,
        y1: 257.3983293087912,
        x2: 355.6434497439315,
        y2: 257.652027433169
      },
      {
        key: "left_hip,left_knee",
        x1: 300.98320318717384,
        y1: 257.3983293087912,
        x2: 292.6207436919961,
        y2: 354.79140469875375
      },
      {
        key: "right_hip,right_knee",
        x1: 355.6434497439315,
        y1: 257.652027433169,
        x2: 372.4374681545515,
        y2: 355.0741245796427
      },
      {
        key: "left_knee,left_ankle",
        x1: 292.6207436919961,
        y1: 354.79140469875375,
        x2: 282.0647667840646,
        y2: 422.89684171640425
      },
      {
        key: "right_knee,right_ankle",
        x1: 372.4374681545515,
        y1: 355.0741245796427,
        x2: 379.8362369533651,
        y2: 434.69482907758584
      }
    ];

    skeletons.forEach(({ key, x1, y1, x2, y2 }) => {
      const line = new fabric.Line([x1, y1, x2, y2], {
        fill: "black",
        stroke: "black",
        strokeWidth: 2,
        evented: false,
        objectCaching: false,
        selectable: false
      });
      this.canvas.add(line);
      this.skeletons[key] = line;
      line.zIndex = 8;
    });

    this.canvas.requestRenderAll();
  }

  /**
   * Draw the keypoints and skeleton on the video.
   * @param pose A pose with keypoints to render.
   */
  async drawResult(pose) {
    if (pose.keypoints != null) {
      pose.keypoints.forEach(kp => {
        kp.x = this.canvas.width - kp.x;
      });

      await this.drawKeypoints(pose.keypoints, pose.id);
      await this.drawSkeleton(pose.keypoints, pose.id);
    }
  }

  /**
   * Draw the keypoints on the video.
   * @param keypoints A list of keypoints.
   */
  async drawKeypoints(keypoints, poseId) {
    const keypointInd = posedetection.util.getKeypointIndexBySide(
      params.STATE.model
    );

    for (const i of keypointInd.middle) {
      await this.drawKeypoint(keypoints[i], "red", poseId);
    }

    for (const i of keypointInd.left) {
      await this.drawKeypoint(keypoints[i], "green", poseId);
    }

    for (const i of keypointInd.right) {
      await this.drawKeypoint(keypoints[i], "orange", poseId);
    }
  }

  async drawKeypoint(keypoint, color, poseId) {
    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

    const c = this.keypoints[keypoint.name];

    if (score >= scoreThreshold) {
      c.visible = true;
      c.left = keypoint.x;
      c.top = keypoint.y;
    } else {
      c.visible = false;
      c.left = keypoint.x;
      c.top = keypoint.y;
    }
  }

  /**
   * Draw the skeleton of a body on the video.
   * @param keypoints A list of keypoints.
   */
  async drawSkeleton(keypoints, poseId) {
    // Each poseId is mapped to a color in the color palette.
    const color = "White";

    const arr = posedetection.util.getAdjacentPairs(params.STATE.model);

    for (let k = 0; k < arr.length; k++) {
      const [i, j] = arr[k];

      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      // If score is null, just show the keypoint.
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;
      const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

      const name = kp1.name + "," + kp2.name;
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
        line.set({
          x1: kp1.x,
          y1: kp1.y,
          x2: kp2.x,
          y2: kp2.y
        });
      }
    }
  }

  async drawAngles() {
    const angles = calcAngles(this.skeletons);
    let t = "";
    t += `1: ${angles[1]}\n`;
    t += `2: ${angles[2]}\n`;
    t += `3: ${angles[3]}\n`;
    t += `4: ${angles[4]}\n`;
    t += `5: ${angles[5]}\n`;
    t += `6: ${angles[6]}\n`;
    t += `7: ${angles[7]}\n`;
    t += `8: ${angles[8]}\n`;
    // if (!this.text) {
    //   this.text = new fabric.Text(t, {
    //     left: 0,
    //     top: 60,
    //     fontSize: 16,
    //     textBackgroundColor: "rgb(255,255,255, 0.5)"
    //   });
    //   this.canvas.add(this.text);
    //   this.text.zIndex = 5;
    // }
    // this.text.set("text", t);
    this.angles = angles;

    const now = Date.now();
    if (now - this.lastRenderAnglesTime > 1000) {
      this.text.innerHTML = t;
      this.lastRenderAnglesTime = now;
    }
  }
}

function calcAngles(obj) {
  const angles = [];

  const line11 = obj["right_shoulder,right_elbow"];
  const line12 = obj["right_elbow,right_wrist"];
  if (line11 && line12 && line11.visible && line12.visible) {
    angles[1] = calcAngle(
      line12.x1,
      line12.y1,
      line12.x2,
      line12.y2,
      line11.x2,
      line11.y2,
      line11.x1,
      line11.y1
    );
  }

  const line21 = obj["left_shoulder,left_elbow"];
  const line22 = obj["left_elbow,left_wrist"];
  if (line21 && line22 && line21.visible && line22.visible) {
    angles[2] = calcAngle(
      line21.x2,
      line21.y2,
      line21.x1,
      line21.y1,
      line22.x1,
      line22.y1,
      line22.x2,
      line22.y2
    );
  }

  const line31 = obj["right_shoulder,right_elbow"];
  const line32 = obj["right_shoulder,right_hip"];
  if (line31 && line32 && line31.visible && line32.visible) {
    angles[3] = calcAngle(
      line32.x1,
      line32.y1,
      line32.x2,
      line32.y2,
      line31.x1,
      line31.y1,
      line31.x2,
      line31.y2
    );
  }

  const line41 = obj["left_shoulder,left_elbow"];
  const line42 = obj["left_shoulder,left_hip"];
  if (line41 && line42 && line41.visible && line42.visible) {
    angles[4] = calcAngle(
      line41.x1,
      line41.y1,
      line41.x2,
      line41.y2,
      line42.x1,
      line42.y1,
      line42.x2,
      line42.y2
    );
  }

  const line51 = obj["right_shoulder,right_hip"];
  const line52 = obj["right_hip,right_knee"];
  if (line51 && line52 && line51.visible && line52.visible) {
    angles[5] = calcAngle(
      line52.x1,
      line52.y1,
      line52.x2,
      line52.y2,
      line51.x2,
      line51.y2,
      line51.x1,
      line51.y1
    );
  }

  const line61 = obj["left_shoulder,left_hip"];
  const line62 = obj["left_hip,left_knee"];
  if (line61 && line62 && line61.visible && line62.visible) {
    angles[6] = calcAngle(
      line61.x2,
      line61.y2,
      line61.x1,
      line61.y1,
      line62.x1,
      line62.y1,
      line62.x2,
      line62.y2
    );
  }

  const line71 = obj["right_hip,right_knee"];
  const line72 = obj["right_knee,right_ankle"];
  if (line71 && line72 && line71.visible && line72.visible) {
    angles[7] = calcAngle(
      line71.x2,
      line71.y2,
      line71.x1,
      line71.y1,
      line72.x1,
      line72.y1,
      line72.x2,
      line72.y2
    );
  }

  const line81 = obj["left_hip,left_knee"];
  const line82 = obj["left_knee,left_ankle"];
  if (line81 && line82 && line81.visible && line82.visible) {
    angles[8] = calcAngle(
      line82.x1,
      line82.y1,
      line82.x2,
      line82.y2,
      line81.x2,
      line81.y2,
      line81.x1,
      line81.y1
    );
  }

  return angles;
}

function calcAngle(A1x, A1y, A2x, A2y, B1x, B1y, B2x, B2y) {
  var dAx = A2x - A1x;
  var dAy = A2y - A1y;
  var dBx = B2x - B1x;
  var dBy = B2y - B1y;
  var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
  // if(angle < 0) {angle = angle * -1;}
  var degree_angle = angle * (180 / Math.PI);
  return parseInt(degree_angle);
}

async function wait(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
