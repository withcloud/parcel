const express = require("express");
const path = require("path");
const _ = require("lodash");

const app = express();

const state = {};

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

app.listen(3000, () => console.log("Listening on port 3000!"));
