const Order = require('../../models/orders')
const CustomError = require('../../utils/customError')

const allOrders = async (req, res, next) => {

    const orders = await Order.find().populate('products.productId')
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
<<<<<<< HEAD
    console.log(calculate)

    
=======
>>>>>>> aa6b12be9643e917e95fc464cfaf939544d49d55
    if (calculate.length === 0) {
        return res.status(200).json({ revenew: 0 });
    }

    res.status(200).json({ revenew: calculate[0].revenew });

}

const allOrderssum = async (req, res, next) => {

    const orders = await Order.find()
    if (!orders) {
        return next(new CustomError('orders Not found', 404))
    }
    res.status(200).json(orders.length)

}


// Update shipping status 
const shippingupdate = async (req, res) => {
    const { newStatus } = req.body;

<<<<<<< HEAD
=======
    // Find and update the order's shipping status
>>>>>>> aa6b12be9643e917e95fc464cfaf939544d49d55
    const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { shippingStatus: newStatus },
        { new: true }
    );

    if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Shipping status updated successfully', order: updatedOrder });

};


module.exports = {
    allOrders,
    cancelOrder,
    getOrderofuserbyID,
    TotalRevenew,
    allOrderssum,
    shippingupdate
}
