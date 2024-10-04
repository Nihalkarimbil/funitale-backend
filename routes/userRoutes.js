const express = require('express')
const routes=express();
const userController=require ('../Controller/userController')


routes
    .post('/user/signup',userController.userReg)
    .post('/user/login',userController.userlogin)
    .get('/user/products/:category',userController.productBycategory)
    .get('/user/productby/:id',userController.getproductbyID)


module.exports=routes