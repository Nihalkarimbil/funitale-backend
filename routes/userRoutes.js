const express = require('express')
const routes=express();
const controller=require('../Controller/userController')


routes
    .post('/user/signup',controller.userReg)
    .post('/user/login',controller.userlogin)


module.exports=routes