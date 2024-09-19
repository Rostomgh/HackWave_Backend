const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LinkSchema = new Schema({
  Url: {
    type: String,
    required: true,
  },
  from: {
    email: {
      type: String,  // The correct type for email is String
      required: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],  // Regex to validate email format
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Link", LinkSchema);
