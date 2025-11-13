import { NextRequest, NextResponse } from "next/server";
import pool from "../db";

//GET handler to fetch all bookings to show on calendars
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM booking ORDER BY booking_id");
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET bookings error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch bookings" }, { status: 500 });
  }
}

//POST handler to create a new booking for Make Booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicle_id, name, email, phone, start_date, end_date } = body;

    //Basic validation to make sure all fields are provided
    if (!vehicle_id || !name || !email || !phone || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const query = `
      INSERT INTO booking (vehicle_id, name, email, phone, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [vehicle_id, name, email, phone, start_date, end_date];
    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err: any) {
    console.error("POST booking error:", err);
    return NextResponse.json({ error: err.message || "Failed to create booking" }, { status: 500 });
  }
}

//PUT handler to update an existing booking from the view/edit page
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { booking_id, name, email, phone, start_date, end_date } = body;

    if (!booking_id) {
        return NextResponse.json({ error: "Booking ID is required for updating" }, { status: 400 });
    }

    const query = `
      UPDATE booking
      SET name = $1, email = $2, phone = $3, start_date = $4, end_date = $5
      WHERE booking_id = $6
      RETURNING *;
    `;
    const values = [name, email, phone, start_date, end_date, booking_id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("PUT /api/bookings error:", err);
    return NextResponse.json({ error: err.message || "Failed to update booking" }, { status: 500 });
  }
}

