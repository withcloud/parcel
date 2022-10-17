const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const path = require("path");
const _ = require("lodash");

const app = express();

const state = {};

app.use(cors());

app.use(express.static(path.join(__dirname, "..", "..", "dist")));

app.get("/api/state", (req, res) => {
  res.json(state);
});

app.use(express.json());

app.post("/api/state", (req, res) => {
  const input = req.body;

  Object.keys(input).forEach(key => {
    _.set(state, key, input[key]);
  });

  return res.json(state);
});

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
