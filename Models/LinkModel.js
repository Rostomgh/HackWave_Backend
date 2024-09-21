const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LinkSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "pending",
  },
  message: {
    type: String,
    default: "",
  },
});
const LinkModel = mongoose.model("LinkSchema", LinkSchema);
module.exports = LinkModel;
