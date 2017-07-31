<template>
    <div>
        <h4>simple demo</h4>
        <span>{{appService.sum}} </span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { AppService } from './appService';
import { devtool } from 'vubx';
const appService = new AppService();
devtool(appService);
console.log(appService)
export default {
    computed: {
        appService() {
            return appService;
        }
    },
    mounted() {
        appService.start();
    }
};
</script>

