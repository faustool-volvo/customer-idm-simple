import { Context, HttpRequest } from "@azure/functions";
import { randomUUID } from "crypto";

export const handleError = function(error: Error, context: Context) {
    const uuid = randomUUID();
    context.log.error(`[${uuid}]: ${error}`);
    context.res = {
        status: 500,
        body: {
            message: `Internal Server Error (${uuid})`
        }
    }
    
};
