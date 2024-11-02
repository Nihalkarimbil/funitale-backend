const express =require('express')
const Routes=express.Router()
const {adminAuthMiddleware}=require('../middleware/Authentication')
const admnUser=require('../Controller/Admin/admUsercontroller')
const admnProduct=require('../Controller/Admin/admProductcontroll')
const admnOrder=require('../Controller/Admin/admOrdercontroller')
const tryCatch=require('../utils/trycatch')
const upload=require('../middleware/imageUploade')

Routes
    //USERS Routers
    .get('/admin/users',adminAuthMiddleware, tryCatch(admnUser.allUsers))
    .delete('/admin/user/:id',adminAuthMiddleware, tryCatch(admnUser.deleteUser))
    .get('/admin/userby/:id',adminAuthMiddleware, tryCatch(admnUser.viewUserbyId))
    .put('/admin/isblock/:id',adminAuthMiddleware, tryCatch(admnUser.Updateuser))
    .get('/admin/usersSum',adminAuthMiddleware, tryCatch(admnUser.allUserssum))

    //PRODUCTS Routes
    .get('/admin/products',adminAuthMiddleware, tryCatch(admnProduct.allProduct))
    .get('/admin/proctby/:id',adminAuthMiddleware, tryCatch(admnProduct.getproductbyID))
    .post('/admin/addproduct',adminAuthMiddleware,upload.single('image'), tryCatch(admnProduct.addProduct))
    .put('/admin/editproduct/:id',adminAuthMiddleware,upload.single('image') ,tryCatch(admnProduct.editProduct))
    .delete('/admin/deleteproduct/:id',adminAuthMiddleware, tryCatch(admnProduct.deleteProduct))
    .get('/admin/productsSum',adminAuthMiddleware, tryCatch(admnProduct.totalproductsum))
    
    //ORDERS Routes
    .get('/admin/orders',adminAuthMiddleware, tryCatch(admnOrder.allOrders))
    .get('/admin/orderofuser/:id',adminAuthMiddleware, tryCatch(admnOrder.getOrderofuserbyID))
    .delete('/admin/order/:id',adminAuthMiddleware, tryCatch(admnOrder.cancelOrder))
    .get('/admin/ordersSum',adminAuthMiddleware, tryCatch(admnOrder.allOrderssum))
    .put('/admin/shipupdate/:id',adminAuthMiddleware,tryCatch(admnOrder.shippingupdate))
    //revenew
    .get('/admin/revenew',adminAuthMiddleware,tryCatch(admnOrder.TotalRevenew))

module.exports=Routes