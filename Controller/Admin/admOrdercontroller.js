const Order = require('../../models/orders')
const CustomError = require('../../utils/customError')

const allOrders = async (req, res, next) => {

    const orders = await Order.find()
    if (!orders) {
        return next(new CustomError('orders Not found', 404))
    }
    res.status(200).json(orders)

}

//get order of induvidual users
const getOrderofuserbyID = async (req, res, next) => {

    const orderofuser = await Order.find({ userID: req.params.id })
        .populate({
            path: 'products.productId',
            select: 'name new_price image'
        }).populate("userID")
    if (!orderofuser) {
        return next(new CustomError('order not found', 404))
    }
    res.status(200).json(orderofuser)

}

//cancel order
const cancelOrder = async (req, res, next) => {

    const orderById = await Order.findById(req.params.id);

    if (!orderById) {
        return next(new CustomError('Order with this ID is not found', 404))
    }

    if (orderById.paymentStatus === "completed") {
        return res.status(400).json('Cannot cancel this order, already paid');
    }

    orderById.paymentStatus = 'cancelled';
    orderById.shippingStatus = 'cancelled';


    await orderById.save();

    res.status(200).json('Order successfully cancelled');

}

//total Revenew 
const TotalRevenew = async (req, res) => {

    const calculate = await Order.aggregate([
        { $match: { paymentStatus: { $ne: 'cancelled' } } },
        {
            $group:
            {
                _id: null,
                revenew: { $sum: "$amount" }
            }
        }
    ])
    console.log(calculate)

    // Return 0 if no data is found
    if (calculate.length === 0) {
        return res.status(200).json({ revenew: 0 });
    }

    res.status(200).json({ revenew: calculate[0].revenew });

}



module.exports = {
    allOrders,
    cancelOrder,
    getOrderofuserbyID,
    TotalRevenew
}