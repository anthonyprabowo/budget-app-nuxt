<template>
    <div>
        <!-- Button -->
        <div class="text-center mb-4">
            <v-btn color="secondary" class="font-weight-bold"><v-icon icon="mdi-plus-circle-outline" class="mr-4" size="x-large" />Add Expenses</v-btn>
        </div>
        <MainComponentDefaultCard title="Recent Transaction" title-text-size="h5" card-type="outlined" card-color="secondary">
            <p class="text-body-2 text-grey mb-2">Your monthly transaction</p>

            <!-- Account filter -->
            <v-select
                v-if="accountOptions.length > 1"
                v-model="selectedAccountId"
                :items="accountOptions"
                item-title="label"
                item-value="value"
                label="Filter by account"
                variant="outlined"
                density="compact"
                class="mb-4"
                style="max-width: 350px;"
                clearable
                hide-details
            />

            <v-data-table
                v-if="filteredTransactions.length > 0"
                :headers="headers"
                :items="filteredTransactions"
                :items-per-page="5"
                mobile-breakpoint="sm"
                class="text-body-2"
                height="400px"
            >
                <!-- Date -->
                <template #item.date="{ item }">
                {{ item.date }}
                </template>

                <!-- Description + icon -->
                <template #item.description="{ item }">
                <v-icon
                    size="x-small"
                    class="mr-2"
                    v-if="findIcon(item.category) !== ''"
                >
                    {{ findIcon(item.category) }}
                </v-icon>
                {{ item.name }}
                </template>

                <!-- Category -->
                <template #item.category="{ item }">
                <v-chip size="small" variant="tonal" :color="getCategoryColor(item.category)">
                    {{ item.category }}
                </v-chip>
                <v-chip v-if="item.isZelle" size="x-small" variant="tonal" color="purple" class="ml-1">
                    Zelle
                </v-chip>
                </template>

                <!-- Pocket -->
                <template #item.pocket="{ item }">
                  <v-chip v-if="item.pocket" size="x-small" variant="tonal" :color="getPocketChipColor(item.pocket)">
                    {{ getPocketShortLabel(item.pocket) }}
                  </v-chip>
                </template>

                <!-- Account -->
                <template #item.account="{ item }">
                <v-chip size="small" variant="outlined" color="purple-accent-1">
                    {{ item.institutionName || 'N/A' }}
                </v-chip>
                </template>

                <!-- Amount -->
                <template #item.amount="{ item }">
                <span :class="{ 'text-green font-weight-bold': item.amount < 0 }">
                    {{ item.amount < 0 ? '+' : '' }}{{ formatCurrency(Math.abs(item.amount)) }}
                </span>
                </template>
            </v-data-table>
            <p v-else class=" text-primary font-weight-bold d-flex align-center justify-center" style="height: 300px">No Data Found</p>
        </MainComponentDefaultCard>
    </div>    
</template>

<script setup lang="ts">
    import type { TransactionData } from '~/types/transaction';

    const { formatCurrency }  = useCurrency();

    const props = defineProps({
        transactionData: {
            type: Array as PropType<TransactionData[]>,
            required: true,
        }
    })

    const selectedAccountId = ref<string | null>(null);

    const accountOptions = computed(() => {
        const seen = new Map<string, string>();
        for (const t of props.transactionData) {
            if (t.accountId && !seen.has(t.accountId)) {
                seen.set(t.accountId, t.institutionName || t.accountName || t.accountId);
            }
        }
        const options = [{ label: 'All Accounts', value: '' }];
        for (const [id, name] of seen) {
            options.push({ label: name, value: id });
        }
        return options;
    });

    const filteredTransactions = computed(() => {
        if (!selectedAccountId.value) return props.transactionData;
        return props.transactionData.filter(t => t.accountId === selectedAccountId.value);
    });

    const headers = [
        { title: 'Date',        key: 'date' },
        { title: 'Description', key: 'description' },
        { title: 'Category',    key: 'category' },
        { title: 'Pocket',      key: 'pocket' },
        { title: 'Account',     key: 'account' },
        { title: 'Amount',      key: 'amount' },
    ];

    function findIcon(category: string) {
        switch(category) {
            case 'entertainment':
                return 'mdi-gamepad-variant-outline'
            case 'health':
                return 'mdi-heart-outline'
            case 'food':
                return 'mdi-silverware'
            case 'shopping':
                return 'mdi-shopping-outline'
            case 'transportation':
                return 'mdi-car-outline'
            case 'utilities':
                return 'mdi-lightning-bolt-outline'
            case 'transfer':
                return 'mdi-swap-horizontal'
            default:
                return ''
        }
    }

    function getCategoryColor(category: string): string {
        switch(category) {
            case 'food': return 'green'
            case 'shopping': return 'blue'
            case 'health': return 'red'
            case 'entertainment': return 'purple'
            case 'transportation': return 'orange'
            case 'utilities': return 'yellow'
            case 'transfer': return 'cyan'
            default: return 'grey'
        }
    }

    function getPocketChipColor(pocket: string): string {
        switch(pocket) {
            case 'basic_needs': return 'green'
            case 'investment': return 'blue'
            case 'self_reward': return 'purple'
            default: return 'grey'
        }
    }

    function getPocketShortLabel(pocket: string): string {
        switch(pocket) {
            case 'basic_needs': return 'Needs'
            case 'investment': return 'Invest'
            case 'self_reward': return 'Reward'
            default: return pocket
        }
    }
</script>