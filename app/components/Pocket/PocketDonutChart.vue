<template>
  <MainComponentDefaultCard
    title="Budget Allocation"
    title-text-size="h5"
    card-type="outlined"
    card-color="secondary"
  >
    <div v-if="pocketSummaries.length > 0">
      <p class="text-body-2 text-grey mb-2">Spending across your 3 pockets</p>

      <div class="d-sm-flex align-center">
        <div class="flex-grow-1 d-flex justify-center mb-4 mb-md-0">
          <ClientOnly>
            <apexchart
              type="donut"
              :options="chartOptions"
              :series="chartSeries"
              width="340"
            />
          </ClientOnly>
        </div>

        <div class="flex-grow-1 pl-md-4">
          <div
            v-for="pocket in pocketSummaries"
            :key="pocket.type"
            class="mb-4"
          >
            <div class="d-flex justify-space-between align-center mb-1">
              <div class="d-flex align-center">
                <div
                  class="mr-2"
                  style="width: 12px; height: 12px; border-radius: 9999px;"
                  :style="{ backgroundColor: pocket.color }"
                />
                <v-icon size="small" class="mr-2">{{ pocket.icon }}</v-icon>
                <span class="text-body-2">{{ pocket.label }} ({{ pocket.percentage }}%)</span>
              </div>
            </div>

            <div class="d-flex justify-space-between align-center ml-8">
              <span class="text-caption text-grey">Spent</span>
              <span class="text-body-2 font-weight-bold">{{ formatCurrency(pocket.spentAmount) }}</span>
            </div>
            <div class="d-flex justify-space-between align-center ml-8">
              <span class="text-caption text-grey">Budget</span>
              <span class="text-caption">{{ formatCurrency(pocket.budgetAmount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="text-primary font-weight-bold d-flex align-center justify-center" style="height: 200px">
      Set your monthly income to see budget allocation
    </p>
  </MainComponentDefaultCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ApexOptions } from 'apexcharts'
import type { PocketSummary } from '~/types/pocket'

const { formatCurrency } = useCurrency()

const props = defineProps<{
  pocketSummaries: PocketSummary[]
}>()

const chartSeries = computed<number[]>(() =>
  props.pocketSummaries.map(p => p.spentAmount)
)

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
  },
  colors: props.pocketSummaries.map(p => p.color),
  labels: props.pocketSummaries.map(p => `${p.label} (${p.percentage}%)`),
  legend: { show: false },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(0)}%`,
  },
  tooltip: {
    y: {
      formatter: (value: number) => formatCurrency(value),
    },
  },
  stroke: { width: 1 },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          name: { show: true, color: 'white', fontSize: '12px' },
          value: {
            show: true,
            color: 'white',
            fontSize: '16px',
            formatter: (val: string) => formatCurrency(Number(val)),
          },
          total: {
            show: true,
            color: 'white',
            label: 'Total Spent',
            formatter: (w: any) => {
              const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
              return formatCurrency(total)
            },
          },
        },
      },
    },
  },
}))
</script>
