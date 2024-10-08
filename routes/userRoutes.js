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
    .get('/user/cart/:userID',userAuthMiddleware,userController.getallcartItem)
    .put('/user/updatecart',userAuthMiddleware,userController.updatecartitem)
    .delete('/user/deletecart',userAuthMiddleware,userController.deleteCart)
    .delete('/user/clearcart/:id',userAuthMiddleware,userController.clearAllCart)
    .post('/user/addwish',userAuthMiddleware,userController.addToWishlist)
    .get('/user/wishlist/:userID',userAuthMiddleware,userController.getwishlist)
    .delete('/user/removewish',userAuthMiddleware,userController.removewish)
    .post('/user/addOrder',userController.CreateOrder)

module.exports=routes 