const express =require('express')
const Routes=express.Router()
const {adminAuthMiddleware}=require('../middleware/Authentication')
const admnUser=require('../Controller/Admin/admUsercontroller')
const admnProduct=require('../Controller/Admin/admProductcontroll')
const admnOrder=require('../Controller/Admin/admOrdercontroller')
const tryCatch=require('../utils/trycatch')


Routes
    //USERS Routers
    .get('/admin/users',adminAuthMiddleware, tryCatch(admnUser.allUsers))
    .delete('/admin/user/:id',adminAuthMiddleware, tryCatch(admnUser.deleteUser))
    .get('/admin/userby/:id',adminAuthMiddleware, tryCatch(admnUser.viewUserbyId))
    .put('/admin/isblock/:id',adminAuthMiddleware, tryCatch(admnUser.Updateuser))

    //PRODUCTS Routes
    .get('/admin/products',adminAuthMiddleware, tryCatch(admnProduct.allProduct))
    .get('/admin/proctby/:id',adminAuthMiddleware, tryCatch(admnProduct.getproductbyID))
    .post('/admin/addproduct',adminAuthMiddleware, tryCatch(admnProduct.addProduct))
    .put('/admin/editproduct/:id',adminAuthMiddleware, tryCatch(admnProduct.editProduct))
    .delete('/admin/deleteproduct/:id',adminAuthMiddleware, tryCatch(admnProduct.deleteProduct))
    
    //ORDERS Routes
    .get('/admin/orders',adminAuthMiddleware, tryCatch(admnOrder.allOrders))
    .get('/admin/orderofuder/:id',adminAuthMiddleware, tryCatch(admnOrder.getOrderofuserbyID))
    .delete('/admin/order/:id',adminAuthMiddleware, tryCatch(admnOrder.cancelOrder))

    //revenew
    .get('/admin/revenew',adminAuthMiddleware,tryCatch(admnOrder.TotalRevenew))

module.exports=Routes