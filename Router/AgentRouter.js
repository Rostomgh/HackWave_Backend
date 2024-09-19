const express = require("express");
const routerAgent = express.Router();
const { signup, login } = require("../Controller/AgentController");

routerAgent.post("/signup", signup);
routerAgent.post("/login", login);

module.exports = routerAgent;
