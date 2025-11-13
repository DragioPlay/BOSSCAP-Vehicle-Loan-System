import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",      
  host: "localhost",
  database: "Vehicle Loan System",     
  password: "Aryan1500", 
  port: 5432,
});

export default pool;
