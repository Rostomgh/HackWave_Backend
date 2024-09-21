const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());
const connectDB = require("./config/Db");
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

//Route Test
app.get("/", (req, res) => {
  res.send("Hello World");
});

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
    app.listen(Port, () => {
      console.log(`http://localhost:${Port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

start();
