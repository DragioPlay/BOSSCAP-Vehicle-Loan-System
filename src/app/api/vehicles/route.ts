import { NextRequest, NextResponse } from "next/server";
import pool from "../db";

//GET handler to fetch all vehicles to show on the Make Bookings
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM vehicle ORDER BY vehicle_id ASC");
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET vehicles error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch vehicles" }, { status: 500 });
  }
}

//POST handler to create a new vehicle from the settings page
export async function POST(req: NextRequest) {
  try {
    const { model, trim, vin, nickname } = await req.json(); 
    if (!model || !trim || !vin || !nickname) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const query = `
      INSERT INTO vehicle (model, trim, vin, nickname)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [model, trim, vin, nickname];
    const result = await pool.query(query, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err: any) {
    console.error("POST vehicles error:", err);
    return NextResponse.json({ error: err.message || "Failed to create vehicle" }, { status: 500 });
  }
}

//PUT handler to update an existing vehicle from the settings page
export async function PUT(req: NextRequest) {
  try {
    const { vehicle_id, model, trim, vin, nickname } = await req.json(); 
    if (!vehicle_id) {
      return NextResponse.json({ error: "vehicle_id is required" }, { status: 400 });
    }

    const query = `
      UPDATE vehicle
      SET model = $1, trim = $2, vin = $3, nickname = $4
      WHERE vehicle_id = $5
      RETURNING *;
    `;
    const values = [model, trim, vin, nickname, vehicle_id]; 
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("PUT /api/vehicles error:", err);
    return NextResponse.json({ error: err.message || "Failed to update vehicle" }, { status: 500 });
  }
}
