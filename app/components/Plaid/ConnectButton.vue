<template>
  <v-btn 
    color="purple-accent-3"
    @click="openPlaid"
    :loading="loading"
    prepend-icon="mdi-plus"
  >
    Connect a bank account
  </v-btn>
</template>

<script setup lang="js">
import { ref } from "vue"

const linkToken = ref(null)
const loading = ref(false)
let plaidHandler = null

onMounted(async () => {
  // Wait for the Plaid SDK script to load
  await new Promise((resolve) => {
    if (window.Plaid) return resolve()
    const check = setInterval(() => {
      if (window.Plaid) { clearInterval(check); resolve() }
    }, 100)
  })

  const res = await $fetch("/api/plaid/create-link-token", { method: "POST" })
  linkToken.value = res.link_token

  plaidHandler = window.Plaid.create({
    token: linkToken.value,
    async onSuccess(public_token, metadata) {
      loading.value = true
      try {
        await $fetch("/api/plaid/exchange-public-token", {
          method: "POST",
          body: {
            public_token,
            metadata,
          },
        })
        console.log("Saved Plaid access token in Firestore")
      } catch (err) {
        console.error("Error saving Plaid access token:", err)
      } finally {
        loading.value = false
      }
      emit('refreshSetting');
    },
    onExit(err, metadata) {
      console.log("EXIT", err, metadata)
    }
  })
})

const emit = defineEmits(['refreshSetting'])

const openPlaid = () => {
  if (!plaidHandler) return
  plaidHandler.open()
}
</script>
