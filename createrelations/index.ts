import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { randomInt, randomUUID } from "crypto";

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

    const { Client } = require('pg')
    const client = new Client();

    client
        .connect()
        .then(() => {
            const statementExecutions = [];
            userIds.forEach(userId => {
                const userCompanyCount = randomInt(companyCodesCount) + 1;
                const codesUsed: boolean[] = [];
                for (let j = 0; j < userCompanyCount; j++) {
                    let companyIndex = 0;
                    do {
                        companyIndex = randomInt(companyCodesCount);
                    } while (codesUsed[companyIndex])
                    codesUsed[companyIndex] = true;
                    const company = companyCodes[companyIndex];
                    const query = {
                        // give the query a unique name
                        name: 'insert-user-company-relation',
                        text: 'insert into customeridm.user_company_relation(user_id, vfs_company_code, record_source) values ($1, $2, $3)',
                        values: [userId, company.code, company.recordSource],
                    }
                    statementExecutions.push(client.query(query).catch(error => {
                        console.log(`Error inserting userId=${userId},companyCode=${company.code},recordSource=${company.recordSource}: ${error.message}`);
                    }));
                }
            });
            Promise.all(statementExecutions).finally(() => {
                client.end();
            })
        })
};

export default httpTrigger;