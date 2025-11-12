<template>
    <v-app-bar :elevation="2" class="backdrop-blur-appbar">
        <v-app-bar-title>
            <v-img cover :width="150" src="/logo/minty-budget-app-logo.png" />
        </v-app-bar-title>
    </v-app-bar>
</template>

<script lang="ts" setup>
    
</script>

<style scoped>
    .backdrop-blur-appbar {
        background-color: rgba(25, 25, 25, 0.6); 
        backdrop-filter: blur(10px); 
        -webkit-backdrop-filter: blur(10px); 
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
</style>