import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { pool } from '../common_pg';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log('Acquiring DB connection.');
    const client = await pool.acquire();
    try {
        const statement = await client.prepare(
            'select user_id, count(*) as company_count from customeridm.user_company_relation group by user_id'
        );

        try {
            const userId = req.params.user;
            const body = {
                users: []
            }
            context.log('Executing DB statement for user_id = ' + req.query['userId']);
            for (const row of await statement.execute([userId])) {
                const record = {
                    userId: row.get('user_id'),
                    companyCount: Number((row.get('company_count') as BigInt))
                };
                body.users.push(record);
            }

            context.log('Preparing response.');
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: body
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