import { Context, HttpRequest } from "@azure/functions";
import { Pool } from "pg";
import { handleError } from '../common/handle_error'

const query = {
    name: 'get-users',
    text: 'select user_id, count(*) as company_count from customeridm.user_company_relation group by user_id'
}

class GetUsersFunction {
    pool: Pool;

    constructor() {
        this.pool = new Pool();
    }

    async run(context: Context, req: HttpRequest): Promise<void> {
        context.log('HTTP trigger function processed a request.');
        context.log('Acquiring DB connection.');
        try {
            const { rows } = await this.pool.query(query);
            const body = {
                count: 0,
                users: []
            }
            rows.forEach(row => {
                const record = {
                    userId: row.user_id,
                    companyCount: row.company_count
                };
                body.users.push(record);
            });
            body.count = body.users.length;
            context.res = {
                body: body
            }
        } catch (error) {
            handleError(error, context);
        }
    }
}

const func = new GetUsersFunction();
module.exports = func;