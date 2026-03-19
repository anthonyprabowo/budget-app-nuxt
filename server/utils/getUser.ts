import { requireUserId } from "./authServer";
import { adminDb } from "./firebaseAdmin";

export async function getUser(event: any): Promise<(FirebaseFirestore.DocumentData & { uid: string }) | undefined>{
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

    return { uid: userId, ...userDoc.data() };
}

/**
 * Get all Plaid connections for a user, supporting both legacy `plaid` field
 * and new `plaid_connections` array for backward compatibility.
 */
export function getPlaidConnections(userData: FirebaseFirestore.DocumentData): Array<{
    accessToken: string;
    itemId: string;
    institutionId: string;
    institutionName: string;
    accounts: any[];
    linkedAt: any;
}> {
    const connections: any[] = [];

    // New multi-account format
    if (Array.isArray(userData.plaid_connections)) {
        connections.push(...userData.plaid_connections);
    }

    // Legacy single-account format
    if (userData.plaid && userData.plaid.accessToken && !Array.isArray(userData.plaid_connections)) {
        connections.push(userData.plaid);
    }

    return connections;
}