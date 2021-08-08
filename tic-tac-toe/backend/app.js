const express = require("express");
const logic = require("./business-logic-layer/socket-logic");
const server = express();

const listener = server.listen(3001, console.log("Listening..."));
logic.start(listener);