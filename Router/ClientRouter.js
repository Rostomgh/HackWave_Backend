const express = require("express");
<<<<<<< HEAD
const routeClient= express.Router();
const { submitForm, getForm } = require("../Controller/ClientController");

routeClient.post("/submitForm", submitForm);
routeClient.get("/getForm", getForm); 
=======
const routeClient = express.Router();
const {
  submitForm,
  getForm,
  getStats,
  getUser,
  getSubmissions,
  getUserLinksController,
  sendSubmission,
  getMySubmissions,
} = require("../Controller/ClientController");
const jwtMiddleware = require("../Middleware/jwtMiddleware");
const { deleteUser } = require("../Controller/AgentController");

routeClient.post("/submitForm", jwtMiddleware, submitForm);
routeClient.post("/submission", jwtMiddleware, sendSubmission);

routeClient.delete("/user/:id", jwtMiddleware, deleteUser);

routeClient.get("/getForm/:id", jwtMiddleware, getForm);
routeClient.get("/stats", jwtMiddleware, getStats);
routeClient.get("/users", jwtMiddleware, getUserLinksController);
routeClient.get("/user/:id", jwtMiddleware, getUser);
routeClient.get("/submissions", jwtMiddleware, getSubmissions);
routeClient.get("/mysubmissions/:userId", jwtMiddleware, getMySubmissions);
>>>>>>> 64eb25a23d93b923c418ba00ea6f384a056f420d

module.exports = routeClient;
