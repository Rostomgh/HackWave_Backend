const mongoose = require("mongoose");
<<<<<<< HEAD
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
  
=======
const Schema = mongoose.Schema;
const AgentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: {
      type: String,
      minlength: [8, "Password should be at least 8 characters"],
      required: true,
    },
    role: { type: String, required: false, default: "client" },
  },
  {
    timestamps: true,
  }
);
const AgentModel = mongoose.model("AgentSchema", AgentSchema);
module.exports = AgentModel;
>>>>>>> 64eb25a23d93b923c418ba00ea6f384a056f420d
