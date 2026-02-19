import { NextRequest, NextResponse } from "next/server";
import pool from "../../db";

// DELETE /api/vehicles/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } } // just an object, not a Promise
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const result = await pool.query(
      "DELETE FROM vehicle WHERE vehicle_id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/vehicles/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
