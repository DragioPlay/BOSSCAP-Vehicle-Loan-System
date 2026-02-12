import { NextRequest, NextResponse } from "next/server";
import pool from "../../db";

// Updated to handle params as a Promise
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 1. Await the params to get the id
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // 2. Perform the database query
    const result = await pool.query("DELETE FROM vehicle WHERE vehicle_id = $1", [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/vehicles/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}