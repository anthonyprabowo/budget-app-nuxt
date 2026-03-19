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
    <div class="d-block d-sm-flex ga-2 align-stretch justify-space-between mb-4">
      <MainComponentDefaultCard title="Monthly budget" icon="mdi-wallet-bifold-outline" icon-color="deep-purple-lighten-2">
        <p class="text-h4 font-weight-bold mb-1">{{ monthlyBudget === 0 ? '-' : formatCurrency(monthlyBudget) }}</p>
        <p class="text-body-2 text-grey mb-4">Total budget allocated</p>
        <NuxtLink :to="'/setting#account-setting'" v-if="monthlyBudget === 0">
          <v-btn color="secondary" class="w-100">Setup monthly budget</v-btn>
        </NuxtLink>
      </MainComponentDefaultCard>
      <MainComponentDefaultCard title="Total Spent" icon="mdi-trending-down" icon-color="error">
        <p class="text-h4 font-weight-bold mb-1">{{ transactionData.length > 0 ? formatCurrency(totalSpend) : '-' }}</p>
        <p class="text-body-2 text-grey">{{ percentageCalculation }}% of budget used</p>
        <p v-if="zelleReceivedTotal > 0" class="text-caption text-green mt-1">Includes {{ formatCurrency(zelleReceivedTotal) }} Zelle credit</p>
      </MainComponentDefaultCard>
      <MainComponentDefaultCard title="Remaining" icon="mdi-trending-up" icon-color="green">
        <p class="text-h4 font-weight-bold mb-1" :class="{'text-red': totalRemaining < 0}">{{ totalRemaining < 0 ? '-' : '' }}{{ formatCurrency(Math.abs(totalRemaining)) }}</p>
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

    <!-- Spending Power Section -->
    <v-divider class="my-2"></v-divider>
    <div class="mb-4">
      <SpendingPowerMainComponent :accounts="balanceAccounts" />
    </div>

    <v-divider class="my-2"></v-divider>
    <div class="mb-2">
      <p class="text-h4 font-weight-bold mb-2">Expenditure</p>
      <ExpenditureMainComponent :transaction-data="transactionData"/>
    </div>
    <div class="mb-4">
      <ExpenditureDonutGraph :transaction-data="transactionData" />
    </div>

    <!-- Income History Section -->
    <v-divider class="my-2"></v-divider>
    <div class="mb-4">
      <IncomeHistory :income-data="incomeData" />
    </div>
  </BasicMain>
</template>

<script lang="ts" setup>
  import type { TransactionData, IncomeTransaction } from '~/types/transaction';
  import type { BalanceApi } from '~/types/balance';

  definePageMeta({
    middleware: 'auth'
  })



  const { apiFetch } = useApiFetch();

  const transactionData = ref<TransactionData[]>([]);
  const incomeData = ref<IncomeTransaction[]>([]);
  const balanceAccounts = ref<BalanceApi[]>([]);
  const zelleReceivedTotal = ref<number>(0);
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
      // Fetch transactions (expenses + income)
      const transactions = await apiFetch<{
        ok: boolean;
        transactions: TransactionData[];
        income?: IncomeTransaction[];
        zelleReceivedTotal?: number;
      }>('/api/plaid/transaction', { method: "GET" });

      if (transactions.ok) {
        transactionData.value = transactions.transactions;
        incomeData.value = transactions.income || [];
        zelleReceivedTotal.value = transactions.zelleReceivedTotal || 0;
        // Sum all amounts — includes negative Zelle credits that offset spending
        totalSpend.value = transactionData.value.reduce((sum, tx) => sum + tx.amount, 0);
      }

      // Fetch budget
      const budget = await apiFetch<{ monthlyBudget: number }>('/api/account/get-user-monthly-budget', { method: 'GET' });
      monthlyBudget.value = budget.monthlyBudget;

      totalRemaining.value = monthlyBudget.value - totalSpend.value;
      percentageCalculation.value = ((totalSpend.value / (monthlyBudget.value === 0 ? 1 : monthlyBudget.value)) * 100).toFixed(2);

      // Fetch balances for spending power
      const balanceRes = await apiFetch<{ accounts: BalanceApi[] }>('/api/plaid/balance', { method: 'GET' });
      balanceAccounts.value = balanceRes.accounts;
    } catch (err: any) {
      console.error(err);
      if (err.message !== 'Your session has expired. Please log in again.') {
        addSnackBar("error", err.message || 'Failed to load dashboard data');
      }
    }
  })

  function addSnackBar(color: string, message: string) {
      snackbarOpen.value = true;
      snackbarColor.value = color;
      snackbarMessage.value = message;
  }
</script>
