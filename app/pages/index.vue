<template>
  <Header />
  <BasicMain>
    <div class="mb-8">
      <h1 class="font-weight-bold">Your Monthly Budget</h1>
      <p>Track purchases manually, or optionally connect a bank provider in Settings.</p>
    </div>
    <div class="d-block d-sm-flex ga-2 align-center justify-space-between">
      <MainComponentDefaultCard title="Spend (this month)">
        <p class="text-h5 font-weight-bold">$100.00</p>
      </MainComponentDefaultCard>
      <MainComponentDefaultCard title="Monthly Budget">
        <p class="text-h5 font-weight-bold">-</p>
      </MainComponentDefaultCard>
      <MainComponentDefaultCard title="Purchases (this month)">
        <p class="text-h5 font-weight-bold">0</p>
      </MainComponentDefaultCard>
    </div>
    <v-divider class="mb-4" />
    <div>
      <PurchaseCard />
    </div>
  </BasicMain>
</template>

<script lang="ts" setup>

  //
</script>
