<template>
  <v-btn 
    color="purple-accent-3"
    @click="openPlaid"
  >
    Connect your bank
  </v-btn>
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
