import { Router } from "express";
import stripeController from "../controllers/stripeController.js";

const router = Router();

// Finalize a paid Stripe Checkout session in case webhooks failed or are delayed
router.post("/confirm", stripeController.confirmCheckout);

export default router;
