/* global $ */

import { fabric } from "fabric";
import { createAvatar } from "@dicebear/avatars";
import * as style from "@dicebear/pixel-art";
import { v4 as uuidv4 } from "uuid";

import * as sound from "./sound";

const lineLimits = [
  // 起點在左邊
  {
    startPoint: {
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 480
    },
    options: [
      // 上
      {
        xMin: 0,
        xMax: 640,
        yMin: 0,
        yMax: 0
      },
      // 右
      {
        xMin: 640,
        xMax: 640,
        yMin: 0,
        yMax: 480
      },
      // 下
      {
        xMin: 0,
        xMax: 640,
        yMin: 480,
        yMax: 480
      }
    ]
  },
  // 起點在上邊
  {
    startPoint: {
      xMin: 0,
      xMax: 640,
      yMin: 0,
      yMax: 0
    },
    options: [
      // 左
      {
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 480
      },
      // 右
      {
        xMin: 640,
        xMax: 640,
        yMin: 0,
        yMax: 480
      },
      // 下
      {
        xMin: 0,
        xMax: 640,
        yMin: 480,
        yMax: 480
      }
    ]
  },
  // 起點在右邊
  {
    startPoint: {
      xMin: 640,
      xMax: 640,
      yMin: 0,
      yMax: 480
    },
    options: [
      // 左
      {
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 480
      },
      // 上
      {
        xMin: 0,
        xMax: 640,
        yMin: 0,
        yMax: 0
      },
      // 下
      {
        xMin: 0,
        xMax: 640,
        yMin: 480,
        yMax: 480
      }
    ]
  },
  // 起點在下邊
  {
    startPoint: {
      xMin: 0,
      xMax: 640,
      yMin: 480,
      yMax: 480
    },
    options: [
      // 左
      {
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 480
      },
      // 上
      {
        xMin: 0,
        xMax: 640,
        yMin: 0,
        yMax: 0
      },
      // 右
      {
        xMin: 640,
        xMax: 640,
        yMin: 0,
        yMax: 480
      }
    ]
  }
];

export class Game {
  constructor(camera) {
    this.camera = camera;
    this.canvas = camera.canvas;
    this.data = null;
    this.name =
      window.search.name ||
      "test" + generateRandomIntegerInRange(1000, 9999).toString();
    this.state = "";
  }

  start() {
    // api 不斷讀取
    this.startLoop();

    // 設置好常用的 div
    // 暫時不用的可以先用 jquery 隱藏掉

    this.$intro = $("#intro");
    this.$intro.hide();
    this.$menu = $("#menu");
    this.$menu.hide();
    this.$menuBg = $("#menu-bg");
    this.$menuBg.hide();
    this.$menuItem1 = $("#menu-item1");
    this.$menuItem2 = $("#menu-item2");
    this.$canvasWrapper = $("#canvas-wrapper");
    this.$menuCountdown = $("#menu-countdown");
    this.$menuItem3 = $("#menu-item3");
    this.$menuItem4 = $("#menu-item4");
    this.$menuCountdown2 = $("#menu-countdown2");
    this.$menuBack2 = $("#menu-back2");
    this.$menu2 = $("#menu2");
    this.$menuBg2 = $("#menu-bg2");
    this.$menu2.hide();
    this.$menuBg2.hide();
    this.$singleBg = $("#single-bg");
    this.$singleBg.hide();
    this.$single = $("#single");
    this.$single.hide();
    this.$singleScore = $("#single-score");
    this.$singleCountdown = $("#single-countdown");
    this.$singleLevel = $("#single-level");
    this.$singlePassed1 = $("#single-passed1");
    this.$singlePassed2 = $("#single-passed2");
    this.$singlePassed3 = $("#single-passed3");
    this.$singlePassed4 = $("#single-passed4");
    this.$singlePassed5 = $("#single-passed5");
    this.$singleLevelup = $("#single-levelup");
    this.$singleSmash = $("#single-smash");
    this.$singleTimesup = $("#single-timesup");
    this.$singleLevelup.hide();
    this.$singleSmash.hide();
    this.$singleTimesup.hide();
    this.$singleEnd = $("#single-end");
    this.$singleEndBg = $("#single-end-bg");
    this.$singleEnd.hide();
    this.$singleEndBg.hide();
    this.$singleEndScore = $("#single-end-score");
    this.$singleEndCountdown = $("#single-end-countdown");

    this.$roomAvatar1 = $("#room_avatar1");
    this.$roomAvatar2 = $("#room_avatar2");
    this.$room = $("#room");
    this.$roomBg = $("#room-bg");
    this.$room.hide();
    this.$roomBg.hide();
    this.$roomCountdown = $("#room-countdown");
    this.$roomBack = $("#room-back");

    this.$singleScoreBoard = $("#single-score-board");
    this.$vsScoreBoard = $("#vs-score-board");
    this.$vsP1Score = $("#vs-p1-score");
    this.$vsP2Score = $("#vs-p2-score");

    this.$vsEnd = $("#vs-end");
    this.$vsEndBg = $("#vs-end-bg");
    this.$vsEnd.hide();
    this.$vsEndBg.hide();
    this.$vsEndP1Score = $("#vs-end-p1-score");
    this.$vsEndP2Score = $("#vs-end-p2-score");
    this.$vsEndCountdown = $("#vs-end-countdown");

    // 遊戲流程

    // menu
    this.postState({
      id: uuidv4(),
      name: this.name,
      state: "state3"
    });
  }

  setupCanvasObjects() {
    // 設置好常用的 canvas object
    // 暫時不用的可以設 visible 為 false
    this.menuItem1 = new fabric.Rect({
      left: 10,
      top: 160,
      width: 280,
      height: 300,
      stroke: "#eee",
      strokeWidth: 10,
      fill: "rgba(0,0,200,0.5)"
    });
    this.canvas.add(this.menuItem1);
    this.menuItem1.zIndex = 10;
    this.menuItem1.visible = false;

    this.menuItem2 = new fabric.Rect({
      left: 320,
      top: 160,
      width: 280,
      height: 300,
      stroke: "#eee",
      strokeWidth: 10,
      fill: "rgba(0,200,0,0.5)"
    });
    this.canvas.add(this.menuItem2);
    this.menuItem2.zIndex = 10;
    this.menuItem2.visible = false;

    this.menuItem3 = new fabric.Rect({
      left: 0,
      top: 0,
      width: 200,
      height: 140,
      stroke: "#eee",
      strokeWidth: 10,
      fill: "rgba(0,200,0,0.5)"
    });
    this.canvas.add(this.menuItem3);
    this.menuItem3.zIndex = 10;
    this.menuItem3.visible = false;

    this.line = new fabric.Line([50, 10, 200, 150], {
      stroke: "green",
      strokeWidth: 16,
      originX: "center",
      originY: "center"
    });
    this.canvas.add(this.line);
    this.line.zIndex = 20;
    this.line.visible = false;

    this.rect1 = new fabric.Rect({
      left: 0,
      top: 0,
      width: 40,
      height: 40,
      fill: "rgba(200,0,0,0.5)"
    });
    this.rect2 = new fabric.Rect({
      left: 40,
      top: 0,
      width: 40,
      height: 40,
      fill: "rgba(0,200,0,0.5)"
    });
    this.rect3 = new fabric.Rect({
      left: 80,
      top: 0,
      width: 40,
      height: 40,
      fill: "rgba(0,0,200,0.5)"
    });
    this.canvas.add(this.rect1);
    this.canvas.add(this.rect2);
    this.canvas.add(this.rect3);
    this.rect1.zIndex = 10;
    this.rect2.zIndex = 10;
    this.rect3.zIndex = 10;
    this.rect1.visible = false;
    this.rect2.visible = false;
    this.rect3.visible = false;
  }

  startLoop() {
    clearInterval(window.gameAPITimer);
    this.fetching = false;
    window.gameAPITimer = setInterval(async () => {
      if (this.fetching) return;
      this.fetching = true;
      // api 讀取
      try {
        const host = window.search.host || "zoke.io";
        const response = await fetch(
          `https://${host}/api/state?name=` + this.name
        );
        const data = await response.json();
        this.data = data;
      } catch (error) {
        console.log(error);
      }

      // 根據 api 做相應的處理
      if (!this.data) return;

      const nextState = this.data?.state;
      if (nextState && nextState !== this.state) {
        this.state = nextState;
        if (this[this.state]) {
          this[this.state]();
        }
      }
      this.fetching = false;
    }, 200);
  }

  checkIntersection() {
    if (this.checkIntersectionHandle) {
      this.checkIntersectionHandle();
    }
  }

  async postState(obj) {
    try {
      const host = window.search.host || "zoke.io";
      const response = await fetch(`https://${host}/api/state`, {
        method: "post",
        body: JSON.stringify(obj),
        headers: { "Content-Type": "application/json" }
      });
      await response.json();
    } catch (error) {
      console.log(error);
    }
  }

  // info
  async state1() {
    this.$intro.show();

    setTimeout(() => {
      this.$intro.hide();
      this.postState({
        [`${this.name}.state`]: "state2"
      });
    }, 10000);
  }

  // 主目錄
  async state2() {
    this.$menu.show();
    this.$menuBg.show();
    this.camera.targetMode = true;
    this.camera.webcamImage.visible = false;
    this.$canvasWrapper.css("opacity", "0.6");
    this.menuItem1.visible = false;
    this.menuItem2.visible = false;

    // 預設是 game1
    this.menuSelected = "";
    sound.click.play();
    sound.bg.stop();

    let count = 4;
    const countdown = () => {
      this.$menuCountdown.text(count);
      count--;

      if (count < 0) {
        clearInterval(this.menuCountdown);

        this.$menu.hide();
        this.$menuBg.hide();
        this.camera.targetMode = false;
        this.camera.webcamImage.visible = true;
        this.$canvasWrapper.css("opacity", "0");
        this.menuItem1.visible = false;
        this.menuItem2.visible = false;
        this.checkIntersectionHandle = null;
        if (this.menuSelected === "game1") {
          this.postState({
            id: uuidv4(),
            name: this.name,
            state: "state3"
          });
        } else {
          this.postState({
            id: uuidv4(),
            name: this.name,
            state: "state3"
          });
        }
      }
    };
    this.$menuCountdown.text("");

    let lastCheck = Date.now();
    this.checkIntersectionHandle = () => {
      if (Date.now() - lastCheck < 200) return;
      // const leftHand = this.camera.keypoints["left_wrist"];
      const rightHand = this.camera.keypoints["right_wrist"];
      let targetHand;
      if (rightHand && rightHand.visible) {
        targetHand = rightHand;
      }
      if (targetHand) {
        if (targetHand.intersectsWithObject(this.menuItem1, true, true)) {
          if (this.menuSelected !== "game1") {
            this.menuSelected = "game1";
            sound.click.play();
            lastCheck = Date.now();
            console.log("game1 selected");
            clearInterval(this.menuCountdown);
            count = 4;
            this.$menuCountdown.text("");
            this.menuCountdown = setInterval(countdown, 1000);
          }
        } else if (
          targetHand.intersectsWithObject(this.menuItem2, true, true)
        ) {
          if (this.menuSelected !== "game2") {
            this.menuSelected = "game2";
            sound.click.play();
            lastCheck = Date.now();
            console.log("game2 selected");
            clearInterval(this.menuCountdown);
            count = 4;
            this.$menuCountdown.text("");
            this.menuCountdown = setInterval(countdown, 1000);
          }
        } else {
          if (this.menuSelected !== "") {
            this.menuSelected = "";
            lastCheck = Date.now();
            console.log("game none selected");
            clearInterval(this.menuCountdown);
            count = 4;
            this.$menuCountdown.text("");
          }
        }
      } else {
        if (this.menuSelected !== "") {
          this.menuSelected = "";
          lastCheck = Date.now();
          console.log("game none selected");
          clearInterval(this.menuCountdown);
          count = 4;
          this.$menuCountdown.text("");
        }
      }
      if (this.menuSelected === "game1") {
        this.$menuItem1.css("opacity", "1");
        this.$menuItem2.css("opacity", "0.5");
      } else if (this.menuSelected === "game2") {
        this.$menuItem1.css("opacity", "0.5");
        this.$menuItem2.css("opacity", "1");
      } else {
        this.$menuItem1.css("opacity", "0.5");
        this.$menuItem2.css("opacity", "0.5");
      }
    };
  }

  // 主目錄
  async state3() {
    this.$menu2.show();
    this.$menuBg2.show();
    this.camera.targetMode = true;
    this.camera.webcamImage.visible = false;
    this.$canvasWrapper.css("opacity", "0.6");
    this.menuItem1.visible = false;
    this.menuItem2.visible = false;
    // 預設是 game1
    this.menuSelected = "";
    sound.click.play();
    sound.bg.stop();

    let count = 4;
    const countdown = () => {
      this.$menuCountdown2.text(count);
      count--;

      if (count < 0) {
        clearInterval(this.menuCountdown2);

        this.$menu2.hide();
        this.$menuBg2.hide();
        this.camera.targetMode = false;
        this.camera.webcamImage.visible = true;
        this.$canvasWrapper.css("opacity", "0");
        this.menuItem1.visible = false;
        this.menuItem2.visible = false;
        this.checkIntersectionHandle = null;
        if (this.menuSelected === "game1") {
          this.postState({
            id: uuidv4(),
            name: this.name,
            state: "state4"
          });
        } else if (this.menuSelected === "game2") {
          this.postState({
            id: uuidv4(),
            name: this.name,
            state: "state6"
          });
        } else if (this.menuSelected === "back") {
          this.postState({
            id: uuidv4(),
            name: this.name,
            state: "state2"
          });
        }
      }
    };
    this.$menuCountdown2.text("");

    let lastCheck = Date.now();
    this.checkIntersectionHandle = () => {
      if (Date.now() - lastCheck < 200) return;
      // const leftHand = this.camera.keypoints["left_wrist"];
      const rightHand = this.camera.keypoints["right_wrist"];
      let targetHand;
      if (rightHand && rightHand.visible) {
        targetHand = rightHand;
      }
      if (targetHand) {
        if (targetHand.intersectsWithObject(this.menuItem1, true, true)) {
          if (this.menuSelected !== "game1") {
            this.menuSelected = "game1";
            sound.click.play();
            lastCheck = Date.now();
            console.log("game1 selected");
            clearInterval(this.menuCountdown2);
            count = 4;
            this.$menuCountdown2.text("");
            this.menuCountdown2 = setInterval(countdown, 1000);
          }
        } else if (
          targetHand.intersectsWithObject(this.menuItem2, true, true)
        ) {
          if (this.menuSelected !== "game2") {
            this.menuSelected = "game2";
            sound.click.play();
            lastCheck = Date.now();
            console.log("game2 selected");
            clearInterval(this.menuCountdown2);
            count = 4;
            this.$menuCountdown2.text("");
            this.menuCountdown2 = setInterval(countdown, 1000);
          }
        } else if (
          targetHand.intersectsWithObject(this.menuItem3, true, true)
        ) {
          if (this.menuSelected !== "back") {
            this.menuSelected = "back";
            sound.click.play();
            lastCheck = Date.now();
            console.log("back selected");
            clearInterval(this.menuCountdown2);
            count = 4;
            this.$menuCountdown2.text("");
            this.menuCountdown2 = setInterval(countdown, 1000);
          }
        } else {
          if (this.menuSelected !== "") {
            this.menuSelected = "";
            lastCheck = Date.now();
            console.log("game none selected");
            clearInterval(this.menuCountdown2);
            count = 4;
            this.$menuCountdown2.text("");
          }
        }
      } else {
        if (this.menuSelected !== "") {
          this.menuSelected = "";
          lastCheck = Date.now();
          console.log("game none selected");
          clearInterval(this.menuCountdown2);
          count = 4;
          this.$menuCountdown2.text("");
        }
      }
      if (this.menuSelected === "game1") {
        this.$menuItem3.css("opacity", "1");
        this.$menuItem4.css("opacity", "0.5");
        this.$menuBack2.css("opacity", "0.5");
      } else if (this.menuSelected === "game2") {
        this.$menuItem3.css("opacity", "0.5");
        this.$menuItem4.css("opacity", "1");
        this.$menuBack2.css("opacity", "0.5");
      } else if (this.menuSelected === "back") {
        this.$menuItem3.css("opacity", "0.5");
        this.$menuItem4.css("opacity", "0.5");
        this.$menuBack2.css("opacity", "1");
      } else {
        this.$menuItem3.css("opacity", "0.5");
        this.$menuItem4.css("opacity", "0.5");
        this.$menuBack2.css("opacity", "0.5");
      }
    };
  }

  async state4() {
    this.$single.show();
    this.$singleBg.show();
    this.$canvasWrapper.css("opacity", "1");
    this.$singlePassed1.css("background-color", "transparent");
    this.$singlePassed2.css("background-color", "transparent");
    this.$singlePassed3.css("background-color", "transparent");
    this.$singlePassed4.css("background-color", "transparent");
    this.$singlePassed5.css("background-color", "transparent");
    this.$singleTimesup.hide();
    this.$singleLevelup.hide();
    this.$singleSmash.hide();
    this.$singleScoreBoard.show();
    this.$vsScoreBoard.hide();

    sound.bg.play();

    this.$singleScore.text(0);
    this.$vsP1Score.text(0);
    this.$vsP2Score.text(0);
    this.$singleLevel.text(`LEVEL 1`);

    this.singleTimesup = false;
    const countdown = async count => {
      for (let i = count; i >= 0; i--) {
        this.$singleCountdown.text(i);
        await wait(1000);
      }
      this.singleTimesup = true;
    };
    this.$singleCountdown.text(60);
    countdown(60);

    this.singleLevel = 1;
    this.singlePassed = 0;
    this.singleScore = 0;
    this.vsP1Score = 0;
    this.vsP2Score = 0;
    await this.startLineLevelGame(1000);

    this.$singleTimesup.show();

    await wait(4000);

    this.rect1.visible = false;
    this.rect2.visible = false;
    this.rect3.visible = false;
    this.line.visible = false;

    this.$single.hide();
    this.$singleBg.hide();
    this.$canvasWrapper.css("opacity", "0");
    this.$singleTimesup.hide();
    this.$singleLevelup.hide();
    this.$singleSmash.hide();

    this.postState({
      id: uuidv4(),
      name: this.name,
      state: "state5"
    });
  }

  async state5() {
    this.$singleEnd.show();
    this.$singleEndBg.show();
    this.camera.targetMode = true;
    this.camera.webcamImage.visible = false;
    this.$canvasWrapper.css("opacity", "0.6");

    sound.bg.stop();

    this.$singleEndScore.text(this.singleScore);

    const countdown = async count => {
      for (let i = count; i >= 0; i--) {
        this.$singleEndCountdown.text(i);
        await wait(1000);
      }
      this.$singleEnd.hide();
      this.$singleEndBg.hide();
      this.camera.targetMode = false;
      this.camera.webcamImage.visible = true;
      this.$canvasWrapper.css("opacity", "0");
      this.postState({
        id: uuidv4(),
        name: this.name,
        state: "state3"
      });
    };
    this.$singleEndCountdown.text(10);
    countdown(10);
  }

  async state6() {
    this.$room.show();
    this.$roomBg.show();
    this.camera.targetMode = true;
    this.camera.webcamImage.visible = false;
    this.$canvasWrapper.css("opacity", "0.6");
    this.$roomAvatar1.empty();
    this.$roomAvatar2.empty();

    let svg = createAvatar(style, {
      seed: this.data.id
    });
    this.$roomAvatar1.html(svg);

    this.menuSelected = "";
    sound.bg.stop();

    let count = 4;
    const countdown = () => {
      this.$roomCountdown.text(count);
      count--;

      if (count < 0) {
        clearInterval(this.roomCountdown);

        this.$room.hide();
        this.$roomBg.hide();
        this.camera.targetMode = false;
        this.camera.webcamImage.visible = true;
        this.$canvasWrapper.css("opacity", "0");
        this.checkIntersectionHandle = null;
        if (this.menuSelected === "back") {
          this.postState({
            id: uuidv4(),
            name: this.name,
            state: "state3"
          });
        }
      }
    };
    this.$roomCountdown.text("");

    let lastCheck = Date.now();
    this.checkIntersectionHandle = () => {
      if (Date.now() - lastCheck < 200) return;
      // const leftHand = this.camera.keypoints["left_wrist"];
      const rightHand = this.camera.keypoints["right_wrist"];
      let targetHand;
      if (rightHand && rightHand.visible) {
        targetHand = rightHand;
      }
      if (targetHand) {
        if (targetHand.intersectsWithObject(this.menuItem3, true, true)) {
          if (this.menuSelected !== "back") {
            this.menuSelected = "back";
            sound.click.play();
            lastCheck = Date.now();
            console.log("back selected");
            clearInterval(this.roomCountdown);
            count = 4;
            this.$roomCountdown.text("");
            this.roomCountdown = setInterval(countdown, 1000);
          }
        } else {
          if (this.menuSelected !== "") {
            this.menuSelected = "";
            lastCheck = Date.now();
            console.log("game none selected");
            clearInterval(this.roomCountdown);
            count = 4;
            this.$roomCountdown.text("");
          }
        }
      } else {
        if (this.menuSelected !== "") {
          this.menuSelected = "";
          lastCheck = Date.now();
          console.log("game none selected");
          clearInterval(this.roomCountdown);
          count = 4;
          this.$roomCountdown.text("");
        }
      }
      if (this.menuSelected === "back") {
        this.$roomBack.css("opacity", "1");
      } else {
        this.$roomBack.css("opacity", "0.5");
      }
    };

    clearInterval(this.roomTimer);
    this.roomTimer = setInterval(() => {
      if (this.data.room) {
        clearInterval(this.roomCountdown);
        clearInterval(this.roomTimer);
        const op =
          this.name === this.data.room.players[0].name
            ? this.data.room.players[1]
            : this.data.room.players[0];
        let svg = createAvatar(style, {
          seed: op.id
        });
        this.$roomAvatar2.html(svg);

        setTimeout(() => {
          this.$room.hide();
          this.$roomBg.hide();
          this.camera.targetMode = false;
          this.camera.webcamImage.visible = true;
          this.$canvasWrapper.css("opacity", "0");
          this.postState({
            id: uuidv4(),
            name: this.name,
            state: "state7",
            roomId: this.data.roomId
          });
        }, 3000);
      }
    }, 500);
  }

  async state7() {
    this.$single.show();
    this.$singleBg.show();
    this.$canvasWrapper.css("opacity", "1");
    this.$singlePassed1.css("background-color", "transparent");
    this.$singlePassed2.css("background-color", "transparent");
    this.$singlePassed3.css("background-color", "transparent");
    this.$singlePassed4.css("background-color", "transparent");
    this.$singlePassed5.css("background-color", "transparent");
    this.$singleTimesup.hide();
    this.$singleLevelup.hide();
    this.$singleSmash.hide();
    this.$singleScoreBoard.hide();
    this.$vsScoreBoard.show();

    sound.bg.play();

    this.$singleScore.text(0);
    this.$vsP1Score.text(0);
    this.$vsP2Score.text(0);
    this.$singleLevel.text(`LEVEL 1`);

    clearInterval(this.vsTimer);
    this.vsTimer = setInterval(() => {
      try {
        // 把自己的數據上傳到 server
        this.postState({
          id: uuidv4(),
          name: this.name,
          state: "state7",
          roomId: this.data.roomId,
          score: this.vsP1Score
        });
        // 更新對手的分數
        const op =
          this.name === this.data.room.players[0].name
            ? this.data.room.players[1]
            : this.data.room.players[0];
        this.vsP2Score = op.score || 0;
        this.$vsP2Score.text(this.vsP2Score);
      } catch (error) {
        console.log(error);
      }
    }, 500);

    this.singleTimesup = false;
    const countdown = async count => {
      for (let i = count; i >= 0; i--) {
        this.$singleCountdown.text(i);
        await wait(1000);
      }
      this.singleTimesup = true;
    };
    this.$singleCountdown.text(60);
    countdown(60);

    this.singleLevel = 1;
    this.singlePassed = 0;
    this.singleScore = 0;
    this.vsP1Score = 0;
    this.vsP2Score = 0;
    await this.startLineLevelGame(1000);

    this.$singleTimesup.show();

    await wait(3000);
    clearInterval(this.vsTimer);
    await wait(1000);

    this.rect1.visible = false;
    this.rect2.visible = false;
    this.rect3.visible = false;
    this.line.visible = false;

    this.$single.hide();
    this.$singleBg.hide();
    this.$canvasWrapper.css("opacity", "0");
    this.$singleTimesup.hide();
    this.$singleLevelup.hide();
    this.$singleSmash.hide();

    this.postState({
      id: uuidv4(),
      name: this.name,
      state: "state8",
      roomId: this.data.roomId
    });
  }

  async state8() {
    this.$vsEnd.show();
    this.$vsEndBg.show();
    this.camera.targetMode = true;
    this.camera.webcamImage.visible = false;
    this.$canvasWrapper.css("opacity", "0.6");

    sound.bg.stop();

    this.$vsEndP1Score.text(this.vsP1Score || 0);
    this.$vsEndP2Score.text(this.vsP2Score || 0);

    const countdown = async count => {
      for (let i = count; i >= 0; i--) {
        this.$vsEndCountdown.text(i);
        await wait(1000);
      }
      this.$vsEnd.hide();
      this.$vsEndBg.hide();
      this.camera.targetMode = false;
      this.camera.webcamImage.visible = true;
      this.$canvasWrapper.css("opacity", "0");
      this.postState({
        id: uuidv4(),
        name: this.name,
        state: "state3"
      });
    };
    this.$vsEndCountdown.text(10);
    countdown(10);
  }

  // async state3() {
  //   // 不斷做的事
  //   // 每隔幾秒
  //   // 顯示一條線，線的 xy 隨機 (半透明)
  //   // 再隔一秒
  //   // 線變實線
  //   // 判斷距離
  //   await this.startLineLevelGame(1000);
  // }

  // async state4() {
  //   alert("game2");
  // }

  async startLineLevelGame(times) {
    for (let i = 0; i < times; i++) {
      // reset
      this.line.visible = false;

      // 等一秒
      await wait(500);
      if (this.singleTimesup) return;

      // 顯示一個燈
      sound.click.play();
      // 顯示半透明線
      this.line.visible = true;
      const p =
        lineLimits[generateRandomIntegerInRange(0, lineLimits.length - 1)];
      const ep =
        p.options[generateRandomIntegerInRange(0, p.options.length - 1)];
      const x1 = generateRandomIntegerInRange(
        p.startPoint.xMin,
        p.startPoint.xMax
      );
      const y1 = generateRandomIntegerInRange(
        p.startPoint.yMin,
        p.startPoint.yMax
      );
      const x2 = generateRandomIntegerInRange(ep.xMin, ep.xMax);
      const y2 = generateRandomIntegerInRange(ep.yMin, ep.yMax);
      this.line.set({
        x1,
        y1,
        x2,
        y2
      });
      this.line.set("stroke", "rgba(0,255,0,0.25)");

      // 等一秒
      await wait(500);
      if (this.singleTimesup) return;

      // 顯示一個燈
      this.line.set("stroke", "rgba(0,255,0,0.5)");

      // 等一秒
      await wait(500);
      if (this.singleTimesup) return;

      // 變成實線
      this.line.set("stroke", "rgba(255,0,0,1)");

      // 等 0.2 秒
      await wait(200);
      if (this.singleTimesup) return;

      // 並開始計算碰撞
      // 判定只有一次
      let kit = false;
      let dx1 = 0;
      let dx2 = 0;
      let dy1 = 0;
      let dy2 = 0;
      Object.keys(this.camera.keypoints).forEach(key => {
        const kp = this.camera.keypoints[key];
        if (kp.visible) {
          const d = getDxDy(kp.left, kp.top, x1, y1, x2, y2);
          if (d.dx > 0) {
            dx1++;
          } else if (d.dx < 0) {
            dx2++;
          }
          if (d.dy > 0) {
            dy1++;
          } else if (d.dy < 0) {
            dy2++;
          }
        }
      });
      if ((dx1 > 0 && dx2 > 0) || (dy1 > 0 && dy2 > 0)) {
        kit = true;
      }

      // 變回綠色
      this.line.set("stroke", "rgba(255,0,0,0.5)");

      console.log("kit", kit);
      if (kit) {
        sound.click5.play();
      } else {
        sound.click4.play();
      }

      // 重置關卡
      if (kit) {
        // passed 歸零
        this.singlePassed = 0;
        // 關卡不變
        // 不會加分數
        this.$singleSmash.show();
        setTimeout(() => {
          this.$singleSmash.hide();
        }, 500);
      } else {
        // passed +1
        this.singlePassed += 1;
        // 關卡分析
        if (this.singlePassed > 5) {
          this.singleLevel += 1;
          this.singlePassed = 1;
          this.$singleLevelup.show();
          setTimeout(() => {
            this.$singleLevelup.hide();
          }, 500);
        }
        // 分數分析
        this.singleScore +=
          100 * ((this.singleLevel - 1) * 5 + this.singlePassed);
        this.vsP1Score +=
          100 * ((this.singleLevel - 1) * 5 + this.singlePassed);
      }

      // 更新 ui
      this.$singleScore.text(this.singleScore);
      this.$vsP1Score.text(this.vsP1Score);
      this.$singleLevel.text(`LEVEL ${this.singleLevel}`);
      if (this.singlePassed >= 1) {
        this.$singlePassed1.css("background-color", "blue");
      } else {
        this.$singlePassed1.css("background-color", "transparent");
      }
      if (this.singlePassed >= 2) {
        this.$singlePassed2.css("background-color", "blue");
      } else {
        this.$singlePassed2.css("background-color", "transparent");
      }
      if (this.singlePassed >= 3) {
        this.$singlePassed3.css("background-color", "blue");
      } else {
        this.$singlePassed3.css("background-color", "transparent");
      }
      if (this.singlePassed >= 4) {
        this.$singlePassed4.css("background-color", "blue");
      } else {
        this.$singlePassed4.css("background-color", "transparent");
      }
      if (this.singlePassed >= 5) {
        this.$singlePassed5.css("background-color", "blue");
      } else {
        this.$singlePassed5.css("background-color", "transparent");
      }

      // 等 0.8 秒
      await wait(800);
      if (this.singleTimesup) return;

      // reset
      this.rect1.visible = false;
      this.rect2.visible = false;
      this.rect3.visible = false;
      this.line.visible = false;
    }
  }
}

async function wait(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

function generateRandomIntegerInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDxDy(x, y, x1, y1, x2, y2) {
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;

  var param = -1;
  if (len_sq != 0)
    //in case of 0 length line
    param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;

  return {
    dx,
    dy
  };
}
