const express = require('express');
const paymentRouter = express.Router();
const userAuth = require('../middleware/auth');
const { PREMIUM_PLAN } = require('../utils/constants');
const User = require('../models/user');
const {getDateTimeFromTimestamp} = require("../utils/helper")

const stripe = require('stripe')('sk_test_51O0H4mSE6xCdwqaZmG1vsrGYbwEAjUCJSXGCqqF1Zn7yYHgx9L3W0cUgzZIDVpErOsb3xgz5LqgApGopcqaoDPbN00FPtoLswy')

paymentRouter.post("/create-subscription", userAuth, async(req, res) => {

    const {plan} = req.body;
    const selectedPlan = PREMIUM_PLAN.find(planName => plan === planName.plan_name)

    if(!selectedPlan) {
        return res.status(400).json({
            message: 'Plan not found'
        })
    }

   try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: selectedPlan.plan_id,
                    quantity: 1,
                }
            ],
            success_url: 'https://sisimanu-web.vercel.app/premium?status=success&session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://sisimanu-web.vercel.app/premium?status=failed&session_id={CHECKOUT_SESSION_ID}',
        })

        return res.status(200).json({session})
    } catch (error) {
        console.log('error', error);
    }
})

paymentRouter.post("/save-payment", userAuth, async(req, res) => {
    try {
        const {session_id} = req.body;
        const userId = req.user._id;
        const session = await stripe.checkout.sessions.retrieve(session_id);

        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        if(session.status === 'complete') {

            let premiumType;
            PREMIUM_PLAN.find((planName) => {
                if (subscription.plan.id === planName.plan_id) {
                    premiumType = planName.plan_name
                }
            })

            const user = await User.findById({_id: userId})
            user.isPremium = true;
            user.paymentSessionId = session.id
            user.subscriptionId = subscription.id
            user.premiumType = premiumType;
            user.premiumStart = getDateTimeFromTimestamp(session.created);
            user.premiumExpires = getDateTimeFromTimestamp(session.expires_at);
            const updatedUserData = await user.save()

            return res.status(200).json({
                plan: premiumType,
                message: "Payment saved successfully.",
                user: updatedUserData
            }) 
        }
        
        return res.status(500).json({message: "Something went wrong while saving payment."}) 
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Something went wrong."}) 
    }
})

module.exports = { paymentRouter }