const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { JoiUserSchema } = require('../models/validation')
const bcrypt = require('bcrypt')
const products = require('../models/product')
const Cart = require('../models/Cart')


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
    if (error) {
        throw new error
    }

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
        res.status(200).json({ status: 'succes', message: "Logined succesfully", token })
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'none'
        });
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




module.exports = {
    userReg,
    userlogin,
    productBycategory,
    getproductbyID,
    addtocart,
    getallcartItem
}