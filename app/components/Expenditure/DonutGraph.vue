<template>
  <MainComponentDefaultCard
    title="Spending by Category"
    title-text-size="h5"
    card-type="outlined"
    card-color="secondary"
  >
    <div v-if="categorySummary.length">
      <p class="text-body-2 text-grey mb-2">Overview of your spending</p>

      <div class="d-sm-flex align-center">
        <div class="flex-grow-1 d-flex justify-center mb-4 mb-md-0">
          <ClientOnly>
            <apexchart
              type="donut"
              :options="chartOptions"
              :series="chartSeries"
              width="360"
            />
          </ClientOnly>
        </div>

        <div class="flex-grow-1 pl-md-4">
          <div
            v-for="(cat, index) in categorySummary"
            :key="cat.category"
            class="mb-3"
          >
            <div class="d-flex justify-space-between align-center mb-1">
              <div class="d-flex align-center">
                <div
                  class="mr-2"
                  style="width: 12px; height: 12px; border-radius: 9999px;"
                  :style="{ backgroundColor: chartColors[index % chartColors.length] }"
                ></div>

                <v-icon
                  v-if="cat.icon"
                  size="small"
                  class="mr-2"
                >
                  {{ cat.icon }}
                </v-icon>

                <span class="text-body-2 text-capitalize">
                  {{ cat.category }}
                </span>
              </div>

              <span class="font-weight-bold text-body-2">
                {{ formatCurrency(cat.amount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p
      v-else
      class="text-primary font-weight-bold d-flex align-center justify-center"
      style="height: 200px"
    >
      No data to display
    </p>
  </MainComponentDefaultCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { ApexOptions } from 'apexcharts'
import type { TransactionData } from '~/types/transaction'

const { formatCurrency } = useCurrency()

const props = defineProps({
  transactionData: {
    type: Array as PropType<TransactionData[]>,
    required: true,
  },
})

function findIcon(category: string) {
  switch (category) {
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
    default:
      return ''
  }
}

const categoryTotals = computed<Record<string, number>>(() => {
  const totals: Record<string, number> = {}

  for (const t of props.transactionData) {
    if (!t.category) continue
    if (!totals[t.category]) {
      totals[t.category] = 0
    }
    totals[t.category]! += t.amount
  }

  return totals
})

const categorySummary = computed(() => {
  const entries = Object.entries(categoryTotals.value)

  return entries.map(([category, amount]) => ({
    category,
    amount,
    icon: findIcon(category),
  }))
})

const chartColors = computed<string[]>(() => [
  '#22c55e', // mint green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
])

const chartSeries = computed<number[]>(() =>
  categorySummary.value.map((c) => c.amount),
)

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
  },
  colors: chartColors.value,
  labels: categorySummary.value.map((c) =>
    c.category.charAt(0).toUpperCase() + c.category.slice(1),
  ),
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(0)}%`,
  },
  tooltip: {
    y: {
      formatter: (value: number) => formatCurrency(value),
    },
  },
  stroke: {
    width: 1,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          name: {
            show: true,
            color: 'white',
            fontSize: '12px'

          },
          value: {
            show: true,
            color: 'white',
            fontSize: '16px',
            fontWeight: '700',
            formatter: (val) => {
                return formatCurrency(val)
            }
          },
          total: {
            show: true,
            label: 'Total',
            formatter: () => {
              const total = chartSeries.value.reduce((a, b) => a + b, 0)
              return formatCurrency(total)
            },
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
          },
        },
      },
    },
  },
  responsive: [
    {
      breakpoint: 960,
      options: {
        chart: {
          width: 320,
        },
      },
    },
  ],
}))
</script>
