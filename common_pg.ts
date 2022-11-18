import { Pool } from 'pg';
// pools will use environment variables
// for connection information
export const pool = new Pool();