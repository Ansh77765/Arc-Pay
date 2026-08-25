import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isAddress } from "viem";

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const SESSION_SECRET =
  process.env.SESSION_SECRET;

function headers() {
  if (
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "Supabase environment variables are missing."
    );
  }

  return {
    apikey:
      SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type":
      "application/json",
  };
}

/*
 * ============================================================
 * VERIFY SESSION
 * ============================================================
 */

function getAuthenticatedWallet(
  req: NextRequest
) {
  if (!SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET is missing."
    );
  }

  const token =
    req.cookies.get(
      "arc_pay_session"
    )?.value;

  if (!token) {
    return null;
  }

  const parts =
    token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [
    encoded,
    providedSignature,
  ] = parts;

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        SESSION_SECRET
      )
      .update(encoded)
      .digest("base64url");

  /*
   * Prevent timing attacks.
   */
  const providedBuffer =
    Buffer.from(
      providedSignature
    );

  const expectedBuffer =
    Buffer.from(
      expectedSignature
    );

  if (
    providedBuffer.length !==
    expectedBuffer.length
  ) {
    return null;
  }

  if (
    !crypto.timingSafeEqual(
      providedBuffer,
      expectedBuffer
    )
  ) {
    return null;
  }

  try {
    const payload =
      JSON.parse(
        Buffer.from(
          encoded,
          "base64url"
        ).toString("utf8")
      );

    if (
      !payload.address ||
      !isAddress(
        payload.address
      )
    ) {
      return null;
    }

    if (
      !payload.expiresAt ||
      Date.now() >
        Number(
          payload.expiresAt
        )
    ) {
      return null;
    }

    return String(
      payload.address
    ).toLowerCase();
  } catch {
    return null;
  }
}

/*
 * ============================================================
 * POST — CREATE REQUEST
 * ============================================================
 */

export async function POST(
  req: NextRequest
) {
  try {
    const authenticatedWallet =
      getAuthenticatedWallet(
        req
      );

    if (!authenticatedWallet) {
      return NextResponse.json(
        {
          error:
            "Wallet authentication required.",
        },
        { status: 401 }
      );
    }

    const body =
      await req.json();

    const {
      requesterWallet,
      requesterUsername,
      recipientWallet,
      recipientUsername,
      amount,
    } = body;

    if (
      !requesterWallet ||
      !isAddress(
        requesterWallet
      ) ||
      !recipientWallet ||
      !isAddress(
        recipientWallet
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid wallet address.",
        },
        { status: 400 }
      );
    }

    /*
     * IMPORTANT:
     *
     * The server uses the authenticated wallet,
     * not a wallet address supplied by the browser.
     */
    if (
      requesterWallet.toLowerCase() !==
      authenticatedWallet
    ) {
      return NextResponse.json(
        {
          error:
            "Authenticated wallet does not match requester.",
        },
        { status: 403 }
      );
    }

    if (
      authenticatedWallet ===
      recipientWallet.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot request payment from yourself.",
        },
        { status: 400 }
      );
    }

    if (
      !requesterUsername ||
      !recipientUsername ||
      !amount
    ) {
      return NextResponse.json(
        {
          error:
            "Missing request information.",
        },
        { status: 400 }
      );
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid amount.",
        },
        { status: 400 }
      );
    }

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/payment_requests`,
        {
          method: "POST",
          headers: {
            ...headers(),
            Prefer:
              "return=representation",
          },
          body: JSON.stringify({
            requester_wallet:
              authenticatedWallet,

            requester_username:
              String(
                requesterUsername
              )
                .replace(/^@/, "")
                .toLowerCase(),

            recipient_wallet:
              recipientWallet.toLowerCase(),

            recipient_username:
              String(
                recipientUsername
              )
                .replace(/^@/, "")
                .toLowerCase(),

            amount:
              String(amount),

            status:
              "pending",
          }),
        }
      );

    if (!response.ok) {
      console.error(
        await response.text()
      );

      return NextResponse.json(
        {
          error:
            "Could not create payment request.",
        },
        { status: 500 }
      );
    }

    const data =
      await response.json();

    return NextResponse.json(
      {
        request:
          Array.isArray(data)
            ? data[0]
            : data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Something went wrong.",
      },
      { status: 500 }
    );
  }
}

/*
 * ============================================================
 * GET — LOAD PENDING REQUESTS
 * ============================================================
 */

export async function GET(
  req: NextRequest
) {
  try {
    const authenticatedWallet =
      getAuthenticatedWallet(
        req
      );

    if (!authenticatedWallet) {
      return NextResponse.json(
        {
          error:
            "Wallet authentication required.",
        },
        { status: 401 }
      );
    }

    const wallet =
      req.nextUrl.searchParams.get(
        "wallet"
      );

    if (
      !wallet ||
      !isAddress(wallet)
    ) {
      return NextResponse.json(
        {
          error:
            "Valid wallet is required.",
        },
        { status: 400 }
      );
    }

    /*
     * The browser cannot ask for another
     * wallet's requests.
     */
    if (
      wallet.toLowerCase() !==
      authenticatedWallet
    ) {
      return NextResponse.json(
        {
          error:
            "You can only view your own requests.",
        },
        { status: 403 }
      );
    }

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/payment_requests?recipient_wallet=eq.${authenticatedWallet}&status=eq.pending&order=created_at.desc`,
        {
          headers:
            headers(),
          cache:
            "no-store",
        }
      );

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Could not load requests.",
        },
        { status: 500 }
      );
    }

    const requests =
      await response.json();

    return NextResponse.json({
      requests,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Something went wrong.",
      },
      { status: 500 }
    );
  }
}

/*
 * ============================================================
 * PATCH — PAY / DECLINE REQUEST
 * ============================================================
 */

export async function PATCH(
  req: NextRequest
) {
  try {
    const authenticatedWallet =
      getAuthenticatedWallet(
        req
      );

    if (!authenticatedWallet) {
      return NextResponse.json(
        {
          error:
            "Wallet authentication required.",
        },
        { status: 401 }
      );
    }

    const {
      id,
      status,
    } =
      await req.json();

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Request ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      status !== "paid" &&
      status !== "declined"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid status.",
        },
        { status: 400 }
      );
    }

    /*
     * Only update a request that:
     *
     * 1. belongs to the authenticated wallet
     * 2. is still pending
     */
    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/payment_requests?id=eq.${encodeURIComponent(id)}&recipient_wallet=eq.${authenticatedWallet}&status=eq.pending`,
        {
          method: "PATCH",
          headers: {
            ...headers(),
            Prefer:
              "return=representation",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

    if (!response.ok) {
      console.error(
        await response.text()
      );

      return NextResponse.json(
        {
          error:
            "Could not update request.",
        },
        { status: 500 }
      );
    }

    const data =
      await response.json();

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Request not found or already processed.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      request:
        data[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
