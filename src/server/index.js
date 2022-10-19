const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const path = require("path");
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");

const app = express();

const state = {};
const rooms = {};

app.use(cors());

app.use(express.static(path.join(__dirname, "..", "..", "dist")));

app.get("/api/state", (req, res) => {
  const { name } = req.query;

  if (!name || !state[name]) return res.json({});

  const roomId = state[name].roomId;

  res.json({
    ...state[name],
    room: roomId ? rooms[roomId] : undefined
  });
});

app.use(express.json());

app.post("/api/state", (req, res) => {
  const input = req.body;
  const name = input.name;

  if (!name) return res.json({});

  state[name] = {
    ...input
  };

  const roomId = state[name].roomId;

  // this.postState({
  //   id: uuidv4(),
  //   name: this.name,
  //   state: "state7",
  //   roomId: this.data.roomId,
  //   score: this.vsP1Score
  // });

  if (input.state === "state7" && roomId && input.score && rooms[roomId]) {
    // found room
    const room = rooms[roomId];
    // found me
    const p = name === room.players[0].name ? room.players[0] : room.players[1];
    p.score = input.score;
  }

  res.json({
    ...state[name],
    room: roomId ? rooms[roomId] : undefined
  });
});

setInterval(() => {
  const arr = _.values(state);
  const players = _.filter(arr, p => !p.roomId && p.state === "state6");
  if (players.length >= 2) {
    const roomId = uuidv4();
    players[0].roomId = roomId;
    players[1].roomId = roomId;
    rooms[roomId] = {
      id: roomId,
      players: [
        {
          name: players[0].name,
          id: players[0].id,
          score: 0
        },
        {
          name: players[1].name,
          id: players[1].id,
          score: 0
        }
      ]
    };
  }
}, 1000);

https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert")
    },
    app
  )
  .listen(3000, () => {
    console.log("Listening...");
  });
