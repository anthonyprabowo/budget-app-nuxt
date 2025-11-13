import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  runtimeConfig: {
    public: {
      NUXT_FB_API_KEY: process.env.NUXT_FB_API_KEY || '',
      NUXT_FB_AUTH_DOMAIN: process.env.NUXT_FB_AUTH_DOMAIN || '',
      NUXT_FB_PROJECT_ID: process.env.NUXT_FB_PROJECT_ID || '',
      NUXT_FB_STORAGE_BUCKET: process.env.NUXT_FB_STORAGE_BUCKET || '',
      NUXT_FB_MSG_SENDER_ID: process.env.NUXT_FB_MSG_SENDER_ID || '',
      NUXT_FB_APP_ID: process.env.NUXT_FB_APP_ID || '',
      NUXT_FB_MEASUREMENT_ID: process.env.NUXT_FB_MEASUREMENT_ID || '',
    }
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.min.css',
  ],
  plugins: ['~/plugins/vuetify.ts'],
  components: true,
})
