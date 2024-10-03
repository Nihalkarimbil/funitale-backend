const User=require('../models/user')
const jwt = require('jsonwebtoken')


const userReg=async(req,res)=>{
    try {
        const {name,password,email}=req.body;
        const newUser= new User({name,password,email})
        await newUser.save()
        res.status(200).json({status:'succes',message:'user registerd succesfully',data:newUser})
    } catch (error) {
        res.status(404).json(error)
    }
}

//user login
const userlogin =async(req,res)=>{
    try {
        
        const {name,password}=req.body;
        const user =await User.findOne({name})
        if(!user){
            return res.status(404).json({status:'eror',message:'user not found'})
        }
        const matching= password===user.password
        if(!matching){
            return res.status(400).json({status:'error',message:'invalid credentials'})
        }
        //creation of jwt
        const token =jwt.sign({id:user._id,name:user.name,email:user.email},process.env.JWT_KEY,{expiresIn:'1d'})
        res.status(200).json({status:'succes',message:"Login succesfull",token})
    } catch (error) {
        res.status(500).json({status:'error',message:'Login failed',error:error.message})
    }
}




module.exports={
    userReg,
    userlogin
}