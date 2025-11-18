import { CountryCode, DepositoryAccountSubtype, Products } from 'plaid'
import { plaid } from '../../utils/plaidApi'
import { requireUserId } from '~~/server/utils/authServer'


export default defineEventHandler(async (event) => {
  const body = await readBody<{ userId?: string }>(event)
  const userId = requireUserId(event);

  try {
    const response = await plaid.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Nuxt Plaid Demo',
      language: 'en',
      country_codes: [CountryCode.Us],
      products: [Products.Transactions],
      transactions: { 
        days_requested: 90
      },
      redirect_uri: process.env.PLAID_REDIRECT_URL || '',
      account_filters: {
        depository: {
          account_subtypes: [DepositoryAccountSubtype.Checking]
        }
      }
    })

    return { link_token: response.data.link_token }
  } catch (err: any) {
    if (err.response?.data) {
      console.error(
        'Plaid /link/token/create error:',
        JSON.stringify(err.response.data, null, 2),
      )
    } else {
      console.error('Plaid error (no response.data):', err)
    }

    throw createError({
      statusCode: 500,
      statusMessage:
        err.response?.data?.error_message || 'Plaid link_token create failed',
      data: err.response?.data,
    })
  }
})
