<template>
  <button 
    class="px-4 py-2 bg-blue-600 text-white rounded"
    @click="openPlaid"
  >
    Connect your bank
  </button>
</template>

<script setup lang="js">
import { ref } from "vue"

const linkToken = ref(null)
let plaidHandler = null

// Load token on mount
onMounted(async () => {
  const res = await $fetch("/api/plaid/create-link-token", { method: "POST" })
  linkToken.value = res.link_token

  plaidHandler = Plaid.create({
    token: linkToken.value,
    async onSuccess(public_token, metadata) {
      console.log("SUCCESS!", public_token, metadata)
      // TODO: connect with exchange token API
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
      }
    },
    onExit(err, metadata) {
      console.log("EXIT", err, metadata)
    }
  })
})

const openPlaid = () => {
  if (!plaidHandler) return
  plaidHandler.open()
}
</script>
