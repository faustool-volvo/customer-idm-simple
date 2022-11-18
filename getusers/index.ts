import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { pool } from '../common_pg';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log('Acquiring DB connection.');
    const client = await pool.acquire();
    try {
        const { error, rows } = await pool.query('select user_id, count(*) as company_count from customeridm.user_company_relation group by user_id');
        if (error) {
            console.log(error);
            context.res = {
                status: 500, /* Defaults to 200 */
                body: {
                    message: "Internal error"
                }
            };
        }
        const userId = req.params.user;
        const body = {
            count: 0,
            users: []
        }
        rows.array.forEach(row => {
            const record = {
                userId: row['user_id'],
                companyCount: Number((row['company_count'] as BigInt))
            };
            body.users.push(record);
        });
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: body
        };
    } finally {
        context.log('Releasing DB connection.');
        pool.release(client);
    }
    context.log('Done.');
};

export default httpTrigger;