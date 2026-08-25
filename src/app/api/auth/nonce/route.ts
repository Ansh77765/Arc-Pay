import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const nonce = crypto.randomBytes(32).toString("hex");

  const response = NextResponse.json(
    { nonce },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );

  response.cookies.set(
    "arc_pay_nonce",
    nonce,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 300,
    }
  );

  return response;
}
