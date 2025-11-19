<template>
    <v-app-bar :elevation="2" class="backdrop-blur-appbar">
        <v-app-bar-title>
            <v-img cover :width="150" src="/logo/minty-budget-app-logo.png" />
        </v-app-bar-title>
        <template #append>
            <div class="d-flex align-center ga-4 mr-8">
                <nuxt-link :to="'/dashboard'">
                    <v-btn variant="elevated" class="font-weight-bold" color="secondary">Dashboard</v-btn>
                </nuxt-link>
                <nuxt-link :to="'/setting'">
                    <v-icon color="white">mdi-cog-outline</v-icon>
                </nuxt-link>
            </div>
        </template>
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