const Product = require('../models/product')
const { JoiProductSchema } = require('../models/validation')
const Cart = require('../models/Cart')


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
const addProduct = async (req, res) => {
    try {
        const { error, value } = JoiProductSchema.validate(req.body)
        if (error) {
            return res.status(400).json(error)
        }
        const { name, category, image, new_price, description, detailOne } = value;
        const newproduct = await new Product({ name, category, image, new_price, description, detailOne })
        newproduct.save()
        res.status(200).json(newproduct)

    } catch (error) {
        console.log(error)
        res.status(500).json('error on adding product', error)
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

//delete product
const deleteProduct = async (req, res) => {
    try {
        const deleteProduct = await Product.findByIdAndDelete(req.params.id)
        if (!deleteProduct) {
            return res.status(404).json('Product with this ID is not found')
        }

        await Cart.updateMany(
            { 'products.productId': req.params.id },
            { $pull: { products: { productId: req.params.id } } }
        )

        res.status(200).json("Product deleted successfully and removed from all carts and wishlists");

    } catch (error) {
        res.status(500).json({ message: 'There was an error deleting the product', error })
    }
}

module.exports={
    allProduct,
    getproductbyID,
    addProduct,
    editProduct,
    deleteProduct
}