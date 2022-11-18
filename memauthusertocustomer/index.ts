import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Client, SSLMode } from "ts-postgres";
import schedule = require('node-schedule');

class MemCacheFunction {
    cache: Set<string>;

    async loadCache() {
        console.log("Loading cache");
        const client = new Client({
            host: process.env.pg_host,
            port: parseInt(process.env.pg_port),
            database: process.env.pg_db,
            user: process.env.pg_user,
            password: process.env.pg_pass,
            keepAlive: true,
            ssl: SSLMode.Disable
        });
        console.log("Preparing statement");
        const statement = await client.prepare('select concat(user_id, vfs_company_code, record_source) from customeridm.user_company_relation');
        try {
            console.log("Executing statement...");
            const result = await statement.execute();
            console.log("Statement completed.");
            this.cache = new Set(result.rows.map(row => {
                const key = row[0].toString();
                console.log("Adding " + key);
                return key;
                
            }));
        } finally {
            console.log("Cache loaded");
            statement.close();
        }
    }

    constructor() {
        console.log("Scheduling load every 5 minutes");
        schedule.scheduleJob('*/5 * * * *', this.loadCache);
    }

    async run(context: Context, req: HttpRequest): Promise<void> {
        context.log('HTTP trigger function processed a request.');
        if (!this.cache) {
            await this.loadCache();
        }
        const userId = req.params.user;
        const companyCode = req.params.company;
        const recordSource = req.query.recordSource;
        const key = userId + companyCode + recordSource;
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {
                auth: this.cache.has(key)
            }
        };
        context.log('Done.');
    }
}

const func = new MemCacheFunction()
module.exports = func;