import { Client, SSLMode } from 'ts-postgres';
import { createPool } from 'generic-pool';

export const pool = createPool({
    create: async () => {
        console.log('Creating DB connection');
        const client = new Client({
            host: process.env.pg_host,
            port: parseInt(process.env.pg_port),
            database: process.env.pg_db,
            user: process.env.pg_user,
            password: process.env.pg_pass,
            keepAlive: true,
            ssl: SSLMode.Disable
        });
        return client.connect().then(() => {
            client.on('error', console.log);
            return client;
        });
    },
    destroy: async (client: Client) => {
        console.log('Destroying DB connection');
        return client.end().then(() => { })
    },
    validate: (client: Client) => {
        console.log('Validating DB connection');
        return Promise.resolve(!client.closed);
    }
}, { testOnBorrow: true });