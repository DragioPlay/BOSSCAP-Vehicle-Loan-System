import { NextRequest, NextResponse } from "next/server";
import pool from "../../db";

//DELETE handler to delete bookings from the database, triggered when someone deletes a booking on the view/edit page
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await pool.query("DELETE FROM booking WHERE booking_id = $1", [params.id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}