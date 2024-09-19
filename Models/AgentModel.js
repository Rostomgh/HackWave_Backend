const Schema= mongoose.Schema
const AgentSchema = new Schema({
  name:{type:String,required:true},
  email:{type:String,required:true},
  password:{type:String,required:true},
  phone:{type:String,required:true},
  //role:{type:String,required:true},
  })
const AgentModel= mongoose.model('AgentSchema', AgentSchema)
module.exports=AgentSchema

  
