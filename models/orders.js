const  mongoose  = require('mongoose')



const orderSchema=new mongoose.Schema({
    userID:{type:mongoose.Schema.ObjectId,ref:'User'},
    products:[{
        productId : {type:mongoose.Schema.ObjectId,ref:'Product',required:true},
        quantity:{type:Number,required:true,default:1}
    }],
    sessionID:{type:String},
    purchaseDate:{type:Date,default:Date.now},
    amount:{type:Number,required:true},
    paymentStatus:{type:String,enum:["pending",'completed',"cancelled"],default:'pending'},
    shippingStatus: { type: String,enum:['pending',"Processing",'completed',"cancelled"] ,default: "pending" }

})

module.exports=mongoose.model('Order',orderSchema)