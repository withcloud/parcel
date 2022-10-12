/* global $ */

import { Howl } from "howler";

export const click = new Howl({
  src: ["click.mp3"]
});

export const click1 = new Howl({
  src: ["click1.wav"]
});

export const click2 = new Howl({
  src: ["click2.wav"]
});

export const click3 = new Howl({
  src: ["click3.wav"]
});

export const click4 = new Howl({
  src: ["click4.wav"]
});

export const click5 = new Howl({
  src: ["click5.wav"]
});

click.once("load", function() {
  console.log("sound loaded");
  // click.play();
});

$("body").on("mousedown", function() {
  click.play();
});
