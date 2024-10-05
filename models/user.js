const mongoose=require('mongoose')

const userschema = new mongoose.Schema({
    username: { type: String, required: true, trim: true }, 
    email: { type: String, required: true, unique: true, trim: true },  
    password: { type: String, required: true },  
    confpassword: { type: String, required: true },  
    admin: { type: Boolean, default: false },  
    blocked: { type: Boolean, default: false },  
   
});

module.exports=mongoose.model('User',userschema)
