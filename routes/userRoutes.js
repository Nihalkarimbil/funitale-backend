const express = require('express')
const routes=express();
const userController=require ('../Controller/userController')
const {userAuthMiddleware}=require('../middleware/Authentication')


routes
    .post('/user/signup',userController.userReg)
    .post('/user/login',userController.userlogin)
    .get('/user/products/:category',userController.productBycategory)
    .get('/user/productby/:id',userController.getproductbyID)
    .post('/user/addtocart',userController.addtocart)
    .get('/user/cart/:userID',userController.getallcartItem)


module.exports=routes