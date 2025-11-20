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
    <div class="mb-8">
      <h1 class="font-weight-bold">Your Monthly Budget</h1>
      <p>Track purchases manually, or optionally connect a bank provider in Settings.</p>
    </div>
    <div class="d-block d-sm-flex ga-2 align-center justify-space-between mb-4">
      <MainComponentDefaultCard title="Monthly budget" icon="mdi-wallet-bifold-outline" icon-color="deep-purple-lighten-2">
        <p class="text-h4 font-weight-bold mb-1">{{ monthlyBudget === 0 ? '-' : formatCurrency(monthlyBudget) }}</p>
        <p class="text-body-2 text-grey mb-4">Total budget allocated</p>
        <NuxtLink :to="'/setting#account-setting'" v-if="monthlyBudget === 0">
          <v-btn color="secondary" class="w-100">Setup monthly budget</v-btn>
        </NuxtLink>
      </MainComponentDefaultCard>
      <MainComponentDefaultCard title="Total Spent" icon="mdi-trending-down" icon-color="error">
        <p class="text-h4 font-weight-bold mb-1">{{ transactionData.length > 0 ? formatCurrency(totalSpend) : '-' }}</p>
        <p class="text-body-2 text-grey">100% of budget used</p>
      </MainComponentDefaultCard>
      <MainComponentDefaultCard title="Remaining" icon="mdi-trending-up" icon-color="green">
        <p class="text-h4 font-weight-bold mb-1" :class="{'text-red': totalRemaining < 0}">{{ totalRemaining < 0 ? '-' : '' }}{{ formatCurrency(totalRemaining) }}</p>
        <!-- If over budget, the text becomes "Over budget" -->
        <p class="text-body-2 text-grey">{{ totalRemaining < 0 ? 'Over budget' : 'Left to spend' }}</p>
      </MainComponentDefaultCard>
    </div>
    <div class="mb-4">
      <MainComponentDefaultCard title="Spending Progress" title-text-size="h5">
        <p class="text-body-2 text-grey mb-2">You've spent {{ percentageCalculation }}% of your monthly budget</p>
        <v-progress-linear :model-value="percentageCalculation" :height="12" rounded color="secondary" class="mb-2"></v-progress-linear>
        <div class="d-flex justify-space-between align-center">
          <p class="text-body-1">$0</p>
          <p class="text-body-1">{{ formatCurrency(monthlyBudget) }}</p>
        </div>
      </MainComponentDefaultCard>
    </div>
    <v-divider class="my-2"></v-divider>
    <div class="mb-2">
      <p class="text-h4 font-weight-bold mb-2">Expenditure</p>
      <ExpenditureMainComponent :transaction-data="transactionData"/>
    </div>
    <div>
      <ExpenditureDonutGraph :transaction-data="transactionData" />
    </div>
  </BasicMain>
</template>

<script lang="ts" setup>
  import type { TransactionData } from '~/types/transaction';
  import type { FetchError } from 'ofetch';

  definePageMeta({
    middleware: 'auth'
  })

  useHead({
    script: [
      {
        src: "https://cdn.plaid.com/link/v2/stable/link-initialize.js",
        defer: true
      }
    ]
  })
  

  const transactionData = ref<TransactionData[]>([]);
  const snackbarOpen = ref<boolean>(false);
  const snackbarMessage = ref<string>('');
  const snackbarColor = ref<string>('error');
  const monthlyBudget = ref<number>(0);
  const totalSpend = ref<number>(0);
  const totalRemaining = ref<number>(0);
  const percentageCalculation = ref<string>('');
  const { formatCurrency } = useCurrency();

  onMounted(async () => {
    try {
      var transactions = await $fetch('/api/plaid/transaction', {
        method: "GET",
      });
      transactionData.value = transactions.transactions
      totalSpend.value = transactionData.value.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
      

      var budget = await $fetch<{monthlyBudget: number}>('/api/account/get-user-monthly-budget', {
        method: 'GET'
      })

      monthlyBudget.value = budget.monthlyBudget

      totalRemaining.value = monthlyBudget.value - totalSpend.value;
      percentageCalculation.value = ((totalSpend.value/monthlyBudget.value) * 100).toFixed(2)
    }
    catch(err) {
      const e = err as FetchError
      console.log(e.statusCode);
      addSnackBar("error", e.message);
    }
  })

  function addSnackBar(color: string, message: string) {
      snackbarOpen.value = true;
      snackbarColor.value = color;
      snackbarMessage.value = message;
  }
</script>
