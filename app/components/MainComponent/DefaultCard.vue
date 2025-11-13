<template>
    <v-card variant="elevated" class="pa-4 border w-100 mb-4 my-sm-0">
        <p class="text-grey-lighten-1 font-weight-bold mb-2" :class="[`text-${titleTextSize}`]"><v-icon class="mr-2" :color="iconColor" v-if="icon">{{ icon }}</v-icon>{{ title }}</p>
        <slot />
    </v-card>
</template>

<script lang="ts" setup>
    const props = defineProps(['title', 'icon', 'iconColor', 'titleTextSize'])
</script>