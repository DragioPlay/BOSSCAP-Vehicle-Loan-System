import { NextRequest, NextResponse } from "next/server";
import pool from "../../db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ⚡ keep it as Promise
) {
  try {
    const { id } = await params; // ⚡ await the promise

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

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

