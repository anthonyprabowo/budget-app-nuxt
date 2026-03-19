<template>
    <MainComponentDefaultCard title="Spending Power" title-text-size="h5" icon="mdi-wallet-outline" icon-color="green">
        <p class="text-body-2 text-grey mb-4">Available funds across your connected bank accounts</p>

        <div v-if="accounts.length > 0">
            <!-- Total across all accounts -->
            <div class="d-flex align-center justify-space-between mb-4 pa-3 rounded" style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3);">
                <div>
                    <p class="text-body-2 text-grey">Total Available</p>
                    <p class="text-h4 font-weight-bold text-green">{{ formatCurrency(totalAvailable) }}</p>
                </div>
                <v-icon size="x-large" color="green">mdi-bank</v-icon>
            </div>

            <!-- Per-account breakdown -->
            <div class="d-block d-sm-flex ga-2 flex-wrap">
                <v-card
                    v-for="account in accounts"
                    :key="account.accountId"
                    variant="outlined"
                    class="pa-3 mb-2 flex-grow-1"
                    style="min-width: 200px;"
                >
                    <div class="d-flex align-center mb-2">
                        <v-icon size="small" color="purple-accent-1" class="mr-2">mdi-credit-card-outline</v-icon>
                        <span class="text-body-2 font-weight-bold">{{ account.institutionName || 'Bank Account' }}</span>
                    </div>
                    <p class="text-caption text-grey mb-1">{{ account.name }} {{ account.mask ? `••${account.mask}` : '' }}</p>
                    <div class="d-flex justify-space-between align-center">
                        <div>
                            <p class="text-caption text-grey">Available</p>
                            <p class="text-h6 font-weight-bold text-primary">{{ formatCurrency(account.available) }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-caption text-grey">Current</p>
                            <p class="text-body-1 font-weight-bold text-lime">{{ formatCurrency(account.current) }}</p>
                        </div>
                    </div>
                </v-card>
            </div>
        </div>

        <div v-else class="d-flex align-center justify-center" style="height: 120px;">
            <div class="text-center">
                <v-icon size="large" color="grey" class="mb-2">mdi-bank-off-outline</v-icon>
                <p class="text-body-2 text-grey">No bank accounts connected. Connect one in Settings.</p>
            </div>
        </div>
    </MainComponentDefaultCard>
</template>

<script setup lang="ts">
    import type { BalanceApi } from '~/types/balance';

    const { formatCurrency } = useCurrency();

    const props = defineProps({
        accounts: {
            type: Array as PropType<BalanceApi[]>,
            required: true,
        }
    });

    const totalAvailable = computed(() =>
        props.accounts.reduce((sum, a) => sum + (a.available ?? 0), 0)
    );
</script>
