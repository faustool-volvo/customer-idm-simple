import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { randomInt, randomUUID } from "crypto";
import { pool } from '../common_pg';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const userIdsCount = req.query.userCount ? parseInt(req.query.userCount) : 20;
    const companyCodesCount = req.query.companyCount ? parseInt(req.query.companyCount) : 100;

    const userIds = []
    for (let i = 0; i < userIdsCount; i++) {
        userIds[i] = randomUUID();
    }

    const recordSources = ['rs1', 'rs2', 'rs3', 'rs4', 'rs5'];
    const companyCodes = [];
    for (let i = 0; i < companyCodesCount; i++) {
        companyCodes[i] = {
            recordSource: recordSources[randomInt(recordSources.length)],
            code: randomUUID()
        }
    }

    context.log('Acquiring DB connection.');
    pool.acquire().then((client) => {
        client.prepare('insert into customeridm.user_company_relation(user_id, vfs_company_code, record_source) values ($1, $2, $3)').then((statement) => {
            const statementExecutions = [];
            userIds.forEach((userId) => {
                const userCompanyCount = randomInt(50);
                for (let j = 0; j < userCompanyCount; j++) {
                    const company = companyCodes[randomInt(companyCodesCount)];
                    statementExecutions.push(statement.execute([userId, company.code, company.recordSource]).catch((error) => {
                        console.log(`Error inserting userId=${userId},companyCode=${company.code},recordSource=${company.recordSource}: ${error.message}`);
                    }));
                }
            })
            Promise.all(statementExecutions).finally(() => {
                statement.close();
                pool.release(client);
            })
        }).catch(() => {
            pool.release(client);
        });
    });
};

export default httpTrigger;