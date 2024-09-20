const mongoose = require("mongoose");
const Schema= mongoose.Schema
const AgentSchema = new Schema({
  
  name:{type:String,required:true},
  email:{type:String,required:true},
  password: {
    type: String,
    minlength: [8, "Password should be at least 8 characters"],
    required: true,
  },
  role:{type:String,required:false},
  },
  {
    timestamps: true  
  });
const AgentModel= mongoose.model('AgentSchema', AgentSchema)
module.exports=AgentModel
  
