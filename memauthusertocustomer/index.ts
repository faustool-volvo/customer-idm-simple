import { Context, HttpRequest } from "@azure/functions";
import { Client } from "pg";
import schedule = require('node-schedule');

const query = {
    name: "load-user-comp-mem-cache",
    text: 'select concat(user_id, vfs_company_code, record_source) as concat from customeridm.user_company_relation'
}

class MemAuthUserCustomerFunction {
    cache: Set<string>;

    async loadCache() {
        console.log("Loading cache");
        const client = new Client();
        await client.connect();
        try {
            const res = await client.query(query);
            this.cache = new Set(res.rows.map((row) => row['concat']));
        } finally {
            console.log("Cache loaded");
            client.end();
        }
    }

    constructor() {
        this.loadCache();
        console.log("Scheduling load every 5 minutes");
        schedule.scheduleJob('*/5 * * * *', this.loadCache);
    }

    async run(context: Context, req: HttpRequest): Promise<void> {
        context.log('HTTP trigger function processed a request.');
        if (!this.cache) {
            context.res = {
                status: 500,
                body: {
                    message: 'Not ready'
                }
            };
            return;
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

const func = new MemAuthUserCustomerFunction()
module.exports = func;