<template>
    <div>
        <!-- Overlay -->

        <!-- Button -->
        <div class="text-center mb-4">
            <v-btn color="secondary" class="font-weight-bold"><v-icon icon="mdi-plus-circle-outline" class="mr-4" size="x-large" />Add Expenses</v-btn>
        </div>
        <MainComponentDefaultCard title="Recent Transaction" title-text-size="h5" card-type="outlined" card-color="secondary">
            <p class="text-body-2 text-grey mb-2">Your monthly transaction</p>
            <v-data-table
                v-if="transactionData.length > 0"
                :headers="headers"
                :items="transactionData"
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
                {{ item.category }}
                </template>

                <!-- Amount -->
                <template #item.amount="{ item }">
                {{ formatCurrency(item.amount) }}
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

    const headers = [
        { title: 'Date',        key: 'date' },
        { title: 'Description', key: 'description' },
        { title: 'Category',    key: 'category' },
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
                return 'mdi-lightning-bold-outline'
            default:
                return ''
        }
    }
</script>