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
        <div  class="mb-4">
            <MainComponentDefaultCard :title="'Bank Connection'" :title-text-size="'h6'" :icon="'mdi-link-variant'" :icon-color="'purple-accent-1'">
                <p class="text-grey text-body-2 mb-4">Connect your bank account using Plaid for automatic transaction tracking</p>

                <div v-if="!isBankConnected">
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
                    <PlaidConnectButton class="mt-4" @refresh-setting="refreshSetting" />
                </div>
                <div v-else class="d-flex align-center justify-start">
                    <p class="font-weight-bold"><v-icon class="mr-2" color="success">mdi-check-circle</v-icon>Bank connected!</p> 
                </div>
            </MainComponentDefaultCard>
        </div>
        <div class="mb-4">
            <MainComponentDefaultCard title="Bank Balance" title-text-size="h6" icon="mdi-currency-usd" icon-color="green">
                <p class="text-grey text-body-2 mb-4">Your current account balance</p>

                <v-alert icon="mdi-information-outline" title="Not Connected" variant="elevated" class="mb-4 alert-balance" v-if="!isBankConnected">
                    <p class="text-caption">Connect your bank account above to see your real-time balance here.</p>
                </v-alert>

                <div class="d-block d-sm-flex align-center ga-2">
                    <MainComponentDefaultCard title="Current Balance" card-type="outlined">
                        <p class="text-h6 font-weight-bold text-lime" v-if="!isBankConnected">Not Connected</p>
                        <p class="text-h6 font-weight-bold text-lime" v-else>{{ formatCurrency(currentBalance) }}</p>
                    </MainComponentDefaultCard>
                    <MainComponentDefaultCard title="Available Balance" card-type="outlined">
                        <p class="text-h6 font-weight-bold text-primary" v-if="!isBankConnected">Not Connected</p>
                        <p class="text-h6 font-weight-bold text-primary" v-else>{{ formatCurrency(availableBalance) }}</p>
                    </MainComponentDefaultCard>
                </div>

            </MainComponentDefaultCard>
        </div>
        <div class="mb-4" id="account-setting">
            <MainComponentDefaultCard title="Account Setting" icon="mdi-account-cog-outline" title-text-size="h6">
                <p class="text-grey text-body-2 mb-4">Manage your Minty Budget account preferences</p>

                <MainComponentDefaultCard title="Adjust Monthly Budget" card-type="outlined">
                    <v-number-input prepend-inner-icon="mdi-currency-usd" label="Monthly Budget" variant="outlined" v-model="monthlyBudget" hide-details class="my-4" />
                    <v-btn color="secondary" class="w-100 font-weight-bold" @click="saveMonthlyBudget">Save Monthly Budget</v-btn>
                </MainComponentDefaultCard>
            </MainComponentDefaultCard>
        </div>
    </BasicMain>
</template>

<script lang="ts" setup>
    import type { FetchError } from 'ofetch';
import type { BalanceApi } from '~/types/balance';

    definePageMeta({
        middleware: 'auth'
    })

    const isBankConnected = ref<boolean>(false);
    const snackbarOpen = ref<boolean>(false);
    const snackbarMessage = ref<string>('');
    const availableBalance = ref<number>(0);
    const currentBalance = ref<number>(0);
    const { formatCurrency } = useCurrency();
    const monthlyBudget = ref<number>(0);
    const snackbarColor = ref<string>('error');


    // onBeforeMount(async () => {
    //    try {
    //         await getSetting();
    //     }
    //     catch(err) {
    //         const e = err as FetchError;
    //         snackbarOpen.value = true;
    //         console.log(e.statusCode);
    //         errorMessage.value = e.message;
    //     }
    // })

    onMounted(async () => {
        try {
            await getSetting();
        }
        catch(err) {
            const e = err as FetchError;
            console.log(e.statusCode);
            addSnackBar('error', e.message);
        }
    })

    async function getSetting() {
        var checkBank = await $fetch<{ verified: boolean }>('/api/account/check-bank-connection', {
            method: 'GET'
        })

        isBankConnected.value = checkBank.verified;

        if(isBankConnected.value) {
            var getBalance = await $fetch<{
                accounts: BalanceApi[]
            }>('/api/plaid/balance', {
                method: 'GET'
            });

            availableBalance.value = getBalance.accounts.reduce((sum, data) => sum + Math.abs(data.available as number), 0)

            currentBalance.value = getBalance.accounts.reduce((sum, data) => sum + Math.abs(data.current as number), 0)
        }

        var getMonthlyBudget = await $fetch<{monthlyBudget: number}>('/api/account/get-user-monthly-budget', {
            method: 'GET',
        });

        monthlyBudget.value = getMonthlyBudget.monthlyBudget;
    }

    async function refreshSetting() {
        await getSetting();
    }

    async function saveMonthlyBudget() {
        if(monthlyBudget.value === 0 || monthlyBudget.value < 0) {
            addSnackBar('error', "Monthly budget cannot be or less than 0")
        }
        else
        {
            try {
                await $fetch('/api/account/save-user-monthly-budget', {
                    method: 'POST',
                    body: {
                        monthlyBudget: monthlyBudget.value,
                    }
                })

                addSnackBar("success", "Monthly budget successfully saved!");
            }
            catch(err) {
                const e = err as FetchError;
                console.log(e.statusCode);
                addSnackBar("error", e.message);
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
</style>