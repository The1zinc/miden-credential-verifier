import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const swaps = await sql`
      SELECT 
        id, 
        note_id, 
        creator_account, 
        offering_asset, 
        offering_amount, 
        requesting_asset, 
        requesting_amount, 
        status, 
        created_at
      FROM active_swaps
      WHERE status = 'open'
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return NextResponse.json({ swaps });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch open swaps" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { note_id, creator_account, offering_asset, offering_amount, requesting_asset, requesting_amount } = body;

    if (!note_id || !creator_account || !offering_asset || !offering_amount || !requesting_asset || !requesting_amount) {
      return NextResponse.json(
        { error: "Missing required fields for swap note" },
        { status: 400 }
      );
    }

    // Basic Bech32 prefix validation for Miden Account ID
    if (!creator_account.startsWith("miden1")) {
      return NextResponse.json(
        { error: "Invalid Miden Account ID format" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO active_swaps (
        note_id, 
        creator_account, 
        offering_asset, 
        offering_amount, 
        requesting_asset, 
        requesting_amount
      ) 
      VALUES (
        ${note_id}, 
        ${creator_account}, 
        ${offering_asset}, 
        ${offering_amount}, 
        ${requesting_asset}, 
        ${requesting_amount}
      )
      ON CONFLICT (note_id) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Swap creation error:", error);
    return NextResponse.json(
      { error: "Failed to create swap listing" },
      { status: 500 }
    );
  }
}
