import * as posedetection from "@tensorflow-models/pose-detection";

export const DEFAULT_LINE_WIDTH = 2;
export const DEFAULT_RADIUS = 4;

export const STATE = {
  camera: {
    targetFPS: 60,
    sizeOption: {
      width: 640,
      height: 480
    }
  },
  backend: "tfjs-webgl",
  flags: {},
  modelConfig: {
    maxPoses: 5,
    type: "lightning",
    scoreThreshold: 0.3,
    customModel: "",
    enableTracking: false
  },
  model: posedetection.SupportedModels.MoveNet
};

window.STATE = STATE;
