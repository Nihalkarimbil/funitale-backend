const Product = require('../../models/product')
const { JoiProductSchema } = require('../../models/validation')
const Cart = require('../../models/Cart')
const CustomError = require('../../utils/customError')


const allProduct = async (req, res, next) => {

    const product = await Product.find()
    if (!product) {
        return next(new CustomError('product not found', 404))
    }
    res.status(200).json(product)

}

//get product by id
const getproductbyID = async (req, res, next) => {

    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new CustomError("product with this id is not available",400))
    }
    res.status(200).json(product)
}

//add Products
const addProduct = async (req, res, next) => {
    console.log(req.file)
    const { error, value } = JoiProductSchema.validate(req.body)

    if (error) {
        return next(new CustomError(error.message))
    }
    
    const { name, category, new_price, description, detailOne } = value;

    const image= req.file?.path
    console.log(value)
    
   
    const newproduct = await new Product({ 
        image, 
        name, 
        category, 
        new_price, 
        description, 
        detailOne 
    })

    newproduct.save()
    res.status(200).json(newproduct)

}


//editing of the product
const editProduct = async (req, res, next) => {
    const { _id,__v,image, ...productData } = req.body;
    const { error, value } = JoiProductSchema.validate(productData);
    
    if (error) {
        console.error("Validation Error:", error.details);
        return next(new CustomError('Validation failed', 400));
    }

    if (req?.file) {
        value.image = req.file.path; 
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, value, { new: true });
        
        if (!updatedProduct) {
            return next(new CustomError('Product not found with this ID', 404));
        }

        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error("Error updating product:", err);
        next(new CustomError('Failed to update product', 500));
    }
};

//delete product
const deleteProduct = async (req, res, next) => {

    const deleteProduct = await Product.findByIdAndDelete(req.params.id)
    console.log(deleteProduct)
    if (!deleteProduct) {
        return next(new CustomError('Product with this ID is not found', 404))
    }

    await Cart.updateMany(
        { 'products.productId': req.params.id },
        { $pull: { products: { productId: req.params.id } } }
    )

    res.status(200).json("Product deleted successfully and removed from all carts and wishlists");


}

const totalproductsum =async(req,res,next)=>{

    const productsum=await Product.find()
    if (!productsum) {
        return next(new CustomError('product not found', 404))
    }

    res.status(200).json(productsum.length)
}

const productBycategory = async (req, res) => {
    const product = await Product.find({ category: req.params.category })
    res.json(product)
}

module.exports = {
    allProduct,
    getproductbyID,
    addProduct,
    editProduct,
    deleteProduct,
    totalproductsum,
    productBycategory
}