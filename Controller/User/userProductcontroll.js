const products = require('../../models/product')

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

module.exports={ 
    productBycategory,
    getproductbyID
}