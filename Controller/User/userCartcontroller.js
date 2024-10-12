const Cart = require('../../models/Cart')

//add to cart
const addtocart = async (req, res) => {
    try {
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
 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in add to cart', error });
    }
};

//get all cartitem
const getallcartItem = async (req, res) => {
    try {
        
        const cart = await Cart.findOne({ user: req.user.id }).populate('products.productId');
        if (!cart) {
            return res.status(400).json({ message: "Cart not found" });
        }
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: "Cart item not found", error });
    }
};


//updatecartitem
const updatecartitem = async (req, res) => {
    try {
        const { productId, action } = req.body;

        const cartData = await Cart.findOne({ user: req.user.id}).populate('products.productId');
        console.log("cartdata"+cartData);
        
        if (!cartData) {
            return res.status(404).json({ message: "cart not found" });
        }

        const cartProduct = cartData.products.find(pro => pro.productId._id.toString() == productId);
        console.log ("product" +cartProduct)


        if (!cartProduct) {
            return res.status(404).json({ message: 'product with this id is not found' });
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
            return res.status(400).json({ message: 'invalid action' });
        }
 
        await cartData.save();

        const updatedCart = await Cart.findOne({ user: req.user.id}).populate('products.productId');
        res.status(200).json({ products: updatedCart.products || [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the cart.' });
    }
};



//deletecart item
const deleteCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const prodata = await Cart.findOne({ user: req.user.id }).populate('products.productId');
        if (!prodata) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const productindex = prodata.products.findIndex(pro => pro.productId._id.toString() == productId);
        prodata.products.splice(productindex, 1);

        await prodata.save();

        return res.status(200).json(prodata || []);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred' });
    }
}


//clear all cart data after payment
const clearAllCart = async (req, res) => {
    try {
        
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.products = [];
        await cart.save();

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error while clearing cart:', error);
        res.status(500).json({ message: 'There was an error clearing the cart' });
    }
};


module.exports={ 
    addtocart,
    getallcartItem,
    updatecartitem,
    deleteCart,
    clearAllCart,
}