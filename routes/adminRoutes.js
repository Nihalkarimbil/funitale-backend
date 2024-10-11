const express =require('express')
const Routes=express.Router()
const {adminAuthMiddleware}=require('../middleware/Authentication')
const adminController=require('../Controller/adminController')


Routes
    //USERS Routers
    .get('/admin/users',adminController.allUsers)
    .delete('/admin/user/:id',adminController.deleteUser)
    .get('/admin/userby/:id',adminController.viewUserbyId)
    .put('/admin/isblock/:id',adminController.Updateuser)

    //PRODUCTS Routes
    .get('/admin/products',adminController.allProduct)
    .get('/admin/proctby/:id',adminController.getproductbyID)
    .post('/admin/addproduct',adminController.addProduct)
    .put('/admin/editproduct/:id',adminController.editProduct)
    
    //ORDERS Routes
    .get('/admin/orders',adminController.allOrders)

module.exports=Routes