const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LinkSchema = new Schema({
  Url: {
    type: String,
    required: true,
  },
  from: {
    email: {
      type: String,  
      required: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],  
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status:{
    type:String,
  }
});
const LinkModel= mongoose.model('LinkSchema', LinkSchema)
module.exports=LinkModel

