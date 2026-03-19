import { plaid } from '../../utils/plaidApi';
import { adminDb } from '../../utils/firebaseAdmin';
import { getUser, getPlaidConnections } from '../../utils/getUser';

export default defineEventHandler(async (event) => {
    const user = await getUser(event);

    if(!user) {
        throw createError({
            statusCode: 404,
            message: "User not found"
        });
    }

    const connections = getPlaidConnections(user);

    if (connections.length === 0) {
        return { accounts: [] };
    }

    // Use cached data if available and covers all connections.
    // Count distinct institution names in cache vs connections to detect staleness.
    const cachedAccounts = user.plaid_balance;
    const cachedInstitutions = new Set(
        (cachedAccounts || []).map((a: any) => a.institutionName).filter(Boolean)
    );
    const connInstitutions = new Set(
        connections.map((c) => c.institutionName).filter(Boolean)
    );
    const cacheIsComplete = cachedAccounts
        && cachedAccounts.length > 0
        && connInstitutions.size > 0
        && [...connInstitutions].every((name) => cachedInstitutions.has(name));

    if (cacheIsComplete) {
        return {
            accounts: cachedAccounts.map((a: any) => ({
                accountId: a.accountId || a.account_id,
                name: a.name,
                officialName: a.officialName || a.official_name,
                mask: a.mask,
                type: a.type,
                subtype: a.subtype,
                current: a.current,
                available: a.available,
                isoCurrencyCode: a.isoCurrencyCode || a.iso_currency_code,
                unofficialCurrencyCode: a.unofficialCurrencyCode || a.unofficial_currency_code,
                institutionName: a.institutionName || null,
            }))
        };
    }

    // Fetch fresh data from all connections
    const allAccounts: any[] = [];

    for (const conn of connections) {
        try {
            const plaidRes = await plaid.accountsBalanceGet({
                access_token: conn.accessToken,
            });

            const accounts = plaidRes.data.accounts.map((a) => ({
                accountId: a.account_id,
                name: a.name,
                officialName: a.official_name,
                mask: a.mask,
                type: a.type,
                subtype: a.subtype,
                current: a.balances.current,
                available: a.balances.available,
                isoCurrencyCode: a.balances.iso_currency_code,
                unofficialCurrencyCode: a.balances.unofficial_currency_code,
                institutionName: conn.institutionName || null,
            }));

            allAccounts.push(...accounts);
        } catch (err: any) {
            console.error(
                `Plaid /balance error for ${conn.institutionName}:`,
                err.response?.data || err
            );
            // Continue with other connections instead of failing entirely
        }
    }

    // Cache results in Firestore
    await adminDb.collection('users')
        .doc(user.uid)
        .set(
            {
                real_balance: allAccounts.reduce((sum, a) => sum + (a.available ?? 0), 0),
                plaid_balance: allAccounts,
            },
            { merge: true }
        );

    return { accounts: allAccounts };
})