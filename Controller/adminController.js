const User = require('../models/user')
const Product = require('../models/product')
const { JoiProductSchema}=require('../models/validation')
const Order= require('../models/orders')
//get all Users
const allUsers = async (req, res) => {
    try {
        const users = await User.find({blocked:false})
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
        res.status(404).json('users not found', error)
    }
}

//delete User By ID
const deleteUser = async (req, res) => {
    try {
        const DeleteUser = await User.findByIdAndDelete(req.params.id)
        if (!DeleteUser) {
            return res.status(404).json('there is an error')
        }
        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json('error in deleting the user', error)
    }
}


//view one user
const viewUserbyId = async (req, res) => {
    try {
        const userbyId = await User.findById(req.params.id)
        if (!userbyId) {
            return res.status(404).json('user with this Id is not found')
        }
        res.status(200).json(userbyId)

    } catch (error) {
        console.log(error)
        res.status(500).json('error on viewing user', error)
    }
}

//update user
const Updateuser = async (req, res) => {
    try {

        const user = await User.findById(req.params.id);


        if (!user) {
            return res.status(404).json({ message: 'User with this ID not found' });
        }

        if (user.blocked === true) {
            user.blocked = false;
            await user.save();
            return res.status(200).json({ message: 'User has been successfully unblocked' });
        } else {
            user.blocked = true;
            await user.save();
            return res.status(200).json({ message: 'User has been successfully blocked' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating the user' });
    }
};


//get all products
const allProduct = async (req, res) => {
    try {
        const product = await Product.find()
        if (!product) {
            return res.status(404).json('product not found')
        }
        res.status(200).json(product)
    } catch (error) {
        console.log(error)
        res.status(500).json('products not found', error)
    }
}

//get product by id
const getproductbyID = async () => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json('product with this id is not available')
        }
        res.status(200).json(product)

    } catch (error) {
        console.log(error)
        res.status(500).json('error on finding error', error)
    }
}

//add Products
const addProduct=async(req,res)=>{
    try {
        const {error,value}=JoiProductSchema.validate(req.body)
        if (error){
            return res.status(400).json(error)
        }
        const {name,category,image,new_price,description,detailOne}=value;
        const newproduct=await new Product({name,category,image,new_price,description,detailOne})
        newproduct.save()
        res.status(200).json(newproduct)

    } catch (error) {
        console.log(error)
        res.status(500).json('error on adding product',error)
    }
}


//editing of the product
const editProduct = async (req, res) => {
    const { error, value } = JoiProductSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Validation failed', details: error.details });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, value, { new: true });
        
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found with this ID' });
        }

        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error('Error while updating product:', err);
        res.status(500).json({ message: 'Error on updating product', error: err.message });
    }
};

//get all orders
const allOrders=async(req,res)=>{
    try {
        const orders=await Order.find()
        if(!orders){
            return res.status(404).json('orders Not found')
        }
        res.status(200).json(orders)
        
    } catch (error) {
        console.log(error)
        res.status(404).json('there is an error finding orders',error)
        
    }    
}



module.exports = {
    allUsers,
    deleteUser,
    viewUserbyId,
    Updateuser,
    allProduct,
    getproductbyID,
    addProduct,
    editProduct,
    allOrders


}