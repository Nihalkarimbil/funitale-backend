const express = require('express')
const routes=express();
const userController=require ('../Controller/userController')
const {userAuthMiddleware}=require('../middleware/Authentication')


routes
    //user LOGIN/REGISTER
    .post('/user/signup',userController.userReg)
    .post('/user/login',userController.userlogin)

    //Product View
    .get('/user/products/:category',userController.productBycategory)
    .get('/user/productby/:id',userController.getproductbyID)

    //CART Routes
    .post('/user/addtocart',userAuthMiddleware,userController.addtocart)
    .get('/user/cart/',userAuthMiddleware,userController.getallcartItem)
    .put('/user/updatecart',userAuthMiddleware,userController.updatecartitem)
    .delete('/user/deletecart',userAuthMiddleware,userController.deleteCart)
    .delete('/user/clearcart',userAuthMiddleware,userController.clearAllCart)

    //WISHLIST Routes
    .post('/user/addwish',userAuthMiddleware,userController.addToWishlist)
    .get('/user/wishlist',userAuthMiddleware,userController.getwishlist)
    .delete('/user/removewish',userAuthMiddleware,userController.removewish)

    //ORDER Routes
    .post('/user/addOrder',userAuthMiddleware,userController.CreateOrder)
    .post('/user/verifyorder',userAuthMiddleware,userController.verifyOrder)
    .get('/user/getAllorders',userAuthMiddleware,userController.GetAllorders)
    .delete('/user/order/:orderId',userAuthMiddleware,userController.cancelOrder)

module.exports=routes 