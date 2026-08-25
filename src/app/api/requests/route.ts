import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

function headers() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables are missing.");
  }

  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      requesterWallet,
      requesterUsername,
      recipientWallet,
      recipientUsername,
      amount,
    } = body;

    if (
      !requesterWallet ||
      !isAddress(requesterWallet) ||
      !recipientWallet ||
      !isAddress(recipientWallet)
    ) {
      return NextResponse.json(
        { error: "Invalid wallet address." },
        { status: 400 }
      );
    }

    if (
      requesterWallet.toLowerCase() ===
      recipientWallet.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "You cannot request payment from yourself." },
        { status: 400 }
      );
    }

    if (
      !requesterUsername ||
      !recipientUsername ||
      !amount
    ) {
      return NextResponse.json(
        { error: "Missing request information." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid amount." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_requests`,
      {
        method: "POST",
        headers: {
          ...headers(),
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          requester_wallet:
            requesterWallet.toLowerCase(),
          requester_username:
            String(requesterUsername)
              .replace(/^@/, "")
              .toLowerCase(),
          recipient_wallet:
            recipientWallet.toLowerCase(),
          recipient_username:
            String(recipientUsername)
              .replace(/^@/, "")
              .toLowerCase(),
          amount: String(amount),
          status: "pending",
        }),
      }
    );

    if (!response.ok) {
      console.error(await response.text());

      return NextResponse.json(
        { error: "Could not create payment request." },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        request: Array.isArray(data)
          ? data[0]
          : data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const wallet =
      req.nextUrl.searchParams.get("wallet");

    if (!wallet || !isAddress(wallet)) {
      return NextResponse.json(
        { error: "Valid wallet is required." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_requests?recipient_wallet=eq.${wallet.toLowerCase()}&status=eq.pending&order=created_at.desc`,
      {
        headers: headers(),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Could not load requests." },
        { status: 500 }
      );
    }

    const requests = await response.json();

    return NextResponse.json({ requests });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Request ID is required." },
        { status: 400 }
      );
    }

    if (status !== "paid" && status !== "declined") {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_requests?id=eq.${id}`,
      {
        method: "PATCH",
        headers: {
          ...headers(),
          Prefer: "return=representation",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Could not update request." },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      request: Array.isArray(data)
        ? data[0]
        : data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
