const Wishlist = require('../../models/Wishlist')
const CustomError = require('../../utils/customError')

//add to wishlist
const addToWishlist = async (req, res) => {

    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
        const newWishlist = new Wishlist({
            user: req.user.id,
            products: [productId]
        });

        await newWishlist.save();

        const populatedWishlist = await newWishlist.populate('products.productId');
        return res.status(200).json(populatedWishlist);
    }
    const isProductInWishlist = wishlist.products.some(product => product.equals(productId));

    if (!isProductInWishlist) {
        wishlist.products.push(productId);
        await wishlist.save();
        wishlist = await wishlist.populate('products.productId');
        return res.status(200).json(wishlist);
    }

    res.status(200).json({ message: 'Product already added to wishlist' });

};

//get all wish list products
const getwishlist = async (req, res) => {

    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');

    if (!wishlist) {
        const newWish = new Wishlist({
            user: req.user.id,
            products: [],
        });

        await newWish.save();
        return res.status(200).json(newWish);
    }

    return res.status(200).json(wishlist);

};

//delete wishlist
const removewish = async (req, res, next) => {

    const { productId } = req.body;
    const data = await Wishlist.findOne({ user: req.user.id }).populate('products')

    if (!data) {
        return next(new CustomError('wishlist not found', 404))
    }
    const productindex = data.products.findIndex(pro => pro._id.toString() === productId)
    
    data.products.splice(productindex, 1)
    await data.save()
    res.status(200).json(data || [])

}

module.exports = {
    addToWishlist,
    getwishlist,
    removewish
}