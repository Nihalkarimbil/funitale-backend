const express =require('express')
const Routes=express.Router()
const {adminAuthMiddleware}=require('../middleware/Authentication')
const admnUser=require('../Controller/Admin/admUsercontroller')
const admnProduct=require('../Controller/Admin/admProductcontroll')
const admnOrder=require('../Controller/Admin/admOrdercontroller')

Routes
    //USERS Routers
    .get('/admin/users',adminAuthMiddleware,admnUser.allUsers)
    .delete('/admin/user/:id',adminAuthMiddleware,admnUser.deleteUser)
    .get('/admin/userby/:id',adminAuthMiddleware,admnUser.viewUserbyId)
    .put('/admin/isblock/:id',admnUser.Updateuser)

    //PRODUCTS Routes
    .get('/admin/products',adminAuthMiddleware,admnProduct.allProduct)
    .get('/admin/proctby/:id',adminAuthMiddleware,admnProduct.getproductbyID)
    .post('/admin/addproduct',adminAuthMiddleware,admnProduct.addProduct)
    .put('/admin/editproduct/:id',adminAuthMiddleware,admnProduct.editProduct)
    .delete('/admin/deleteproduct/:id',adminAuthMiddleware,admnProduct.deleteProduct)
    
    //ORDERS Routes
    .get('/admin/orders',adminAuthMiddleware,admnOrder.allOrders)
    .get('/admin/orderofuder/:id',adminAuthMiddleware,admnOrder.getOrderofuserbyID)
    .delete('/admin/order/:id',adminAuthMiddleware,admnOrder.cancelOrder)

    //revenew
    .get('/admin/revenew',adminAuthMiddleware,admnOrder.TotalRevenew)

module.exports=Routes