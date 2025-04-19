import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  console.log("Received event:", event.type);

  // Handle checkout session completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("Checkout session metadata:", session.metadata);

    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required in metadata", {
        status: 400,
      });
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await prismadb.userSubscription.create({
        data: {
          userId: session.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });

      console.log("Subscription saved for user:", session.metadata.userId);
    } catch (error) {
      console.error("Error saving subscription to DB:", error);
      return new NextResponse("Database error", { status: 500 });
    }
  }

  // Handle subscription renewal (payment succeeded)
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    try {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      await prismadb.userSubscription.update({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });

      console.log("Subscription updated:", subscription.id);
    } catch (error) {
      console.error("Error updating subscription on renewal:", error);
      return new NextResponse("Database update error", { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
