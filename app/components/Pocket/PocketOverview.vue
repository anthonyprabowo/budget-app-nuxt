<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-2">
      <div>
        <p class="text-h4 font-weight-bold">Budget Pockets</p>
        <p class="text-body-2 text-grey">Your income is split into 3 pockets using the 50/30/20 rule</p>
      </div>
      <NuxtLink to="/transactions">
        <v-btn variant="text" color="secondary" size="small" append-icon="mdi-arrow-right">
          View All Transactions
        </v-btn>
      </NuxtLink>
    </div>

    <div class="d-block d-sm-flex ga-2 align-stretch justify-space-between mb-4">
      <MainComponentDefaultCard
        v-for="pocket in pocketSummaries"
        :key="pocket.type"
        :title="pocket.label"
        :icon="pocket.icon"
        :icon-color="pocketProgressColor(pocket)"
      >
        <!-- Spent vs Budget headline -->
        <div class="d-flex justify-space-between align-center mb-1">
          <p class="text-h5 font-weight-bold">{{ formatCurrency(pocket.spentAmount) }}</p>
          <v-chip size="small" variant="tonal" :color="pocketProgressColor(pocket)">
            {{ pocketPercentUsed(pocket).toFixed(0) }}% used
          </v-chip>
        </div>
        <p class="text-caption text-grey mb-2">of {{ formatCurrency(pocket.budgetAmount) }} budget ({{ pocket.percentage }}%)</p>

        <!-- Progress bar -->
        <v-progress-linear
          :model-value="pocketPercentUsed(pocket)"
          :height="10"
          rounded
          :color="pocketProgressColor(pocket)"
          class="mb-2"
        />

        <!-- Remaining -->
        <div class="d-flex justify-space-between align-center">
          <p class="text-caption text-grey">
            {{ formatCurrency(pocket.spentAmount) }} / {{ formatCurrency(pocket.budgetAmount) }}
          </p>
          <p
            class="text-caption font-weight-bold"
            :class="{ 'text-red': pocket.remainingAmount < 0, 'text-green': pocket.remainingAmount >= 0 }"
          >
            {{ pocket.remainingAmount < 0 ? '-' : '' }}{{ formatCurrency(Math.abs(pocket.remainingAmount)) }} left
          </p>
        </div>

        <!-- Category breakdown -->
        <v-divider class="my-3" />
        <div v-if="getCategoryBreakdown(pocket).length > 0">
          <div
            v-for="cat in getCategoryBreakdown(pocket)"
            :key="cat.category"
            class="d-flex justify-space-between align-center mb-1"
          >
            <div class="d-flex align-center">
              <v-icon size="x-small" class="mr-2">{{ getPocketCategoryIcon(cat.category) }}</v-icon>
              <span class="text-caption">{{ getCategoryLabel(cat.category) }}</span>
            </div>
            <span class="text-caption font-weight-bold">{{ formatCurrency(cat.amount) }}</span>
          </div>
        </div>
        <p v-else class="text-caption text-grey text-center">No transactions yet</p>
      </MainComponentDefaultCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PocketSummary } from '~/types/pocket'
import type { PocketCategory } from '~/types/pocket'

const { formatCurrency } = useCurrency()
const { getCategoryLabel, getPocketCategoryIcon } = usePocketBudget()

const props = defineProps<{
  pocketSummaries: PocketSummary[]
}>()

function pocketPercentUsed(pocket: PocketSummary): number {
  if (pocket.budgetAmount === 0) return 0
  return Math.min((pocket.spentAmount / pocket.budgetAmount) * 100, 100)
}

function pocketProgressColor(pocket: PocketSummary): string {
  const pct = pocketPercentUsed(pocket)
  if (pct >= 100) return 'red'
  if (pct >= 80) return 'orange'
  return pocket.color
}

function getCategoryBreakdown(pocket: PocketSummary): { category: PocketCategory; amount: number }[] {
  const totals: Record<string, number> = {}
  for (const tx of pocket.transactions) {
    if (tx.amount <= 0) continue
    const cat = tx.pocketCategory || 'other'
    totals[cat] = (totals[cat] || 0) + tx.amount
  }
  return Object.entries(totals)
    .map(([category, amount]) => ({ category: category as PocketCategory, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => b.amount - a.amount)
}
</script>
