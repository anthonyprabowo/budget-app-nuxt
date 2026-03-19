import { plaid } from '../../utils/plaidApi'
import { adminDb } from '../../utils/firebaseAdmin'
import { getPlaidConnections } from '../../utils/getUser'

export default defineEventHandler(async (event) => {
    console.log('Cron job running at', new Date().toISOString());
    
    const cronSecret = process.env.CRON_SECRET;
    const authorizationHeader = event.req.headers.authorization;

    if (authorizationHeader !== `Bearer ${cronSecret}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    console.log('Secure cron job running...');

    const snapshot = await adminDb.collection("users").get()

    const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }))

    for(const user of users) {
        const connections = getPlaidConnections(user)
        if (connections.length === 0) continue;

        const allAccounts: any[] = [];

        for (const conn of connections) {
            try {
                const plaidRes = await plaid.accountsBalanceGet({
                    access_token: conn.accessToken,
                })

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
                }))

                allAccounts.push(...accounts)
            } catch (err: any) {
                console.error(
                    `Plaid /cron/update-bank-balance error for ${conn.institutionName}:`,
                    err.response?.data || err
                )
            }
        }

        await adminDb.collection('users')
        .doc(user.id)
        .set(
            {
                real_balance: allAccounts.reduce((sum, a) => sum + (a.available ?? 0), 0),
                plaid_balance: allAccounts,
            },
            { merge: true }
        )
    }
        
    return new Response('Cron job executed successfully!');
});