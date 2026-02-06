import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseAdmin() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string);
}

async function upsertSubscription({
  venue_id,
  plan,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  start_date,
  end_date,
}: any) {
  const supabase = await supabaseAdmin();

  const { error } = await supabase.from("venue_subscriptions").upsert(
    {
      venue_id,
      plan,
      status,
      stripe_customer_id,
      stripe_subscription_id,
      start_date,
      end_date,
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (error) throw error;

  // Apply venue flags
  if (plan === "featured_monthly" || plan === "featured_annual") {
    await supabase.from("venues").update({ is_featured: status === "active" }).eq("id", venue_id);
  }
  if (plan === "claimed_plus") {
    await supabase.from("venues").update({ claimed: status === "active" }).eq("id", venue_id);
  }
}

export async function POST(req: Request) {
  if (!endpointSecret) return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const venue_id = session.metadata?.venue_id;
        const plan = session.metadata?.plan;
        const email = session.metadata?.email;

        const subId = session.subscription as string | null;
        if (!venue_id || !plan || !subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const start = new Date(sub.start_date * 1000);
        const end = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

        await upsertSubscription({
          venue_id,
          plan,
          status: sub.status === "active" ? "active" : sub.status,
          stripe_customer_id: (sub.customer as string) || session.customer as string,
          stripe_subscription_id: sub.id,
          start_date: start.toISOString().slice(0, 10),
          end_date: end ? end.toISOString().slice(0, 10) : null,
        });

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const venue_id = sub.metadata?.venue_id;
        const plan = sub.metadata?.plan;

        if (!venue_id || !plan) break;

        const start = new Date(sub.start_date * 1000);
        const end = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

        await upsertSubscription({
          venue_id,
          plan,
          status: sub.status,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          start_date: start.toISOString().slice(0, 10),
          end_date: end ? end.toISOString().slice(0, 10) : null,
        });

        break;
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
