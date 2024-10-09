const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { JoiUserSchema } = require('../models/validation')
const bcrypt = require('bcrypt')
const products = require('../models/product')
const Cart = require('../models/Cart')
const Wishlist = require('../models/Wishlist')
const stripe = require('stripe')(process.env.STRIPE_KEY)
const Order = require('../models/orders')


//user register
const userReg = async (req, res) => {
    const { value, error } = JoiUserSchema.validate(req.body)
    const { username, password, confpassword, email } = value

    if (error) {
        throw new error
    }

    try {
        const hashedpassword = await bcrypt.hash(password, 8)
        const newUser = new User({ username, password: hashedpassword, confpassword, email })
        await newUser.save()
        res.status(200).json({ status: 'succes', message: 'Registerd succesfully', data: newUser })

    } catch (error) {
        res.status(404).json(error)
    }

}

//user login
const userlogin = async (req, res) => {
    const { value, error } = JoiUserSchema.validate(req.body)
    const { username, password } = value;

    try {
        //admin login jwt
        const adminName = process.env.ADMIN_USERNAME
        const adminPass = process.env.ADMIN_PASSWORD
        if (username === adminName && password === adminPass) {
            console.log('admin logged')
            const token = jwt.sign(
                { id: 'admin', admin: true }, process.env.JWT_KEY, { expiresIn: '1d' }
            )
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000,
            });
            return res.status(200).json({ token, admin: true });
        }
        //user login and jwt

        const user = await User.findOne({ username })
        if (!user) {
            return res.status(404).json({ status: 'eror', message: 'user not found' })
        }
        const matching = await bcrypt.compare(password, user.password)
        if (!matching) {
            return res.status(400).json({ status: 'error', message: 'invalid credentials' })
        }

        const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_KEY, { expiresIn: '1d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'none'
        });
        res.status(200).json({ status: 'succes', message: "Logined succesfully", token })
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Login failed', error: error.message })
    }
}


//get products by category
const productBycategory = async (req, res) => {
    try {
        const product = await products.find({ category: req.params.category })
        res.json(product)
    } catch (error) {
        res.status(500).json(error)
    }
}



//get product by ID
const getproductbyID = async (req, res) => {
    try {
        const oneProduct = await products.findById(req.params.id)
        if (!oneProduct) {
            res.status(404).json({ message: "product not found" })
        }
        res.json(oneProduct)
    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
}



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
        const prodata = await Cart.findOne({ user: req.user.id }).populate('products.productId')
        if (!prodata) {
            res.status(404).json({ message: 'Cart not found' })
        }
        const productindex = prodata.products.findIndex(pro => pro.productId.toString() === productId)
        prodata.splice(productindex, 1)
        await prodata.save()
        res.status(200).json(prodata || [])
    } catch (error) {
        console.log(error)
        res.status(404).json('product not found')
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


//add to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const wishlist = await Wishlist.findOne({ user: req.user.id});

        if (!wishlist) {
            const newWishlist = new Wishlist({
                user: req.user.id ,
                products: [productId]
            });

            await newWishlist.save();
            return res.status(200).json(newWishlist);
        }

        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
            return res.status(200).json(wishlist);
        }
        res.status(200).json({ message: 'Product already added to wishlist' });
    } catch (error) {
        console.error('Error in adding to wishlist:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

//get all wish list products
const getwishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');

        if (!wishlist) {
            const newWish = new Wishlist({
                user: req.user.id ,
                products: [],
            });

            await newWish.save();
            return res.status(200).json(newWish);
        }

        return res.status(200).json(wishlist);
    } catch (error) {
        console.error('Error while fetching wishlist:', error);
        res.status(500).json({ error: 'An error occurred while viewing the wishlist.' });
    }
};

//delete wishlist
const removewish = async (req, res) => {
    try {
        const { productId } = req.body;
        const data = await Wishlist.findOne({ user: req.user.id }).populate('products')
        if (!data) {
            return res.status(404).json({ message: 'wishlist not found' })
        }
        const productindex = data.products.findIndex(pro => pro._id.toString() === productId)
        data.products.splice(productindex, 1)
        await data.save()
        res.status(200).json(data || [])
    } catch (error) {
        console.log(error);

        res.status(404).json('there have an error')
    }
}

//order Creation
const CreateOrder = async (req, res) => {
    try {
        
        const userCart = await Cart.findOne({ user: req.user.id }).populate("products.productId");
        if (!userCart) {
            return res.status(404).json('User cart not found');
        }

        const totalPrice = Math.round(

            userCart.products.reduce((total, item) => {
                const price = parseFloat(item.productId.new_price);
                const quantity = parseInt(item.quantity);
                if (isNaN(price) || isNaN(quantity)) {
                    throw new Error('Invalid product price or quantity');
                }

                return total + price * quantity;
            }, 0)
        )
        console.log(totalPrice);

        // const lineItems = userCart.products.map(item => ({
        //     price_data: {
        //         currency: 'INR',
        //         product_data: {
        //             name: item.productId.name,
        //             images: [item.productId.image]
        //         },
        //         unit_amount: Math.round(item.productId.new_price * 100) 
        //     },
        //     quantity: item.quantity
        // }));

        // const session = await stripe.checkout.sessions.create({
        //     payment_method_types: ['card'],  
        //     line_items: lineItems,           
        //     mode: 'payment',
        //     success_url: `${process.env.URL_FRONTEND}/success-order`,
        //     cancel_url: `${process.env.URL_FRONTEND}/cancel-order`
        // });


        const newOrder = new Order({
            userID: req.user.id,
            products: userCart.products,
            sessionID: 23452343,
            amount: totalPrice,
            paymentStatus: 'pending'
        });


        const savedOrder = await newOrder.save();
        await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { products: [] } });

        res.status(200).json({ savedOrder });

    } catch (error) {
        console.log(error);
        res.status(500).json('Error adding order');
    }
};


//verify order

const verifyOrder = async (req, res) => {
    try {
        const { session_ID } = req.body;
        const order = await Order.findOne({ sessionID: session_ID });

        if (!order) {
            return res.status(404).json('Order not found');
        }

        if (order.paymentStatus === 'completed') {
            return res.status(400).json('Product already updated');
        }

        order.paymentStatus = 'completed';
        order.shippingStatus = 'Processing'
        const updatedOrder = await order.save();

        res.status(200).json({ message: 'Order successfully updated', updatedOrder });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error verifying order' });
    }
};


//get all orders

const GetAllorders = async (req,res) => {
    try {
        
        const allOrders=await Order.find({ userID: req.user.id }).populate("products.productId")
        
        if (!allOrders || allOrders.length === 0) {
            return res.status(404).json('No orders found');
        }

        res.status(200).json(allOrders)
    } catch (error) {
        console.log(error)
        res.status(500).json('there is an error on geting orders')
    }

}


//Cancel Order
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const orderById = await Order.findById(orderId); 

        if (!orderById) {
            return res.status(404).json("Order with this ID is not found");
        }
        
        if (orderById.paymentStatus === "completed") {
            return res.status(400).json('Cannot cancel this order, already paid');
        }

        orderById.paymentStatus = 'cancelled';
        orderById.shippingStatus = 'cancelled';

  
        await orderById.save();

        res.status(200).json('Order successfully cancelled');

    } catch (error) {
        console.log(error);
        res.status(500).json('There is an error on cancelling the order');
    }
};





module.exports = {
    //user login and register
    userReg,
    userlogin,
    //getting products
    productBycategory,
    getproductbyID,
    //Cart 
    addtocart,
    getallcartItem,
    updatecartitem,
    deleteCart,
    clearAllCart,
    //wishlist
    addToWishlist,
    getwishlist,
    removewish,
    //orders
    CreateOrder,
    verifyOrder,
    GetAllorders,
    cancelOrder
}