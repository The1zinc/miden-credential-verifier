import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    // Create active_swaps table
    await sql`
      CREATE TABLE IF NOT EXISTS active_swaps (
          id SERIAL PRIMARY KEY,
          note_id VARCHAR(255) UNIQUE NOT NULL,
          creator_account VARCHAR(255) NOT NULL,
          offering_asset VARCHAR(100) NOT NULL,
          offering_amount NUMERIC NOT NULL,
          requesting_asset VARCHAR(100) NOT NULL,
          requesting_amount NUMERIC NOT NULL,
          status VARCHAR(50) DEFAULT 'open',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_swaps_status ON active_swaps(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_swaps_creator ON active_swaps(creator_account)`;

    return NextResponse.json({ message: "Database tables and indexes created successfully!" });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return NextResponse.json(
      { error: "Failed to initialize database", details: String(error) },
      { status: 500 }
    );
  }
}
