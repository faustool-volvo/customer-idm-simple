import { Context, HttpRequest } from "@azure/functions";
import { Pool } from "pg";
import { handleError } from "../common/handle_error";

class GetUserCustomersFunction {
    pool: Pool;

    constructor() {
        this.pool = new Pool();
    }

    async run(context: Context, req: HttpRequest): Promise<void> {
        context.log('HTTP trigger function processed a request.');
        try {
            const userId = req.params.user;
            const query = {
                name: 'get-user-customers',
                text: 'select user_id, vfs_company_code, record_source from customeridm.user_company_relation where user_id = $1',
                values: [userId]
            }
            const { rows } = await this.pool.query(query);

            const body = {
                userId: userId,
                companies: []
            }

            rows.forEach(row => {
                const record = {
                    companyCode: row.vfs_company_code,
                    recordSource: row.record_source
                };
                body.companies.push(record);
            });

            context.res = {
                // status: 200, /* Defaults to 200 */
                body: body
            };
        } catch (error) {
            handleError(error, context);
        }
        context.log('Done.');
    }
}

const func = new GetUserCustomersFunction();
module.exports = func;