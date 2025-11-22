import Stripe from "stripe";
import { sendPaymentReceiptEmail } from "../utils/mailer.js";

const confirmCheckout = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.body || {};
    if (!userId) return res.status(401).json({ message: "No token provided" });
    if (!sessionId)
      return res.status(400).json({ message: "sessionId is required" });
    if (!process.env.STRIPE_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: "Stripe is not configured on the server" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      console.error("Stripe retrieve session failed:", err?.message || err);
      return res.status(400).json({ message: "Invalid or unknown sessionId" });
    }

    // Verify payment status
    if (session.payment_status !== "paid") {
      return res.status(409).json({ message: "Payment not completed yet" });
    }

    // Validate the caller matches the session metadata user
    const meta = session.metadata || {};
    if (!meta.userId || meta.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized for this payment session" });
    }

    const payerEmail =
      session.customer_details?.email || session.customer_email || undefined;
    const currency = (session.currency || "egp").toUpperCase();
    const amountPaid = session.amount_total
      ? session.amount_total / 100
      : undefined;

    if (meta.type === "trip" && meta.tripId) {
      const Trip = (await import("../models/Trip.js")).default;
      const trip = await Trip.findById(meta.tripId);
      if (!trip) return res.status(404).json({ message: "Trip not found" });

      // If already finalized, exit idempotently
      const already = trip.attendees.find(
        (r) => r.userId.toString() === userId.toString()
      );
      if (already && already.paid) {
        return res.status(200).json({ message: "Already confirmed", trip });
      }
      const pending = trip.registered.find(
        (r) => r.userId.toString() === userId.toString()
      );
      if (!pending) {
        return res
          .status(404)
          .json({ message: "Registration not found for this user" });
      }
      pending.paid = true;
      trip.attendees.push(pending);
      trip.registered = trip.registered.filter(
        (r) => r.userId.toString() !== userId.toString()
      );
      await trip.save();

      try {
        await sendPaymentReceiptEmail({
          to: payerEmail || pending.email,
          name: `${pending.firstname} ${pending.lastname}`.trim(),
          eventType: "trip",
          eventName: trip.tripname,
          amount: amountPaid ?? trip.price,
          currency,
          paymentMethod: "Card (Stripe)",
          date: new Date(session.created * 1000),
          transactionId: session.payment_intent || session.id,
        });
      } catch (mailErr) {
        console.error(
          "sendPaymentReceiptEmail trip confirm error:",
          mailErr?.message || mailErr
        );
      }

      return res.status(200).json({ message: "Payment confirmed", trip });
    }

    if (meta.type === "workshop" && meta.workshopId) {
      const WorkShop = (await import("../models/Workshop.js")).default;
      const workshop = await WorkShop.findById(meta.workshopId);
      if (!workshop)
        return res.status(404).json({ message: "Workshop not found" });

      const already = workshop.attendees.find(
        (r) => r.userId.toString() === userId.toString()
      );
      if (already && already.paid) {
        return res.status(200).json({ message: "Already confirmed", workshop });
      }
      const pending = workshop.registered.find(
        (r) => r.userId.toString() === userId.toString()
      );
      if (!pending) {
        return res
          .status(404)
          .json({ message: "Registration not found for this user" });
      }
      pending.paid = true;
      workshop.attendees.push(pending);
      workshop.registered = workshop.registered.filter(
        (r) => r.userId.toString() !== userId.toString()
      );
      await workshop.save();

      try {
        await sendPaymentReceiptEmail({
          to: payerEmail || pending.email,
          name: `${pending.firstname} ${pending.lastname}`.trim(),
          eventType: "workshop",
          eventName: workshop.workshopname,
          amount: amountPaid ?? workshop.requiredFunding,
          currency,
          paymentMethod: "Card (Stripe)",
          date: new Date(session.created * 1000),
          transactionId: session.payment_intent || session.id,
        });
      } catch (mailErr) {
        console.error(
          "sendPaymentReceiptEmail workshop confirm error:",
          mailErr?.message || mailErr
        );
      }

      return res.status(200).json({ message: "Payment confirmed", workshop });
    }

    if (meta.type === "vendorRequest" && meta.vendorRequestId) {
      const VendorRequest = (await import("../models/VendorRequest.js"))
        .default;
      const Vendor = (await import("../models/Vendor.js")).default;
      const Booth = (await import("../models/Booth.js")).default;
      const { sendBoothPaymentReceiptEmail } = await import(
        "../utils/mailer.js"
      );
      const vReq = await VendorRequest.findById(meta.vendorRequestId).populate(
        "bazarId"
      );
      if (!vReq)
        return res.status(404).json({ message: "Vendor request not found" });
      if (vReq.vendorId.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized for this payment session" });
      }
      if (vReq.paymentStatus === "paid") {
        return res
          .status(200)
          .json({ message: "Already confirmed", vendorRequest: vReq });
      }
      vReq.paymentStatus = "paid";
      await vReq.save();
      const vendor = await Vendor.findById(vReq.vendorId);
      // Create Booth from request (idempotent check: if exists skip creation)
      let booth = await Booth.findOne({ vendorRequestId: vReq._id });
      if (!booth) {
        const body = {
          boothname: vReq.boothname || vendor.companyname,
          vendorRequestId: vReq._id,
          vendorId: vReq.vendorId,
          isBazarBooth: vReq.isBazarBooth,
          status: "Approved",
          bazarId: vReq.bazarId?._id || vReq.bazarId,
          boothSize: vReq.boothSize,
          people: vReq.people,
          location: vReq.location,
          duration: vReq.duration,
          startdate: vReq.startdate,
          enddate: vReq.enddate,
        };
        booth = await Booth.create(body);
      }
      try {
        await sendBoothPaymentReceiptEmail(vendor, {
          ...booth.toObject(),
          price: vReq.price,
          people: vReq.people,
          isBazarBooth: vReq.isBazarBooth,
          bazarId: vReq.bazarId,
        });
      } catch (mailErr) {
        console.error(
          "sendBoothPaymentReceiptEmail vendorRequest confirm error:",
          mailErr?.message || mailErr
        );
      }
      return res
        .status(200)
        .json({ message: "Payment confirmed", vendorRequest: vReq, booth });
    }

    return res.status(400).json({ message: "Unsupported session metadata" });
  } catch (err) {
    console.error("confirmCheckout error:", err?.message || err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default { confirmCheckout };
