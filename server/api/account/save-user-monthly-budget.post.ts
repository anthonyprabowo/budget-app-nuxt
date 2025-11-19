import { adminDb } from "#imports";
import { getUser } from "#imports";

export default defineEventHandler(async (event) => {
    const body = await readBody<{ monthlyBudget?: number }>(event)
    const user = await getUser(event);

    if(!body.monthlyBudget) {
        throw createError({
            statusCode: 400,
            message: "Monthly budget missing from field"
        })
    }

    if(body.monthlyBudget === 0 || body.monthlyBudget < 0) {
        throw createError({
            statusCode: 400,
            message: 'Monthly budget cannot be or less than 0'
        })
    }

    if(!user) {
        throw createError({
            statusCode: 403,
            message: 'You are unauthorized to access this app'
        })
    }

    await adminDb.collection("users")
        .doc(user.uid)
        .set(
            {
                monthlyBudget: body.monthlyBudget
            },
            { merge: true }
        )

    return { ok: true }
    
})