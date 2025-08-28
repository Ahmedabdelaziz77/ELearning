// controllers/transactionController.ts
import Stripe from "stripe";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripePaymentIntent = async (
  req: Request,
  res: Response
) => {
  try {
    let { amount } = req.body as { amount?: number | string };

    let amountInCents: number;
    if (!amount || Number(amount) === 0) {
      amountInCents = 5000;
    } else {
      const asNumber = Number(amount);
      amountInCents = Math.round(asNumber * 100);
    }

    if (!Number.isFinite(amountInCents) || amountInCents < 50) {
      return res.status(400).json({
        message: "Invalid amount",
        reason: "Amount must be at least $0.50 (50 cents).",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",

      automatic_payment_methods: { enabled: true },
      // Optional: metadata
      // metadata: { courseId: req.body.courseId, userId: req.auth?.userId ?? "" },
    });

    return res.status(200).json({
      message: "PaymentIntent created",
      data: { clientSecret: paymentIntent.client_secret },
    });
  } catch (err: any) {
    console.error(
      "Create PI error:",
      err?.message,
      err?.type,
      err?.code,
      err?.param
    );
    return res.status(500).json({
      message: "Error creating stripe payment intent",
      error: err?.message ?? "Unknown error",
    });
  }
};

export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId, transactionId, amount, paymentProvider } = req.body;
  try {
    const course = await Course.get(courseId);
    const newTransaction = new Transaction({
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      amount,
      paymentProvider,
    });
    await newTransaction.save();
    const initialProgress = new UserCourseProgress({
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })),
      })),
      lastAccessedTimestamp: new Date().toISOString(),
    });
    await initialProgress.save();
    await Course.update(
      { courseId },
      {
        $ADD: {
          enrollments: [{ userId }],
        },
      }
    );
    res.json({
      message: "Purshace Course successfully",
      data: {
        transaction: newTransaction,
        courseProgress: initialProgress,
      },
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error creating transaction:", error);
    res
      .status(500)
      .json({ message: "Error creating transaction", error: error.message });
  }
};

export const getAllTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.query;
  try {
    const transactions = userId
      ? await Transaction.query("userId").eq(userId).exec()
      : await Transaction.scan().exec();
    res.json({
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};
