const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());
const Port = 3000;
//Route Test
app.get("/", (req, res) => {
  res.send("Hello World");
});
// Path Route
const routerAgent = require("./Router/AgentRouter");

//Router
app.use("/api/v1/agent", routerAgent);

const start = async () => {
  try {
    await connectDB(MONGOO_URI); // Ensure the connectDB function is called with the correct URI
    app.listen(Port, () => {
      console.log(`http://localhost:${Port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

start();
