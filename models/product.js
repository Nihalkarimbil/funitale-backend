const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({

    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, 
    name: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },
    new_price: { type: Number, required: true, min: 0 }, 
    old_price: { type: Number, min: 0 },
    description: { type: String, required: true },
    rating: { type: Number, default: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 }, 
    topTrends: { type: Boolean, default: false },
    newCollections: { type: Boolean, default: false },
    detailOne: { type: String, required: true }
});


const Product = mongoose.model('Product', productSchema);
module.exports = Product;
