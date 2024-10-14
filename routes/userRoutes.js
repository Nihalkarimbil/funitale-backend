const express = require('express')
const routes=express.Router();
const userController=require ('../Controller/userController')
const {userAuthMiddleware}=require('../middleware/Authentication')
const userproduct =require('../Controller/User/userProductcontroll')
const userCart=require('../Controller/User/userCartcontroller')
const userwish =require('../Controller/User/userWishlistcontroller')
const userOrder=require('../Controller/User/userOrdercontroller')


routes
    //user LOGIN/REGISTER/LOGOUT
    .post('/user/signup',userController.userReg)
    .post('/user/login',userController.userlogin)
    .post('/user/logout',userController.userLogout)

    //Product View
    .get('/user/products/:category',userproduct.productBycategory)
    .get('/user/productby/:id',userproduct.getproductbyID)

    //CART Routes
    .post('/user/addtocart',userAuthMiddleware,userCart.addtocart)
    .get('/user/cart/',userAuthMiddleware,userCart.getallcartItem)
    .put('/user/updatecart',userAuthMiddleware,userCart.updatecartitem)
    .delete('/user/deletecart',userAuthMiddleware,userCart.deleteCart)
    .delete('/user/clearcart',userAuthMiddleware,userCart.clearAllCart)

    //WISHLIST Routes
    .post('/user/addwish',userAuthMiddleware,userwish.addToWishlist)
    .get('/user/wishlist',userAuthMiddleware,userwish.getwishlist)
    .delete('/user/removewish',userAuthMiddleware,userwish.removewish)

    //ORDER Routes
    .post('/user/addOrder',userAuthMiddleware,userOrder.CreateOrder)
    .post('/user/verifyorder',userAuthMiddleware,userOrder.verifyOrder)
    .get('/user/getAllorders',userAuthMiddleware,userOrder.GetAllorders)
    .delete('/user/order/:id',userAuthMiddleware,userOrder.cancelOrder)

module.exports=routes 