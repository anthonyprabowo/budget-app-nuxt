<template>
    <div>
        <!-- Overlay -->

        <!-- Button -->
        <div class="text-center mb-4">
            <v-btn color="secondary" class="font-weight-bold"><v-icon icon="mdi-plus-circle-outline" class="mr-4" size="x-large" />Add Expenses</v-btn>
        </div>
        <MainComponentDefaultCard title="Recent Transaction" title-text-size="h5" card-type="outlined" card-color="secondary">
            <p class="text-body-2 text-grey mb-2">Your monthly transaction</p>
            <v-table height="300px">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, i) in transactionData" :key="i">
                        <td>{{ data.Date }}</td>
                        <td><v-icon size="x-small" class="mr-2" v-if="findIcon(data.Category) !== ''">{{ findIcon(data.Category) }}</v-icon>{{ data.Description }}</td>
                        <td>{{ data.Category }}</td>
                        <td>{{ formatCurrency(data.Amount) }}</td>
                    </tr>
                </tbody>
            </v-table>
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
            case 'transporation':
                return 'mdi-car-outline'
            case 'utilities':
                return 'mdi-lightning-bold-outline'
            default:
                return ''
        }
    }
</script>