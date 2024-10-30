const Cart = require('../../models/Cart')
const stripe = require('stripe')
const Order = require('../../models/orders')
const CustomError = require ('../../utils/customError')


//order Creation
const CreateOrder = async (req, res, next) => {

    const userCart = await Cart.findOne({ user: req.user.id }).populate("products.productId");
    if (!userCart) {
        return next(new CustomError('User cart not found', 404))
    }

    const totalPrice = Math.round(

        userCart.products.reduce((total, item) => {
            const price = parseFloat(item.productId.new_price);
            const quantity = parseInt(item.quantity);
            if (isNaN(price) || isNaN(quantity)) {
                return next( new CustomError('Invalid product price or quantity'))
            }

            return total + price * quantity;
        }, 0)
    )
    console.log(totalPrice);

    const lineItems = userCart.products.map(item => ({
        price_data: {
            currency: 'INR',
            product_data: {
                name: item.productId.name,
                images: [item.productId.image]
            },
            unit_amount: Math.round(item.productId.new_price * 100) 
        },
        quantity: item.quantity
    }));

    const stripeclint=new stripe(process.env.STRIPE_KEY)
    const session = await stripeclint.checkout.sessions.create({
        payment_method_types: ['card'],  
        line_items: lineItems,           
        mode: 'payment',
        ui_mode:'embedded',
        return_url: `${process.env.URL_FRONTEND}/success/{CHECKOUT_SESSION_ID}`,
       
    });


    const newOrder = new Order({
        userID: req.user.id,
        products: userCart.products,
        sessionID:session.id,
        amount: totalPrice,
        paymentStatus: 'pending'
    });


    const savedOrder = await newOrder.save();
    await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { products: [] } });

    res.status(200).json({
        message:'order created succesfully',
        data:{session:session,
            order:savedOrder,
            clientsecret: session.client_secret,
            linedata:lineItems
        }
    });


};


//verify order
const verifyOrder = async (req, res, next) => {

    const { session_ID } = req.body;
    const order = await Order.findOne({ sessionID: session_ID });

    if (!order) {
        return next(CustomError('Order not found', 404))
    }

    if (order.paymentStatus === 'completed') {
        return res.status(400).json('Product already updated');
    }

    order.paymentStatus = 'completed';
    order.shippingStatus = 'Processing'
    const updatedOrder = await order.save();

    res.status(200).json({ message: 'Order successfully updated', updatedOrder });

};


//get all orders
const GetAllorders = async (req, res, next) => {

    const allOrders = await Order.find({ userID: req.user.id }).populate("products.productId")

    if (!allOrders || allOrders.length === 0) {
        return next(new CustomError('No orders found', 404))
    }

    res.status(200).json(allOrders)
}


//Cancel Order
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
};

module.exports = {
    CreateOrder,
    verifyOrder,
    GetAllorders,
    cancelOrder
}