import { NextRequest, NextResponse } from "next/server";
import {
  verifyMessage,
  isAddress,
} from "viem";
import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET;

function createSessionToken(
  address: string
) {
  if (!SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET is missing."
    );
  }

  const payload = JSON.stringify({
    address: address.toLowerCase(),
    expiresAt:
      Date.now() +
      1000 * 60 * 60 * 24,
  });

  const encoded =
    Buffer.from(payload).toString(
      "base64url"
    );

  const signature =
    crypto
      .createHmac(
        "sha256",
        SESSION_SECRET
      )
      .update(encoded)
      .digest("base64url");

  return `${encoded}.${signature}`;
}

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const {
      address,
      signature,
      message,
    } = body;

    if (
      !address ||
      !isAddress(address) ||
      !signature ||
      !message
    ) {
      return NextResponse.json(
        {
          error:
            "Address, signature and message are required.",
        },
        { status: 400 }
      );
    }

    const nonce =
      req.cookies.get(
        "arc_pay_nonce"
      )?.value;

    if (!nonce) {
      return NextResponse.json(
        {
          error:
            "Verification expired. Please try again.",
        },
        { status: 401 }
      );
    }

    if (!message.includes(nonce)) {
      return NextResponse.json(
        {
          error:
            "Invalid verification message.",
        },
        { status: 401 }
      );
    }

    const valid =
      await verifyMessage({
        address,
        message,
        signature,
      });

    if (!valid) {
      return NextResponse.json(
        {
          error:
            "Wallet signature is invalid.",
        },
        { status: 401 }
      );
    }

    const sessionToken =
      createSessionToken(address);

    const response =
      NextResponse.json({
        authenticated: true,
        address:
          address.toLowerCase(),
      });

    /*
     * Remove the used nonce.
     */
    response.cookies.set(
      "arc_pay_nonce",
      "",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      }
    );

    /*
     * Create authenticated wallet session.
     */
    response.cookies.set(
      "arc_pay_session",
      sessionToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge:
          60 * 60 * 24,
      }
    );

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Wallet verification failed.",
      },
      { status: 500 }
    );
  }
}
