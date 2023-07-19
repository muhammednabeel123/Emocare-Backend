const c_mongoose = require('mongoose')
const Schema = c_mongoose.Schema

const C_schema = new c_mongoose.Schema({
    name:{
        type:String,
      
    },
    email:{
        type:String,
       
    },
    password:{
        type:String,
        
    },
    state:{
        type:String
    },
    address:{
        type:Array
    },
    
    country:{
        type:String
    },
    pincode:{
        type:Number
    },
    experience:{
        type:Number
    },
    id_proof:{
        type:String,
       
    },
    id_proofPublicId:{
        type:String
    },
    certificates:{
        type:String 
    },
    certificatesPublicId:{
        type:String
    },
    fee:{
        type:Number
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    is_Blocked:{
        type:Boolean,
        default:false
    },
    revenue:{
        type:Number
    },
    Image:{
        type:String
    },
    profile_PublicId:{
        type:String
    },
    service:{
        type:Schema.Types.ObjectId,
        ref: "Service",
    }
})

module.exports = c_mongoose.model("Counselor",C_schema)