import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

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

    // Validate account ID is a non-empty string (real extension returns hex, demo returns miden1sim...)
    if (typeof creator_account !== "string" || creator_account.trim().length < 6) {
      return NextResponse.json(
        { error: "Invalid Miden Account ID" },
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

export async function PATCH(request: Request) {
  try {
    const { note_id } = await request.json();
    
    if (!note_id) {
      return NextResponse.json({ error: "Missing note_id" }, { status: 400 });
    }

    await sql`
      UPDATE active_swaps 
      SET status = 'fulfilled' 
      WHERE note_id = ${note_id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to fulfill swap:", error);
    return NextResponse.json(
      { error: "Failed to update swap status" },
      { status: 500 }
    );
  }
}
