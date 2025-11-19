import { adminDb } from "../../utils/firebaseAdmin";
import { getUser } from "#imports";

export default defineEventHandler(async (event: any) => {
    const user = await getUser(event);

    if(!user) {
        throw createError({
            statusCode: 403,
            message: "You are unauthorized to use this app"
        })
    }

    if(!user.monthlyBudget) {
        await adminDb.collection('users')
        .doc(user.uid)
        .set(
            {
                monthlyBudget: 0
            },
            { merge: true }
        )
    }

    return { monthlyBudget: user.monthlyBudget ?? 0 };
})