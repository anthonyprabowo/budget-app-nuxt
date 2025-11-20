import { plaid } from '../../utils/plaidApi'
import { adminDb } from '../../utils/firebaseAdmin'

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
        // @ts-ignore ignore firestore type checking
        if(!user.plaid) {
            continue;
        }

        var plaidRes;
        try {
            plaidRes = await plaid.accountsBalanceGet({
                // @ts-ignore
                access_token: user.plaid.accessToken,
            })
        } catch (err: any) {
            if (err.response?.data) {
            console.error(
                'Plaid /cron/update-bank-balance error:',
                JSON.stringify(err.response.data, null, 2),
            )
            } else {
            console.error('Plaid error (no response.data):', err)
            }

            throw createError({
            statusCode: 500,
            statusMessage:
                err.response?.data?.error_message || 'Plaid balance create failed',
            data: err.response?.data,
            })
        }

        const accounts = plaidRes.data.accounts;
        const simplified = accounts.map((a) => ({
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
        }))

        await adminDb.collection('users')
        // @ts-ignore
        .doc(user.uid)
        .set(
            {
                real_balance: simplified.reduce((sum, data) => sum + Math.abs(data.available as number), 0),
                plaid_balance: simplified,
            },
            { merge: true }
        )
    }
        
    return new Response('Cron job executed successfully!');
});