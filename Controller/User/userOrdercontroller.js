const Cart = require('../../models/Cart')
const stripe = require('stripe')(process.env.STRIPE_KEY)
const Order = require('../../models/orders')


//order Creation
const CreateOrder = async (req, res) => {
    try {
        
        const userCart = await Cart.findOne({ user: req.user.id }).populate("products.productId");
        if (!userCart) {
            return res.status(404).json('User cart not found');
        }

        const totalPrice = Math.round(

            userCart.products.reduce((total, item) => {
                const price = parseFloat(item.productId.new_price);
                const quantity = parseInt(item.quantity);
                if (isNaN(price) || isNaN(quantity)) {
                    throw new Error('Invalid product price or quantity');
                }

                return total + price * quantity;
            }, 0)
        )
        console.log(totalPrice);

        // const lineItems = userCart.products.map(item => ({
        //     price_data: {
        //         currency: 'INR',
        //         product_data: {
        //             name: item.productId.name,
        //             images: [item.productId.image]
        //         },
        //         unit_amount: Math.round(item.productId.new_price * 100) 
        //     },
        //     quantity: item.quantity
        // }));

        // const session = await stripe.checkout.sessions.create({
        //     payment_method_types: ['card'],  
        //     line_items: lineItems,           
        //     mode: 'payment',
        //     success_url: `${process.env.URL_FRONTEND}/success-order`,
        //     cancel_url: `${process.env.URL_FRONTEND}/cancel-order`
        // });


        const newOrder = new Order({
            userID: req.user.id,
            products: userCart.products,
            sessionID: 23452343,
            amount: totalPrice,
            paymentStatus: 'pending'
        });


        const savedOrder = await newOrder.save();
        await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { products: [] } });

        res.status(200).json({ savedOrder });

    } catch (error) {
        console.log(error);
        res.status(500).json('Error adding order');
    }
};


//verify order
const verifyOrder = async (req, res) => {
    try {
        const { session_ID } = req.body;
        const order = await Order.findOne({ sessionID: session_ID });

        if (!order) {
            return res.status(404).json('Order not found');
        }

        if (order.paymentStatus === 'completed') {
            return res.status(400).json('Product already updated');
        }

        order.paymentStatus = 'completed';
        order.shippingStatus = 'Processing'
        const updatedOrder = await order.save();

        res.status(200).json({ message: 'Order successfully updated', updatedOrder });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error verifying order' });
    }
};


//get all orders
const GetAllorders = async (req,res) => {
    try {
        
        const allOrders=await Order.find({ userID: req.user.id }).populate("products.productId")
        
        if (!allOrders || allOrders.length === 0) {
            return res.status(404).json('No orders found');
        }

        res.status(200).json(allOrders)
    } catch (error) {
        console.log(error)
        res.status(500).json('there is an error on geting orders')
    }

}


//Cancel Order
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
};

module.exports={   
    CreateOrder,
    verifyOrder,
    GetAllorders,
    cancelOrder
}