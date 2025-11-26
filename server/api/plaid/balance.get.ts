import { plaid } from '../../utils/plaidApi';
import { adminDb } from '../../utils/firebaseAdmin';
import { getUser } from '../../utils/getUser';

export default defineEventHandler(async (event) => {
    const user = await getUser(event);

    if(!user) {
        throw createError({
            statusCode: 404,
            message: "User not found"
        });
    }

    const accessToken = user.plaid.accessToken;
    console.log("ACCESS TOKEN: ", accessToken);
    var plaidRes;

    if(!user.plaid_balance)
    {
        try {
            plaidRes = await plaid.accountsBalanceGet({
                access_token: accessToken,
            })
        } catch (err: any) {
            if (err.response?.data) {
            console.error(
                'Plaid /balance error:',
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

        const accounts = plaidRes.data.accounts

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
        .doc(user.uid)
        .set(
            {
                real_balance: simplified.reduce((sum, data) => sum + data.available! as number, 0),
                plaid_balance: simplified,
            },
            { merge: true }
        )
        return {
            accounts: simplified
        }
    }
    else
    {
        console.log("Plaid balance is defined!")

        const simplified = user.plaid_balance.map((a: any) => ({
            accountId: a.account_id,
            name: a.name,
            officialName: a.official_name,
            mask: a.mask,
            type: a.type,
            subtype: a.subtype,
            current: a.current,
            available: a.available,
            isoCurrencyCode: a.iso_currency_code,
            unofficialCurrencyCode: a.unofficial_currency_code,
        }))

        return {
            accounts: simplified
        }
    }

    

    
})