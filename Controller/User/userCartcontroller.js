const { custom } = require('joi');
const Cart = require('../../models/Cart')
const CustomError = require('../../utils/customError')

//add to cart
const addtocart = async (req, res) => {

    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id }).populate('products.productId');

    if (!cart) {
        const newCart = new Cart({
            user: req.user.id,
            products: [{ productId, quantity }]
        });
        await newCart.save();

        const cartsend = await newCart.populate('products.productId');
        return res.status(201).json(cartsend);
    }

    console.log('Incoming productId:', productId);

    const existingProduct = cart.products.find(
        (product) => product.productId._id.toString() === productId.toString()
    );

    console.log('Existing Product:', existingProduct);

    if (existingProduct) {
        existingProduct.quantity += quantity;
        console.log('Updated Quantity:', existingProduct.quantity);
    } else {
        cart.products.push({ productId, quantity });
    }

    await cart.save();
    const updatedCart = await cart.populate('products.productId');
    res.status(200).json(updatedCart);


};

//get all cartitem
const getallcartItem = async (req, res, next) => {

    const cart = await Cart.findOne({ user: req.user.id }).populate('products.productId');
    if (!cart) {

        return next(new CustomError('Cart not found', 400))
    }
    res.status(200).json(cart);
};


//updatecartitem
const updatecartitem = async (req, res, next) => {

    const { productId, action } = req.body;
    console.log(productId)

    const cartData = await Cart.findOne({ user: req.user.id }).populate('products.productId');
    console.log("cartdata" + cartData);

    if (!cartData) {
        return next(new CustomError("cart not found", 404))
    }

    const cartProduct = cartData.products.find(pro => pro.productId._id.toString() == productId);
    console.log("product" + cartProduct)


    if (!cartProduct) {
        return next(new CustomError('product with this id is not found', 404))
    }

    if (action === "increment") {
        cartProduct.quantity += 1;
    } else if (action === 'decrement') {
        if (cartProduct.quantity > 1) {
            cartProduct.quantity -= 1;
        } else {
            cartData.products = cartData.products.filter(valu => valu.productId._id.toString() !== productId);
        }
    } else {
        return next(new CustomError('invalid action', 400))
    }

    await cartData.save();

    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('products.productId');
    res.status(200).json({ products: updatedCart.products || [] });
};



//deletecart item
const deleteCart = async (req, res, next) => {

    const { productId } = req.body;
    const prodata = await Cart.findOne({ user: req.user.id }).populate('products.productId');
    if (!prodata) {
        return next(new CustomError("Cart not found", 404))
    }

    const productindex = prodata.products.findIndex(pro => pro.productId._id.toString() == productId);
    prodata.products.splice(productindex, 1);

    await prodata.save();

    return res.status(200).json(prodata || []);

}


//clear all cart data after payment
const clearAllCart = async (req, res, next) => {

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return next(new CustomError('Cart not found', 404))
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({ message: 'Cart cleared successfully' });

};


module.exports = {
    addtocart,
    getallcartItem,
    updatecartitem,
    deleteCart,
    clearAllCart,
}