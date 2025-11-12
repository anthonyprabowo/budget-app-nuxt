<template>
    <v-card variant="elevated" class="pa-4 border w-100 mb-4 my-sm-0">
        <p class="text-body-2 text-grey-lighten-1 font-weight-bold">{{ title }}</p>
        <slot />
    </v-card>
</template>

<script lang="ts" setup>
    const props = defineProps(['title'])
</script>