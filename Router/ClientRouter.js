const express = require("express");
const routeClient= express.Router();
const { submitForm, getForm } = require("../Controller/ClientController");

routeClient.post("/submitForm", submitForm);
routeClient.get("/getForm", getForm); 

module.exports = routeClient;
