import { NextRequest, NextResponse } from "next/server";
import pool from "../../db";

// Updated to treat params as a Promise
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Change this to a Promise
) {
  try {
    // Await the params before accessing the id
    const { id } = await params;

    await pool.query("DELETE FROM booking WHERE booking_id = $1", [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}