<template>
    <v-snackbar
        :color="snackbarColor"
        v-model="snackbarOpen"
        location="top right"
    >
        {{ snackbarMessage }}
    </v-snackbar>
    <Header />
    <BasicMain>
        <div class="mb-4">
            <h1 class="font-weight-bold text-primary">Settings</h1>
            <p class="text-h6 text-grey-lighten-1">Manage your account and integrations</p>
        </div>

        <!-- Bank Connection Section -->
        <div class="mb-4">
            <MainComponentDefaultCard title="Bank Connections" title-text-size="h6" icon="mdi-link-variant" icon-color="purple-accent-1">
                <p class="text-grey text-body-2 mb-4">Connect your bank accounts using Plaid for automatic transaction tracking</p>

                <div v-if="connectedAccounts.length === 0">
                    <v-alert icon="mdi-information-outline" title="Secure Connection" variant="outlined" density="compact" class="mb-4">
                        <p class="text-caption">Your bank credentials are never stored. Plaid handles secure authentication with your bank.</p>
                    </v-alert>

                    <MainComponentDefaultCard title="Benefits:" class="border-sm mb-2">
                        <v-list density="compact" class="pt-0">
                            <v-list-item>
                                <div class="d-flex ga-2">
                                    <v-icon color="primary">mdi-check</v-icon>
                                    <p class="text-body-2">Automatically import transactions</p>
                                </div>
                            </v-list-item>
                            <v-list-item>
                                <div class="d-flex ga-2">
                                    <v-icon color="primary">mdi-check</v-icon>
                                    <p class="text-body-2">Real-time balance updates</p>
                                </div>
                            </v-list-item>
                            <v-list-item>
                                <div class="d-flex ga-2">
                                    <v-icon color="primary">mdi-check</v-icon>
                                    <p class="text-body-2">Support for 12,000+ financial institutions</p>
                                </div>
                            </v-list-item>
                            <v-list-item>
                                <div class="d-flex ga-2">
                                    <v-icon color="primary">mdi-check</v-icon>
                                    <p class="text-body-2">Multi-account tracking</p>
                                </div>
                            </v-list-item>
                        </v-list>
                    </MainComponentDefaultCard>
                </div>

                <!-- Connected accounts list -->
                <div v-if="connectedAccounts.length > 0" class="mb-4">
                    <p class="text-body-2 font-weight-bold mb-2">Connected Accounts ({{ connectedAccounts.length }})</p>
                    <v-card
                        v-for="account in connectedAccounts"
                        :key="account.accountId"
                        variant="outlined"
                        class="pa-3 mb-2"
                    >
                        <div class="d-flex align-center justify-space-between">
                            <div class="d-flex align-center">
                                <v-icon color="success" class="mr-3">mdi-check-circle</v-icon>
                                <div>
                                    <p class="font-weight-bold text-body-2">{{ account.institutionName || 'Bank Account' }}</p>
                                    <p class="text-caption text-grey">{{ account.name }} {{ account.mask ? `\u2022\u2022${account.mask}` : '' }}</p>
                                </div>
                            </div>
                            <v-btn
                                icon="mdi-link-off"
                                size="small"
                                variant="text"
                                color="red"
                                @click="disconnectBank(account.itemId)"
                                :loading="disconnecting === account.itemId"
                            />
                        </div>
                    </v-card>
                </div>

                <!-- Always show connect button for adding more banks -->
                <PlaidConnectButton class="mt-4" @refresh-setting="refreshSetting" />
                <v-progress-linear v-if="isRefreshing" indeterminate color="purple-accent-3" class="mt-2" />
            </MainComponentDefaultCard>
        </div>

        <!-- Bank Balance Section -->
        <div class="mb-4">
            <MainComponentDefaultCard title="Bank Balances" title-text-size="h6" icon="mdi-currency-usd" icon-color="green">
                <p class="text-grey text-body-2 mb-4">Your current account balances</p>

                <v-alert v-if="connectedAccounts.length === 0" icon="mdi-information-outline" title="Not Connected" variant="elevated" class="mb-4 alert-balance">
                    <p class="text-caption">Connect your bank account above to see your real-time balance here.</p>
                </v-alert>

                <div v-if="balanceAccounts.length > 0">
                    <!-- Total balance summary -->
                    <div class="d-flex align-center justify-space-between mb-4 pa-3 rounded balance-total-card">
                        <div>
                            <p class="text-caption text-grey">Total Available</p>
                            <p class="text-h5 font-weight-bold text-green">{{ formatCurrency(totalAvailable) }}</p>
                        </div>
                        <div>
                            <p class="text-caption text-grey">Total Current</p>
                            <p class="text-h5 font-weight-bold text-lime">{{ formatCurrency(totalCurrent) }}</p>
                        </div>
                    </div>

                    <!-- Per-account balances -->
                    <div class="d-block d-sm-flex align-center ga-2 flex-wrap">
                        <MainComponentDefaultCard
                            v-for="acc in balanceAccounts"
                            :key="acc.accountId"
                            :title="acc.institutionName || acc.name"
                            card-type="outlined"
                        >
                            <p class="text-caption text-grey mb-2">{{ acc.name }} {{ acc.mask ? `\u2022\u2022${acc.mask}` : '' }}</p>
                            <div class="d-flex ga-4">
                                <div>
                                    <p class="text-caption text-grey">Current</p>
                                    <p class="text-h6 font-weight-bold text-lime">{{ formatCurrency(acc.current) }}</p>
                                </div>
                                <div>
                                    <p class="text-caption text-grey">Available</p>
                                    <p class="text-h6 font-weight-bold text-primary">{{ formatCurrency(acc.available) }}</p>
                                </div>
                            </div>
                        </MainComponentDefaultCard>
                    </div>
                </div>
            </MainComponentDefaultCard>
        </div>

        <!-- Account Settings -->
        <div class="mb-4" id="account-setting">
            <MainComponentDefaultCard title="Account Setting" icon="mdi-account-cog-outline" title-text-size="h6">
                <p class="text-grey text-body-2 mb-4">Manage your Minty Budget account preferences</p>
                <div class="mb-4">
                    <MainComponentDefaultCard title="Adjust Monthly Budget" card-type="outlined">
                        <v-number-input prepend-inner-icon="mdi-currency-usd" label="Monthly Budget" variant="outlined" v-model="monthlyBudget" hide-details class="my-4" />
                        <v-btn color="secondary" class="w-100 font-weight-bold" @click="saveMonthlyBudget">Save Monthly Budget</v-btn>
                    </MainComponentDefaultCard>
                </div>
                <div>
                    <MainComponentDefaultCard title="Logout" card-type="outlined" icon="mdi-logout" icon-color="red" card-color="red">
                        <p class="text-grey text-body-2 mb-4">Logout from your Minty Budget account</p>
                        <v-btn color="red" @click="logout" prepend-icon="mdi-logout-variant" class="font-weight-bold">Logout</v-btn>
                    </MainComponentDefaultCard>
                </div>
            </MainComponentDefaultCard>
        </div>
    </BasicMain>
</template>

<script lang="ts" setup>
    import type { BalanceApi } from '~/types/balance';

    definePageMeta({
        middleware: 'auth'
    })

    interface ConnectedAccount {
        accountId: string;
        name: string;
        mask: string;
        type: string;
        subtype: string;
        institutionId: string;
        institutionName: string;
        itemId: string;
    }

    const connectedAccounts = ref<ConnectedAccount[]>([]);
    const balanceAccounts = ref<BalanceApi[]>([]);
    const isRefreshing = ref<boolean>(false);
    const snackbarOpen = ref<boolean>(false);
    const snackbarMessage = ref<string>('');
    const snackbarColor = ref<string>('error');
    const monthlyBudget = ref<number>(0);
    const disconnecting = ref<string | null>(null);
    const { formatCurrency } = useCurrency();
    const { logout } = useAuth();
    const { apiFetch } = useApiFetch();

    const totalAvailable = computed(() =>
        balanceAccounts.value.reduce((sum, a) => sum + (a.available ?? 0), 0)
    );
    const totalCurrent = computed(() =>
        balanceAccounts.value.reduce((sum, a) => sum + (a.current ?? 0), 0)
    );

    onMounted(async () => {
        try {
            await getSetting();
        } catch (err: any) {
            console.error(err);
            if (err.message !== 'Your session has expired. Please log in again.') {
                addSnackBar('error', err.message || 'Failed to load settings');
            }
        }
    })

    async function getSetting() {
        // Fetch connected accounts
        const accountsRes = await apiFetch<{ accounts: ConnectedAccount[] }>('/api/plaid/accounts', { method: 'GET' });
        connectedAccounts.value = accountsRes.accounts;

        // Fetch balances if there are connected accounts (non-fatal — accounts list updates regardless)
        if (connectedAccounts.value.length > 0) {
            try {
                const balanceRes = await apiFetch<{ accounts: BalanceApi[] }>('/api/plaid/balance', { method: 'GET' });
                balanceAccounts.value = balanceRes.accounts;
            } catch (err: any) {
                console.error('Balance fetch failed:', err);
            }
        }

        // Fetch monthly budget
        const budgetRes = await apiFetch<{ monthlyBudget: number }>('/api/account/get-user-monthly-budget', { method: 'GET' });
        monthlyBudget.value = budgetRes.monthlyBudget;
    }

    async function refreshSetting(accounts?: ConnectedAccount[]) {
        isRefreshing.value = true;
        // Optimistic update: show new accounts immediately if provided
        if (accounts && accounts.length > 0) {
            connectedAccounts.value = accounts;
        }
        try {
            await getSetting();
        } catch (err: any) {
            console.error(err);
            if (err.message !== 'Your session has expired. Please log in again.') {
                addSnackBar('error', err.message || 'Failed to refresh settings');
            }
        } finally {
            isRefreshing.value = false;
        }
    }

    async function disconnectBank(itemId: string) {
        disconnecting.value = itemId;
        try {
            await apiFetch('/api/plaid/disconnect', {
                method: 'POST',
                body: { itemId },
            });
            addSnackBar('success', 'Bank account disconnected');
            await getSetting();
        } catch (err: any) {
            addSnackBar('error', err.message || 'Failed to disconnect bank');
        } finally {
            disconnecting.value = null;
        }
    }

    async function saveMonthlyBudget() {
        if (monthlyBudget.value === 0 || monthlyBudget.value < 0) {
            addSnackBar('error', "Monthly budget cannot be or less than 0")
        } else {
            try {
                await apiFetch('/api/account/save-user-monthly-budget', {
                    method: 'POST',
                    body: { monthlyBudget: monthlyBudget.value },
                })
                addSnackBar("success", "Monthly budget successfully saved!");
            } catch (err: any) {
                console.error(err);
                addSnackBar("error", err.message || 'Failed to save budget');
            }
        }
    }

    function addSnackBar(color: string, message: string) {
        snackbarOpen.value = true;
        snackbarColor.value = color;
        snackbarMessage.value = message;
    }
</script>

<style scoped>
    .alert-balance {
        background: hsl(142 60% 40% / 0.18);
    }
    .balance-total-card {
        background: rgba(76, 175, 80, 0.1);
        border: 1px solid rgba(76, 175, 80, 0.3);
    }
</style>
