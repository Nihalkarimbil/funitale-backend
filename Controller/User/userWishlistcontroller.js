const Wishlist = require('../../models/Wishlist')

//add to wishlist
const addToWishlist = async (req, res) => {
    try {
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

module.exports={
    addToWishlist,
    getwishlist,
    removewish
}