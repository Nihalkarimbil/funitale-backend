const products = require('../../models/product')
const CustomError = require ('../../utils/customError')

const allProduct = async (req, res, next) => {

    const product = await products.find()
    if (!product) {
        return next(new CustomError('product not found', 404))
    }
    res.status(200).json(product)

}
//get products by category
const productBycategory = async (req, res) => {
    const product = await products.find({ category: req.params.category })
    res.json(product)
}

//get product by ID
const getproductbyID = async (req, res, next) => {

    const oneProduct = await products.findById(req.params.id)
    if (!oneProduct) {
        return next(new CustomError('product not found', 404))
    }
    res.json(oneProduct)

}


module.exports = {
    productBycategory,
    getproductbyID,
    allProduct
}