"use strict";

const app = require("./app");
const { PORT } = require("./config");

const dotenv = require("dotenv");

// dotenv.config();

app.listen(PORT, function () {
  // console.log(`app is on ${process.env.ENV}`);
  console.log(`Started on http://localhost:${PORT}`);
});
