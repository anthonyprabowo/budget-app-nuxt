<template>
    <MainComponentDefaultCard title="Income History" title-text-size="h5" icon="mdi-cash-plus" icon-color="green" card-type="outlined" card-color="secondary">
        <p class="text-body-2 text-grey mb-2">Your monthly income — not included in budget calculations</p>

        <v-data-table
            v-if="incomeData.length > 0"
            :headers="headers"
            :items="incomeData"
            :items-per-page="5"
            mobile-breakpoint="sm"
            class="text-body-2"
            height="300px"
        >
            <template #item.date="{ item }">
                {{ item.date }}
            </template>

            <template #item.name="{ item }">
                <v-icon size="x-small" class="mr-2" :color="getIncomeIconColor(item.category)">
                    {{ getIncomeIcon(item.category) }}
                </v-icon>
                {{ item.name }}
            </template>

            <template #item.category="{ item }">
                <v-chip size="small" variant="tonal" :color="getIncomeCategoryColor(item.category)">
                    {{ formatIncomeCategory(item.category) }}
                </v-chip>
            </template>

            <template #item.account="{ item }">
                <v-chip size="small" variant="outlined" color="purple-accent-1">
                    {{ item.institutionName || 'N/A' }}
                </v-chip>
            </template>

            <template #item.amount="{ item }">
                <span class="text-green font-weight-bold">+{{ formatCurrency(item.amount) }}</span>
            </template>
        </v-data-table>

        <p v-else class="text-primary font-weight-bold d-flex align-center justify-center" style="height: 200px">
            No income data this month
        </p>
    </MainComponentDefaultCard>
</template>

<script setup lang="ts">
    import type { IncomeTransaction } from '~/types/transaction';

    const { formatCurrency } = useCurrency();

    defineProps({
        incomeData: {
            type: Array as PropType<IncomeTransaction[]>,
            required: true,
        }
    })

    const headers = [
        { title: 'Date',     key: 'date' },
        { title: 'Source',    key: 'name' },
        { title: 'Type',      key: 'category' },
        { title: 'Account',   key: 'account' },
        { title: 'Amount',    key: 'amount' },
    ];

    function getIncomeIcon(category: string): string {
        switch (category) {
            case 'payroll': return 'mdi-briefcase-outline'
            case 'zelle': return 'mdi-cellphone-arrow-down'
            case 'direct_deposit': return 'mdi-bank-transfer-in'
            case 'transfer_in': return 'mdi-swap-horizontal'
            default: return 'mdi-cash'
        }
    }

    function getIncomeIconColor(category: string): string {
        switch (category) {
            case 'payroll': return 'blue'
            case 'zelle': return 'purple'
            case 'direct_deposit': return 'green'
            case 'transfer_in': return 'cyan'
            default: return 'grey'
        }
    }

    function getIncomeCategoryColor(category: string): string {
        switch (category) {
            case 'payroll': return 'blue'
            case 'zelle': return 'purple'
            case 'direct_deposit': return 'green'
            case 'transfer_in': return 'cyan'
            default: return 'grey'
        }
    }

    function formatIncomeCategory(category: string): string {
        switch (category) {
            case 'payroll': return 'Payroll'
            case 'zelle': return 'Zelle'
            case 'direct_deposit': return 'Direct Deposit'
            case 'transfer_in': return 'Transfer In'
            case 'other_income': return 'Other'
            default: return category
        }
    }
</script>
