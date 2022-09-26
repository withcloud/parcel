import { getObjectFitSize } from "./utils";

export class Camera {
  constructor() {
    this.video = document.getElementById("v");
    this.canvas = document.getElementById("c");
    this.ctx = this.canvas.getContext("2d");
    this.timer = null;
    this.x = 0;
    this.y = 0;
  }

  async setupCamera() {
    if (window.stream) {
      window.stream.getTracks().forEach(track => {
        track.stop();
      });
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: 360,
          height: 270
        }
      });
      window.stream = stream;
      this.video.srcObject = stream;
    } catch (error) {
      console.log(error);
    }

    await new Promise(resolve => {
      this.video.onloadedmetadata = () => {
        resolve(this.video);
      };
    });
  }

  async setupCanvas() {
    this.windowResize();

    // resize the canvas to fill browser window dynamically
    window.addEventListener("resize", this.windowResize.bind(this));
    this.video.addEventListener("resize", this.windowResize.bind(this));
  }

  // 為什麼要這樣做
  // 因為如果馬上 resize 馬上調 canvas，此時新的 video 長寬值好像有時拿不到
  // 例如手機不斷直屏橫屏轉
  windowResize() {
    // clearTimeout(this.timer);
    // this.timer = setTimeout(this.resize.bind(this), 200);
    this.resize();
  }

  resize() {
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;

    this.video.width = videoWidth;
    this.video.height = videoHeight;

    const size = getObjectFitSize(
      false,
      window.innerWidth,
      window.innerHeight,
      videoWidth,
      videoHeight
    );

    // 更新 canvas 的畫布大小
    this.canvas.width = size.w;
    this.canvas.height = size.h;

    // 讓 camera 渲染時能放正中間
    this.x = -size.x;
    this.y = -size.y;
  }

  async render() {
    // 等待 camera 可以播
    if (this.video.readyState < 2) {
      await new Promise(resolve => {
        this.video.onloadeddata = () => {
          resolve(this.video);
        };
      });
    }

    // 畫到 canvas
    // 把 video, 0 0 360, 270
    // 畫到 canvas x y (調整置中)
    // 因為本身畫佈有 crop，所以沒問題
    // this.canvas.width = size.w;
    // this.canvas.height = size.h;
    this.ctx.drawImage(
      this.video,
      0,
      0,
      this.video.videoWidth,
      this.video.videoHeight,
      this.x,
      this.y,
      this.video.videoWidth,
      this.video.videoHeight
    );
  }
}
