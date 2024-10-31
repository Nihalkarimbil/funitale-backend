const express = require('express')
const routes=express.Router();
const userController=require ('../Controller/userController')
const {userAuthMiddleware}=require('../middleware/Authentication')
const userproduct =require('../Controller/User/userProductcontroll')
const userCart=require('../Controller/User/userCartcontroller')
const userwish =require ('../Controller/User/userWishlistcontroller')
const userOrder=require('../Controller/User/userOrdercontroller')
const tryCatch=require('../utils/trycatch')



routes

    //user LOGIN/REGISTER/LOGOUT
    .post('/user/signup',tryCatch(userController.userReg))
    .post('/user/login',tryCatch(userController.userlogin))
    .post('/user/logout',tryCatch(userController.userLogout))

    //Product View
    .get('/user/products/:category',tryCatch(userproduct.productBycategory))
    .get('/user/productby/:id',tryCatch(userproduct.getproductbyID))
    .get('/user/product', tryCatch(userproduct.allProduct))

    //CART Routes
    .post('/user/addtocart',userAuthMiddleware, tryCatch(userCart.addtocart))
    .get('/user/cart',userAuthMiddleware, tryCatch(userCart.getallcartItem))
    .put('/user/updatecart',userAuthMiddleware, tryCatch(userCart.updatecartitem))
    .delete('/user/deletecart',userAuthMiddleware, tryCatch(userCart.deleteCart))
    .delete('/user/clearcart',userAuthMiddleware, tryCatch(userCart.clearAllCart))

    //WISHLIST Routes
    .post('/user/addwish',userAuthMiddleware, tryCatch(userwish.addToWishlist))
    .get('/user/wishlist',userAuthMiddleware, tryCatch(userwish.getwishlist))
    .delete('/user/removewish',userAuthMiddleware,userwish.removewish)

    //ORDER Routes
    .post('/user/addOrder',userAuthMiddleware, tryCatch(userOrder.CreateOrder))
    .post('/user/verifyorder/:sessionID',userAuthMiddleware, tryCatch(userOrder.verifyOrder))
    .get('/user/getAllorders',userAuthMiddleware, tryCatch(userOrder.GetAllorders))
    .get('/user/getorderbyID/:sessionID',userAuthMiddleware, tryCatch(userOrder.getOrderById))
    .delete('/user/order/:id',userAuthMiddleware, tryCatch(userOrder.cancelOrder))

module.exports=routes 