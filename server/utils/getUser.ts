import { requireUserId } from "./authServer";
import { adminDb } from "./firebaseAdmin";

export async function getUser(event: any): Promise<FirebaseFirestore.DocumentData | undefined>{
    const userId = requireUserId(event);

    if(!userId) {
        throw createError({
            statusCode: 403,
            message: "Unauthorize Access"
        })
    }

    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    return userDoc.data();
}