const express = require("express");
const app = express();
<<<<<<< HEAD
const mongoose = require("mongoose");
=======
>>>>>>> 64eb25a23d93b923c418ba00ea6f384a056f420d
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());
const connectDB = require("./config/Db");
<<<<<<< HEAD
const cors=require("cors")
const Port = 5000;

//cors
app.use(cors({
  origin: "*",
  
}))
=======
const cors = require("cors");
const path = require("path");

const Port = 3000;

//cors
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

>>>>>>> 64eb25a23d93b923c418ba00ea6f384a056f420d
//Route Test
app.get("/", (req, res) => {
  res.send("Hello World");
});
<<<<<<< HEAD
// Path Route
const routerAgent = require("./Router/AgentRouter");
const routeClient= require("./Router/ClientRouter");
const routeBotVerify = require("./Util/VerifyWebSite");


//Router
app.use("/api/v1/agent", routerAgent);
app.use("/api/v1/client",routeClient);

app.post("/api/v1/botverify", routeBotVerify.verifyWebsite);

const start = async () => { 
  try {
    console.log(process.env.MONGOO_URI);
    
    await connectDB(process.env.MONGOO_URI); 
=======

// Path Route
const routerAgent = require("./Router/AgentRouter");
const routeClient = require("./Router/ClientRouter");
const routeBotVerify = require("./Util/VerifyWebSite");

//Router
app.use("/api/v1/agent", routerAgent);
app.use("/api/v1/client", routeClient);
app.post("/api/v1/botverify", routeBotVerify.verifyWebsite);

const start = async () => {
  try {
    await connectDB(process.env.MONGOO_URI);
>>>>>>> 64eb25a23d93b923c418ba00ea6f384a056f420d
    app.listen(Port, () => {
      console.log(`http://localhost:${Port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};
<<<<<<< HEAD
=======

>>>>>>> 64eb25a23d93b923c418ba00ea6f384a056f420d
start();
