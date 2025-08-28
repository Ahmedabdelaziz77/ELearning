import express from "express";
import {
  createStripePaymentIntent,
  createTransaction,
  getAllTransactions,
} from "../controllers/transactionController";

const router = express.Router();

router.post("/", createTransaction);
router.get("/", getAllTransactions);
router.post("/stripe/payment-intent", createStripePaymentIntent);

export default router;
