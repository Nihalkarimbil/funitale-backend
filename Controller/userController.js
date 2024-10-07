const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { JoiUserSchema } = require('../models/validation')
const bcrypt = require('bcrypt')
const products = require('../models/product')
const Cart = require('../models/Cart')
const Wishlist = require('../models/Wishlist')
const user = require('../models/user')


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
        const { userID, productId, quantity } = req.body;
        let cart = await Cart.findOne({ user: userID }).populate('products.productId');

        if (!cart) {
            const newCart = new Cart({
                user: userID,
                products: [{ productId, quantity }]
            });
            await newCart.save();

            const cartsend = await newCart.populate('products.productId');
            return res.status(201).json(cartsend);
        }

        const existingProduct = cart.products.find(
            (product) => product.productId.toString() === productId
        );

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.products.push({ productId, quantity });
        }
        await cart.save();
        const updateCart = await cart.populate('products.productId');
        res.status(200).json(updateCart);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in add to cart', error });
    }
};
//get all cartitem
const getallcartItem = async (req, res) => {
    try {
        const { userID } = req.params;
        const cart = await Cart.findOne({ user: userID }).populate('products.productId');
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

        const cartData = await Cart.findOne({ user: req.user.id }).populate('products.productId');

        if (!cartData) {
            return res.status(404).json({ message: "cart not found" });
        }

        const cartProduct = cartData.products.find(pro => pro.productId.toString() === productId);

        if (!cartProduct) {
            return res.status(404).json({ message: 'product with this id is not found' });
        }

        if (action === "increment") {
            cartProduct.quantity += 1;
        } else if (action === 'decrement') {
            if (cartProduct.quantity > 1) {
                cartProduct.quantity -= 1;
            } else {
                cartData.products = cartData.products.filter(valu => valu.productId.toString() !== productId);
            }
        } else {
            return res.status(400).json({ message: 'invalid action' });
        }

        await cartData.save();

        const updatedCart = await Cart.findOne({ user: req.user.id }).populate('products.productId');
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
const clearAllCart = async (req, res) => {
    try {
        const { userID } = req.params;
        const cart = await Cart.findOne({ userID });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Clear the products array
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
        const { productId, userID } = req.body;
        const wishlist = await Wishlist.findOne({ user: userID });

        if (!wishlist) {
            const newWishlist = new Wishlist({
                user: userID,
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
        const { userID } = req.params;
        console.log(userID)
       
        const wishlist = await Wishlist.findOne({ user: userID }).populate('products');

        if (!wishlist) {
            // If no wishlist exists, create a new one
            const newWish = new Wishlist({
                user: userID, // Make sure this is assigned correctly
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
const removewish=async(req,res)=>{
    try {
        const {productId}=req.body;
        const data= await Wishlist.findOne({user:req.user.id}).populate('products')
        if (!data){
            return res.status(404).json({message:'wishlist not found'})
        }
        const productindex = data.products.findIndex(pro => pro.productId.toString() === productId)
        prodata.splice(productindex, 1)
        await data.save()
        res.status(200).json(data || [])
    } catch (error) {
        res.status(404).json('there have an error')
    }
}





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
    removewish

}