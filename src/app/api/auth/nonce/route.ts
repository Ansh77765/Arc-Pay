import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const nonce = crypto.randomBytes(32).toString("hex");

  return NextResponse.json(
    { nonce },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
