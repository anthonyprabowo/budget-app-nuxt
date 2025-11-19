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
}[]