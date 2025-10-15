import { NextRequest, NextResponse } from "next/server";
import pool from "../../api/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM vehicle ORDER BY vehicle_id ASC");
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET vehicles error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch vehicles" }, { status: 500 });
  }
}

