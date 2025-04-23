const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { Cashfree } = require("cashfree-pg");
const User = require("../../models/User_Customer.js");
const SubscriptionPlan = require("../models/SubscriptionPacks");
const Learner_SubscriptionPlan = require("../models/Learner_Subscription");
const UserReportCard = require("../LearningModels/UserLearningProgress");
const SuperAdmin = require("../../models/Super_Admin.js");
const BusinessCourses = require("../LearningModels/Training_Business");

require("dotenv").config();

Cashfree.XClientId = process.env.PAYMENT_ID;
Cashfree.XClientSecret = process.env.PAYMENT_ID_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

router.post("/payment", payment);

router.post("/verifyPayment", verifyPayment);

async function payment(req, res) {
  try {
    const { plan_code, business_id } = req.body;

    const isPackValid = await SubscriptionPlan.findOne({ plan_code }).lean();

    if (!isPackValid) {
      return res.status(404).json({ error: "INVALID PACK" });
    }

    const isBusinessValid = await BusinessCourses.findById(business_id).lean();

    if (!isBusinessValid) {
      return res.status(404).json({ error: "INVALID BUSINESS" });
    }

    const userId = req.user._id;

    const user = await SuperAdmin.findById(userId, {
      firstName: 1,
      phoneNumber: 1,
      lastName: 1,
      email: 1,
    }).lean();

    if (!user) {
      return res.status(404).json({ error: "Super Admin not found" });
    }

    const crypto_Id = generateOrderId();

    let request = {
      order_amount: isPackValid.price,
      order_currency: "INR",
      order_id: crypto_Id,
      plan_code,
      customer_details: {
        customer_id: user._id,
        customer_phone: user.phoneNumber.toString(),
        customer_name: `${user.firstName} ${user.lastName}`,
        customer_email: user.email,
        plan_code,
      },
    };

    Cashfree.PGCreateOrder("2023-08-01", request)
      .then((response) => {
        return res.status(201).json(response.data);
      })
      .catch((error) => {
        console.error("create payment error",error.response.data.message);
        return res.status(500).json(error.response.data.message);
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function verifyPayment(req, res) {
  try {
    let { orderId, client_id: user_id, business_id } = req.body;

    const isBusinessValid = await BusinessCourses.findById(business_id).lean();

    if (!isBusinessValid) {
      return res.status(404).json({ error: "INVALID BUSINESS" });
    }

    const user = await User.findOne(
      { _id: user_id, role: "staff" },
      {
        firstName: 1,
        phoneNumber: 1,
        lastName: 1,
        email: 1,
        doesHaveTraningSubscription: 1,
      }
    ).lean();

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

    if (response && response.data && response.data.length > 0) {
      const hasSuccessfulPayment = response.data.find(
        (order) => order.payment_status === "SUCCESS"
      );

      if (hasSuccessfulPayment) {
        await addSubPack({ paymentArr: response.data, user, business_id });
        if (!user?.doesHaveTraningSubscription) {
          await User.findByIdAndUpdate(user._id, {
            $set: {
              doesHaveTraningSubscription: true,
            },
          }).lean();
        }
      } else {
        return res.status(400).json({ success: false, data: "Payment Failed" });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, data: "No payments found for this order." });
    }

    return res.status(200).json({ success: true, data: "SUCCESS" });
  } catch (error) {
    console.error("verify payment error",error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { router, payment, verifyPayment };

async function addSubPack({ paymentArr, user, business_id, superAdminId }) {
  try {
    let paymentObj;
    if (paymentArr.length > 0) {
      const x = paymentArr.find(
        (order, i) => order.payment_status == "SUCCESS"
      );
      if (x) {
        paymentObj = x;
      } else {
        throw new Error("Successfull Payment Not Found");
      }
    }

    let learnerDocId = await UserReportCard.findOne({
      user_id: user._id,
    }).lean();

    if (!learnerDocId) {
      const initUserAsLearner = new UserReportCard({
        user_id: user._id,
        business_course_id: business_id,
      });

      learnerDocId = await initUserAsLearner.save();
    }

    const findPack = await SubscriptionPlan.findOne({
      price: paymentObj.order_amount,
    }).lean();

    const newSubscription = new Learner_SubscriptionPlan({
      author: user._id,
      learner_id: learnerDocId._id,
      subscriptionManager: user.subscription_Manager,
      plan: findPack.name,
      business_course_id: business_id,
      sub_pack_id: findPack._id,
      plan_code: findPack.plan_code,
      price: paymentObj.order_amount,
      transactionId: paymentObj.cf_payment_id,
      endTime: new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000),
    });

    await newSubscription.save();

    await UserReportCard.updateOne(
      { user_id: user._id },
      {
        $push: {
          subscription: newSubscription,
        },
      }
    );
  } catch (error) {
    throw new Error(error.message);
  }
}

function generateOrderId() {
  const uniqueId = crypto.randomBytes(16).toString("hex");

  const hash = crypto.createHash("sha256");
  hash.update(uniqueId);

  const orderId = hash.digest("hex");

  return orderId.substr(0, 12);
}
