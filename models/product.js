const mongoose=require('mongoose')

const productSchema= new mongoose.Schema({
    name:{type:String,required:true},
    category:{type:String,required:true},
    image:{type:String,required:true},
    new_price:{type:Number,required:true},
    old_price:{type:Number},
    description:{type:String,required:true},
    rating:{type:Number,default:0},
    reviews:{type:Number,default:0},
    topTrends:{type:Boolean,default:false},
    newCollections: {type: Boolean,default: false},
    detailOne: {type: String,required: true}
});

const Product=mongoose.model('product',productSchema)

module.exports=Product