// const express = require('express')
// const Order = require('../models/orders')
// const stripe = require('stripe')
// const route=express.Router()


// const handlestrypewebhook =async (req, res) => {
//     const stripe = new stripe.Stripe(process.env.STRIPE_KEY)
//     const sig = req.headers['stripe-signature'];

//     try {
//         const event = stripe.webhooks.constructEvent(
//             req.body,
//             sig,
//             process.env.WEBHOOK_KEY
//         );

//         if (event.type === 'checkout.session.completed') {
//             const session = event.data.object;

//             // Update the order's payment status to 'completed'
//             const order = await Order.findOneAndUpdate({ sessionID: session.id }, { paymentStatus: 'completed' });
//             if (order) {
//                 order.status = 'completed'
//                 await order.save()
//             }
//             console.log('Payment successful for Order:', order);
//         }

//         res.status(200).json({ received: true });
//     } catch (err) {
//         console.log(`Webhook error: ${err.message}`);
//         res.status(400).send(`Webhook Error: ${err.message}`);
//     }
// };

// route.post('/webhook', express.raw({ type: 'application/json' }),
// async (req, res) => {
//     const event = JSON.parse(req.body);
//     console.log(req.body);
//     console.log(event);

//     res.status(200).json("received");
//   }
// )

// export default route