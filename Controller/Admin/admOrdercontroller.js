const Order = require('../../models/orders')

const allOrders = async (req, res) => {
    try {
        const orders = await Order.find()
        if (!orders) {
            return res.status(404).json('orders Not found')
        }
        res.status(200).json(orders)

    } catch (error) {
        console.log(error)
        res.status(404).json('there is an error finding orders', error)

    }
}

//get order of induvidual users
const getOrderofuserbyID = async (req, res) => {
    try {
        const orderofuser = await Order.find({ userID: req.params.id })
            .populate({
                path: 'products.productId',
                select: 'name new_price image'
            }).populate("userID")
        if (!orderofuser) {
            return res.status(404).json('order not found')
        }
        res.status(200).json(orderofuser)
    } catch (error) {
        console.log(error)
        res.status(500).json('failed to get order of this user')
    }
}

//cancel order
const cancelOrder = async (req, res) => {
    try {
        const orderById = await Order.findById(req.params.id); 

        if (!orderById) {
            return res.status(404).json("Order with this ID is not found");
        }
        
        if (orderById.paymentStatus === "completed") {
            return res.status(400).json('Cannot cancel this order, already paid');
        }

        orderById.paymentStatus = 'cancelled';
        orderById.shippingStatus = 'cancelled';

  
        await orderById.save();

        res.status(200).json('Order successfully cancelled');

    } catch (error) {
        console.log(error);
        res.status(500).json('There is an error on cancelling the order');
    }
}

//total Revenew 
const TotalRevenew = async (req, res) => {
    try {
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

    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
}



module.exports = {
    allOrders,
    cancelOrder,
    getOrderofuserbyID,
    TotalRevenew
}