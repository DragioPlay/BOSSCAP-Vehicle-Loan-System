import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",      // 👈 change this
  host: "localhost",         // or your server IP
  database: "Vehicle Loan System",       // 👈 your DB name
  password: "Aryan1500", // 👈 change this
  port: 5432,
});

export default pool;
