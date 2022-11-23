import { Context, HttpRequest } from "@azure/functions";
import { Pool } from 'pg';
import { handleError } from '../common/handle_error'

class AuthUserCustomerFunction {
    pool: Pool

    constructor() {
        this.pool = new Pool();
    }

    async run(context: Context, req: HttpRequest): Promise<void> {
        context.log('HTTP trigger function processed a request.');
        context.log('Acquiring DB connection.');

        const userId = req.params.user;
        const companyCode = req.params.company;
        const recordSource = req.query.recordSource;

        try {
            context.log(`Executing DB statement for user_id = ${userId}, company_code = ${companyCode}, record_source = ${recordSource}`);
            const { rows } = await this.pool.query('select 1 from customeridm.user_company_relation where user_id = $1 and vfs_company_code = $2 and record_source = $3', [userId, companyCode, recordSource]);
            context.log('Preparing response.');
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: {
                    auth: rows.length > 0
                }
            };
        } catch (error) {
            handleError(error, context);
        }
    };
}


const func = new AuthUserCustomerFunction();
module.exports = func;