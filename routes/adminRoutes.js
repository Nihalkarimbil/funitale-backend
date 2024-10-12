const express =require('express')
const Routes=express.Router()
const {adminAuthMiddleware}=require('../middleware/Authentication')
const adminController=require('../Controller/Admin/admOrdercontroller')
const admnuser=require('../Controller/Admin/admUsercontroller')
const admproduct=require('../Controller/Admin/admProductcontroll')
const admorder=require('../Controller/Admin/admOrdercontroller')

Routes
    //USERS Routers
    .get('/admin/users',admnuser.allUsers)
    .delete('/admin/user/:id',admnuser.deleteUser)
    .get('/admin/userby/:id',admnuser.viewUserbyId)
    .put('/admin/isblock/:id',admnuser.Updateuser)

    //PRODUCTS Routes
    .get('/admin/products',admproduct.allProduct)
    .get('/admin/proctby/:id',admproduct.getproductbyID)
    .post('/admin/addproduct',admproduct.addProduct)
    .put('/admin/editproduct/:id',admproduct.editProduct)
    .delete('/admin/deleteproduct/:id',admproduct.deleteProduct)
    
    //ORDERS Routes
    .get('/admin/orders',admorder.allOrders)
    .get('/admin/orderofuder/:id',admorder.getOrderofuserbyID)
    .delete('/admin/order/:id',admorder.cancelOrder)

    //revenew
    .get('/admin/revenew',admorder.TotalRevenew)

module.exports=Routes