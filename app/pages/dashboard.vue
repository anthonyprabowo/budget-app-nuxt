<template>
  <Header />
  <BasicMain>
    <div class="mb-8">
      <h1 class="font-weight-bold">Your Monthly Budget</h1>
      <p>Track purchases manually, or optionally connect a bank provider in Settings.</p>
    </div>
    <div class="d-block d-sm-flex ga-2 align-center justify-space-between mb-4">
      <MainComponentDefaultCard title="Spend (this month)" icon="mdi-wallet-bifold-outline" icon-color="secondary">
        <p class="text-h4 font-weight-bold mb-1">$100.00</p>
        <p class="text-body-2 text-grey">Total budget allocated</p>
      </MainComponentDefaultCard>
      <MainComponentDefaultCard title="Total Spent" icon="mdi-trending-down" icon-color="error">
        <p class="text-h4 font-weight-bold mb-1">$100.00</p>
        <p class="text-body-2 text-grey">100% of budget used</p>
      </MainComponentDefaultCard>
      <MainComponentDefaultCard title="Remaining" icon="mdi-trending-up" icon-color="green">
        <p class="text-h4 font-weight-bold mb-1">$0.00</p>
        <!-- If over budget, the text becomes "Over budget" -->
        <p class="text-body-2 text-grey">Left to spend</p>
      </MainComponentDefaultCard>
    </div>
    <div class="mb-4">
      <MainComponentDefaultCard title="Spending Progress" title-text-size="h5">
        <p class="text-body-2 text-grey mb-2">You've spent 100.0% of your monthly budget</p>
        <v-progress-linear model-value="100" :height="12" rounded color="secondary" class="mb-2"></v-progress-linear>
        <div class="d-flex justify-space-between align-center">
          <p class="text-body-1">$0</p>
          <p class="text-body-1">$100.00</p>
        </div>
      </MainComponentDefaultCard>
    </div>
    <v-divider class="my-2"></v-divider>
    <div>
      <p class="text-h4 font-weight-bold">Expenditure</p>
    </div>
  </BasicMain>
</template>

<script lang="ts" setup>
  definePageMeta({
    middleware: 'auth'
  })
</script>
