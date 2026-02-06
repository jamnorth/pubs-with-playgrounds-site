import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-01-28.clover",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const PRICE_FEATURED_MONTHLY = process.env.STRIPE_PRICE_FEATURED_MONTHLY;
const PRICE_FEATURED_ANNUAL = process.env.STRIPE_PRICE_FEATURED_ANNUAL;
const PRICE_CLAIMED_PLUS = process.env.STRIPE_PRICE_CLAIMED_PLUS;

function priceForPlan(plan: string) {
  if (plan === "featured_monthly") return PRICE_FEATURED_MONTHLY;
  if (plan === "featured_annual") return PRICE_FEATURED_ANNUAL;
  if (plan === "claimed_plus") return PRICE_CLAIMED_PLUS;
  return null;
}

export async function POST(req: Request) {
  try {
    if (!APP_URL) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_APP_URL" }, { status: 500 });
    }

    const body = await req.json();
    const { venue_id, plan, email } = body as { venue_id: string; plan: string; email: string };

    if (!venue_id || !plan || !email) {
      return NextResponse.json({ error: "Missing venue_id, plan, or email" }, { status: 400 });
    }

    const price = priceForPlan(plan);
    if (!price) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${APP_URL}/owners/success`,
      cancel_url: `${APP_URL}/owners/cancel`,
      metadata: { venue_id, plan, email },
      subscription_data: {
        metadata: { venue_id, plan, email },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Stripe error" }, { status: 500 });
  }
}
