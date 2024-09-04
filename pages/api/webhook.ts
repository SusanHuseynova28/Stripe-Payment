import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import getRawBody from "raw-body";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.WEBHOOK_SECRET as string;

export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const signature = req.headers["stripe-signature"];
  
  if (!signature) {
    return res.status(400).json({ error: "Missing Stripe signature" });
  }

  let event: Stripe.Event;
  let rawBody: Buffer;

  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    console.error("Failed to get raw body", err);
    return res.status(400).json({ error: "Failed to get request raw body" });
  }

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  console.log("Received event type:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      });
      const lineItems = sessionWithLineItems.line_items;

      if (!lineItems) {
        console.error("No line items found for the session");
        return res.status(500).json({ error: "No line items found" });
      }

      console.log("Fulfill the order with custom logic");
      console.log("Line Items Data:", lineItems.data);
      console.log("Customer email:", session.customer_details?.email);
      console.log("Created at:", new Date(session.created * 1000)); 

      return res.status(200).json({ message: "Checkout session completed successfully" });
    } catch (err: any) {
      console.error("Error retrieving checkout session:", err.message);
      return res.status(500).json({ error: "Error retrieving checkout session" });
    }
  }

  return res.status(400).json({ error: "Unhandled event type" });
}
