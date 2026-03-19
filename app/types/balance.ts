export interface BalanceApi {
    accountId: string;
    name: string;
    officialName: string | null;
    mask: string | null;
    type: string;
    subtype: string;
    current: number | null;
    available: number | null;
    isoCurrencyCode: string | null;
    unofficialCurrencyCode: string | null;
    institutionName?: string;
}

export interface PlaidConnection {
    accessToken: string;
    itemId: string;
    institutionId: string;
    institutionName: string;
    accounts: { id: string; mask: string; name: string; subtype: string; type: string }[];
    linkedAt: Date;
}