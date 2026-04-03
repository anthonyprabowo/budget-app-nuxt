<template>
  <v-snackbar :color="snackbarColor" v-model="snackbarOpen" location="top right">
    {{ snackbarMessage }}
  </v-snackbar>

  <Header />
  <BasicMain>
    <div class="mb-4">
      <h1 class="font-weight-bold">Transactions</h1>
      <p class="text-body-2 text-grey">View and manage your transactions by pocket</p>
    </div>

    <!-- Month Selector -->
    <div class="d-flex align-center ga-2 mb-4">
      <v-btn icon="mdi-chevron-left" variant="text" size="small" @click="changeMonth(-1)" />
      <v-chip variant="tonal" color="secondary" size="large">
        <v-icon start>mdi-calendar</v-icon>
        {{ currentMonthLabel }}
      </v-chip>
      <v-btn icon="mdi-chevron-right" variant="text" size="small" @click="changeMonth(1)" :disabled="isCurrentMonth" />
    </div>

    <!-- Loading state -->
    <v-progress-linear v-if="loading" indeterminate color="secondary" class="mb-4" />

    <!-- Pocket filter tabs -->
    <v-tabs v-model="selectedPocket" color="secondary" class="mb-4">
      <v-tab value="all">
        All
        <v-chip size="x-small" class="ml-2" variant="tonal">{{ filteredTransactions.length }}</v-chip>
      </v-tab>
      <v-tab
        v-for="pocket in pocketTabs"
        :key="pocket.type"
        :value="pocket.type"
      >
        <v-icon start size="small">{{ pocket.icon }}</v-icon>
        {{ pocket.label }}
        <v-chip size="x-small" class="ml-2" variant="tonal" :color="pocket.color">
          {{ transactionsByPocket(pocket.type).length }}
        </v-chip>
      </v-tab>
    </v-tabs>

    <!-- Pocket budget summary for selected pocket -->
    <div v-if="selectedPocket !== 'all' && selectedPocketSummary" class="mb-4">
      <v-card variant="outlined" class="pa-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <div class="d-flex align-center">
            <v-icon :color="selectedPocketSummary.color" class="mr-2">{{ selectedPocketSummary.icon }}</v-icon>
            <span class="text-h6 font-weight-bold">{{ selectedPocketSummary.label }}</span>
            <v-chip size="small" class="ml-2" variant="tonal">{{ selectedPocketSummary.percentage }}%</v-chip>
          </div>
          <div class="text-right">
            <p class="text-caption text-grey">Remaining</p>
            <p
              class="text-h6 font-weight-bold"
              :class="{ 'text-red': selectedPocketSummary.remainingAmount < 0, 'text-green': selectedPocketSummary.remainingAmount >= 0 }"
            >
              {{ formatCurrency(selectedPocketSummary.remainingAmount) }}
            </p>
          </div>
        </div>
        <v-progress-linear
          :model-value="Math.min((selectedPocketSummary.spentAmount / (selectedPocketSummary.budgetAmount || 1)) * 100, 100)"
          :height="8"
          rounded
          :color="selectedPocketSummary.color"
        />
        <div class="d-flex justify-space-between mt-1">
          <span class="text-caption text-grey">{{ formatCurrency(selectedPocketSummary.spentAmount) }} spent</span>
          <span class="text-caption text-grey">{{ formatCurrency(selectedPocketSummary.budgetAmount) }} budget</span>
        </div>
      </v-card>
    </div>

    <!-- Transaction table -->
    <MainComponentDefaultCard title="Transaction List" title-text-size="h5" card-type="outlined" card-color="secondary">
      <v-data-table
        v-if="filteredTransactions.length > 0"
        :headers="headers"
        :items="filteredTransactions"
        :items-per-page="10"
        mobile-breakpoint="sm"
        class="text-body-2"
      >
        <!-- Date -->
        <template #item.date="{ item }">
          {{ item.date }}
        </template>

        <!-- Description -->
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-icon size="x-small" class="mr-2">{{ getPocketCategoryIcon(item.pocketCategory || 'other') }}</v-icon>
            <div>
              <p class="text-body-2">{{ item.name }}</p>
              <p v-if="item.merchantName" class="text-caption text-grey">{{ item.merchantName }}</p>
            </div>
          </div>
        </template>

        <!-- Pocket -->
        <template #item.pocket="{ item }">
          <v-chip size="small" variant="tonal" :color="getPocketColor(item.pocket || 'basic_needs')">
            {{ getPocketLabel(item.pocket || 'basic_needs') }}
          </v-chip>
        </template>

        <!-- Category -->
        <template #item.pocketCategory="{ item }">
          <v-chip size="x-small" variant="outlined">
            {{ getCategoryLabel(item.pocketCategory || 'other') }}
          </v-chip>
          <v-icon
            v-if="item.isOverride"
            size="x-small"
            color="purple"
            class="ml-1"
            title="User override"
          >mdi-pencil-circle</v-icon>
        </template>

        <!-- Amount -->
        <template #item.amount="{ item }">
          <span :class="{ 'text-green font-weight-bold': item.amount < 0 }">
            {{ item.amount < 0 ? '+' : '' }}{{ formatCurrency(Math.abs(item.amount)) }}
          </span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil-outline"
            size="x-small"
            variant="text"
            @click="openEditDialog(item)"
          />
        </template>
      </v-data-table>

      <p v-else class="text-primary font-weight-bold d-flex align-center justify-center" style="height: 300px">
        No transactions found for this period
      </p>
    </MainComponentDefaultCard>

    <!-- Edit category dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Transaction Category</v-card-title>
        <v-card-text v-if="editingTransaction">
          <p class="text-body-2 mb-1"><strong>Transaction:</strong> {{ editingTransaction.name }}</p>
          <p class="text-caption text-grey mb-4">{{ editingTransaction.merchantName || 'No merchant' }} &middot; {{ formatCurrency(editingTransaction.amount) }}</p>

          <v-select
            v-model="editPocket"
            :items="pocketOptions"
            item-title="label"
            item-value="value"
            label="Pocket"
            variant="outlined"
            density="compact"
            class="mb-3"
            hide-details
          />

          <v-select
            v-model="editCategory"
            :items="categoryOptionsForPocket"
            item-title="label"
            item-value="value"
            label="Category"
            variant="outlined"
            density="compact"
            class="mb-3"
            hide-details
          />

          <v-checkbox
            v-if="editingTransaction.merchantName"
            v-model="saveAsMerchantRule"
            :label="`Always categorize '${editingTransaction.merchantName}' this way`"
            density="compact"
            hide-details
            class="mb-2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="secondary" variant="flat" @click="saveOverride" :loading="saving">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </BasicMain>
</template>

<script lang="ts" setup>
import type { TransactionData } from '~/types/transaction'
import type { PocketType, PocketCategory, PocketSummary } from '~/types/pocket'

definePageMeta({
  middleware: 'auth'
})

const { apiFetch } = useApiFetch()
const { formatCurrency } = useCurrency()
const {
  getPocketColor,
  getPocketLabel,
  getCategoryLabel,
  getPocketCategoryIcon,
  buildPocketSummaries,
  POCKET_META,
} = usePocketBudget()

const loading = ref(false)
const transactionData = ref<TransactionData[]>([])
const monthlyIncome = ref(0)
const selectedPocket = ref<string>('all')
const snackbarOpen = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('error')

// Month navigation
const currentDate = ref(new Date())
const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})
const isCurrentMonth = computed(() => {
  const now = new Date()
  return currentDate.value.getMonth() === now.getMonth() && currentDate.value.getFullYear() === now.getFullYear()
})

function changeMonth(delta: number) {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + delta)
  // Don't go into future
  const now = new Date()
  if (d > now) return
  currentDate.value = d
  loadTransactions()
}

// Pocket tabs
const pocketTabs = computed(() => [
  { type: 'basic_needs' as PocketType, label: 'Basic Needs', icon: 'mdi-home-outline', color: '#22c55e' },
  { type: 'investment' as PocketType, label: 'Investment', icon: 'mdi-chart-line', color: '#3b82f6' },
  { type: 'self_reward' as PocketType, label: 'Self Reward', icon: 'mdi-gift-outline', color: '#a855f7' },
])

// Pocket summaries
const pocketSummaries = computed(() => buildPocketSummaries(transactionData.value, monthlyIncome.value))

const selectedPocketSummary = computed<PocketSummary | null>(() => {
  if (selectedPocket.value === 'all') return null
  return pocketSummaries.value.find((p: PocketSummary) => p.type === selectedPocket.value) || null
})

function transactionsByPocket(type: PocketType): TransactionData[] {
  return transactionData.value.filter(t => t.pocket === type)
}

const filteredTransactions = computed(() => {
  if (selectedPocket.value === 'all') return transactionData.value
  return transactionData.value.filter(t => t.pocket === selectedPocket.value)
})

const headers = [
  { title: 'Date', key: 'date', width: '100px' },
  { title: 'Description', key: 'name' },
  { title: 'Pocket', key: 'pocket', width: '140px' },
  { title: 'Category', key: 'pocketCategory', width: '160px' },
  { title: 'Amount', key: 'amount', width: '120px' },
  { title: '', key: 'actions', width: '50px', sortable: false },
]

// Edit dialog
const editDialog = ref(false)
const editingTransaction = ref<TransactionData | null>(null)
const editPocket = ref<PocketType>('basic_needs')
const editCategory = ref<PocketCategory>('other')
const saveAsMerchantRule = ref(false)
const saving = ref(false)

const pocketOptions = [
  { label: 'Basic Needs (50%)', value: 'basic_needs' },
  { label: 'Investment (30%)', value: 'investment' },
  { label: 'Self Reward (20%)', value: 'self_reward' },
]

const POCKET_CATEGORIES: Record<PocketType, { label: string; value: PocketCategory }[]> = {
  basic_needs: [
    { label: 'Rent / Housing', value: 'rent' },
    { label: 'Groceries', value: 'groceries' },
    { label: 'Gas / Fuel', value: 'gas' },
    { label: 'Debt Payment', value: 'debt_payment' },
    { label: 'Insurance', value: 'insurance' },
    { label: 'Utilities', value: 'utilities' },
    { label: 'Health / Medical', value: 'health' },
    { label: 'Other', value: 'other' },
  ],
  investment: [
    { label: 'Brokerage / Investment', value: 'brokerage' },
    { label: 'Savings', value: 'savings' },
    { label: 'Retirement', value: 'retirement' },
    { label: 'Other', value: 'other' },
  ],
  self_reward: [
    { label: 'Shopping', value: 'shopping' },
    { label: 'Dining / Restaurants', value: 'dining' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'Travel', value: 'travel' },
    { label: 'Other', value: 'other' },
  ],
}

const categoryOptionsForPocket = computed(() => {
  return POCKET_CATEGORIES[editPocket.value] || [{ label: 'Other', value: 'other' }]
})

// Reset category when pocket changes
watch(editPocket, () => {
  const options = categoryOptionsForPocket.value
  if (!options.find(o => o.value === editCategory.value)) {
    editCategory.value = options[0]?.value || 'other'
  }
})

function openEditDialog(tx: TransactionData) {
  editingTransaction.value = tx
  editPocket.value = tx.pocket || 'basic_needs'
  editCategory.value = tx.pocketCategory || 'other'
  saveAsMerchantRule.value = false
  editDialog.value = true
}

async function saveOverride() {
  if (!editingTransaction.value) return
  saving.value = true

  try {
    await apiFetch('/api/account/save-transaction-override', {
      method: 'POST',
      body: {
        transactionId: editingTransaction.value.transactionId,
        pocket: editPocket.value,
        pocketCategory: editCategory.value,
        merchantName: editingTransaction.value.merchantName,
        saveAsMerchantRule: saveAsMerchantRule.value,
      },
    })

    // Update locally
    const idx = transactionData.value.findIndex(t => t.transactionId === editingTransaction.value!.transactionId)
    if (idx >= 0) {
      const existing = transactionData.value[idx]!
      existing.pocket = editPocket.value
      existing.pocketCategory = editCategory.value
      existing.isOverride = true
    }

    editDialog.value = false
    addSnackBar('success', 'Transaction category updated')
  } catch (err: any) {
    addSnackBar('error', err.message || 'Failed to save override')
  } finally {
    saving.value = false
  }
}

// Load data
async function loadTransactions() {
  loading.value = true
  try {
    const res = await apiFetch<{
      ok: boolean
      transactions: TransactionData[]
      income?: any[]
      zelleReceivedTotal?: number
    }>('/api/plaid/transaction', { method: 'GET' })

    if (res.ok) {
      transactionData.value = res.transactions
    }

    const budgetRes = await apiFetch<{ monthlyBudget: number }>('/api/account/get-user-monthly-budget', { method: 'GET' })
    monthlyIncome.value = budgetRes.monthlyBudget
  } catch (err: any) {
    console.error(err)
    if (err.message !== 'Your session has expired. Please log in again.') {
      addSnackBar('error', err.message || 'Failed to load transactions')
    }
  } finally {
    loading.value = false
  }
}

function addSnackBar(color: string, message: string) {
  snackbarOpen.value = true
  snackbarColor.value = color
  snackbarMessage.value = message
}

onMounted(() => {
  loadTransactions()
})
</script>
