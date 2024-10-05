const mongoose=require('mongoose')

const cartSchma= new mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId, ref:'User',required:true},
    products:[{
        productId:{type:mongoose.Schema.ObjectId,ref:'Product'},
        quantity:{type:Number,required:true,default:1}
    }]
})

module.exports=mongoose.model('Cart',cartSchma)