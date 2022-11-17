import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { pool } from '../common_pg';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log('Acquiring DB connection.');
    const client = await pool.acquire();
    try {
        const statement = await client.prepare(
            'select 1 from customeridm.user_company_relation where user_id = $1 and vfs_company_code = $2 and record_source = $3'
        );

        try {
            const userId = req.params.user;
            const companyCode = req.params.company;
            const recordSource = req.query.recordSource;
            context.log('Executing DB statement for user_id = ' + req.query['userId']);
            const result = await statement.execute([userId, companyCode, recordSource]);
            context.log('Preparing response.');
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: {
                    auth: result.rows.length > 0
                }
            };
        } finally {
            context.log('Closing DB statement.');
            statement.close();
        }

    } finally {
        context.log('Releasing DB connection.');
        pool.release(client);
    }
    context.log('Done.');
};

export default httpTrigger;