import { getUser, getPlaidConnections } from "~~/server/utils/getUser";

export default defineEventHandler(async (event) => {
    var user = await getUser(event);

    if(!user) {
        throw createError({
            statusCode: 404,
            message: 'User not found'
        })
    }

    const connections = getPlaidConnections(user);
    return { verified: connections.length > 0 }
})