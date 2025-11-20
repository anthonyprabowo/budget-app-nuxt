import { getUser } from "~~/server/utils/getUser";

export default defineEventHandler(async (event) => {
    var user = await getUser(event);

    if(!user) {
        throw createError({
            statusCode: 404,
            message: 'User not found'
        })
    }

    return { verified: user.plaid && user.plaid.access_token !== '' }
})