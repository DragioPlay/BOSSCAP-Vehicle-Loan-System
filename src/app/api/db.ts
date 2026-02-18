import { Pool } from "pg";

// Neon PostgreSQL connection (for deployment)
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_ueGjB4JPit8m@ep-holy-sea-ai0jcbox-pooler.c-4.us-east-1.aws.neon.tech/vehicle-loan-system?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false, // Neon requires SSL
  },
});

export default pool;

